/**
 * middleware/uploadMiddleware.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Multer configuration for file uploads.
 *
 * Design decisions:
 *  - Files are stored on disk (not memory) so large files don't crash the server
 *  - Destination folder is determined per-module at the route level
 *  - Filename is sanitized and made unique with Date.now() + random suffix
 *  - Strict MIME type whitelist — only images accepted
 *  - 5 MB limit per file (configurable via env.MAX_FILE_SIZE)
 *
 * Exports two ready-made upload handlers:
 *  uploadLostFound   — stores to /uploads/lostfound/, single field "image"
 *  uploadMarketplace — stores to /uploads/marketplace/, single field "image"
 * ─────────────────────────────────────────────────────────────────────────────
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// ── MIME type filter ──────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'),
      false
    );
  }
};

// ── Storage factory ───────────────────────────────────────────────────────────
// Creates a DiskStorage instance for a given subfolder under /uploads/
const createStorage = (subfolder) => {
  const dest = path.join(__dirname, '..', 'uploads', subfolder);

  // Ensure the directory exists (won't fail if it already does)
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      // Strip special characters from original name for safety
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
      // Format: timestamp-randomSuffix-safeName
      // e.g. 1713234567890-4f2a-backpack.jpg
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${safeName}`;
      cb(null, uniqueName);
    },
  });
};

// ── Multer instances ──────────────────────────────────────────────────────────

export const uploadLostFound = multer({
  storage: createStorage('lostfound'),
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE }, // Default: 5 MB
}).single('image'); // Expects FormData field named "image"

export const uploadMarketplace = multer({
  storage: createStorage('marketplace'),
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE },
}).single('image');

// ── Multer error wrapper ──────────────────────────────────────────────────────
// Wraps multer middleware in Express-compatible error handling.
// Usage in routes: router.post('/', multerHandler(uploadLostFound), controller)
export const multerHandler = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific error (e.g. file too large)
      res.status(400);
      return next(new Error(`Upload error: ${err.message}`));
    } else if (err) {
      // Our custom fileFilter error
      res.status(400);
      return next(err);
    }
    next();
  });
};
