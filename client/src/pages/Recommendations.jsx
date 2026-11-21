/**
 * =====================================================================
 * Personalized Product Recommendations Page (Feature 4)
 * Tailored suggestions derived from individual user activity:
 * 1. Previous search history
 * 2. Previously viewed products
 * 3. Previous order history
 * 4. Frequently explored categories
 * =====================================================================
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Compass, Clock, Search, ShoppingBag, Eye, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function Recommendations() {
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRecommendations();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-neutral-400 gap-3">
        <Sparkles className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold">Generating your personalized product recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <p className="text-xs text-red-700 font-medium">{error}</p>
        <button
          onClick={fetchRecommendations}
          className="mt-3 px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { topPicks = [], categoryRecommendations, trending = [], userPreferences = {}, hasHistory } = data || {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-900 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 mb-3">
            <Sparkles size={14} /> AI Recommendation Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Personalized For You, {user?.name ? user.name.split(' ')[0] : 'Shopper'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
            Curated using your browsing patterns, search queries, past orders, and category preferences.
          </p>

          {/* User Activity Signals Bar */}
          {hasHistory && userPreferences.topCategories?.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-emerald-800/80 text-xs">
              <span className="text-emerald-300 font-medium">Favorite Categories:</span>
              {userPreferences.topCategories.map((cat) => (
                <span
                  key={cat}
                  className="px-2.5 py-1 rounded-lg bg-emerald-800/60 border border-emerald-700/60 text-emerald-100 text-[11px] font-semibold"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rail 1: Top Picks For You */}
      {topPicks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-700" />
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Top Recommended Picks</h2>
                <p className="text-xs text-neutral-500">
                  {hasHistory
                    ? 'Based on your overall purchase & browsing preferences'
                    : 'Best-selling electronics and gadgets to get you started'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchRecommendations}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-emerald-700"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {topPicks.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Rail 2: Because you explored [Category] */}
      {categoryRecommendations?.products?.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-neutral-200">
          <div className="flex items-center gap-2">
            <Compass size={20} className="text-emerald-700" />
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Because You Explored <span className="text-emerald-700">{categoryRecommendations.category}</span>
              </h2>
              <p className="text-xs text-neutral-500">Top picks within your frequently visited category</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {categoryRecommendations.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Rail 3: Trending Across India */}
      {trending.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-neutral-200">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-700" />
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Trending Top-Rated Products</h2>
              <p className="text-xs text-neutral-500">Highest rated products with thousands of positive customer reviews</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {trending.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* User Activity Snapshot Box */}
      {hasHistory && userPreferences.recentlyViewed?.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-neutral-500" />
            <h3 className="text-sm font-bold text-neutral-900">Recently Viewed Items</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {userPreferences.recentlyViewed.map((item) => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                className="group block p-2 rounded-xl border border-neutral-100 hover:border-emerald-300 transition text-center"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-24 object-cover rounded-lg bg-neutral-50 mb-2 group-hover:scale-102 transition"
                />
                <p className="text-[11px] font-semibold text-neutral-900 truncate">{item.title}</p>
                <p className="text-[11px] font-bold text-emerald-700 mt-0.5">₹{item.price?.toLocaleString('en-IN')}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
