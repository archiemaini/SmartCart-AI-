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
import { notFound, errorHandler } from './middleware/errorHandler.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = process.env.PORT || 5001;


const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});


app.use('/uploads', express.static(uploadsDir));


app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SmartCart API',
    uptime: `${Math.round(process.uptime())}s`,
    database: 'MongoDB Connected',
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);


app.use(notFound);
app.use(errorHandler);


async function startServer() {
  try {
    
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
