/**
 * =====================================================================
 * User Model with Role-Based Access Control, Saved Delivery Addresses,
 * Shopping Cart Persistence, and Recommendation Activity Tracking
 * =====================================================================
 */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Delivery Address Sub-Schema (Feature 7)
const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
      trim: true,
    },
    houseNo: {
      type: String,
      required: [true, 'House / Flat number is required'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Street / Locality is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pinCode: {
      type: String,
      required: [true, 'PIN code is required'],
      match: [/^\d{6}$/, 'Please enter a valid 6-digit PIN code'],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Cart Item Sub-Schema for Shopping Cart Persistence across sessions (Feature 7 & Core)
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, default: 1, min: 1 },
    brand: { type: String, default: 'Generic' },
    category: { type: String, default: 'General' },
    countInStock: { type: Number, default: 99 },
  },
  { _id: false }
);

// User Activity Schema for Personalized Recommendations (Feature 4)
const activitySchema = new mongoose.Schema(
  {
    searches: [
      {
        query: { type: String, trim: true },
        category: { type: String, trim: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    viewedProducts: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        category: { type: String, trim: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    exploredCategories: [
      {
        category: { type: String, trim: true },
        count: { type: Number, default: 1 },
        lastExplored: { type: Date, default: Date.now },
      },
    ],
  },
  { _id: false }
);

// Main User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      // Strict RFC-compliant email validation regex (Feature 1)
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
        'Please enter a valid email address (e.g. name@example.com)',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    addresses: [addressSchema],
    cart: [cartItemSchema],
    loginOtp: {
      type: String,
      select: false,
    },
    loginOtpExpires: {
      type: Date,
      select: false,
    },
    activity: {
      type: activitySchema,
      default: () => ({ searches: [], viewedProducts: [], exploredCategories: [] }),
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Safe Public representation
userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    addresses: this.addresses || [],
    cart: this.cart || [],
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
