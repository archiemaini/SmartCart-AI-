/**
 * =====================================================================
 * Contact Us & Support Desk Page
 * =====================================================================
 */
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, Clock } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 600);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
          <Mail size={14} /> Get in Touch
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight sm:text-4xl">
          Contact Customer Care
        </h1>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
          Have questions about your order, product specifications, or payments? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4 md:col-span-1">
          <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800 mb-3">
              <Mail size={18} />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Official Email</h4>
            <p className="text-sm font-bold text-neutral-900 mt-1">smartcartindia99@gmail.com</p>
            <p className="text-[11px] text-neutral-400 mt-1">Average response time: within 2 hours</p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800 mb-3">
              <Phone size={18} />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Phone Support</h4>
            <p className="text-sm font-bold text-neutral-900 mt-1 font-mono">
              <a href="tel:6006730274" className="hover:text-emerald-700 transition">+91 6006730274</a>
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Mon - Sat: 9:00 AM - 8:00 PM IST
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800 mb-3">
              <MapPin size={18} />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Headquarters</h4>
            <p className="text-xs font-bold text-neutral-900 mt-1 leading-relaxed">
              SmartCart India <br />
              Chitkara University Campus, Rajpura,<br />
              Punjab - 140401, India
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-neutral-900 mb-1">Send Us a Direct Message</h2>
          <p className="text-xs text-neutral-500 mb-6">
            Fill out the form below and our customer support team will reply to your registered email.
          </p>

          {submitted && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold">Message sent successfully!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">Thank you for reaching out. A representative will contact you shortly.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Arnav Gupta"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Your Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Subject / Inquiry Type</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Order #SC-ORD Status / Payment Inquiry"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Message Details</label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your question or issue in detail..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition disabled:opacity-50"
            >
              <Send size={14} />
              <span>{busy ? 'Sending Message…' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
