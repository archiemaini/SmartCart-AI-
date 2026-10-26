import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, PlusCircle, X, Sparkles, AlertCircle, RefreshCw, CheckSquare, Square, RotateCcw } from 'lucide-react';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const PRICE_PRESETS = [
  { label: 'All Prices', max: null },
  { label: 'Under ₹1,000', max: 1000 },
  { label: 'Under ₹5,000', max: 5000 },
  { label: 'Under ₹20,000', max: 20000 },
  { label: 'Under ₹50,000', max: 50000 },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';


  const [products, setProducts] = useState([]);
  const [filterMeta, setFilterMeta] = useState({ categories: [] });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  
  const fetchFilterMeta = async () => {
    try {
      const meta = await api.getFilters();
      if (meta?.categories) setFilterMeta(meta);
    } catch {
      
    }
  };

  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search,
        category: selectedCategories.join(','),
        maxPrice: selectedMaxPrice || '',
        sort: sortBy,
      };

      const data = await api.getProducts(params);
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterMeta();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategories, selectedMaxPrice, sortBy]);

  
  const toggleCategory = (catName) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedMaxPrice(null);
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    setSearchParams(params);
  };

  
  const handleSyncPublic = async () => {
    try {
      setSyncing(true);
      const res = await api.syncPublic();
      alert(`🎉 ${res.message}`);
      await fetchFilterMeta();
      await fetchProducts();
    } catch (err) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from MongoDB?')) return;
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      fetchFilterMeta();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedMaxPrice !== null || search;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
     
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200/70 bg-gradient-to-b from-[#fbfbfa] via-[#f4f9f6] to-[#faf9f7] p-8 sm:p-12 mb-10 shadow-xs">
        <div className="max-w-3xl">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/70 mb-5 shadow-xs">
            <Sparkles size={13} className="text-blue-500" />
            <span>AI comparison assistant</span>
          </div>

          
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 font-serif leading-tight">
            Shopping, without the guesswork.
          </h1>
          <p className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent mt-2 font-serif">
            Just tell us what you need.
          </p>

          
          <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl">
            Describe what you're after — "a fast-charging USB-C cable under ₹500". Our assistant reads the
            request, searches the shelves, and lines up the three best matches side by side.
          </p>
        </div>

        {/* Soft Background Accent Glow */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />
      </section>

      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <aside className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs sticky top-24">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800">
                <SlidersHorizontal size={14} className="text-emerald-700" /> Filters
              </h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition"
                >
                  <RotateCcw size={12} /> Clear
                </button>
              )}
            </div>

            
            <div className="space-y-4">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  Category
                </h3>
                <div className="space-y-1.5 max-h-[340px] overflow-y-auto scroll-slim pr-1 text-xs">
                  {filterMeta.categories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.name);
                    return (
                      <label
                        key={cat.name}
                        onClick={() => toggleCategory(cat.name)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer select-none transition ${
                          isChecked ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {isChecked ? (
                            <CheckSquare size={16} className="text-emerald-700 shrink-0" />
                          ) : (
                            <Square size={16} className="text-neutral-300 shrink-0" />
                          )}
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <span className="text-[11px] text-neutral-400 font-mono shrink-0 ml-2">
                          {cat.count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Filter */}
              <div className="pt-3 border-t border-neutral-100">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
                  Max Price
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {PRICE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSelectedMaxPrice(preset.max)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                        selectedMaxPrice === preset.max
                          ? 'bg-emerald-800 text-white font-semibold'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Public API Sync Button */}
              <div className="pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleSyncPublic}
                  disabled={syncing}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition disabled:opacity-50"
                  title="Fetch latest 190+ products from Public API into MongoDB"
                >
                  <RefreshCw size={13} className={syncing ? 'animate-spin text-emerald-600' : 'text-neutral-500'} />
                  <span>{syncing ? 'Syncing...' : 'Sync Public API (190+ items)'}</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Area: All Products Grid (Matches screenshot) */}
        <main className="lg:col-span-3 space-y-6">
          {/* Products Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">All products</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {products.length} products {selectedCategories.length > 0 && `(filtered by ${selectedCategories.join(', ')})`}
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          
          {search && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">Search results for:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                "{search}"
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('search');
                    setSearchParams(params);
                  }}
                  className="hover:text-emerald-950"
                >
                  <X size={12} />
                </button>
              </span>
            </div>
          )}

         
          {loading && (
            <div className="py-24 flex flex-col items-center justify-center text-neutral-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold">Loading real products from MongoDB...</p>
            </div>
          )}

          
          {error && !loading && (
            <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center max-w-md mx-auto my-12">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-xs text-red-700 font-medium">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-3 px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          
          {!loading && !error && products.length === 0 && (
            <div className="py-20 text-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8">
              <p className="text-sm font-bold text-neutral-800">No products match your filters</p>
              <p className="text-xs text-neutral-500 mt-1">Try clearing categories or price constraints.</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
              >
                Clear all filters
              </button>
            </div>
          )}

          
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
