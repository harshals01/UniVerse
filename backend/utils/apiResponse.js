/**
 * utils/apiResponse.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Enforces a consistent API response shape across every controller.
 * Frontend can always rely on { success, message, data } being present.
 *
 * Usage in controllers:
 *   return sendSuccess(res, 201, 'Item created', { item });
 *   return sendError(res, 409, 'Email already exists');
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Send a successful JSON response.
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status (200, 201, etc.)
 * @param {string} message    - Human-readable success message
 * @param {*}      data       - Payload (object, array, or null)
 */
export const sendSuccess = (res, statusCode = 200, message = 'OK', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error JSON response and pass it to the global error handler.
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status (400, 401, 404, 409, etc.)
 * @param {string} message    - Human-readable error message
 */
export const sendError = (res, statusCode = 500, message = 'Something went wrong') => {
  res.status(statusCode);
  throw new Error(message); // Caught by express-async-handler → errorHandler middleware
};
