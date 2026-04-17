/**
 * routes/aiRoutes.js
 * Stateless AI endpoint — no note required, no DB write.
 * Used by Interview Prep and any future standalone AI tool.
 * POST /api/ai/generate  → { prompt, mode, context? }
 */
import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import aiService from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = express.Router();

router.post('/generate', protect, asyncHandler(async (req, res) => {
  const { prompt, mode = 'notes', context = '' } = req.body;

  if (!prompt || prompt.trim().length < 3) {
    return sendError(res, 400, 'Prompt must be at least 3 characters');
  }

  const effectivePrompt = context
    ? `Context:\n${context}\n\nRequest: ${prompt}`
    : prompt;

  const result = await aiService.generate(effectivePrompt, { mode });
  return sendSuccess(res, 200, 'AI generation complete', { result });
}));

export default router;
