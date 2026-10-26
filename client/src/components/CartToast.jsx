import { Link } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

/**
 * Confirmation for cart adds. Matters most for adds made from the chat widget,
 * where the panel covers the cart icon in the navbar.
 */
export default function CartToast() {
  const { notice, dismissNotice } = useCart();

  if (!notice) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-fade-up fixed bottom-24 left-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 sm:bottom-6 sm:left-6 sm:translate-x-0"
    >
      <div className="flex items-center gap-3 rounded-xl border border-brand-300 bg-surface/97 p-3.5 shadow-2xl shadow-black/10 backdrop-blur-xl">
        <CheckCircle2 size={20} className="shrink-0 text-brand-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-heading">Added to cart</p>
          <p className="truncate text-xs text-muted">{notice.title}</p>
        </div>
        <Link
          to="/cart"
          onClick={dismissNotice}
          className="shrink-0 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100"
        >
          View
        </Link>
        <button
          type="button"
          onClick={dismissNotice}
          aria-label="Dismiss notification"
          className="shrink-0 text-muted hover:text-body"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
