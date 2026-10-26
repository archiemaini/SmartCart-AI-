/**
 * =====================================================================
 * Contributor: ARNAV
 * Role: Product Backend & Storage Engineer
 * Syllabus Sessions: Session 41 (Mongoose Schemas, Validation & Text Indexing)
 * Feature: Product Model, Validation Schema & Search Indexing
 * =====================================================================
 */
import mongoose from 'mongoose';

/**
 * Product Schema
 * Demonstrates: Session 41 - Mongoose Schemas, Models, Validation
 */
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: 'Generic',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    mrp: {
      type: Number,
      min: [0, 'MRP cannot be negative'],
      default: 0,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Product image URL or upload is required'],
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot be above 5'],
      default: 4.5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    countInStock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 10,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Text index for search functionality (Session 38 & 41)
productSchema.index({ title: 'text', description: 'text', brand: 'text', category: 'text' });

export default mongoose.model('Product', productSchema);