/**
 * =====================================================================
 * Contributor: KUNAL
 * Role: Lead Backend & Database Architect
 * Syllabus Sessions: Session 41 (MongoDB Connection & Mongoose Configuration)
 * Feature: MongoDB Database Connection Management
 * =====================================================================
 */
import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using Mongoose
 * Demonstrates: Session 41 - MongoDB, MongoDB Atlas, CRUD Operations, Mongoose
 */
export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartcart';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[MongoDB] Connection error: ${err.message}`);
    console.error('Make sure MongoDB is running locally or provide a valid Atlas URI in server/.env');
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
