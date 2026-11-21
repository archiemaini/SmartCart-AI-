/**
 * =====================================================================
 * Intelligent AI Shopping Assistant Chatbot (Feature 3)
 * - RAG Vector Search & Product Consultant
 * - Direct In-Chat Product Cards with Add to Cart & Buy Now Checkout
 * - Side-by-Side Product Comparison Rendering
 * - Preset Prompt Quick Chips
 * =====================================================================
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Loader2,
  ShoppingCart,
  Check,
  ExternalLink,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';

const PRESET_QUERIES = [
  'Show me laptops under ₹50,000',
  'Suggest a good smartphone with a decent camera',
  'Find the best headphones for gaming',
  'Compare Lenovo and ASUS laptops',
];

// Render inline formatted markdown (bold, italics, code)
function renderFormattedInline(text, isUser) {
  if (!text) return null;
  const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return tokens.map((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**') && tok.length >= 4) {
      return (
        <strong key={i} className={`font-bold ${isUser ? 'text-white' : 'text-neutral-950'}`}>
          {tok.slice(2, -2)}
        </strong>
      );
    }
    if (tok.startsWith('*') && tok.endsWith('*') && tok.length >= 2) {
      return (
        <em key={i} className="italic">
          {tok.slice(1, -1)}
        </em>
      );
    }
    if (tok.startsWith('`') && tok.endsWith('`') && tok.length >= 2) {
      return (
        <code
          key={i}
          className={`px-1 py-0.5 rounded text-[11px] font-mono ${
            isUser ? 'bg-emerald-800 text-white' : 'bg-neutral-100 text-emerald-800'
          }`}
        >
          {tok.slice(1, -1)}
        </code>
      );
    }
    return tok;
  });
}

// Clean markdown message renderer for chat bubbles
function FormattedMessage({ text, isUser = false }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className={`space-y-1.5 text-xs leading-relaxed ${isUser ? 'text-white' : 'text-neutral-800'}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Markdown Headings
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          const heading = trimmed.replace(/^#+\s*/, '');
          return (
            <div key={idx} className={`font-bold text-xs mt-2 mb-1 ${isUser ? 'text-white' : 'text-neutral-900'}`}>
              {renderFormattedInline(heading, isUser)}
            </div>
          );
        }

        // Bullet Points (•, -, *)
        const isBullet = /^[•\-*]\s+/.test(trimmed);
        const content = isBullet ? trimmed.replace(/^[•\-*]\s+/, '') : trimmed;

        return (
          <div key={idx} className={isBullet ? 'flex items-start gap-2 pl-1' : ''}>
            {isBullet && (
              <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isUser ? 'bg-white' : 'bg-emerald-600'}`} />
            )}
            <span className="flex-1">{renderFormattedInline(content, isUser)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ChatWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "👋 Hi! I'm your SmartCart shopping assistant.\n\nLooking for product recommendations, comparing items, or finding the best deals in ₹ INR? Let me know what you're shopping for today!",
      products: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { addItem, isInCart } = useCart();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Pass previous products in history for conversational follow-ups and comparisons
      const previousProducts = messages
        .flatMap((m) => m.products || [])
        .slice(-4);

      const data = await api.chat(textToSend, previousProducts);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'Here are the matching products from our catalog:',
          products: data.products || [],
          isComparison: data.isComparison || false,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I ran into a problem finding recommendations. Please try asking again!',
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Direct checkout action from chat
  const handleBuyNow = (product) => {
    addItem(product, 1);
    setIsOpen(false);
    navigate('/cart');
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        text: "👋 Chat cleared! How can I help you find what you need today?",
        products: [],
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-xl shadow-emerald-950/25 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Open AI Shopping Assistant"
        >
          <div className="relative">
            <MessageSquare size={24} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300"></span>
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[620px] w-[min(94vw,430px)] flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl animate-pop-in">
          {/* Header */}
          <div className="flex items-center justify-between bg-emerald-900 px-4 py-3.5 text-white shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-800 text-emerald-200 border border-emerald-700/60 shadow-xs">
                <Sparkles size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  SmartCart Assistant
                </h3>
                <p className="text-[11px] text-emerald-200 flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Online · Ready to help
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg text-emerald-200 hover:bg-emerald-800 hover:text-white transition"
                title="Clear conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:bg-emerald-800 hover:text-white transition"
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-neutral-50/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Bubble Text */}
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-none shadow-xs'
                      : 'bg-white text-neutral-800 border border-neutral-200/90 rounded-bl-none shadow-xs'
                  }`}
                >
                  <FormattedMessage text={msg.text} isUser={msg.role === 'user'} />
                </div>

                {/* Render Actual Product Cards inside the chat message */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2.5 w-full space-y-2.5">
                    {msg.products.map((p) => {
                      const inCart = isInCart(p._id);
                      return (
                        <div
                          key={p._id}
                          className="flex flex-col p-3 rounded-2xl border border-neutral-200 bg-white shadow-xs hover:border-emerald-300 transition"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="h-14 w-14 rounded-xl object-cover bg-neutral-50 shrink-0 border border-neutral-100"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                                {p.category}
                              </span>
                              <p className="font-semibold text-neutral-900 truncate text-xs">{p.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-emerald-800 font-bold text-sm">
                                  {formatPrice(p.price)}
                                </span>
                                {p.mrp > p.price && (
                                  <span className="text-[10px] text-neutral-400 line-through">
                                    {formatPrice(p.mrp)}
                                  </span>
                                )}
                                <span className="text-[10px] font-semibold text-amber-600 ml-auto">
                                  ⭐ {p.rating}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Add to Cart & Buy Now Directly */}
                          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                            <Link
                              to={`/product/${p._id}`}
                              onClick={() => setIsOpen(false)}
                              className="text-[11px] font-semibold text-neutral-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                              Details <ExternalLink size={12} />
                            </Link>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => addItem(p)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                  inCart
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                }`}
                              >
                                {inCart ? <Check size={13} /> : <ShoppingCart size={13} />}
                                <span>{inCart ? 'In Cart' : 'Add'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleBuyNow(p)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1 shadow-xs transition"
                              >
                                <Zap size={12} /> Buy Now
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-neutral-600 bg-white p-3 rounded-2xl border border-neutral-200 w-fit text-xs shadow-xs">
                <Loader2 size={14} className="animate-spin text-emerald-600" />
                <span>Finding the best recommendations for you…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="border-t border-neutral-200 bg-white px-3 py-2 overflow-x-auto flex gap-1.5 scroll-slim">
            {PRESET_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-semibold hover:bg-emerald-50 hover:text-emerald-800 border border-neutral-200/80 transition disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-neutral-200 bg-white p-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. laptops under ₹50,000, camera phone)..."
              className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-700 text-white disabled:opacity-40 hover:bg-emerald-800 transition"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
