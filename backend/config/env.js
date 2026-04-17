/**
 * config/env.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized environment variable access.
 * All modules import from here — never from process.env directly.
 * This ensures a single point of validation and easy mocking in tests.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import dotenv from 'dotenv';
dotenv.config();

/**
 * Validate that a required env variable exists.
 * Crashes the server early with a clear message if something is missing.
 * @param {string} key
 * @returns {string}
 */
const required = (key) => {
  const value = process.env[key];
  if (!value) {
    console.error(`[ENV] Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
};

export const env = {
  // ── Server ──────────────────────────────────────────────
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV !== 'production',

  // ── MongoDB ──────────────────────────────────────────────
  MONGO_URI: required('MONGO_URI'),

  // ── JWT ──────────────────────────────────────────────────
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // ── File Uploads ─────────────────────────────────────────
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5 MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',

  // ── CORS ─────────────────────────────────────────────────
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
