/**
 * =====================================================================
 * Terms of Service Page
 * =====================================================================
 */
import { FileText, CheckCircle2 } from 'lucide-react';

export default function Terms() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
          <FileText size={14} /> Legal Agreement
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-xs text-neutral-500">
          Last Updated: November 2026 • Governed by the laws of India
        </p>
      </div>

      <div className="prose prose-neutral max-w-none text-xs leading-relaxed text-neutral-600 space-y-6">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">1. Agreement to Terms</h2>
          <p>
            By accessing, browsing, or shopping on SmartCart, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, you may discontinue use of our platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">2. Account Registration & Two-Factor OTP Security</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. Every sign-in requires entering a one-time password (OTP) delivered to your registered email address. You agree not to share your OTP code with third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">3. Order Limits & Fair Stock Usage Policy</h2>
          <p>
            To prevent unfair stockpiling and bulk commercial re-selling:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Each customer is permitted to purchase a <strong>maximum of 5 units</strong> of any individual product per order.</li>
            <li>Orders placed exceeding this threshold will be blocked automatically by our checkout validator.</li>
            <li>Upon order confirmation, stock counts in our MongoDB inventory decrease in real time.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">4. Pricing & Payments</h2>
          <p>
            All prices displayed on SmartCart are in <strong>Indian Rupees (₹ INR)</strong>. We reserve the right to correct any typographical or inventory errors. Payments must be processed through our authorized gateway (Razorpay) or verified Cash on Delivery (COD).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">5. Returns, Replacements & Refunds</h2>
          <p>
            Customers may request a replacement within 7 calendar days of delivery for items that arrive defective or damaged. Refunds for prepaid orders will be returned to the original payment source within 3-5 business days.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">6. Governing Jurisdiction</h2>
          <p>
            These Terms of Service are governed by and construed in accordance with the laws of the Republic of India. Any legal disputes shall be subject to the exclusive jurisdiction of the competent courts in Punjab / Delhi, India.
          </p>
        </section>
      </div>
    </div>
  );
}
