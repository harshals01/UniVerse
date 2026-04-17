/**
 * models/Note.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Schema for a user's AI-powered note.
 *
 * Core concept:
 *  A Note stores the original content AND an embedded aiHistory array.
 *  Every time the user calls the AI (generate / summarize / quiz),
 *  a new entry is pushed to aiHistory — giving a full conversation trail.
 *
 * Schema fields:
 *  title        - Note title (user-defined or AI-generated)
 *  subject      - Academic subject (Math, Chemistry, etc.)
 *  content      - The raw note text — user writes this
 *  aiSummary    - Latest AI output (quick access without scanning history)
 *  aiHistory    - Array of all AI interactions on this note
 *  tags         - Free-form labels
 *  isPublic     - Whether other students can view this note
 *  postedBy     - Owner
 * ─────────────────────────────────────────────────────────────────────────────
 */

import mongoose from 'mongoose';

// ── Sub-schema: one AI interaction entry ─────────────────────────────────────
const aiHistoryEntrySchema = new mongoose.Schema(
  {
    prompt:    { type: String, required: true },  // What the user asked
    response:  { type: String, required: true },  // What AI returned
    mode:      {                                  // Which AI mode was used
      type: String,
      enum: ['notes', 'summarize', 'quiz'],
      default: 'notes',
    },
    tokensUsed: { type: Number, default: 0 },
    provider:   { type: String, default: 'mock' },
  },
  {
    timestamps: true, // Each history entry gets its own createdAt
    _id: true,        // Each entry has its own _id for reference
  }
);

// ── Main Note schema ──────────────────────────────────────────────────────────
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },

    subject: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [80, 'Subject cannot exceed 80 characters'],
    },

    // Raw content the user provides (their own notes / topic text)
    content: {
      type: String,
      default: '',
      maxlength: [20000, 'Note content cannot exceed 20,000 characters'],
    },

    // Latest AI-generated output — denormalized for fast access
    // (same data as aiHistory[last].response, stored separately for convenience)
    aiSummary: {
      type: String,
      default: '',
    },

    // Full chronological AI interaction trail for this note
    aiHistory: {
      type: [aiHistoryEntrySchema],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
noteSchema.index({ postedBy: 1, createdAt: -1 }); // "My notes" sorted newest first
noteSchema.index({ title: 'text', content: 'text', subject: 'text' });

// ── Virtual: AI interaction count ─────────────────────────────────────────────
noteSchema.virtual('aiInteractionCount').get(function () {
  return this.aiHistory.length;
});

noteSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    delete ret.id; // avoid id duplicate of _id
    return ret;
  },
});

const Note = mongoose.model('Note', noteSchema);
export default Note;
