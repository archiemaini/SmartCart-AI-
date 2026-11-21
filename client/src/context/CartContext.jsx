/**
 * =====================================================================
 * Shopping Cart Context with Persistent Storage (Feature 7 & Core)
 * Preserves cart items across sessions, logouts, and logins.
 * Syncs seamlessly between LocalStorage and MongoDB backend.
 * =====================================================================
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { api, tokenStore } from '../lib/api';

const CartContext = createContext(null);
const STORAGE_KEY = 'smartcart.cart.v2';

const TAX_RATE = 0.18; // 18% GST
const FREE_SHIPPING_THRESHOLD = 500; // Free shipping over ₹500
const FLAT_SHIPPING = 50; // ₹50 flat rate

function toLine(product, qty) {
  return {
    _id: product._id || product.id,
    title: product.title,
    image: product.image,
    price: Number(product.price),
    brand: product.brand || 'Generic',
    category: product.category || 'General',
    countInStock: product.countInStock !== undefined ? product.countInStock : 99,
    qty,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return action.items;

    case 'ADD': {
      const { product, qty } = action;
      const pid = product._id || product.id;
      const existing = state.find((i) => i._id === pid);
      const max = product.countInStock !== undefined ? product.countInStock : 99;

      if (existing) {
        return state.map((i) =>
          i._id === pid ? { ...i, qty: Math.min(i.qty + qty, max) } : i
        );
      }
      return [...state, toLine(product, Math.min(qty, max))];
    }

    case 'SET_QTY': {
      const qty = Math.max(1, action.qty);
      return state.map((i) =>
        i._id === action.id ? { ...i, qty: Math.min(qty, i.countInStock || 99) } : i
      );
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
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, readStoredCart);
  const [notice, setNotice] = useState(null);

  // Hydrate cart from backend upon session start or login
  useEffect(() => {
    let cancelled = false;
    async function syncFromServer() {
      if (!tokenStore.get()) return;
      try {
        const { cart } = await api.getCart();
        if (!cancelled && cart && Array.isArray(cart) && cart.length > 0) {
          // Merge server items with local items
          const currentLocal = readStoredCart();
          const mergedMap = new Map();
          for (const item of cart) {
            mergedMap.set(item.product?._id || item._id, {
              _id: item.product?._id || item._id,
              title: item.title,
              image: item.image,
              price: item.price,
              brand: item.brand,
              category: item.category,
              countInStock: item.countInStock ?? 99,
              qty: item.qty || 1,
            });
          }
          for (const item of currentLocal) {
            if (!mergedMap.has(item._id)) {
              mergedMap.set(item._id, item);
            }
          }
          const merged = Array.from(mergedMap.values());
          dispatch({ type: 'SET_ITEMS', items: merged });
        }
      } catch {
        // ignore
      }
    }

    syncFromServer();
    return () => {
      cancelled = true;
    };
  }, []);

  // Save to LocalStorage and MongoDB
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }

    // Debounced sync to MongoDB if logged in (Shopping Cart Persistence)
    if (tokenStore.get()) {
      const timer = setTimeout(() => {
        api.syncCart(items).catch(() => {});
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [items]);

  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(() => setNotice(null), 2800);
    return () => clearTimeout(id);
  }, [notice]);

  const addItem = useCallback((product, qty = 1) => {
    dispatch({ type: 'ADD', product, qty });
    setNotice({ title: product.title, at: Date.now() });
  }, []);

  const setQty = useCallback((id, qty) => dispatch({ type: 'SET_QTY', id, qty }), []);
  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE', id }), []);
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
    if (tokenStore.get()) {
      api.syncCart([]).catch(() => {});
    }
  }, []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  const totals = useMemo(() => {
    const itemsPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shippingPrice = itemsPrice === 0 || itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
    const taxPrice = Math.round(itemsPrice * TAX_RATE);
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    return {
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
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
