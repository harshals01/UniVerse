/**
 * utils/generateToken.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Signs and returns a JWT for a given user ID.
 *
 * Why a separate util?
 *  - Keeps the controller clean (single responsibility)
 *  - One place to change algorithm, expiry, or claims in the future
 *
 * Token payload intentionally minimal — only the user _id.
 * Additional claims (role, email) are fetched fresh from DB via getMe()
 * to avoid stale data in long-lived tokens.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * @param {string} userId - MongoDB ObjectId string
 * @returns {string}       - Signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },         // Payload — keep it lean
    env.JWT_SECRET,         // Secret from .env
    { expiresIn: env.JWT_EXPIRES_IN } // e.g. "7d"
  );
};

export default generateToken;
