/**
 * =====================================================================
 * Authentication & Role-Based Access Control (RBAC) Middleware
 * =====================================================================
 */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes: requires valid JWT bearer token
 */
export async function protect(req, res, next) {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartcart_secret_key_2026');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
}

/**
 * Admin Only RBAC Middleware (Feature 5)
 * Restricts administrative functionality strictly to authorized admin accounts.
 */
export function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    message: 'Access denied: Administrative privileges required.',
  });
}

/**
 * Optional Auth: attaches req.user if token is present, continues otherwise
 */
export async function optionalAuth(req, res, next) {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartcart_secret_key_2026');
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch {
    // ignore
  }
  next();
}
