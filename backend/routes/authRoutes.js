/**
 * routes/authRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Maps HTTP methods + paths to auth controller functions.
 * Zero business logic here — this file is routing config only.
 *
 * Mounted in server.js at: /api/auth
 *
 * Full endpoint table:
 *  POST   /api/auth/register   → registerUser  (public)
 *  POST   /api/auth/login      → loginUser     (public)
 *  GET    /api/auth/me         → getMe         (private — needs Bearer token)
 *  PUT    /api/auth/me         → updateMe      (private — needs Bearer token)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register', registerUser);
router.post('/login',    loginUser);

// ── Private Routes (JWT required) ────────────────────────────────────────────
// protect runs first: verifies token & populates req.user
// then the controller function runs
router.get ('/me', protect, getMe);
router.put ('/me', protect, updateMe);

export default router;
