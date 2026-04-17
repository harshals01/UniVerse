/**
 * middleware/authMiddleware.js
 * ─────────────────────────────────────────────────────────────────────────────
 * JWT verification middleware. Attaches the authenticated user to req.user
 * so every downstream controller knows who made the request.
 *
 * Request flow:
 *  1. Client sends: Authorization: Bearer <token>
 *  2. protect() extracts the token from the header
 *  3. jwt.verify() decodes and validates the signature + expiry
 *  4. User is fetched from DB to confirm they still exist (not deleted)
 *  5. req.user is populated → next() passes control to the controller
 *
 * Usage in routes:
 *   router.get('/me', protect, getMe);
 *   router.post('/item', protect, authorizeRoles('admin'), createItem);
 * ─────────────────────────────────────────────────────────────────────────────
 */

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { env } from '../config/env.js';

// ── protect ───────────────────────────────────────────────────────────────────
// Verifies JWT and populates req.user on every protected route.
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // ── Step 1: Extract token from Authorization header ───────────────────────
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]; // "Bearer <token>" → "<token>"
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }

  // ── Step 2: Verify token signature and expiry ─────────────────────────────
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
    // decoded = { id: "userId", iat: ..., exp: ... }
  } catch (err) {
    res.status(401);
    // Distinguish between expired and tampered tokens for clearer errors
    if (err.name === 'TokenExpiredError') {
      throw new Error('Not authorized — token has expired');
    }
    throw new Error('Not authorized — token is invalid');
  }

  // ── Step 3: Confirm user still exists in DB ───────────────────────────────
  // This catches the edge case where a user was deleted after token was issued.
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    res.status(401);
    throw new Error('Not authorized — user no longer exists');
  }

  // ── Step 4: Attach user to request object ────────────────────────────────
  req.user = user;
  next();
});

// ── authorizeRoles ────────────────────────────────────────────────────────────
// Role-based access control. Must come AFTER protect in the middleware chain.
// Usage: router.delete('/:id', protect, authorizeRoles('admin'), deleteItem);
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied — role '${req.user.role}' is not authorized for this action`
      );
    }
    next();
  };
};
