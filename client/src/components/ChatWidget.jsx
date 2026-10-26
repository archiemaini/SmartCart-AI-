/**
 * =====================================================================
 * Contributor: LAVANYA
 * Syllabus Sessions: Sessions 46-48 (State Hooks, Form Events & Dynamic Rendering)
 * Feature: Floating AI Shopping Assistant Drawer & Interactive Recommendations
 * =====================================================================
 */
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, ShoppingCart, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';

const PRESET_QUERIES = [
  'Laptops under ₹60,000',
  'Smartphones under ₹25,000',
  'Headphones under ₹3,000',
  'Skincare & beauty under ₹1,500',
  'Home & Kitchen essentials',
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '👋 Hi! I am your **SmartCart Shopping Assistant**. Tell me your budget or what kind of products you are looking for, and I will find the best matches from our catalogue!',
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
      const data = await api.chat(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'Here are the best matches for you:',
          products: data.products || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I had trouble searching the catalogue. Please try asking again!',
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (Matches bottom-right green bubble in screenshot) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-xl shadow-emerald-950/20 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Open AI Shopping Assistant"
        >
          <div className="relative">
            <MessageSquare size={24} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
            </span>
          </div>
        </button>
      )}

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[580px] w-[min(94vw,390px)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl animate-pop-in">
          {/* Header */}
          <div className="flex items-center justify-between bg-emerald-900 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-700/60 text-emerald-200">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold">SmartCart Assistant</h3>
                <p className="text-[11px] text-emerald-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Online · Budget & Variety Helper
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-emerald-300 hover:bg-emerald-800 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/50 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-neutral-800 border border-neutral-200/90 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Render Recommended Product Cards Inside Chat */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 w-full space-y-2">
                    {msg.products.map((p) => {
                      const inCart = isInCart(p._id);
                      return (
                        <div
                          key={p._id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-neutral-200 bg-white shadow-xs hover:border-emerald-300 transition"
                        >
                          <img
                            src={p.image}
                            alt={p.title}
                            className="h-12 w-12 rounded-lg object-cover bg-neutral-100 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-neutral-900 truncate">{p.title}</p>
                            <p className="text-emerald-700 font-bold mt-0.5">{formatPrice(p.price)}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Link
                              to={`/product/${p._id}`}
                              onClick={() => setIsOpen(false)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                              title="View details"
                            >
                              <ExternalLink size={14} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => addItem(p)}
                              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                                inCart
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              {inCart ? <Check size={13} /> : <ShoppingCart size={13} />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-neutral-400 bg-white p-3 rounded-2xl border border-neutral-200 w-fit">
                <Loader2 size={14} className="animate-spin text-emerald-600" />
                <span>Searching shelves in MongoDB...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="border-t border-neutral-200 bg-white px-3 py-2 overflow-x-auto flex gap-1.5 scroll-slim">
            {PRESET_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-medium hover:bg-emerald-50 hover:text-emerald-800 border border-neutral-200/60 transition disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
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
              placeholder="e.g. phones under ₹20,000..."
              className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-600 text-white disabled:opacity-40 hover:bg-emerald-700 transition"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
