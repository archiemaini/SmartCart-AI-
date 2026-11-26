/**
 * =====================================================================
 * Admin User Management API
 * Role-Based Access Control: Restricted to Authorized Admin Accounts
 * Capabilities:
 * - List all registered users with search & metadata
 * - Add new users (Customer / Admin)
 * - Update existing user information (Name, Email, Role, Password)
 * - Delete user accounts (with safeguards against self-deletion)
 * =====================================================================
 */
import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Email format validator
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(email.trim()) && email.trim().length <= 254;
}

/**
 * @route   GET /api/users
 * @desc    Get all registered users (with search and order count)
 * @access  Private / Admin
 */
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { search = '' } = req.query;

    const filter = {};
    if (search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-loginOtp -loginOtpExpires')
      .sort({ createdAt: -1 })
      .lean();

    // Attach order counts for each user
    const userIds = users.map((u) => u._id);
    const orderCounts = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 }, totalSpent: { $sum: '$totalPrice' } } },
    ]);

    const orderCountMap = {};
    for (const oc of orderCounts) {
      orderCountMap[String(oc._id)] = {
        count: oc.count,
        totalSpent: oc.totalSpent,
      };
    }

    const enrichedUsers = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role || 'user',
      addressCount: (u.addresses || []).length,
      cartItemCount: (u.cart || []).length,
      orderCount: orderCountMap[String(u._id)]?.count || 0,
      totalSpent: orderCountMap[String(u._id)]?.totalSpent || 0,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    res.json({
      users: enrichedUsers,
      total: enrichedUsers.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/users
 * @desc    Add a new user (Customer or Admin)
 * @access  Private / Admin
 */
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email address is required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: role === 'admin' ? 'admin' : 'user',
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addressCount: 0,
        orderCount: 0,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update an existing user's information (Name, Email, Role, Password)
 * @access  Private / Admin
 */
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { name, email, role, password } = req.body || {};
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (email && email.trim()) {
      const cleanEmail = email.toLowerCase().trim();
      if (!isValidEmail(cleanEmail)) {
        return res.status(400).json({ message: 'Invalid email address format' });
      }

      if (cleanEmail !== user.email) {
        const emailExists = await User.findOne({ email: cleanEmail });
        if (emailExists) {
          return res.status(400).json({ message: 'This email is already in use by another user' });
        }
        user.email = cleanEmail;
      }
    }

    if (role && (role === 'user' || role === 'admin')) {
      // Prevent demoting the logged-in admin if it's themselves
      if (String(req.user._id) === String(user._id) && role !== 'admin') {
        return res.status(400).json({ message: 'You cannot revoke your own admin permissions' });
      }
      user.role = role;
    }

    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }
      user.password = password.trim();
    }

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user account
 * @access  Private / Admin
 */
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const targetId = req.params.id;

    // Guard: Prevent admin from deleting themselves
    if (String(req.user._id) === String(targetId)) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const user = await User.findById(targetId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(targetId);

    res.json({
      message: `User account for ${user.email} was deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
