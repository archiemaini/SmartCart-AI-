/**
 * =====================================================================
 * Contributor: ARCHIE
 * Role: Order Management & State Specialist
 * Feature: Shopping Cart View, Quantity Adjustments & Checkout Flow
 * =====================================================================
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Minus, Plus, ShoppingBag, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { formatPrice, handleImageError } from '../lib/format';

/**
 * Cart Component
 */
export default function Cart() {
  const navigate = useNavigate();
  const { items, totals, setQty, removeItem, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();


  const [address, setAddress] = useState('Chitkara University Campus, Chandigarh-Patiala National Highway');
  const [city, setCity] = useState('Rajpura');
  const [postalCode, setPostalCode] = useState('140401');

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  const lineItems = () =>
    items.map((i) => ({
      product: i._id,
      title: i.title,
      image: i.image,
      price: i.price,
      qty: i.qty,
    }));

  async function handleCheckout(e) {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login?redirect=/cart');
      return;
    }

    if (items.length === 0) return;

    try {
      setPlacing(true);
      setError(null);

      const payload = {
        items: lineItems(),
        shippingAddress: {
          fullName: user?.name || 'Customer',
          address,
          city,
          postalCode,
          country: 'India',
        },
        paymentMethod: 'Cash on Delivery / Direct Checkout',
      };

      const { order } = await api.createOrder(payload);
      clearCart();
      navigate(`/order-success/${order._id}`, { state: { order } });
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
          <ShoppingBag size={32} />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">Your cart is empty</h1>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
          Add items to your cart from our curated electronics catalog to test order processing.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
        >
          Explore Catalog <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Shopping Cart ({items.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-200 bg-white shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.title}
                  onError={handleImageError}
                  className="w-20 h-20 object-cover rounded-xl border border-neutral-100 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    {item.category || item.brand}
                  </span>
                  <Link
                    to={`/product/${item._id}`}
                    className="block text-sm font-semibold text-neutral-900 hover:text-emerald-700 transition line-clamp-1"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs font-bold text-neutral-800 mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>

              {/* Quantity Controls & Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQty(item._id, item.qty - 1)}
                    disabled={item.qty <= 1}
                    className="p-1.5 text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-xs font-bold text-neutral-800">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(item._id, item.qty + 1)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-900"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-900">
                    {formatPrice(item.price * item.qty)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item._id)}
                    className="text-neutral-400 hover:text-red-600 transition text-[11px] flex items-center gap-1 mt-0.5"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <Link to="/" className="text-xs font-medium text-emerald-700 hover:underline">
              ← Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-xs font-medium text-neutral-400 hover:text-red-600 transition"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary & Checkout Form */}
        <aside className="h-fit space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-neutral-900 mb-4 pb-3 border-b border-neutral-100">
              Order Summary
            </h2>

            <dl className="space-y-3 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatPrice(totals.itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className={`font-semibold ${totals.shippingPrice === 0 ? 'text-emerald-700' : 'text-neutral-900'}`}>
                  {totals.shippingPrice === 0 ? 'Free' : formatPrice(totals.shippingPrice)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Estimated Tax (18% GST)</span>
                <span className="font-semibold text-neutral-900">{formatPrice(totals.taxPrice)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-neutral-900 pt-3 border-t border-neutral-100">
                <span>Total Amount</span>
                <span className="text-base text-emerald-700">{formatPrice(totals.totalPrice)}</span>
              </div>
            </dl>

            {/* Controlled Shipping Address Form (Session 48) */}
            <form onSubmit={handleCheckout} className="mt-6 pt-5 border-t border-neutral-100 space-y-3">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Shipping Address
              </h3>

              <div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street Address"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Postal Code"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={placing}
                className="w-full mt-3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {placing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Processing order…
                  </>
                ) : !isAuthenticated ? (
                  'Sign In to Complete Checkout'
                ) : (
                  <>
                    <CheckCircle2 size={15} /> Confirm & Place Order
                  </>
                )}
              </button>
            </form>

            <p className="text-[11px] text-neutral-400 text-center mt-3">
              Fast, safe, and secure order processing with free shipping over ₹500.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
