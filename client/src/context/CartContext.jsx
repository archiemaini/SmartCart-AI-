/**
 * =====================================================================
 * Contributor: ARCHIE
 * Role: Order Management & State Specialist
 * Feature: Cart Context, Reducer Actions & LocalStorage Persistence
 * =====================================================================
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'smartcart.cart';
// Mirror of server/services/pricing.js. The server recomputes every total at
// checkout — these exist only so the cart summary matches what will be charged.
// Number('') is 0, not NaN — an empty `TAX_RATE=` in client/.env must fall back, not
// silently zero the tax.
const num = (v, fallback) => {
  if (v == null || String(v).trim() === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const TAX_RATE = num(import.meta.env.VITE_TAX_RATE, 0.08);
const FREE_SHIPPING_THRESHOLD = num(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD, 75);
const FLAT_SHIPPING = num(import.meta.env.VITE_FLAT_SHIPPING, 6.99);

/** Cart lines keep a snapshot of the product so the cart renders offline. */
function toLine(product, qty) {
  return {
    _id: product._id,
    title: product.title,
    image: product.image,
    price: product.price,
    brand: product.brand,
    category: product.category,
    countInStock: product.countInStock ?? 99,
    qty,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, qty } = action;
      const existing = state.find((i) => i._id === product._id);
      const max = product.countInStock ?? 99;

      if (existing) {
        return state.map((i) =>
          i._id === product._id ? { ...i, qty: Math.min(i.qty + qty, max) } : i
        );
      }
      return [...state, toLine(product, Math.min(qty, max))];
    }

    case 'SET_QTY': {
      const qty = Math.max(1, action.qty);
      return state.map((i) => (i._id === action.id ? { ...i, qty: Math.min(qty, i.countInStock) } : i));
    }

    case 'REMOVE':
      return state.filter((i) => i._id !== action.id);

    case 'CLEAR':
      return [];

    default:
      return state;
  }
}

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt or unavailable storage shouldn't take the app down.
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, readStoredCart);
  // Transient "Added to cart" confirmation, mostly for adds made from the chat
  // widget where the cart icon is off-screen.
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full or blocked — the in-memory cart still works */
    }
  }, [items]);

  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(id);
  }, [notice]);

  const addItem = useCallback((product, qty = 1) => {
    dispatch({ type: 'ADD', product, qty });
    setNotice({ title: product.title, at: Date.now() });
  }, []);

  const setQty = useCallback((id, qty) => dispatch({ type: 'SET_QTY', id, qty }), []);
  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE', id }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  const totals = useMemo(() => {
    const itemsPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shippingPrice = itemsPrice === 0 || itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
    const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100;

    return {
      itemsPrice,
      shippingPrice,
      taxPrice,
      // Round the sum, not just the parts — floating-point cents otherwise
      // surface as $91.99000000000001 in the summary.
      totalPrice: Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100,
      freeShippingGap: Math.max(0, FREE_SHIPPING_THRESHOLD - itemsPrice),
    };
  }, [items]);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      count,
      totals,
      notice,
      addItem,
      setQty,
      removeItem,
      clearCart,
      dismissNotice,
      isInCart: (id) => items.some((i) => i._id === id),
    }),
    [items, count, totals, notice, addItem, setQty, removeItem, clearCart, dismissNotice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside a <CartProvider>');
  return ctx;
}
