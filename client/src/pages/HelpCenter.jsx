/**
 * =====================================================================
 * Help Center & Frequently Asked Questions (FAQ) Page
 * =====================================================================
 */
import { useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, MessageSquare, Shield, CreditCard, Truck, RefreshCw, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    category: 'Orders & Tracking',
    icon: Truck,
    items: [
      {
        q: 'How do I track my active order?',
        a: 'You can track your order at any time by heading to the "My Orders" tab located in the navigation header. There, each order displays its live processing status (Confirmed, Processing, Shipped, or Delivered).',
      },
      {
        q: 'Is there a limit on how many units of a product I can purchase?',
        a: 'Yes. To ensure fair stock distribution, SmartCart enforces a maximum limit of 5 pieces per product per order. If you need larger commercial orders, please reach out to customer care.',
      },
      {
        q: 'Can I cancel an order once placed?',
        a: 'Orders can be cancelled before they enter the "Shipped" status directly through support. If your order has already shipped, you can simply refuse delivery or request a return upon arrival.',
      },
    ],
  },
  {
    category: 'Payment & Checkout',
    icon: CreditCard,
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major Indian payment methods through Razorpay: Google Pay, PhonePe, Paytm, BHIM UPI, Credit Cards, Debit Cards, NetBanking from 50+ banks, and Cash on Delivery (COD).',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes, 100%. SmartCart uses Razorpay for all transactions, which operates with bank-grade 256-bit SSL encryption and strict PCI-DSS Level 1 compliance. SmartCart never stores card or UPI details on its servers.',
      },
      {
        q: 'Are all prices listed in Indian Rupees?',
        a: 'Yes, all prices on SmartCart are denominated in Indian Rupees (₹ INR) and include applicable taxes according to Indian GST regulations.',
      },
    ],
  },
  {
    category: 'Account & Security',
    icon: Shield,
    items: [
      {
        q: 'How does the Two-Factor OTP Login work?',
        a: 'Whenever you sign in with your email and password, SmartCart automatically generates and sends a secure 6-digit verification code (OTP) to your registered email address. This ensures that only you can access your account.',
      },
      {
        q: 'What if I do not receive the login OTP email?',
        a: 'Please check your Spam, Junk, or Promotions folder in your email inbox. You can also click the "Resend Code" button on the sign-in screen after the 30-second timer expires.',
      },
      {
        q: 'How do I update my delivery address?',
        a: 'You can save, edit, and designate default delivery addresses during the checkout process or manage them directly from your saved addresses profile.',
      },
    ],
  },
  {
    category: 'AI Assistant & Recommendations',
    icon: MessageSquare,
    items: [
      {
        q: 'How does the SmartCart AI shopping assistant work?',
        a: 'Click the chat bubble in the bottom right corner at any time! Our AI assistant uses Retrieval-Augmented Generation (RAG) to understand your requirements (e.g. "Find me a gaming laptop under ₹60,000") and recommends matching products from our verified catalog.',
      },
      {
        q: 'How are personalized recommendations generated?',
        a: 'Our recommendation engine analyzes items currently added to your shopping cart, previous search keywords, viewed products, and frequent category interests to tailor a unique shopping feed for you.',
      },
    ],
  },
];

export default function HelpCenter() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const allItems = FAQS.flatMap((f) => f.items.map((item) => ({ ...item, category: f.category })));

  const filteredItems = allItems.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const s = searchTerm.toLowerCase().trim();
    const matchesSearch = !s || item.q.toLowerCase().includes(s) || item.a.toLowerCase().includes(s);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-900 p-8 sm:p-12 text-white shadow-xl text-center">
        <div className="max-w-xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <HelpCircle size={14} /> 24/7 Smart Support
          </span>
          <h1 className="text-3xl font-extrabold sm:text-4xl tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
            Search our knowledge base or browse frequently asked questions below.
          </p>

          <div className="relative max-w-md mx-auto pt-4">
            <Search size={16} className="absolute left-4 top-7 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions, payments, delivery, OTP..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-neutral-900 text-xs shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {['All', 'Orders & Tracking', 'Payment & Checkout', 'Account & Security', 'AI Assistant & Recommendations'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeCategory === cat
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3 max-w-3xl mx-auto">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 bg-white rounded-2xl border border-neutral-200">
            No FAQs match your search query. Try typing another keyword.
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const isOpen = expanded[idx];
            return (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-200 bg-white shadow-xs transition overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm text-neutral-900 hover:text-emerald-700 transition"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                    <span>{item.q}</span>
                  </span>
                  {isOpen ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 bg-neutral-50/50">
                    <p>{item.a}</p>
                    <span className="inline-block mt-2.5 rounded-md bg-neutral-200/60 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                      {item.category}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Contact Help Card */}
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center max-w-md mx-auto space-y-3">
        <h3 className="text-sm font-bold text-neutral-900">Still need assistance?</h3>
        <p className="text-xs text-neutral-500">
          Our friendly care team and AI Shopping Assistant are ready to assist you.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Link
            to="/contact"
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition"
          >
            Contact Customer Care
          </Link>
        </div>
      </div>
    </div>
  );
}
