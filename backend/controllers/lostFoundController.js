/**
 * controllers/lostFoundController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Business logic for the Lost & Found module.
 *
 * Exported functions:
 *  createItem    POST   /api/lostfound
 *  getAllItems   GET    /api/lostfound         ← supports filtering & search
 *  getItemById   GET    /api/lostfound/:id
 *  updateItem    PUT    /api/lostfound/:id     ← owner or admin only
 *  deleteItem    DELETE /api/lostfound/:id     ← owner or admin only
 *  claimItem     PATCH  /api/lostfound/:id/claim
 *
 * Filtering strategy (getAllItems):
 *  All filters are optional query params. They are built into a
 *  MongoDB query object dynamically — only applied when provided.
 *
 *  ?type=lost            → { type: 'lost' }
 *  ?type=found           → { type: 'found' }
 *  ?status=open          → { status: 'open' }
 *  ?category=electronics → { category: 'electronics' }
 *  ?search=iphone        → MongoDB $text search on title/description/location
 *  ?page=2&limit=10      → Pagination
 * ─────────────────────────────────────────────────────────────────────────────
 */

import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import LostFoundItem from '../models/LostFoundItem.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new Lost or Found item
// @route   POST /api/lostfound
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const createItem = asyncHandler(async (req, res) => {
  const { title, description, type, category, location, contactInfo, dateLostOrFound, tags } =
    req.body;

  // ── 1. Required field validation ──────────────────────────────────────────
  if (!title || !description || !type || !category || !location) {
    return sendError(res, 400, 'title, description, type, category, and location are required');
  }

  // ── 2. Build image path if a file was uploaded ────────────────────────────
  // req.file is populated by multerHandler(uploadLostFound) in the route
  const imagePath = req.file
    ? `/uploads/lostfound/${req.file.filename}`
    : '';

  // ── 3. Parse tags safely (sent as comma-separated string from FormData) ───
  const parsedTags = tags
    ? String(tags).split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  // ── 4. Create document ────────────────────────────────────────────────────
  const item = await LostFoundItem.create({
    title,
    description,
    type,
    category,
    location,
    image: imagePath,
    contactInfo: contactInfo || '',
    dateLostOrFound: dateLostOrFound || Date.now(),
    tags: parsedTags,
    postedBy: req.user._id, // Set by protect middleware
  });

  // ── 5. Populate owner info for the response ───────────────────────────────
  await item.populate('postedBy', 'name email avatar college');

  return sendSuccess(res, 201, 'Item posted successfully', { item });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all items with optional filtering, searching, and pagination
// @route   GET /api/lostfound
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getAllItems = asyncHandler(async (req, res) => {
  const {
    type,       // 'lost' | 'found'
    status,     // 'open' | 'claimed' | 'resolved'
    category,   // any valid category enum
    search,     // keyword for text search
    page  = 1,
    limit = 12,
  } = req.query;

  // ── Build dynamic filter object ───────────────────────────────────────────
  const filter = {};

  if (type     && ['lost', 'found'].includes(type))               filter.type     = type;
  if (status   && ['open', 'claimed', 'resolved'].includes(status)) filter.status = status;
  if (category && category !== 'all')                              filter.category = category;

  // Text search across title, description, location (uses text index)
  if (search && search.trim()) {
    filter.$text = { $search: search.trim() };
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  const pageNum  = Math.max(1, parseInt(page,  10) || 1);
  const limitNum = Math.min(50, parseInt(limit, 10) || 12); // Cap at 50/page
  const skip     = (pageNum - 1) * limitNum;

  // ── Query + Sort ──────────────────────────────────────────────────────────
  // If text search → sort by relevance score; otherwise newest first
  const sortOptions = search ? { score: { $meta: 'textScore' } } : { createdAt: -1 };

  const [items, total] = await Promise.all([
    LostFoundItem.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('postedBy', 'name email avatar college')
      .lean(), // .lean() returns plain JS objects — faster for read-only
    LostFoundItem.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, 'Items fetched successfully', {
    items,
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
// @desc    Get a single item by ID
// @route   GET /api/lostfound/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getItemById = asyncHandler(async (req, res) => {
  const item = await LostFoundItem.findById(req.params.id).populate(
    'postedBy',
    'name email avatar college'
  );

  if (!item) return sendError(res, 404, 'Item not found');

  return sendSuccess(res, 200, 'Item fetched successfully', { item });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update an item (owner or admin only)
// @route   PUT /api/lostfound/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const updateItem = asyncHandler(async (req, res) => {
  const item = await LostFoundItem.findById(req.params.id);
  if (!item) return sendError(res, 404, 'Item not found');

  // ── Ownership check ──────────────────────────────────────────────────────
  const isOwner = item.postedBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return sendError(res, 403, 'Not authorized to update this item');
  }

  // ── Handle new image upload ───────────────────────────────────────────────
  if (req.file) {
    // Delete old image from disk if one existed
    if (item.image) {
      const oldPath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    item.image = `/uploads/lostfound/${req.file.filename}`;
  }

  // ── Apply updates (only provided fields) ─────────────────────────────────
  const updatableFields = ['title', 'description', 'category', 'location', 'status', 'contactInfo', 'dateLostOrFound'];
  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) item[field] = req.body[field];
  });

  if (req.body.tags !== undefined) {
    item.tags = String(req.body.tags).split(',').map((t) => t.trim()).filter(Boolean);
  }

  const updated = await item.save();
  await updated.populate('postedBy', 'name email avatar');

  return sendSuccess(res, 200, 'Item updated successfully', { item: updated });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete an item (owner or admin only)
// @route   DELETE /api/lostfound/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const deleteItem = asyncHandler(async (req, res) => {
  const item = await LostFoundItem.findById(req.params.id);
  if (!item) return sendError(res, 404, 'Item not found');

  // ── Ownership check ──────────────────────────────────────────────────────
  const isOwner = item.postedBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return sendError(res, 403, 'Not authorized to delete this item');
  }

  // ── Remove associated image from disk ─────────────────────────────────────
  if (item.image) {
    const imagePath = path.join(__dirname, '..', item.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  await item.deleteOne();

  return sendSuccess(res, 200, 'Item deleted successfully', null);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark an item as claimed (anyone can claim a found item)
// @route   PATCH /api/lostfound/:id/claim
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const claimItem = asyncHandler(async (req, res) => {
  const item = await LostFoundItem.findById(req.params.id);
  if (!item) return sendError(res, 404, 'Item not found');

  if (item.status !== 'open') {
    return sendError(res, 400, `Item is already ${item.status} and cannot be claimed`);
  }

  item.status = 'claimed';
  await item.save();

  return sendSuccess(res, 200, 'Item marked as claimed', { item });
});
