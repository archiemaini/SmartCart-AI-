/**
 * =====================================================================
 * Contributor: KUNAL
 * Role: Lead Backend & Database Architect
 * Syllabus Sessions: Session 39 (bcrypt Password Hashing) & Session 41 (Mongoose Schemas & Validation)
 * Feature: User Model, Schema Validation & Password Hashing
 * =====================================================================
 */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * User Schema
 * Demonstrates:
 * - Session 39: Validation, JWT Authentication, bcrypt
 * - Session 41: Mongoose Schemas, Models, Validation
 */
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
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't return password hash in regular queries
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password with bcrypt before saving to MongoDB (Session 39)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password entered by user with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Safe JSON representation without sensitive data
userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
