/**
 * =====================================================================
 * Contributor: LAVANYA
 * Syllabus Sessions: Sessions 27-28 (Dynamic Fetch) & Sessions 43-45 (Component Props & Reusability)
 * Feature: Product Detail View, Image Zoom, Pricing & Related Suggestions
 * =====================================================================
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, Minus, Plus, ShieldCheck, ShoppingCart, Truck, Tag } from 'lucide-react';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { formatPrice, discountPercent, handleImageError } from '../lib/format';
import Rating from '../components/Rating';
import ProductCard from '../components/ProductCard';

/**
 * ProductDetail Component
 * Demonstrates:
 * - Session 27-28: Fetch API consumption with useParams()
 * - Session 42-45: Single page routing, props passing
 * - Sessions 46-47: Local state with useState()
 */
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();

  const [data, setData] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setQty(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    api
      .getProduct(id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-neutral-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !data?.product) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-bold text-neutral-900">Product not found</h1>
        <p className="text-xs text-neutral-500 mt-1">{error || 'This item could not be retrieved from MongoDB.'}</p>
        <Link
          to="/"
          className="mt-6 inline-flex px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const { product, related = [] } = data;
  const off = discountPercent(product.price, product.mrp);
  const inCart = isInCart(product._id);
  const outOfStock = product.countInStock === 0;

  function handleBuyNow() {
    addItem(product, qty);
    navigate('/cart');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition"
      >
        <ArrowLeft size={14} /> Back to Products
      </button>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Product Image */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm h-fit">
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-neutral-100">
            <img
              src={product.image}
              alt={product.title}
              onError={handleImageError}
              className="h-full w-full object-cover"
            />
            {off > 0 && (
              <span className="absolute left-4 top-4 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                {off}% off
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-200">
              <Tag size={12} /> {product.category}
            </span>
            <span className="text-xs font-semibold text-neutral-400">·</span>
            <span className="text-xs font-medium text-neutral-500">{product.brand}</span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-tight">
            {product.title}
          </h1>

          <Rating value={product.rating || 4.5} count={product.numReviews || 0} className="mt-3" size={16} />

          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            {product.description || 'Premium quality product with comprehensive manufacturer warranty and authentic specifications.'}
          </p>

          {/* Pricing */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-neutral-900">{formatPrice(product.price)}</span>
            {off > 0 && (
              <>
                <span className="text-base text-neutral-400 line-through">{formatPrice(product.mrp)}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Save {formatPrice(product.mrp - product.price)}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-400">Inclusive of all standard taxes</p>

          <p className={`mt-4 text-xs font-semibold ${outOfStock ? 'text-red-600' : 'text-emerald-700'}`}>
            {outOfStock
              ? 'Currently out of stock'
              : `In Stock (${product.countInStock} units available)`}
          </p>

          {/* Quantity & CTA Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl border border-neutral-300 bg-white">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="p-3 text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-xs font-bold text-neutral-900">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.countInStock, q + 1))}
                disabled={qty >= product.countInStock}
                className="p-3 text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => addItem(product, qty)}
              disabled={outOfStock}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                inCart
                  ? 'border border-emerald-400 bg-emerald-50 text-emerald-800'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {inCart ? <Check size={16} /> : <ShoppingCart size={16} />}
              <span>{inCart ? 'In Cart' : 'Add to Cart'}</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buy Now
            </button>
          </div>

          {/* Perks */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <Truck size={18} className="text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-neutral-800">Free Express Delivery</p>
                <p className="text-[11px] text-neutral-500">Dispatched within 24 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-neutral-800">Authentic & Verified</p>
                <p className="text-[11px] text-neutral-500">Stored in MongoDB database</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related?.length > 0 && (
        <section className="mt-16 pt-10 border-t border-neutral-200">
          <h2 className="text-lg font-bold text-neutral-900 mb-6">More in {product.category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
