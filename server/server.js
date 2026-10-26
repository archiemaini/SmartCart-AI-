/**
 * =====================================================================
 * Contributor: LAVANYA
 * Role: Lead Frontend UI/UX & Assistant Engineer
 * Syllabus Sessions: Sessions 31-35 (Node.js, Express App Pipeline, Static Files & Lifecycle)
 * Feature: Main Server Orchestration, Middleware Pipeline & Route Mounting
 * =====================================================================
 */
import 'dotenv/config'; // Session 36: Environment Variables
import express from 'express'; // Session 37: Express Server
import cors from 'cors';
import path from 'path'; // Session 33: Path Module
import fs from 'fs'; // Session 33: File System Module
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js'; // Session 41: MongoDB & Mongoose
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import chatRoutes from './routes/chat.js';
import { notFound, errorHandler } from './middleware/errorHandler.js'; // Session 39: Error Handling Middleware

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express App (Session 37)
const app = express();
const PORT = process.env.PORT || 5001;

// Ensure uploads folder exists (Session 33 & 40)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─────────────────────────────────────────────────────────────
// Middleware Setup (Session 38: Middleware & Body Parsing)
// ─────────────────────────────────────────────────────────────

// Enable CORS for cross-origin requests from React Vite client
app.use(cors());

// Built-in Body Parsing Middleware (Session 38)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Logger Middleware: Request-Response Lifecycle (Session 35 & 38)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve Multer uploaded files statically (Session 40)
app.use('/uploads', express.static(uploadsDir));

// ─────────────────────────────────────────────────────────────
// API Routes (Session 37-38: Express Routing & REST APIs)
// ─────────────────────────────────────────────────────────────

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SmartCart API',
    uptime: `${Math.round(process.uptime())}s`,
    database: 'MongoDB Connected',
  });
});

// Mount Resource Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);

// ─────────────────────────────────────────────────────────────
// Error Handling Middleware (Session 39)
// ─────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// Database Connection & Server Startup (Session 41 & 35)
// ─────────────────────────────────────────────────────────────
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 SmartCart Server running on http://localhost:${PORT}`);
      console.log(`📦 MongoDB connected and ready`);
      console.log(`📁 Static uploads folder: ${uploadsDir}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();
