/**
 * routes/aiRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Stateless AI endpoint — no DB write.
 * Supports both:
 *   • Multi-turn chat:  POST /api/ai/generate { messages[], mode, systemContext? }
 *   • Single-prompt:   POST /api/ai/generate { prompt, mode, context? }
 * ─────────────────────────────────────────────────────────────────────────────
 */
import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import aiService from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = express.Router();

router.post('/generate', protect, asyncHandler(async (req, res) => {
  const { prompt, mode = 'notes', context = '', messages, systemContext = '' } = req.body;

  // ── Multi-turn path: validate messages array ──────────────────────────────
  if (messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return sendError(res, 400, 'messages must be a non-empty array');
    }
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg?.content || lastMsg.content.trim().length < 1) {
      return sendError(res, 400, 'Last message content cannot be empty');
    }
    const result = await aiService.generate(null, { mode, messages, systemContext });
    return sendSuccess(res, 200, 'AI generation complete', { result });
  }

  // ── Single-prompt path (backward compat with Notes workspace) ────────────
  if (!prompt || prompt.trim().length < 3) {
    return sendError(res, 400, 'Prompt must be at least 3 characters');
  }
  const effectivePrompt = context
    ? `Context:\n${context}\n\nRequest: ${prompt}`
    : prompt;

  const result = await aiService.generate(effectivePrompt, { mode, systemContext });
  return sendSuccess(res, 200, 'AI generation complete', { result });
}));

export default router;
