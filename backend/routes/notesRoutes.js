/**
 * routes/notesRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounted in server.js at: /api/notes
 *
 * Endpoint map:
 *  GET    /api/notes/public        → getPublicNotes  (public)   ← MUST be before /:id
 *  GET    /api/notes               → getNotes        (private)
 *  POST   /api/notes               → createNote      (private)
 *  GET    /api/notes/:id           → getNoteById     (private/public)
 *  PUT    /api/notes/:id           → updateNote      (private)
 *  DELETE /api/notes/:id           → deleteNote      (private)
 *  POST   /api/notes/:id/ai        → generateAI      (private) ← core AI endpoint
 * ─────────────────────────────────────────────────────────────────────────────
 */

import express from 'express';
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  generateAI,
  getPublicNotes,
} from '../controllers/notesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Public — MUST be registered before /:id to avoid route collision ──────────
router.get('/public', getPublicNotes);

// ── Private ───────────────────────────────────────────────────────────────────
router.get ('/',    protect, getNotes);
router.post('/',    protect, createNote);
router.get ('/:id', protect, getNoteById);
router.put ('/:id', protect, updateNote);
router.delete('/:id', protect, deleteNote);

// ── AI endpoint ───────────────────────────────────────────────────────────────
// Nested under /:id because AI always operates on a specific note
router.post('/:id/ai', protect, generateAI);

export default router;
