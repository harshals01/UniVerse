/**
 * models/User.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mongoose schema for a UniVerse user.
 *
 * Security design:
 *  - Password is hashed with bcrypt (cost factor 10) BEFORE saving.
 
 * Schema fields:
 *  name       - Display name
 *  email      - Unique login identifier
 *  password   - bcrypt hash (hidden by default)
 *  role       - 'student' | 'admin'  (extensible for future RBAC)
 *  avatar     - Optional profile picture URL
 *  college    - Student's college/university name
 *  createdAt  - Auto-managed by timestamps: true
 *  updatedAt  - Auto-managed by timestamps: true
 * ─────────────────────────────────────────────────────────────────────────────
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },

    avatar: {
      type: String,
      default: '',
    },

    college: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * @param {string} enteredPassword 
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
export default User;
