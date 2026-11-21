/**
 * =====================================================================
 * SmartCart Backend Server
 * Express pipeline, MongoDB connection, Real Email Service,
 * Razorpay Payment Gateway, AI RAG Shopping Assistant,
 * and Personalized Product Recommendations
 * =====================================================================
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import chatRoutes from './routes/chat.js';
import paymentRoutes from './routes/payment.js';
import recommendationRoutes from './routes/recommendations.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { getTransporter } from './services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─────────────────────────────────────────────────────────────
// Middleware Pipeline
// ─────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve Multer uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// ─────────────────────────────────────────────────────────────
// API Route Mounting
// ─────────────────────────────────────────────────────────────

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SmartCart API (INR Edition)',
    currency: 'INR',
    uptime: `${Math.round(process.uptime())}s`,
    database: 'MongoDB Connected',
    features: [
      'Email Integration & Real Delivery',
      'Real Product API & MongoDB Storage',
      'Intelligent AI RAG Shopping Chatbot',
      'Personalized Recommendations Engine',
      'Admin Dashboard with RBAC',
      'Razorpay Payment Gateway (UPI, Cards, NetBanking)',
      'Multiple Delivery Addresses & Checkout Validation',
      'Inventory Management & Order History'
    ],
  });
});

// Resource Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Serve frontend static files in production (Render single-service deployment)
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// Database Connection & Server Startup
// ─────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDB();

    // Initialize real email delivery transporter in background
    getTransporter().catch((err) => console.warn(`[Email Init] ${err.message}`));

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 SmartCart Server running on http://localhost:${PORT}`);
      console.log(`📦 MongoDB connected and ready`);
      console.log(`💳 Payment Gateway: Razorpay (INR)`);
      console.log(`🤖 AI Assistant: RAG Vector Search & Product Consultant`);
      console.log(`📁 Static uploads folder: ${uploadsDir}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();
