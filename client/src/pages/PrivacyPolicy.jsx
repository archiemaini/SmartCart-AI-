/**
 * =====================================================================
 * Privacy Policy Page
 * =====================================================================
 */
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
          <ShieldCheck size={14} /> Data Protection & Trust
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
          SmartCart Privacy Policy
        </h1>
        <p className="mt-2 text-xs text-neutral-500">
          Last Updated: November 2026 • Effective for all SmartCart shoppers & visitors
        </p>
      </div>

      <div className="prose prose-neutral max-w-none text-xs leading-relaxed text-neutral-600 space-y-6">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">1. Introduction</h2>
          <p>
            SmartCart India ("SmartCart", "we", "us", or "our") values your trust and is dedicated to protecting your personal information. This Privacy Policy details how we collect, store, handle, and protect your information when you register, browse our store, add items to your cart, or place an order.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">2. Information We Collect</h2>
          <p>To provide high-quality e-commerce and AI-powered recommendation services, we collect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Personal Account Details:</strong> Name, verified email address, and encrypted credentials.</li>
            <li><strong>Delivery Information:</strong> Full name, 10-digit Indian mobile number, house number, street, city, state, and 6-digit PIN code.</li>
            <li><strong>Shopping Activity & Intent Signals:</strong> Products added to cart, search queries entered, items viewed, and order history.</li>
            <li><strong>Technical Session Data:</strong> IP address, browser type, and authentication tokens for session persistence.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">3. How We Use Your Data</h2>
          <p>Your information is used strictly for legitimate storefront operations:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dispatching Two-Factor Authentication OTP codes to your email on login.</li>
            <li>Processing orders, shipping physical merchandise, and dispatching order invoices.</li>
            <li>Personalizing the recommendation engine based on items currently in your cart and recent search queries.</li>
            <li>Preventing fraudulent orders and enforcing the 5-unit purchase limit per product.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">4. Payment Information & Security</h2>
          <p>
            SmartCart <strong>never stores</strong> your credit/debit card numbers, CVVs, or NetBanking credentials on our servers. All financial transactions are processed securely through <strong>Razorpay</strong>, which is certified under PCI-DSS Level 1 compliance with 256-bit bank-grade encryption.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">5. Data Sharing & Third Parties</h2>
          <p>
            We do not sell, rent, or trade your personal data. Data is shared exclusively with necessary infrastructure partners:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Logistics Partners:</strong> For delivering shipments to your saved delivery addresses.</li>
            <li><strong>Email Providers:</strong> Brevo and Google Workspace for transactional OTP and order invoices.</li>
            <li><strong>Cloud Hosting:</strong> MongoDB Atlas and cloud infrastructure providers for reliable system uptime.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">6. Your Rights & Account Deletion</h2>
          <p>
            You have the right to access, review, modify, or request deletion of your account and personal data at any time. To make a data request, contact our privacy officer at <a href="mailto:smartcartindia99@gmail.com" className="text-emerald-700 font-semibold underline">smartcartindia99@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
