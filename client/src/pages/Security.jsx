/**
 * =====================================================================
 * Security & Trust Page
 * =====================================================================
 */
import { ShieldCheck, Lock, Key, CreditCard, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Security() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <ShieldCheck size={14} /> Bank-Grade Protection
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight sm:text-4xl">
          Security & Trust at SmartCart
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          How we safeguard your account credentials, payment information, and personal delivery details.
        </p>
      </div>

      {/* Security Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
            <Key size={20} />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Email OTP Two-Factor Authentication (2FA)</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Every sign-in attempt requires a cryptographically random 6-digit OTP sent to your verified email address. The code expires in 10 minutes and is wiped from our database immediately upon successful login to prevent replay attacks.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
            <Lock size={20} />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Bcrypt Password Hashing & JWT Auth</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Your passwords are never stored in plaintext. We utilize bcrypt with 10 salt rounds to hash credentials before they touch the database. All authenticated API requests use secure, signed JSON Web Tokens (JWT).
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
            <CreditCard size={20} />
          </div>
          <h3 className="text-base font-bold text-neutral-900">PCI-DSS Compliant Payment Gateway</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            We partner with <strong>Razorpay</strong>, India's leading payment gateway with PCI-DSS Level 1 compliance and 256-bit SSL encryption. We never handle or store credit card numbers, CVVs, or bank passwords on our servers.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
            <RefreshCw size={20} />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Real-Time Inventory & Anti-Fraud Locking</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Our system decrements MongoDB product inventory in real time upon order placement and enforces strict order limits (max 5 pieces per product per order) to prevent hoarding and automated bot checkouts.
          </p>
        </div>
      </div>

      {/* Security Best Practices Banner */}
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-neutral-900">Customer Security Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-600">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
            <span>Never share your 6-digit email OTP verification codes with anyone over call or text.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
            <span>Use a unique, strong password for your SmartCart account.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
            <span>Always verify that our emails originate from our official address: <code>smartcartindia99@gmail.com</code>.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
