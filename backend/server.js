/**
 * server.js
 * ─────────────────────────────────────────────────────────────────────────────
 * UniVerse — Express application entry point.
 *
 * Boot sequence:
 *  1. Load environment variables (via config/env.js)
 *  2. Connect to MongoDB Atlas
 *  3. Register global middleware (CORS, JSON, morgan logger)
 *  4. Mount feature routers
 *  5. Serve static uploads
 *  6. Attach 404 + global error handlers (must be last)
 *  7. Start HTTP server
 * ─────────────────────────────────────────────────────────────────────────────
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import 'colors';

import { env } from './config/env.js';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// ── Route imports ────────────────────────────────────────────────────────────
import authRoutes        from './routes/authRoutes.js';        // ✅ live
import lostFoundRoutes   from './routes/lostFoundRoutes.js';   // ✅ live
import marketplaceRoutes from './routes/marketplaceRoutes.js'; // ✅ live
import notesRoutes       from './routes/notesRoutes.js';       // ✅ live

// ── ESM __dirname shim ────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── 1. Connect to MongoDB ─────────────────────────────────────────────────────
await connectDB();

// ── 2. Initialise Express ─────────────────────────────────────────────────────
const app = express();

// ── 3. Global Middleware ──────────────────────────────────────────────────────

// CORS — whitelist the React dev server (and production domain later)
app.use(
  cors({
    origin: [env.CLIENT_URL],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Parse incoming JSON bodies (max 10mb for note content)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data (for multipart forms without files)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logger — 'dev' format in development, 'combined' in production
app.use(morgan(env.isDev ? 'dev' : 'combined'));

// ── 4. Health-check endpoint ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'UniVerse API is running 🚀',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── 5. Feature Routers ────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);              // ✅ Register / Login / Me
app.use('/api/lostfound',   lostFoundRoutes);         // ✅ Lost & Found CRUD
app.use('/api/marketplace', marketplaceRoutes);       // ✅ Marketplace CRUD
app.use('/api/notes',       notesRoutes);             // ✅ AI Notes CRUD

// ── 6. Static File Serving ────────────────────────────────────────────────────
// Uploaded images / PDFs accessible at: /uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── 7. Error Handling (MUST be last) ─────────────────────────────────────────
app.use(notFound);      // Catches unmatched routes → 404
app.use(errorHandler);  // Catches all errors thrown by controllers

// ── 8. Start Server ───────────────────────────────────────────────────────────
const server = app.listen(env.PORT, () => {
  console.log(
    `\n🚀  Server running in ${env.NODE_ENV.toUpperCase()} mode on port ${env.PORT}`.green.bold
  );
  console.log(`   Health: http://localhost:${env.PORT}/api/health`.cyan);
});

// ── Graceful shutdown on unhandled rejections ─────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error(`\n💥  Unhandled Rejection: ${err.message}`.red.bold);
  server.close(() => process.exit(1));
});

export default app;
