/**
 * models/MarketplaceItem.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mongoose schema for a Student Marketplace listing.
 *
 * Differences from LostFoundItem (intentional, not duplication):
 *  - `price`      required Number field (marketplace-specific)
 *  - `condition`  required enum (new/like-new/good/fair)
 *  - `isSold`     boolean flag (simpler than the 3-state status in LostFound)
 *  - No `type`    field — every listing is implicitly "sell"
 *  - No `dateLostOrFound` — irrelevant for marketplace
 *
 * Shared patterns (deliberately reused):
 *  - `postedBy` ref → User
 *  - `image` as relative path string
 *  - `category` enum (same set — consistent UX)
 *  - `tags` array
 *  - timestamps, toJSON transform, text index
 * ─────────────────────────────────────────────────────────────────────────────
 */

import mongoose from 'mongoose';

const marketplaceItemSchema = new mongoose.Schema(
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

    // ── Marketplace-specific Fields ───────────────────────────────────────────
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },

    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: {
        values: ['new', 'like-new', 'good', 'fair'],
        message: 'Condition must be one of: new, like-new, good, fair',
      },
    },

    isSold: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ── Shared Fields (same pattern as LostFoundItem) ─────────────────────────
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

    location: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Location cannot exceed 150 characters'],
    },

    image: {
      type: String,
      default: '',
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    contactInfo: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
marketplaceItemSchema.index({ category: 1, isSold: 1 });
marketplaceItemSchema.index({ price: 1 });           // Range queries: price sort/filter
marketplaceItemSchema.index({ postedBy: 1 });        // "My listings" view

// Text search across title + description
marketplaceItemSchema.index(
  { title: 'text', description: 'text' },
  { weights: { title: 3, description: 1 } }
);

// ── Clean response shape ──────────────────────────────────────────────────────
marketplaceItemSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

const MarketplaceItem = mongoose.model('MarketplaceItem', marketplaceItemSchema);
export default MarketplaceItem;
