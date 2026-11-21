/**
 * =====================================================================
 * Order Success & Email Confirmation View (Feature 1 & Feature 6)
 * Displays order confirmation, payment receipt details in INR,
 * shipping address, and direct link to the delivered invoice email.
 * =====================================================================
 */
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, Package, Mail, ExternalLink, MapPin, ArrowRight } from 'lucide-react';
import { formatPrice } from '../lib/format';
import { api } from '../lib/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const { state } = useLocation();
  const order = state?.order;
  const [matchingEmail, setMatchingEmail] = useState(null);

  useEffect(() => {
    async function findOrderEmail() {
      try {
        const data = await api.getRecentEmails();
        const found = (data.emails || []).find((e) => e.orderId === (order?._id || id));
        if (found) {
          setMatchingEmail(found);
        } else if (data.emails && data.emails.length > 0) {
          setMatchingEmail(data.emails[0]);
        }
      } catch {
        // ignore
      }
    }
    findOrderEmail();
  }, [id, order]);

  const addr = order?.shippingAddress;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-6">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-sm animate-pop-in">
        <CheckCircle2 size={36} />
      </span>

      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Order Confirmed!</h1>
        <p className="mt-1 text-xs text-neutral-500">
          Thank you for shopping with SmartCart. Your order has been placed successfully.
        </p>
      </div>

      {/* Email Invoice Dispatched Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left flex items-start justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-2.5">
          <Mail size={18} className="text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-emerald-900">Confirmation Email Dispatched</p>
            <p className="text-emerald-700 mt-0.5">
              An invoice email with full order details has been generated and sent to{' '}
              <strong>{order?.shippingAddress?.email || 'your registered email'}</strong>.
            </p>
          </div>
        </div>

        {matchingEmail?.previewUrl && (
          <a
            href={matchingEmail.previewUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
          >
            Open Email <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Order Summary Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Order ID</span>
          <span className="font-mono text-xs font-bold text-neutral-800">#{(order?._id || id).slice(-8).toUpperCase()}</span>
        </div>

        {order && (
          <>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Items ({order.items?.length})</span>
                <span className="font-semibold text-neutral-900">{formatPrice(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-700">
                  {order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Taxes (18% GST)</span>
                <span className="font-semibold text-neutral-900">{formatPrice(order.taxPrice)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-2 text-sm font-bold text-neutral-900">
                <span>Total Amount</span>
                <span className="text-emerald-700">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>

            {addr && (
              <div className="pt-3 border-t border-neutral-100 text-xs text-neutral-600 flex items-start gap-2">
                <MapPin size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900">Shipping to: </span>
                  {addr.fullName}, {addr.houseNo}, {addr.street}, {addr.city}, {addr.state} - {addr.pinCode} (📞 {addr.mobileNumber})
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition"
        >
          <Package size={15} /> View My Orders
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm"
        >
          Continue Shopping <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
