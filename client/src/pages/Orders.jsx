/**
 * =====================================================================
 * Orders Page: Comprehensive Customer Order History (Core Requirement)
 * Displays previous purchases with full item details, INR prices,
 * payment statuses, delivery addresses, and tracking badges.
 * =====================================================================
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, MapPin, CreditCard, ChevronRight, ShoppingBag, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { formatPrice, handleImageError } from '../lib/format';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const data = await api.getMyOrders();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || 'Failed to load your orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={13} /> Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck size={13} /> Shipped
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <AlertCircle size={13} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock size={13} /> {status || 'Confirmed'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center text-neutral-400">
        <Package className="w-10 h-10 animate-bounce mx-auto mb-3 text-emerald-700" />
        <p className="text-sm font-semibold">Loading your order history from MongoDB...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200">
          <p className="text-xs text-red-700 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
          <Package size={32} />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">No orders placed yet</h1>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
          You haven't made any purchases yet. Explore our curated catalogue and complete your first order!
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition shadow-sm"
        >
          Explore Catalog <ChevronRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Order History</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            View all your past purchases and delivery details ({orders.length} {orders.length === 1 ? 'order' : 'orders'})
          </p>
        </div>
        <Link
          to="/"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1"
        >
          Continue Shopping <ChevronRight size={14} />
        </Link>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          const addr = order.shippingAddress || {};

          return (
            <div
              key={order._id}
              className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs hover:border-neutral-300 transition"
            >
              {/* Order Card Header */}
              <div className="bg-neutral-50/80 p-4 sm:px-6 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-neutral-400 block text-[11px]">ORDER PLACED</span>
                    <span className="font-semibold text-neutral-800 flex items-center gap-1 mt-0.5">
                      <Calendar size={13} className="text-neutral-400" /> {orderDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[11px]">TOTAL AMOUNT</span>
                    <span className="font-bold text-neutral-900 mt-0.5 block">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[11px]">ORDER ID</span>
                    <span className="font-mono text-neutral-600 mt-0.5 block">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Order Card Body */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Purchased Items */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-4 pb-3 border-b border-neutral-100 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          onError={handleImageError}
                          className="w-14 h-14 object-cover rounded-xl border border-neutral-100 shrink-0 bg-neutral-50"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/product/${item.product?._id || item.product}`}
                            className="font-semibold text-xs text-neutral-900 hover:text-emerald-700 transition line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            Qty: <span className="font-semibold text-neutral-700">{item.qty}</span> · Price: {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-neutral-900">
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Metadata: Delivery Address & Payment Method */}
                <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-neutral-50/50 p-3 rounded-xl">
                  <div className="flex items-start gap-2">
                    <MapPin size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div className="text-neutral-600">
                      <span className="font-semibold text-neutral-900 block">Delivery Address:</span>
                      <p className="mt-0.5">{addr.fullName} (📞 {addr.mobileNumber})</p>
                      <p>{addr.houseNo}, {addr.street}, {addr.city}, {addr.state} - {addr.pinCode}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CreditCard size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div className="text-neutral-600">
                      <span className="font-semibold text-neutral-900 block">Payment Details:</span>
                      <p className="mt-0.5">{order.paymentMethod}</p>
                      <p className="text-[11px]">
                        Status: <span className={`font-semibold ${order.isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {order.isPaid ? 'Paid' : (order.paymentStatus || 'Pending')}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
