/**
 * =====================================================================
 * Contributor: LAVANYA
 * Role: Lead Frontend UI/UX & Assistant Engineer
 * Syllabus Sessions: Sessions 43-45 (Component Organization, Search State & Props)
 * Feature: Top Navigation Bar, Search Input, Cart Counter & User Profile Header
 * =====================================================================
 */
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut, Package, Search, ShoppingCart, Sparkles, User, X, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();

  const [term, setTerm] = useState(searchParams.get('search') || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setTerm(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKeyDown = (e) => e.key === 'Escape' && setMenuOpen(false);

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  function onSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (term.trim()) params.set('search', term.trim());
    else params.delete('search');
    navigate(`/?${params.toString()}`);
  }

  function onLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 px-2.5 py-1 rounded-xl border border-neutral-200 bg-white shadow-2xs hover:border-emerald-400 transition"
          aria-label="SmartCart home"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-800 text-white">
            <Sparkles size={14} />
          </span>
          <span className="font-bold text-base text-neutral-900 tracking-tight">
            Smart<span className="text-emerald-700">Cart</span>
          </span>
        </Link>

        {/* Search Form */}
        <form onSubmit={onSearch} className="relative min-w-0 flex-1 max-w-xl" role="search">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search electronics, computers, home & kitchen…"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/80 py-2 pl-9 pr-9 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
          {term && (
            <button
              type="button"
              onClick={() => {
                setTerm('');
                const params = new URLSearchParams(searchParams);
                params.delete('search');
                navigate(`/?${params.toString()}`);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              <X size={15} />
            </button>
          )}
        </form>

        {/* Add Product Button */}
        <Link
          to="/add-product"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition shadow-sm"
        >
          <PlusCircle size={15} />
          <span className="hidden sm:inline">Add Product</span>
        </Link>

        {/* Cart Icon */}
        <Link
          to="/cart"
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-emerald-400 hover:text-emerald-700 transition"
          aria-label={`Cart, ${count} items`}
        >
          <ShoppingCart size={18} />
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-emerald-600 px-1 text-[11px] font-bold text-white shadow-sm">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Link>

        {/* Orders Link */}
        <Link
          to="/orders"
          className="hidden md:flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 px-2 py-2"
        >
          <Package size={15} />
          <span>Orders</span>
        </Link>

        {/* User Account / Login */}
        {isAuthenticated ? (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 text-neutral-800 hover:border-emerald-400 transition"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-700 text-[11px] font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden max-w-24 truncate text-xs font-medium sm:block">
                {user.name.split(' ')[0]}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl z-50 animate-pop-in">
                <div className="border-b border-neutral-100 px-4 py-3 bg-neutral-50">
                  <p className="truncate text-xs font-semibold text-neutral-900">{user.name}</p>
                  <p className="truncate text-[11px] text-neutral-500">{user.email}</p>
                </div>
                <NavLink
                  to="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <Package size={14} /> My Orders
                </NavLink>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 border-t border-neutral-100"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition"
          >
            <User size={15} />
            <span>Sign in</span>
          </Link>
        )}
      </nav>
    </header>
  );
}
