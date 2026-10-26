/**
 * =====================================================================
 * Contributor: KUNAL
 * Role: Lead Backend & Database Architect
 * Syllabus Sessions: Session 39 (JWT Authentication & Protected Routes)
 * Feature: JWT Verification Middleware
 * =====================================================================
 */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * JWT Authentication Middleware
 * Demonstrates: Session 39 - JWT Authentication, Protected Routes
 */
export async function protect(req, res, next) {
  try {
    let token;

    // Check for "Authorization: Bearer <token>" header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartcart_secret_key_2026');

    // Attach authenticated user to req.user (excluding password)
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
}
