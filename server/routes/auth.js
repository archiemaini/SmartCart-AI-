/**
 * =====================================================================
 * Contributor: KUNAL
 * Role: Lead Backend & Database Architect
 * Syllabus Sessions: Sessions 37-39 (Express Routing, Body Parsing, JWT & bcrypt)
 * Feature: User Authentication & Profile Update APIs
 * =====================================================================
 */
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * Generate a JWT token helper
 * Demonstrates: Session 39 - JWT Authentication
 */
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'smartcart_secret_key_2026', {
    expiresIn: '30d',
  });
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * Demonstrates: Sessions 37-39 - Body Parsing, Validation, bcrypt, JWT
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    // Validation (Session 39)
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user (bcrypt handles hashing in pre-save hook)
    const user = await User.create({ name, email, password });

    res.status(201).json({
      user: user.toPublicJSON(),
      token: generateToken(user._id),
      message: 'Registration successful',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 * Demonstrates: Sessions 38-39 - Request Handling, bcrypt comparison, JWT
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Query user and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      user: user.toPublicJSON(),
      token: generateToken(user._id),
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user profile
 * @access  Private (Protected Route)
 * Demonstrates: Session 39 - Protected Routes with JWT
 */
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile (name, email, password)
 * @access  Private (Protected Route)
 * Demonstrates: Sessions 38 & 41 - Updating User documents in MongoDB
 */
router.put('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, password } = req.body || {};

    if (name) user.name = name;
    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use by another user' });
      }
      user.email = email.toLowerCase();
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = password; // Will be automatically hashed by bcrypt in pre-save hook
    }

    const updatedUser = await user.save();

    res.json({
      user: updatedUser.toPublicJSON(),
      message: 'Profile updated successfully in MongoDB',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
