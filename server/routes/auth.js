import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();


function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'smartcart_secret_key_2026', {
    expiresIn: '30d',
  });
}


router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    
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


router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

   
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


router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});


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
      user.password = password; 
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
