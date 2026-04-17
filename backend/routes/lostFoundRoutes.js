/**
 * routes/lostFoundRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Lost & Found endpoints. Mounted in server.js at: /api/lostfound
 *
 * Endpoint map:
 *  GET    /api/lostfound                 → getAllItems  (public)
 *  POST   /api/lostfound                 → createItem  (private + image upload)
 *  GET    /api/lostfound/:id             → getItemById (public)
 *  PUT    /api/lostfound/:id             → updateItem  (private + optional image)
 *  DELETE /api/lostfound/:id             → deleteItem  (private)
 *  PATCH  /api/lostfound/:id/claim       → claimItem   (private)
 *
 * Middleware chain for mutating routes:
 *  protect → multerHandler(uploadLostFound) → controller
 *  Upload must come AFTER protect (need req.user set before processing body)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import express from 'express';
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  claimItem,
} from '../controllers/lostFoundController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadLostFound, multerHandler } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/',    getAllItems);
router.get('/:id', getItemById);

// ── Private routes ────────────────────────────────────────────────────────────
router.post(
  '/',
  protect,                           // 1. Verify JWT → populate req.user
  multerHandler(uploadLostFound),    // 2. Parse multipart form + save image
  createItem                         // 3. Controller runs with req.file available
);

router.put(
  '/:id',
  protect,
  multerHandler(uploadLostFound),    // Optional: new image replaces old one
  updateItem
);

router.delete('/:id', protect, deleteItem);

// Claim endpoint uses PATCH — it's a partial status update, not a full replace
router.patch('/:id/claim', protect, claimItem);

export default router;
