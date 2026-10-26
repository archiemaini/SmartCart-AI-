/**
 * =====================================================================
 * Contributor: ARCHIE
 * Role: Order Management & State Specialist
 * Syllabus Sessions: Session 41 (Mongoose References & .populate() Configuration)
 * Feature: Order Model & Schema References (User & Product Relationships)
 * =====================================================================
 */
import mongoose from 'mongoose';

/**
 * Order Schema
 * Demonstrates: Session 41 - Mongoose Schemas, Validation, Relationships & Populate
 */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to Product model for .populate()
      required: true,
    },
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to User model for .populate()
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v) => Array.isArray(v) && v.length > 0, 'Order must contain at least one item'],
    },
    shippingAddress: {
      fullName: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Confirmed',
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Order', orderSchema);
