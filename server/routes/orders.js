/**
 * =====================================================================
 * Order Management Routes: Inventory Management, Address Validation,
 * Order History, Admin Overview, and Status Updates
 * =====================================================================
 */
import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order, validate complete delivery address,
 *          verify inventory availability, and trigger notification
 * @access  Private
 */
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = 'Cash on Delivery' } = req.body;

    // 1. Verify items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // 2. Validate Complete Delivery Address (Feature 7)
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Complete delivery address is required' });
    }

    const { fullName, mobileNumber, houseNo, street, city, state, pinCode } = shippingAddress;
    if (!fullName?.trim() || !mobileNumber?.trim() || !houseNo?.trim() || !street?.trim() || !city?.trim() || !pinCode?.trim()) {
      return res.status(400).json({
        message: 'Incomplete address. Full name, mobile number, house number, street, city, and PIN code are required.',
      });
    }

    if (!/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number' });
    }

    if (!/^\d{6}$/.test(pinCode.trim())) {
      return res.status(400).json({ message: 'Please provide a valid 6-digit Indian PIN code' });
    }

    // 3. Purchase Limit (Max 5 units per order) & Inventory Availability Check
    const MAX_PER_ORDER = 5;
    const productUpdates = [];
    for (const item of items) {
      const product = await Product.findById(item.product || item._id);
      if (!product) {
        return res.status(404).json({ message: `Product "${item.title}" no longer exists in catalog` });
      }

      if (item.qty > MAX_PER_ORDER) {
        return res.status(400).json({
          message: `Limit exceeded for "${product.title}". Maximum allowed is ${MAX_PER_ORDER} units per order.`,
        });
      }

      if (product.countInStock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.title}". Only ${product.countInStock} units available.`,
        });
      }

      productUpdates.push({ product, qty: item.qty });
    }

    // 4. Calculate INR Prices
    const itemsPrice = items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
    const shippingPrice = itemsPrice >= 500 ? 0 : 50; // Free shipping over ₹500
    const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST in India
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const isCod = paymentMethod.toLowerCase().includes('cash on delivery') || paymentMethod.toLowerCase().includes('cod');

    // 5. Create Order Document
    const order = await Order.create({
      user: req.user._id,
      items: items.map((i) => ({
        product: i.product || i._id,
        title: i.title,
        image: i.image,
        price: Number(i.price),
        qty: Number(i.qty),
      })),
      shippingAddress: {
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        houseNo: houseNo.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state?.trim() || 'Punjab',
        pinCode: pinCode.trim(),
        country: 'India',
        email: req.user?.email || '',
      },
      paymentMethod,
      paymentStatus: isCod ? 'Pending' : 'Pending',
      isPaid: false,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      status: 'Confirmed',
      stockDeducted: true,
    });

    // 6. Deduct stock immediately upon order placement in database
    for (const update of productUpdates) {
      await Product.findByIdAndUpdate(update.product._id, {
        $inc: { countInStock: -update.qty },
      });
    }

    // Send real Order Confirmation Email (for COD immediately)
    if (isCod) {
      sendOrderConfirmationEmail({ order, user: req.user }).catch((err) =>
        console.warn(`[Orders] Email notification error: ${err.message}`)
      );
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/orders/mine
 * @desc    Get logged-in user's order history with populated products (Core Requirement)
 * @access  Private
 */
router.get('/mine', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('user', 'name email')
      .populate('items.product', 'title category price image')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/orders/admin/stats
 * @desc    Get admin high-level metrics (Revenue, Orders, Low Stock Alerts) (Feature 5)
 * @access  Private (Admin Only)
 */
router.get('/admin/stats', protect, adminOnly, async (req, res, next) => {
  try {
    const [totalOrders, orders, products, lowStockProducts] = await Promise.all([
      Order.countDocuments(),
      Order.find().select('totalPrice status isPaid'),
      Product.countDocuments(),
      Product.find({ countInStock: { $lte: 5 } }).select('title countInStock price category image'),
    ]);

    const totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Confirmed').length;
    const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts: products,
      pendingOrders,
      deliveredOrders,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/orders
 * @desc    Get all orders across store (Feature 5: Admin Panel with RBAC)
 * @access  Private (Admin Only)
 */
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'title price')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Normal users can only view their own orders; admins can view any
    if (req.user.role !== 'admin' && String(order.user._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied to this order' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order lifecycle status (Pending -> Confirmed -> Shipped -> Delivered -> Cancelled)
 * @access  Private (Admin Only)
 */
router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'Delivered' && order.paymentMethod.includes('Cash on Delivery')) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentStatus = 'Completed';
    }

    await order.save();

    res.json({
      message: `Order status updated to "${status}"`,
      order,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
