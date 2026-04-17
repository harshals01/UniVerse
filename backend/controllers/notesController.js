/**
 * controllers/notesController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Notes CRUD + AI generation controller.
 *
 * Exported functions:
 *  createNote       POST   /api/notes
 *  getNotes         GET    /api/notes                ← user's own notes
 *  getNoteById      GET    /api/notes/:id
 *  updateNote       PUT    /api/notes/:id
 *  deleteNote       DELETE /api/notes/:id
 *  generateAI       POST   /api/notes/:id/ai         ← core AI endpoint
 *  getPublicNotes   GET    /api/notes/public          ← community notes
 *
 * AI endpoint design (generateAI):
 *  - Accepts: { prompt, mode }
 *  - Calls aiService.generate() — provider-agnostic
 *  - Pushes result to note.aiHistory
 *  - Updates note.aiSummary with latest response
 *  - Returns both the AI result and updated history length
 *  - Rate-limit friendly: one DB write per AI call (atomic $push)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import asyncHandler from 'express-async-handler';
import Note from '../models/Note.js';
import aiService from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// ── Shared tag parser (same pattern as marketplace controller) ─────────────────
const parseTags = (raw) =>
  raw ? String(raw).split(',').map((t) => t.trim()).filter(Boolean) : [];

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const createNote = asyncHandler(async (req, res) => {
  const { title, subject, content, tags, isPublic } = req.body;

  if (!title) return sendError(res, 400, 'Note title is required');

  const note = await Note.create({
    title,
    subject:  subject  || 'General',
    content:  content  || '',
    tags:     parseTags(tags),
    isPublic: isPublic === true || isPublic === 'true',
    postedBy: req.user._id,
  });

  return sendSuccess(res, 201, 'Note created successfully', { note });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current user's notes (with optional search + filter)
// @route   GET /api/notes
// @access  Private
//
// Query params:
//  ?subject=Math
//  ?search=calculus    ← text search
//  ?page=1&limit=10
// ─────────────────────────────────────────────────────────────────────────────
export const getNotes = asyncHandler(async (req, res) => {
  const { subject, search, page = 1, limit = 10 } = req.query;

  // Base filter: only user's own notes
  const filter = { postedBy: req.user._id };

  if (subject && subject !== 'all') filter.subject = subject;
  if (search && search.trim())      filter.$text = { $search: search.trim() };

  const pageNum  = Math.max(1, parseInt(page,  10) || 1);
  const limitNum = Math.min(50, parseInt(limit, 10) || 10);
  const skip     = (pageNum - 1) * limitNum;

  const sortOptions = search ? { score: { $meta: 'textScore' } } : { createdAt: -1 };

  const [notes, total] = await Promise.all([
    Note.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-aiHistory -content')   // ← Omit heavy fields from list view
      .lean(),
    Note.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, 'Notes fetched', {
    notes,
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
// @desc    Get single note (full content + AI history)
// @route   GET /api/notes/:id
// @access  Private (unless note.isPublic)
// ─────────────────────────────────────────────────────────────────────────────
export const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id).populate('postedBy', 'name avatar');

  if (!note) return sendError(res, 404, 'Note not found');

  // Allow access if public OR if owner
  const isOwner  = note.postedBy._id.toString() === req.user._id.toString();
  const isPublic = note.isPublic;

  if (!isOwner && !isPublic) {
    return sendError(res, 403, 'This note is private');
  }

  return sendSuccess(res, 200, 'Note fetched', { note });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update note metadata/content (NOT AI fields — use /ai for that)
// @route   PUT /api/notes/:id
// @access  Private (owner only)
// ─────────────────────────────────────────────────────────────────────────────
export const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return sendError(res, 404, 'Note not found');

  if (note.postedBy.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to edit this note');
  }

  const { title, subject, content, isPublic } = req.body;

  if (title    !== undefined) note.title    = title;
  if (subject  !== undefined) note.subject  = subject;
  if (content  !== undefined) note.content  = content;
  if (isPublic !== undefined) note.isPublic = isPublic === true || isPublic === 'true';
  if (req.body.tags !== undefined) note.tags = parseTags(req.body.tags);

  const updated = await note.save();
  return sendSuccess(res, 200, 'Note updated', { note: updated });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a note and its entire AI history
// @route   DELETE /api/notes/:id
// @access  Private (owner only)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return sendError(res, 404, 'Note not found');

  if (note.postedBy.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to delete this note');
  }

  await note.deleteOne();
  return sendSuccess(res, 200, 'Note deleted', null);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Call AI to generate notes / summary / quiz for a note
// @route   POST /api/notes/:id/ai
// @access  Private (owner only)
//
// Body:
//  { prompt: string, mode: 'notes' | 'summarize' | 'quiz' }
//
// Workflow:
//  1. Validate note exists + user owns it
//  2. Build effective prompt (user prompt + note content context)
//  3. Call aiService.generate() — provider-agnostic
//  4. Push result to note.aiHistory (atomic $push — no stale read risk)
//  5. Update note.aiSummary with latest result
//  6. Return AI result + new history entry
// ─────────────────────────────────────────────────────────────────────────────
export const generateAI = asyncHandler(async (req, res) => {
  const { prompt, mode = 'notes' } = req.body;

  if (!prompt || prompt.trim().length < 3) {
    return sendError(res, 400, 'Prompt must be at least 3 characters');
  }

  if (!['notes', 'summarize', 'quiz'].includes(mode)) {
    return sendError(res, 400, 'Mode must be one of: notes, summarize, quiz');
  }

  // ── 1. Fetch note ─────────────────────────────────────────────────────────
  const note = await Note.findById(req.params.id);
  if (!note) return sendError(res, 404, 'Note not found');

  if (note.postedBy.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to use AI on this note');
  }

  // ── 2. Build effective prompt ─────────────────────────────────────────────
  // If the note has existing content, prepend it for context
  const effectivePrompt = note.content
    ? `Context from my notes:\n${note.content.slice(0, 2000)}\n\nRequest: ${prompt}`
    : prompt;

  // ── 3. Call AI service ────────────────────────────────────────────────────
  const aiResult = await aiService.generate(effectivePrompt, { mode });

  // ── 4. Build history entry ────────────────────────────────────────────────
  const historyEntry = {
    prompt:     prompt,           // Store original user prompt (not the expanded one)
    response:   aiResult.content,
    mode:       aiResult.mode,
    tokensUsed: aiResult.tokensUsed,
    provider:   aiResult.provider,
  };

  // ── 5. Atomic update — push to history + update summary ───────────────────
  // $push avoids race conditions better than .save() in concurrent scenarios
  await Note.findByIdAndUpdate(note._id, {
    $push:  { aiHistory: historyEntry },
    $set:   { aiSummary: aiResult.content },
  });

  return sendSuccess(res, 200, 'AI generation complete', {
    result: {
      content:    aiResult.content,
      mode:       aiResult.mode,
      provider:   aiResult.provider,
      tokensUsed: aiResult.tokensUsed,
    },
    historyEntry,
    historyLength: note.aiHistory.length + 1,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get public notes from all users (community resource)
// @route   GET /api/notes/public
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getPublicNotes = asyncHandler(async (req, res) => {
  const { subject, search, page = 1, limit = 12 } = req.query;

  const filter = { isPublic: true };
  if (subject && subject !== 'all') filter.subject = subject;
  if (search && search.trim())      filter.$text = { $search: search.trim() };

  const pageNum  = Math.max(1, parseInt(page,  10) || 1);
  const limitNum = Math.min(50, parseInt(limit, 10) || 12);
  const skip     = (pageNum - 1) * limitNum;

  const [notes, total] = await Promise.all([
    Note.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-aiHistory -content')
      .populate('postedBy', 'name avatar college')
      .lean(),
    Note.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, 'Public notes fetched', {
    notes,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});
