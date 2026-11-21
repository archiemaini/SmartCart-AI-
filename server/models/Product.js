/**
 * =====================================================================
 * Product Model with INR Pricing, Stock Management, Reviews,
 * Tags & Vector Embeddings for AI-Powered RAG Retrieval
 * =====================================================================
 */
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    reviewerName: { type: String, default: 'Verified Buyer' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

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
      required: [true, 'Price in INR is required'],
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
      required: [true, 'Main product image is required'],
    },
    images: {
      type: [String],
      default: [],
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
    reviews: [reviewSchema],
    countInStock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 10,
    },
    tags: {
      type: [String],
      default: [],
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    // Dense Vector Embedding for RAG similarity search (Feature 3)
    embedding: {
      type: [Number],
      select: false, // Omit from default lightweight queries
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
productSchema.index({ title: 'text', description: 'text', brand: 'text', category: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ rating: -1 });

export default mongoose.model('Product', productSchema);
