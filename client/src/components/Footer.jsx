import { Sparkles, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200 bg-white">
      {/* Trust Badges Bar */}
      <div className="border-b border-neutral-100 bg-neutral-50/70">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
              <Truck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">Free Express Delivery</p>
              <p className="text-[11px] text-neutral-500">On all eligible orders over ₹500</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">100% Genuine Products</p>
              <p className="text-[11px] text-neutral-500">Directly sourced & verified</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
              <RefreshCw size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">7-Day Easy Returns</p>
              <p className="text-[11px] text-neutral-500">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
              <Headphones size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">24/7 AI Assistance</p>
              <p className="text-[11px] text-neutral-500">Smart comparison helper</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-800 text-white">
              <Sparkles size={16} />
            </span>
            <span className="font-bold text-lg text-neutral-900">
              Smart<span className="text-emerald-700">Cart</span>
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-neutral-500">
            SmartCart delivers curated electronics, computers, home essentials, and fashion. Compare what matters, discover best value picks, and shop with confidence.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-800">Shop by Category</h3>
          <ul className="space-y-2 text-xs text-neutral-500">
            <li><Link to="/?category=Electronics" className="hover:text-emerald-700 transition">Electronics & Phones</Link></li>
            <li><Link to="/?category=Computers %26 Accessories" className="hover:text-emerald-700 transition">Computers & Accessories</Link></li>
            <li><Link to="/?category=Home %26 Kitchen" className="hover:text-emerald-700 transition">Home & Kitchen</Link></li>
            <li><Link to="/?category=Fashion %26 Apparel" className="hover:text-emerald-700 transition">Fashion & Apparel</Link></li>
            <li><Link to="/?category=Health %26 Personal Care" className="hover:text-emerald-700 transition">Health & Personal Care</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-800">Customer Support</h3>
          <ul className="space-y-2 text-xs text-neutral-500">
            <li><Link to="/orders" className="hover:text-emerald-700 transition">Track Your Order</Link></li>
            <li><span className="cursor-pointer hover:text-emerald-700 transition">Shipping & Delivery</span></li>
            <li><span className="cursor-pointer hover:text-emerald-700 transition">Returns & Replacements</span></li>
            <li><span className="cursor-pointer hover:text-emerald-700 transition">Help Center & FAQs</span></li>
            <li><span className="cursor-pointer hover:text-emerald-700 transition">Contact Us</span></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-800">Company & Policies</h3>
          <ul className="space-y-2 text-xs text-neutral-500">
            <li><span className="cursor-pointer hover:text-emerald-700 transition">About SmartCart</span></li>
            <li><span className="cursor-pointer hover:text-emerald-700 transition">Privacy Policy</span></li>
            <li><span className="cursor-pointer hover:text-emerald-700 transition">Terms of Service</span></li>
            <li><span className="cursor-pointer hover:text-emerald-700 transition">Security & Trust</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-100 px-4 py-4 text-center text-xs text-neutral-400 sm:px-6">
        SmartCart © 2026. All rights reserved.
      </div>
    </footer>
  );
}
