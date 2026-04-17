/**
 * config/db.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Establishes and manages the MongoDB Atlas connection via Mongoose.
 *
 * Strategy:
 *  - Single connection shared across the entire app lifetime.
 *  - Logs host on success for traceability.
 *  - Hard-exits on failure so the server never starts in a broken state.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import mongoose from 'mongoose';
import { env } from './env.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      // Mongoose 8+ has these defaults built-in, kept explicit for clarity
      serverSelectionTimeoutMS: 5000, // fail fast if Atlas unreachable
    });

    console.log(
      `✅  MongoDB connected: ${conn.connection.host}`.cyan.bold
    );
  } catch (error) {
    console.error(`❌  MongoDB connection failed: ${error.message}`.red.bold);
    process.exit(1); // Non-zero exit signals failure to process managers (PM2, Docker)
  }
};

// ── Mongoose event listeners for runtime monitoring ───────────────────────────
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️   MongoDB disconnected. Attempting reconnect...'.yellow);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅  MongoDB reconnected.'.cyan);
});

export default connectDB;
