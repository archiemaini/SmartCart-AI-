/**
 * =====================================================================
 * Shipping & Delivery Information Page
 * =====================================================================
 */
import { Truck, Clock, ShieldCheck, MapPin, PackageCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Shipping() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
          <Truck size={14} /> Express Pan-India Logistics
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight sm:text-4xl">
          Shipping & Delivery Information
        </h1>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
          SmartCart delivers to over 19,000+ PIN codes across India with verified tracking and secure handling.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-800 mb-4">
            <Clock size={22} />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Delivery Timelines</h3>
          <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
            • <strong>Metro Cities:</strong> 1 - 2 business days<br />
            • <strong>Tier 2 & 3 Cities:</strong> 3 - 5 business days<br />
            • <strong>Special / Rural Zones:</strong> 5 - 7 business days
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-800 mb-4">
            <Truck size={22} />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Shipping Rates</h3>
          <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
            • <strong>Orders ≥ ₹500:</strong> 100% FREE express delivery nationwide.<br />
            • <strong>Orders &lt; ₹500:</strong> Flat nominal shipping fee of ₹49.<br />
            • No hidden packaging or handling charges.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-800 mb-4">
            <ShieldCheck size={22} />
          </div>
          <h3 className="text-base font-bold text-neutral-900">7-Day Replacement</h3>
          <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
            All electronics and merchandise arrive in tamper-proof packaging. We provide a hassle-free 7-day replacement guarantee if items arrive damaged.
          </p>
        </div>
      </div>

      {/* Detailed Logistics Policy */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-neutral-900 pb-3 border-b border-neutral-100">
          Delivery FAQs & Logistics Guidelines
        </h2>

        <div className="space-y-4 text-xs text-neutral-600 leading-relaxed">
          <div>
            <h4 className="font-bold text-neutral-800 text-sm mb-1">1. How do I track my shipment?</h4>
            <p>
              Once your order is confirmed, you will receive an instant email invoice with your unique order ID. You can track real-time dispatch progress anytime in your <Link to="/orders" className="text-emerald-700 font-semibold underline">My Orders</Link> dashboard.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-800 text-sm mb-1">2. Which courier services do you partner with?</h4>
            <p>
              We route all shipments through tier-1 certified logistics partners including Blue Dart, Delhivery, DTDC, and India Post Speed Post to guarantee safe, on-time arrivals.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-800 text-sm mb-1">3. Can I change my delivery address after placing an order?</h4>
            <p>
              Addresses can be modified before an order status moves to "Shipped". Please contact our support team immediately or manage saved addresses in your account settings.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-800 text-sm mb-1">4. Is Cash on Delivery (COD) available for all locations?</h4>
            <p>
              Yes! COD is supported across all serviceable Indian PIN codes alongside instant UPI, Credit/Debit cards, and NetBanking through Razorpay.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            Need urgent assistance with a package? Contact our 24/7 care desk.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition"
          >
            <span>Contact Support</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
