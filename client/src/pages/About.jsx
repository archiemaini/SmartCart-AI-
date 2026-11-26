/**
 * =====================================================================
 * About SmartCart Page
 * =====================================================================
 */
import { Sparkles, Bot, ShieldCheck, Zap, HeartHandshake, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Sparkles size={14} /> Redefining Indian E-Commerce
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight sm:text-5xl">
          About Smart<span className="text-emerald-700">Cart</span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
          SmartCart is India's next-generation AI-powered e-commerce storefront. We combine catalog intelligence, semantic dense vector search, personalized recommendations, and two-factor security to deliver an effortless online shopping experience.
        </p>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-emerald-950 text-white shadow-xl text-center">
        <div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300">10,000+</p>
          <p className="text-xs text-emerald-200/80 mt-1">Verified Products</p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300">100%</p>
          <p className="text-xs text-emerald-200/80 mt-1">Indian Rupee (₹) Pricing</p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300">24/7</p>
          <p className="text-xs text-emerald-200/80 mt-1">AI Shopping Assistant</p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300">99.9%</p>
          <p className="text-xs text-emerald-200/80 mt-1">Order Fulfillment Rate</p>
        </div>
      </div>

      {/* Core Innovation Pillars */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-neutral-900 text-center">Our Technology & Core Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-800 mb-4">
              <Bot size={22} />
            </div>
            <h3 className="text-base font-bold text-neutral-900">AI RAG Product Assistant</h3>
            <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
              Equipped with deep Retrieval-Augmented Generation, our conversational assistant analyzes real catalog inventory in real-time to answer buyer inquiries, compare specifications, and recommend the best value options.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-800 mb-4">
              <Sparkles size={22} />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Intent Recommendation Engine</h3>
            <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
              Our hybrid recommendation model analyzes items currently sitting in your cart, recent search queries, and historical browsing preferences to continuously curate relevant product rails.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-800 mb-4">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Two-Factor Security (2FA)</h3>
            <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
              Security is built into our core. Every sign-in is protected by a 6-digit email OTP verification code, and all payments are processed through Razorpay's PCI-DSS compliant payment rails.
            </p>
          </div>
        </div>
      </div>

      {/* Mission CTA Card */}
      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center max-w-2xl mx-auto space-y-4">
        <h3 className="text-xl font-bold text-neutral-900">Ready to experience smarter shopping?</h3>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Explore curated electronics, laptops, smartphones, fashion, and home accessories today.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition"
        >
          <span>Explore Catalog</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
