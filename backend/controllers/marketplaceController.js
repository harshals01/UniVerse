/**
 * controllers/marketplaceController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Marketplace CRUD — intentionally mirrors lostFoundController patterns.
 *
 * Code reuse strategy:
 *  - Same dynamic filter builder pattern
 *  - Same Promise.all([find, count]) for pagination
 *  - Same ownership guard (toString comparison)
 *  - Same disk cleanup on delete
 *  - Same image path convention
 *  - Reuses: sendSuccess, sendError, protect, multerHandler, uploadMarketplace
 *
 * Marketplace-specific additions:
 *  - Price range filtering (?minPrice, ?maxPrice)
 *  - Condition filtering (?condition)
 *  - isSold filtering (?isSold)
 *  - Price sorting (?sortBy=price_asc | price_desc)
 *  - PATCH /:id/sold   → Mark listing as sold
 *
 * Exported functions:
 *  createListing    POST   /api/marketplace
 *  getAllListings    GET    /api/marketplace
 *  getListingById   GET    /api/marketplace/:id
 *  deleteListing    DELETE /api/marketplace/:id
 *  markAsSold       PATCH  /api/marketplace/:id/sold
 * ─────────────────────────────────────────────────────────────────────────────
 */

import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import MarketplaceItem from '../models/MarketplaceItem.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Internal helper: delete image from disk ───────────────────────────────────
// Extracted to avoid repeating the same 3-line pattern in update + delete
const removeImageFile = (relativePath) => {
  if (!relativePath) return;
  const abs = path.join(__dirname, '..', relativePath);
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
};

// ── Internal helper: parse tags from FormData string ─────────────────────────
const parseTags = (raw) =>
  raw ? String(raw).split(',').map((t) => t.trim()).filter(Boolean) : [];

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new marketplace listing
// @route   POST /api/marketplace
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const createListing = asyncHandler(async (req, res) => {
  const { title, description, price, condition, category, location, contactInfo, tags } =
    req.body;

  // ── 1. Validate required fields ──────────────────────────────────────────
  if (!title || !description || price === undefined || !condition || !category) {
    return sendError(
      res, 400,
      'title, description, price, condition, and category are required'
    );
  }

  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    return sendError(res, 400, 'Price must be a non-negative number');
  }

  // ── 2. Build image path ───────────────────────────────────────────────────
  const imagePath = req.file ? `/uploads/marketplace/${req.file.filename}` : '';

  // ── 3. Create document ────────────────────────────────────────────────────
  const listing = await MarketplaceItem.create({
    title,
    description,
    price: numericPrice,
    condition,
    category,
    location:    location    || '',
    contactInfo: contactInfo || '',
    image:       imagePath,
    tags:        parseTags(tags),
    postedBy:    req.user._id,
  });

  await listing.populate('postedBy', 'name email avatar college');

  return sendSuccess(res, 201, 'Listing created successfully', { listing });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all listings — filter, search, sort, paginate
// @route   GET /api/marketplace
// @access  Public
//
// Supported query params:
//  ?category=electronics
//  ?condition=new
//  ?isSold=false               (default: shows only unsold)
//  ?minPrice=100&maxPrice=500  (price range)
//  ?search=macbook             (text search)
//  ?sortBy=price_asc | price_desc | newest (default)
//  ?page=1&limit=12
// ─────────────────────────────────────────────────────────────────────────────
export const getAllListings = asyncHandler(async (req, res) => {
  const {
    category,
    condition,
    isSold    = 'false',    // Default: hide sold items
    minPrice,
    maxPrice,
    search,
    sortBy    = 'newest',
    page      = 1,
    limit     = 12,
  } = req.query;

  // ── Build filter object ───────────────────────────────────────────────────
  const filter = {};

  // isSold: convert string → boolean
  if (isSold === 'true')  filter.isSold = true;
  if (isSold === 'false') filter.isSold = false;

  if (category  && category  !== 'all') filter.category  = category;
  if (condition && condition !== 'all') filter.condition = condition;

  // Price range — only apply the bounds that are provided
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
  }

  // Text search
  if (search && search.trim()) {
    filter.$text = { $search: search.trim() };
  }

  // ── Sort strategy ─────────────────────────────────────────────────────────
  // Same pattern as lostFoundController but with price sort added
  const SORT_MAP = {
    newest:     { createdAt: -1 },
    oldest:     { createdAt:  1 },
    price_asc:  { price:      1 },
    price_desc: { price:     -1 },
  };
  const sortOptions = search
    ? { score: { $meta: 'textScore' } }   // Text relevance first
    : (SORT_MAP[sortBy] ?? SORT_MAP.newest);

  // ── Pagination ────────────────────────────────────────────────────────────
  const pageNum  = Math.max(1, parseInt(page,  10) || 1);
  const limitNum = Math.min(50, parseInt(limit, 10) || 12);
  const skip     = (pageNum - 1) * limitNum;

  // ── Parallel query + count (same pattern as lostFoundController) ──────────
  const [listings, total] = await Promise.all([
    MarketplaceItem.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('postedBy', 'name email avatar college')
      .lean(),
    MarketplaceItem.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, 'Listings fetched successfully', {
    listings,
    pagination: {
      total,
      page:       pageNum,
      limit:      limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNext:    pageNum < Math.ceil(total / limitNum),
      hasPrev:    pageNum > 1,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single listing by ID
// @route   GET /api/marketplace/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getListingById = asyncHandler(async (req, res) => {
  const listing = await MarketplaceItem.findById(req.params.id).populate(
    'postedBy',
    'name email avatar college'
  );

  if (!listing) return sendError(res, 404, 'Listing not found');

  return sendSuccess(res, 200, 'Listing fetched successfully', { listing });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a listing (owner or admin only)
// @route   DELETE /api/marketplace/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const deleteListing = asyncHandler(async (req, res) => {
  const listing = await MarketplaceItem.findById(req.params.id);
  if (!listing) return sendError(res, 404, 'Listing not found');

  // ── Ownership guard (same pattern as lostFoundController) ─────────────────
  const isOwner = listing.postedBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return sendError(res, 403, 'Not authorized to delete this listing');
  }

  // ── Remove image from disk (shared helper) ─────────────────────────────────
  removeImageFile(listing.image);

  await listing.deleteOne();

  return sendSuccess(res, 200, 'Listing deleted successfully', null);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark a listing as sold (owner only)
// @route   PATCH /api/marketplace/:id/sold
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const markAsSold = asyncHandler(async (req, res) => {
  const listing = await MarketplaceItem.findById(req.params.id);
  if (!listing) return sendError(res, 404, 'Listing not found');

  // Only the owner can mark their own item as sold
  if (listing.postedBy.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Only the listing owner can mark it as sold');
  }

  if (listing.isSold) {
    return sendError(res, 400, 'Listing is already marked as sold');
  }

  listing.isSold = true;
  await listing.save();

  return sendSuccess(res, 200, 'Listing marked as sold', { listing });
});
