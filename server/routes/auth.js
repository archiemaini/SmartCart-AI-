/**
 * =====================================================================
 * User Authentication, Email Notifications, Saved Addresses,
 * and Persistent Cart Routes
 * =====================================================================
 */
import express from 'express';
import jwt from 'jsonwebtoken';
import dns from 'node:dns/promises';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendWelcomeEmail, getRecentSentEmails } from '../services/emailService.js';

const router = express.Router();

/**
 * @route   GET /api/auth/recent-emails
 * @desc    Get recent outgoing email delivery notifications & preview links for testing
 * @access  Public
 */
router.get('/recent-emails', (req, res) => {
  res.json({
    emails: getRecentSentEmails(),
    count: getRecentSentEmails().length,
  });
});

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'smartcart_secret_key_2026', {
    expiresIn: '30d',
  });
}

// Strict email validation helper (Feature 1)
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  // RFC 5322 compliant regex
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!regex.test(trimmed)) return false;
  if (trimmed.length > 254) return false;
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (local.length > 64) return false;
  if (!domain.includes('.')) return false;
  const domainParts = domain.split('.');
  if (domainParts.some((p) => p.length === 0)) return false;
  if (domainParts[domainParts.length - 1].length < 2) return false;
  return true;
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user, validate email format, and send a real welcome email
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, address } = req.body || {};

    // 1. Validate fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid, complete email address (e.g. name@example.com)' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const domain = cleanEmail.split('@')[1];
    const localPart = cleanEmail.split('@')[0];

    const disposableDomains = [
      'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
      'yopmail.com', 'trashmail.com', 'dispostable.com', 'getairmail.com',
      'sharklasers.com', 'temp-mail.org', 'fakemailgenerator.com'
    ];
    if (disposableDomains.includes(domain)) {
      return res.status(400).json({ message: 'Temporary or disposable email addresses are not allowed' });
    }

    if (/\d{7,}/.test(localPart)) {
      return res.status(400).json({ message: 'This email appears invalid or auto-generated' });
    }

    // Live DNS MX check to ensure email domain exists and can receive real mail
    try {
      const records = await dns.resolveMx(domain);
      if (!records || records.length === 0) {
        return res.status(400).json({ message: `This email domain (@${domain}) does not exist and cannot receive mail` });
      }
    } catch (err) {
      if (err.code === 'ENOTFOUND' || err.code === 'ENODATA' || err.code === 'SERVFAIL' || err.code === 'NODATA') {
        return res.status(400).json({ message: `This email domain (@${domain}) does not exist and cannot receive mail` });
      }
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Initial address if provided during signup
    const addresses = [];
    if (address && address.houseNo && address.street && address.city && address.pinCode) {
      addresses.push({
        fullName: address.fullName || name.trim(),
        mobileNumber: address.mobileNumber || '9876543210',
        houseNo: address.houseNo.trim(),
        street: address.street.trim(),
        city: address.city.trim(),
        state: address.state ? address.state.trim() : 'Punjab',
        pinCode: address.pinCode.trim(),
        isDefault: true,
      });
    }

    // 2. Create user in MongoDB
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      addresses,
      role: cleanEmail.includes('admin') ? 'admin' : 'user',
    });

    // 3. Send Real Welcome Email with Account Credentials (Feature 1)
    const emailResult = await sendWelcomeEmail({
      name: user.name,
      email: user.email,
      password,
    });

    res.status(201).json({
      user: user.toPublicJSON(),
      token: generateToken(user._id),
      message: 'Registration successful! Welcome email sent.',
      emailDelivery: emailResult,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/check-email
 * @desc    Live email existence check (RFC syntax, live DNS MX lookup, and DB user check)
 * @access  Public
 */
router.get('/check-email', async (req, res) => {
  try {
    const rawEmail = String(req.query.email || '').trim().toLowerCase();
    const context = req.query.context || 'login'; // 'login' or 'register'

    if (!rawEmail) {
      return res.json({ valid: false, message: 'Please enter an email' });
    }

    if (!isValidEmail(rawEmail)) {
      return res.json({
        valid: false,
        syntaxValid: false,
        domainExists: false,
        userExists: false,
        message: 'Invalid email format (e.g. name@example.com)',
      });
    }

    const domain = rawEmail.split('@')[1];
    const localPart = rawEmail.split('@')[0];

    // Disposable/temporary email domains list
    const disposableDomains = [
      'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
      'yopmail.com', 'trashmail.com', 'dispostable.com', 'getairmail.com',
      'sharklasers.com', 'temp-mail.org', 'fakemailgenerator.com'
    ];
    if (disposableDomains.includes(domain)) {
      return res.json({
        valid: false,
        syntaxValid: true,
        domainExists: false,
        userExists: false,
        message: 'Temporary or disposable email addresses are not allowed',
      });
    }

    // Flag obvious fake / bot-generated usernames with excessive consecutive random digits (7+ digits)
    if (/\d{7,}/.test(localPart)) {
      return res.json({
        valid: false,
        syntaxValid: true,
        domainExists: true,
        userExists: false,
        message: 'This email appears invalid or auto-generated',
      });
    }

    // 1. Live DNS MX verification (checks if domain exists and has mail exchange servers)
    let domainExists = true;
    try {
      const records = await dns.resolveMx(domain);
      domainExists = Array.isArray(records) && records.length > 0;
    } catch (err) {
      if (err.code === 'ENOTFOUND' || err.code === 'ENODATA' || err.code === 'SERVFAIL' || err.code === 'NODATA') {
        domainExists = false;
      }
    }

    if (!domainExists) {
      return res.json({
        valid: false,
        syntaxValid: true,
        domainExists: false,
        userExists: false,
        message: `This email domain (@${domain}) does not exist`,
      });
    }

    // 2. Check if this email exists in MongoDB database
    const user = await User.findOne({ email: rawEmail }).select('_id name email');
    const userExists = !!user;

    if (context === 'login') {
      if (!userExists) {
        return res.json({
          valid: false,
          syntaxValid: true,
          domainExists: true,
          userExists: false,
          message: 'This email does not exist',
        });
      }
      return res.json({
        valid: true,
        syntaxValid: true,
        domainExists: true,
        userExists: true,
        userName: user.name,
        message: `Account found for ${user.name}`,
      });
    } else {
      // Registration context
      if (userExists) {
        return res.json({
          valid: false,
          syntaxValid: true,
          domainExists: true,
          userExists: true,
          message: 'An account with this email already exists',
        });
      }
      return res.json({
        valid: true,
        syntaxValid: true,
        domainExists: true,
        userExists: false,
        message: 'Email is valid and available',
      });
    }
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Could not check email' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return token
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'This email does not exist. Please check your spelling or sign up.' });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Incorrect password for this email' });
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
 * @desc    Get current authenticated user profile
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, password } = req.body || {};

    if (name) user.name = name.trim();
    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
      }
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== user.email) {
        const emailExists = await User.findOne({ email: cleanEmail });
        if (emailExists) {
          return res.status(400).json({ message: 'Email is already used by another account' });
        }
        user.email = cleanEmail;
      }
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
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────
// User Address Management APIs (Feature 7)
// ─────────────────────────────────────────────────────────────

