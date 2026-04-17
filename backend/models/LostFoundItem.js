/**
 * models/LostFoundItem.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mongoose schema for a Lost & Found item.
 *
 * Schema design decisions:
 *  - `type`     enum ['lost','found'] — drives all filtering logic
 *  - `status`   enum ['open','claimed','resolved'] — lifecycle tracking
 *  - `postedBy` ref to User — enables populate() for owner details
 *  - `image`    stores relative path (e.g. "/uploads/lostfound/abc.jpg")
 *               served as static by Express; frontend prepends base URL
 *  - `tags`     free-form array for future search/filter expansion
 *
 * Indexes:
 *  - Compound index on (type, status) — the most common query pattern
 *  - Text index on (title, description) — enables full-text search later
 * ─────────────────────────────────────────────────────────────────────────────
 */

import mongoose from 'mongoose';

const lostFoundItemSchema = new mongoose.Schema(
  {
    // ── Core Fields ───────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    // ── Classification ────────────────────────────────────────────────────────
    type: {
      type: String,
      enum: {
        values: ['lost', 'found'],
        message: 'Type must be either "lost" or "found"',
      },
      required: [true, 'Type (lost/found) is required'],
      index: true,
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'electronics',
          'clothing',
          'accessories',
          'books',
          'documents',
          'keys',
          'bags',
          'sports',
          'other',
        ],
        message: 'Invalid category',
      },
      index: true,
    },

    // ── Location ──────────────────────────────────────────────────────────────
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters'],
    },

    // ── Lifecycle ─────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['open', 'claimed', 'resolved'],
      default: 'open',
      index: true,
    },

    // ── Media ────────────────────────────────────────────────────────────────
    image: {
      type: String,
      default: '', // Relative path: "/uploads/lostfound/<filename>"
    },

    // ── Ownership ─────────────────────────────────────────────────────────────
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Optional extras ───────────────────────────────────────────────────────
    tags: {
      type: [String],
      default: [],
    },

    // Contact override (if user wants a different contact for this item)
    contactInfo: {
      type: String,
      default: '',
      trim: true,
    },

    // Date the item was actually lost or found (vs. createdAt = posting date)
    dateLostOrFound: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ── Compound index for the most common filtered queries ───────────────────────
// e.g. "show me all open lost items" → hits this index
lostFoundItemSchema.index({ type: 1, status: 1 });
lostFoundItemSchema.index({ category: 1, type: 1 });

// ── Text index for keyword search ─────────────────────────────────────────────
lostFoundItemSchema.index(
  { title: 'text', description: 'text', location: 'text' },
  { weights: { title: 3, location: 2, description: 1 } }
);

// ── Clean __v from responses ──────────────────────────────────────────────────
lostFoundItemSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

const LostFoundItem = mongoose.model('LostFoundItem', lostFoundItemSchema);
export default LostFoundItem;
