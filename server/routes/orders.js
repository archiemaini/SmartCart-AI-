/**
 * =====================================================================
 * Contributor: ARCHIE
 * Role: Order Management & State Specialist
 * Feature: Order Creation API & Order Retrieval with User/Product .populate()
 * =====================================================================
 */
import express from 'express';
import Order from '../models/Order.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private (Protected Route)

 */
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shippingAddress = {}, paymentMethod = 'Cash on Delivery' } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: 'No order items provided' });
    }


    const itemsPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 500 ? 0 : 50; // Free shipping over 500
    const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST/Tax
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      status: 'Confirmed',
    });

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/orders/mine
 * @desc    Get logged in user orders
 * @access  Private (Protected Route)

 */
router.get('/mine', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('user', 'name email') // Populates user details
      .populate('items.product', 'title category price image') // Populates referenced product details
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/orders
 * @desc    Get all orders (admin/all view)
 * @access  Public / Admin

 */
router.get('/', async (req, res, next) => {
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

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

export default router;
