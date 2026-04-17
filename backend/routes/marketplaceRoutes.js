/**
 * routes/marketplaceRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounted in server.js at: /api/marketplace
 *
 * Endpoint map:
 *  GET    /api/marketplace             → getAllListings   (public)
 *  POST   /api/marketplace             → createListing   (private + image)
 *  GET    /api/marketplace/:id         → getListingById  (public)
 *  DELETE /api/marketplace/:id         → deleteListing   (private)
 *  PATCH  /api/marketplace/:id/sold    → markAsSold      (private)
 *
 * Reused middleware (zero new imports):
 *  protect          — from authMiddleware
 *  uploadMarketplace, multerHandler — from uploadMiddleware
 * ─────────────────────────────────────────────────────────────────────────────
 */

import express from 'express';
import {
  createListing,
  getAllListings,
  getListingById,
  deleteListing,
  markAsSold,
} from '../controllers/marketplaceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadMarketplace, multerHandler } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/',    getAllListings);
router.get('/:id', getListingById);

// ── Private ───────────────────────────────────────────────────────────────────
router.post(
  '/',
  protect,
  multerHandler(uploadMarketplace),  // Reused from lostFound routes — same middleware
  createListing
);

router.delete('/:id', protect, deleteListing);

router.patch('/:id/sold', protect, markAsSold);

export default router;
