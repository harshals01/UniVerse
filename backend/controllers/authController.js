/**
 * controllers/authController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles all authentication business logic.
 * All functions are wrapped with asyncHandler — errors propagate to
 * errorMiddleware automatically (no try/catch needed).
 *
 * Exported functions:
 *  registerUser  POST /api/auth/register
 *  loginUser     POST /api/auth/login
 *  getMe         GET  /api/auth/me       (protected)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, college } = req.body;

  // ── 1. Validate required fields ──────────────────────────────────────────
  if (!name || !email || !password) {
    return sendError(res, 400, 'Please provide name, email, and password');
  }

  // ── 2. Check for duplicate email ─────────────────────────────────────────
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return sendError(res, 409, 'An account with this email already exists');
  }

  // ── 3. Create user (password hashed by pre-save hook in User.js) ─────────
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,           // Plain text — bcrypt hook hashes it before DB write
    college: college?.trim() || '',
  });

  // ── 4. Generate JWT ───────────────────────────────────────────────────────
  const token = generateToken(user._id.toString());

  // ── 5. Respond (never include password — toJSON transform handles this) ───
  return sendSuccess(res, 201, 'Account created successfully', {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login user and return JWT
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // ── 1. Validate input ─────────────────────────────────────────────────────
  if (!email || !password) {
    return sendError(res, 400, 'Please provide email and password');
  }

  // ── 2. Find user — explicitly select password (hidden by default) ─────────
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  // ── 3. Check credentials ──────────────────────────────────────────────────
  // Deliberately vague error — don't reveal which field was wrong (security)
  if (!user || !(await user.comparePassword(password))) {
    return sendError(res, 401, 'Invalid email or password');
  }

  // ── 4. Generate JWT ───────────────────────────────────────────────────────
  const token = generateToken(user._id.toString());

  // ── 5. Respond ────────────────────────────────────────────────────────────
  return sendSuccess(res, 200, 'Login successful', {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get currently logged-in user's profile
// @route   GET /api/auth/me
// @access  Private (requires protect middleware)
// ─────────────────────────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  // req.user is populated by the protect middleware — no DB call needed
  // The user object is already fetched fresh (without password) in authMiddleware
  return sendSuccess(res, 200, 'User profile fetched', { user: req.user });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update logged-in user's profile (name, college, avatar)
// @route   PUT /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const updateMe = asyncHandler(async (req, res) => {
  const { name, college, avatar } = req.body;

  // Fetch user WITH password excluded (default — we won't change it here)
  const user = await User.findById(req.user._id);
  if (!user) return sendError(res, 404, 'User not found');

  // Only update provided fields
  if (name)    user.name    = name.trim();
  if (college) user.college = college.trim();
  if (avatar)  user.avatar  = avatar.trim();

  // pre-save hook WON'T re-hash password (isModified('password') = false)
  const updated = await user.save();

  return sendSuccess(res, 200, 'Profile updated', {
    user: {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      college: updated.college,
      avatar: updated.avatar,
    },
  });
});
