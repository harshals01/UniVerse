/**
 * middleware/errorMiddleware.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Global error handling for the Express app.
 *
 * Handled error types:
 *  Mongoose CastError         → 400  (invalid ObjectId in params)
 *  Mongoose ValidationError   → 400  (schema validation failed, lists fields)
 *  Mongoose Duplicate key     → 409  (e.g., duplicate email on register)
 *  JWT JsonWebTokenError      → 401  (malformed token)
 *  JWT TokenExpiredError      → 401  (expired token — clear client storage)
 *  Multer file size/type      → 400  (image upload validation)
 *  Generic                    → 500  (anything else)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { env } from '../config/env.js';

// ── 404 — No route matched ────────────────────────────────────────────────────
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// ── Global error handler — must be last middleware in server.js ───────────────
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message    = err.message || 'Internal Server Error';
  let details    = undefined; // Extra structured data for validation errors

  // ── 1. Mongoose CastError (e.g. /api/items/not-an-objectid) ──────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Invalid ${err.path}: "${err.value}" is not a valid ID`;
  }

  // ── 2. Mongoose ValidationError (schema-level validation failed) ─────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Collect all failing fields into an array: [{ field, message }]
    details = Object.values(err.errors).map(e => ({
      field:   e.path,
      message: e.message,
    }));
    message = details.map(d => d.message).join('. ');
  }

  // ── 3. Mongoose Duplicate key (code 11000) ────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field] || '';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} "${value}" is already in use`;
  }

  // ── 4. JWT — malformed token ──────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid token. Please log in again';
  }

  // ── 5. JWT — expired token ────────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Your session has expired. Please log in again';
  }

  // ── 6. Multer errors (file upload) ────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message    = 'File is too large. Maximum upload size is 5 MB';
  }
  if (err.code === 'INVALID_FILE_TYPE') {
    statusCode = 400;
    message    = err.message || 'Invalid file type. Only JPEG, PNG, and WebP are allowed';
  }

  // ── Respond ───────────────────────────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    message,
    ...(details  && { details }),
    ...(env.isDev && { stack: err.stack }), // Stack trace in dev only
  });
};
