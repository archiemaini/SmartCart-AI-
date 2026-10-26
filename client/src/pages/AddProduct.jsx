/**
 * =====================================================================
 * Contributor: ARNAV
 * Role: Product Backend & Storage Engineer
 * Syllabus Sessions: Session 40 (Multer Multipart Uploads) & Session 48 (Controlled Form State)
 * Feature: Add Product Page with Multer File Picker & Preview
 * =====================================================================
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, PlusCircle, ArrowLeft, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

/**
 * AddProduct Component
 * Demonstrates:
 * - Session 40: Multer File Uploads (multipart/form-data)
 * - Session 41: MongoDB/Mongoose Product Creation
 * - Sessions 46-47: Multiple state variables with useState()
 * - Session 48: Controlled Form Components & Event Handling
 */
export default function AddProduct() {
  const navigate = useNavigate();

  // Multiple state variables using useState() (Session 46-47)
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [countInStock, setCountInStock] = useState('10');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Event handler for file selection (Session 48)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create local preview URL
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Form submission handler with async/await and FormData (Sessions 27-28 & 40)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation (Session 48)
    if (!title.trim()) return setError('Product title is required');
    if (!price || Number(price) <= 0) return setError('Valid price is required');
    if (uploadMode === 'file' && !imageFile) return setError('Please choose an image to upload via Multer');
    if (uploadMode === 'url' && !imageUrl.trim()) return setError('Please provide an image URL');

    try {
      setLoading(true);

      // Using FormData to send multipart/form-data for Multer upload (Session 40)
      const formData = new FormData();
      formData.append('title', title);
      formData.append('brand', brand || 'Generic');
      formData.append('category', category);
      formData.append('price', price);
      formData.append('mrp', mrp || price);
      formData.append('countInStock', countInStock);
      formData.append('description', description);

      if (uploadMode === 'file' && imageFile) {
        formData.append('image', imageFile); // Multer field name 'image'
      } else {
        formData.append('imageUrl', imageUrl);
      }

      await api.createProduct(formData);
      setSuccess('Product created successfully via Multer & MongoDB!');

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </button>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Form Header */}
        <div className="px-6 py-5 bg-neutral-50 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Add New Product</h1>
              <p className="text-xs text-neutral-500">
                List an item to your storefront with pricing, inventory, and photo upload.
              </p>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="m-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="m-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700 text-sm">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Controlled Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                Product Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sony WH-1000XM5 Noise Cancelling Headphones"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                required
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Sony, Apple, Samsung"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
              >
                <option value="Electronics">Electronics</option>
                <option value="Audio">Audio</option>
                <option value="Laptops">Laptops</option>
                <option value="Accessories">Accessories</option>
                <option value="Wearables">Wearables</option>
                <option value="Gadgets">Gadgets</option>
                <option value="Displays">Displays</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 24990"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                required
              />
            </div>

            {/* MRP (Original Price) */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                Original MRP (₹)
              </label>
              <input
                type="number"
                min="0"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                placeholder="e.g. 29990"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Stock Count */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                Count in Stock *
              </label>
              <input
                type="number"
                min="0"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product overview, specifications, and highlights..."
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Multer Image Upload Section (Session 40) */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-700" /> Product Image Upload
              </span>
              <div className="flex rounded-lg bg-neutral-200 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    uploadMode === 'file' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600'
                  }`}
                >
                  Upload File (Multer)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    uploadMode === 'url' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {uploadMode === 'file' ? (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-300 rounded-xl cursor-pointer hover:bg-emerald-50 transition bg-white">
                  <Upload className="w-8 h-8 text-emerald-600 mb-2" />
                  <span className="text-sm font-semibold text-neutral-700">
                    {imageFile ? imageFile.name : 'Click to select image file from computer'}
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {imagePreview && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-neutral-200"
                    />
                    <div className="text-xs text-neutral-600">
                      <p className="font-semibold text-neutral-900">Upload Ready</p>
                      <p>Will be processed by Multer and stored in <code className="bg-neutral-100 px-1 py-0.5 rounded">server/uploads</code></p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <span>Uploading & Creating...</span>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" /> Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
