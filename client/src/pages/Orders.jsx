/**
 * =====================================================================
 * Contributor: ARCHIE
 * Role: Order Management & State Specialist
 * Feature: User Order History & Populated Mongoose Details Display
 * =====================================================================
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, Package, UserCheck, Database } from 'lucide-react';
import { api } from '../lib/api';
import { formatPrice, formatDate, handleImageError } from '../lib/format';

const STATUS_STYLES = {
  Confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Paid: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Pending: 'border-amber-200 bg-amber-50 text-amber-800',
  Shipped: 'border-sky-200 bg-sky-50 text-sky-800',
  Delivered: 'border-purple-200 bg-purple-50 text-purple-800',
  Cancelled: 'border-red-200 bg-red-50 text-red-800',
};

/**
 * Orders Component
 */
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getMyOrders()
      .then((data) => setOrders(data.orders || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-neutral-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs font-medium">Loading orders via Mongoose populate...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Order History</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track and review your recent purchases and shipments.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-6">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
          <Package size={40} className="text-neutral-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-neutral-800">No orders yet</h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Add products to your cart and complete checkout to see orders saved in MongoDB.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
          >
            Browse Products
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order._id} className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            {/* Order Header */}
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-neutral-50/70 px-5 py-3.5">
              <div>
                <p className="font-mono text-xs font-semibold text-neutral-700">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>

              {/* Populated User Information (Session 41 proof) */}
              {order.user && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-xs text-neutral-600">
                  <UserCheck size={13} className="text-emerald-600" />
                  <span className="font-semibold text-neutral-800">{order.user.name}</span>
                  <span className="text-neutral-400">({order.user.email})</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[order.status] || STATUS_STYLES.Pending}`}>
                  {order.status}
                </span>
                <span className="text-base font-bold text-neutral-900">{formatPrice(order.totalPrice)}</span>
              </div>
            </header>

            {/* Order Items */}
            <div className="divide-y divide-neutral-100">
              {order.items.map((item, index) => {
                const productId = item.product?._id || item.product;
                return (
                  <div key={index} className="flex items-center gap-3.5 px-5 py-3.5">
                    <img
                      src={item.image}
                      alt={item.title}
                      onError={handleImageError}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover border border-neutral-100"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/product/${productId}`}
                        className="line-clamp-1 text-xs font-semibold text-neutral-900 hover:text-emerald-700 transition"
                      >
                        {item.title}
                      </Link>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Qty: {item.qty} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-neutral-800">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Shipping Address Summary */}
            {order.shippingAddress?.address && (
              <div className="px-5 py-2.5 bg-neutral-50 border-t border-neutral-100 text-[11px] text-neutral-500">
                <span className="font-medium text-neutral-700">Delivery Address: </span>
                {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.postalCode}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