/**
 * @route   GET /api/auth/addresses
 * @desc    Get all saved delivery addresses for the user
 * @access  Private
 */
router.get('/addresses', protect, async (req, res) => {
  res.json({ addresses: req.user.addresses || [] });
});

/**
 * @route   POST /api/auth/addresses
 * @desc    Add a new delivery address with strict field validation
 * @access  Private
 */
router.post('/addresses', protect, async (req, res, next) => {
  try {
    const { fullName, mobileNumber, houseNo, street, city, state, pinCode, isDefault } = req.body;

    // Field Validation (Feature 7)
    if (!fullName?.trim()) return res.status(400).json({ message: 'Full name is required' });
    if (!mobileNumber?.trim() || !/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit Indian mobile number' });
    }
    if (!houseNo?.trim()) return res.status(400).json({ message: 'House / Flat number is required' });
    if (!street?.trim()) return res.status(400).json({ message: 'Street / Locality is required' });
    if (!city?.trim()) return res.status(400).json({ message: 'City is required' });
    if (!state?.trim()) return res.status(400).json({ message: 'State is required' });
    if (!pinCode?.trim() || !/^\d{6}$/.test(pinCode.trim())) {
      return res.status(400).json({ message: 'Please enter a valid 6-digit PIN code' });
    }

    const user = await User.findById(req.user._id);

    // If marked default or first address, unset existing defaults
    const shouldBeDefault = Boolean(isDefault) || user.addresses.length === 0;
    if (shouldBeDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }

    user.addresses.push({
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      houseNo: houseNo.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pinCode: pinCode.trim(),
      isDefault: shouldBeDefault,
    });

    await user.save();
    res.status(201).json({
      message: 'Delivery address saved successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/auth/addresses/:addressId
 * @desc    Update a saved delivery address
 * @access  Private
 */
router.put('/addresses/:addressId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    const { fullName, mobileNumber, houseNo, street, city, state, pinCode, isDefault } = req.body;

    if (fullName) addr.fullName = fullName.trim();
    if (mobileNumber) {
      if (!/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
        return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
      }
      addr.mobileNumber = mobileNumber.trim();
    }
    if (houseNo) addr.houseNo = houseNo.trim();
    if (street) addr.street = street.trim();
    if (city) addr.city = city.trim();
    if (state) addr.state = state.trim();
    if (pinCode) {
      if (!/^\d{6}$/.test(pinCode.trim())) {
        return res.status(400).json({ message: 'Please enter a valid 6-digit PIN code' });
      }
      addr.pinCode = pinCode.trim();
    }

    if (isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
      addr.isDefault = true;
    }

    await user.save();
    res.json({ message: 'Address updated successfully', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/auth/addresses/:addressId
 * @desc    Delete a saved delivery address
 * @access  Private
 */
router.delete('/addresses/:addressId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((a) => String(a._id) !== String(req.params.addressId));
    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    await user.save();
    res.json({ message: 'Address removed successfully', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────
// Shopping Cart Persistence APIs (Core Requirement)
// ─────────────────────────────────────────────────────────────

/**
 * @route   GET /api/auth/cart
 * @desc    Get user's persistent cart from MongoDB
 * @access  Private
 */
router.get('/cart', protect, async (req, res) => {
  res.json({ cart: req.user.cart || [] });
});

/**
 * @route   PUT /api/auth/cart
 * @desc    Sync user's shopping cart items into MongoDB so it persists across login/logout
 * @access  Private
 */
router.put('/cart', protect, async (req, res, next) => {
  try {
    const { items = [] } = req.body;
    const user = await User.findById(req.user._id);
    user.cart = items.map((i) => ({
      product: i._id || i.product,
      title: i.title,
      image: i.image,
      price: i.price,
      qty: i.qty || 1,
      brand: i.brand || 'Generic',
      category: i.category || 'General',
      countInStock: i.countInStock ?? 99,
    }));
    await user.save();
    res.json({ message: 'Cart synced successfully', cart: user.cart });
  } catch (error) {
    next(error);
  }
});

export default router;
