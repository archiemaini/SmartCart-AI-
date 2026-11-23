/**
 * =====================================================================
 * Admin Dashboard & Product Management Panel (Feature 5)
 * Role-Based Access Control: Restricted to Authorized Admin Accounts
 * Capabilities:
 * - Add, Update & Delete Products
 * - Full Inventory View & Stock Management
 * - Customer Orders Overview & Status Management
 * - Real Product API One-Click Synchronization
 * =====================================================================
 */
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Package,
  ShoppingBag,
  IndianRupee,
  AlertTriangle,
  PlusCircle,
  RefreshCw,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  X,
  UploadCloud,
  Check,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { formatPrice, handleImageError } from '../lib/format';

const CATEGORIES = [
  'Computers & Accessories',
  'Smartphones & Tablets',
  'Audio & Wearables',
  'Gaming & Accessories',
  'Electronics',
  'Health & Personal Care',
  'Home & Kitchen',
  'Fashion & Apparel',
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders' | 'addProduct'
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockSort, setStockSort] = useState('none'); // 'none' | 'asc' (lowest first) | 'desc' (highest first)
  const [syncing, setSyncing] = useState(false);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    title: '',
    brand: '',
    category: 'Computers & Accessories',
    price: '',
    mrp: '',
    description: '',
    countInStock: 15,
    imageUrl: '',
    tags: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [formMsg, setFormMsg] = useState(null);

  // Load Admin Data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsResult, productsResult, ordersResult] = await Promise.allSettled([
        api.getAdminStats(),
        api.getProducts({ sort: 'newest' }),
        api.getAllOrders(),
      ]);

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value);
      } else {
        console.warn('Admin stats could not be loaded:', statsResult.reason);
      }

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value?.products || []);
      } else {
        console.error('Products catalog could not be loaded:', productsResult.reason);
      }

      if (ordersResult.status === 'fulfilled') {
        setOrders(ordersResult.value?.orders || []);
      } else {
        console.warn('Orders could not be loaded:', ordersResult.reason);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login?redirect=/admin');
      } else if (!isAdmin) {
        // Will show access denied screen
      } else {
        loadAdminData();
      }
    }
  }, [isAuthenticated, isAdmin, authLoading]);

  // Access Control Guard
  if (authLoading) {
    return (
      <div className="py-24 text-center text-neutral-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
        <p className="text-xs font-semibold">Verifying administrative credentials…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
          <ShieldAlert size={36} />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">Access Denied</h1>
        <p className="text-xs text-neutral-500 mt-2">
          Administrative functionality is restricted to authorized administrator accounts. Your account (<strong>{user?.email}</strong>) does not have administrator privileges.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Return to Store
          </Link>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          >
            Sign in as Admin
          </button>
        </div>
      </div>
    );
  }

  // Quick Stock Adjustment
  const handleStockChange = async (id, newStock) => {
    if (newStock < 0) return;
    try {
      await api.updateStock(id, newStock);
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, countInStock: newStock } : p))
      );
    } catch (err) {
      alert(`Stock update failed: ${err.message}`);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from catalog?`)) return;
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      alert('Product deleted successfully');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Update Order Status
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert(`Order update failed: ${err.message}`);
    }
  };

  // Sync Real API
  const handleSyncCatalog = async () => {
    try {
      setSyncing(true);
      const res = await api.syncRealProducts();
      alert(`🎉 ${res.message}`);
      loadAdminData();
    } catch (err) {
      alert(`Sync error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Create Product Submit
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      setSubmittingProduct(true);
      setFormMsg(null);

      const formData = new FormData();
      formData.append('title', newProduct.title);
      formData.append('brand', newProduct.brand || 'Generic');
      formData.append('category', newProduct.category);
      formData.append('price', newProduct.price);
      formData.append('mrp', newProduct.mrp || Math.round(Number(newProduct.price) * 1.25));
      formData.append('description', newProduct.description);
      formData.append('countInStock', newProduct.countInStock);
      formData.append('tags', newProduct.tags);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (newProduct.imageUrl) {
        formData.append('imageUrl', newProduct.imageUrl);
      } else {
        alert('Please upload an image file or provide an Image URL');
        setSubmittingProduct(false);
        return;
      }

      await api.createProduct(formData);
      setFormMsg({ type: 'success', text: 'Product created successfully and indexed for AI search!' });
      setNewProduct({
        title: '',
        brand: '',
        category: 'Computers & Accessories',
        price: '',
        mrp: '',
        description: '',
        countInStock: 15,
        imageUrl: '',
        tags: '',
      });
      setImageFile(null);
      loadAdminData();
      setActiveTab('inventory');
    } catch (err) {
      setFormMsg({ type: 'error', text: err.message || 'Failed to create product' });
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Update Existing Product Submit
  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', editingProduct.title);
      formData.append('brand', editingProduct.brand);
      formData.append('category', editingProduct.category);
      formData.append('price', editingProduct.price);
      formData.append('mrp', editingProduct.mrp);
      formData.append('description', editingProduct.description);
      formData.append('countInStock', editingProduct.countInStock);
      if (editingProduct.newImageFile) {
        formData.append('image', editingProduct.newImageFile);
      } else if (editingProduct.image) {
        formData.append('imageUrl', editingProduct.image);
      }

      await api.updateProduct(editingProduct._id, formData);
      alert('Product updated successfully!');
      setEditingProduct(null);
      loadAdminData();
    } catch (err) {
      alert(`Update error: ${err.message}`);
    }
  };

  const filteredProducts = products
    .filter((p) => {
      const s = searchTerm.toLowerCase().trim();
      if (!s) return true;
      const title = String(p.title || '').toLowerCase();
      const cat = String(p.category || '').toLowerCase();
      const brand = String(p.brand || '').toLowerCase();
      return title.includes(s) || cat.includes(s) || brand.includes(s);
    })
    .sort((a, b) => {
      if (stockSort === 'asc') return (a.countInStock || 0) - (b.countInStock || 0);
      if (stockSort === 'desc') return (b.countInStock || 0) - (a.countInStock || 0);
      return 0;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header & Role Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-800 text-white text-[10px] font-bold tracking-wider uppercase">
              Admin Portal
            </span>
            <span className="text-xs text-neutral-500">RBAC: Authorized as {user?.email}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 mt-1">
            Store Administration & Inventory Panel
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncCatalog}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition"
            title="Ingest and sync full Amazon Berkeley Objects dataset into MongoDB"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin text-emerald-700' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Amazon Berkeley Dataset'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addProduct')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition shadow-sm"
          >
            <PlusCircle size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-medium">Total Store Revenue</span>
              <IndianRupee size={18} className="text-emerald-700" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{formatPrice(stats.totalRevenue)}</p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">₹ Net Volume Incurred</p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-medium">Customer Orders</span>
              <ShoppingBag size={18} className="text-emerald-700" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stats.totalOrders}</p>
            <p className="text-[11px] text-neutral-500 mt-1">
              {stats.pendingOrders} pending · {stats.deliveredOrders} delivered
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-medium">Catalog Inventory</span>
              <Package size={18} className="text-emerald-700" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stats.totalProducts}</p>
            <p className="text-[11px] text-neutral-500 mt-1">Active products in MongoDB</p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-medium">Low Stock Alerts</span>
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stats.lowStockCount}</p>
            <p className="text-[11px] text-amber-700 font-medium mt-1">Items with ≤ 5 units left</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-200 text-xs font-semibold gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'inventory'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          Product Inventory ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('addProduct')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'addProduct'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          + Add New Product
        </button>
      </div>

      {/* TAB 1: PRODUCT INVENTORY TABLE */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by title, category, or brand…"
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200">
                <span className="text-[11px] font-semibold text-neutral-600">Sort by Stock:</span>
                <select
                  value={stockSort}
                  onChange={(e) => setStockSort(e.target.value)}
                  className="text-xs bg-white border border-neutral-200 rounded-lg px-2 py-1 text-neutral-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="none">Default Ordering</option>
                  <option value="asc">Stock: Low to High (Out & Low First)</option>
                  <option value="desc">Stock: High to Low</option>
                </select>
              </div>

              <span className="text-xs text-neutral-500 shrink-0">
                Showing {filteredProducts.length} of {products.length} products
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price (INR)</th>
                  <th className="p-3.5">
                    <button
                      type="button"
                      onClick={() => setStockSort((prev) => (prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none'))}
                      className="inline-flex items-center gap-1.5 font-bold uppercase hover:text-emerald-700 transition"
                      title="Click to sort by stock (Low to High / High to Low)"
                    >
                      <span>Stock Management</span>
                      <ArrowUpDown
                        size={12}
                        className={stockSort !== 'none' ? 'text-emerald-700 font-bold' : 'text-neutral-400'}
                      />
                      {stockSort === 'asc' && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold normal-case">
                          Low → High
                        </span>
                      )}
                      {stockSort === 'desc' && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold normal-case">
                          High → Low
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-neutral-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                      <p className="font-medium text-neutral-600">Loading catalog inventory...</p>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-neutral-400">
                      <Package className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                      <p className="font-semibold text-neutral-700">No products found</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {searchTerm ? `No products match "${searchTerm}"` : 'Your catalog is currently empty.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isLow = p.countInStock <= 5;
                    const isOut = p.countInStock === 0;

                    return (
                      <tr key={p._id} className="hover:bg-neutral-50/50 transition">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.title}
                            onError={handleImageError}
                            className="w-10 h-10 object-cover rounded-lg border border-neutral-100 shrink-0 bg-neutral-50"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-neutral-900 truncate">{p.title}</p>
                            <p className="text-[11px] text-neutral-400">{p.brand}</p>
                          </div>
                        </td>
                        <td className="p-3.5 text-neutral-600">{p.category}</td>
                        <td className="p-3.5 font-bold text-neutral-900">{formatPrice(p.price)}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStockChange(p._id, p.countInStock - 1)}
                              className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={p.countInStock}
                              onChange={(e) => handleStockChange(p._id, Number(e.target.value))}
                              className="w-12 text-center text-xs font-semibold py-0.5 border border-neutral-200 rounded"
                            />
                            <button
                              type="button"
                              onClick={() => handleStockChange(p._id, p.countInStock + 1)}
                              className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-3.5">
                          {isOut ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              Low Stock ({p.countInStock})
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              In Stock ({p.countInStock})
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...p })}
                            className="p-1.5 text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 rounded-lg transition"
                            title="Edit product"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p._id, p.title)}
                            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER ORDERS TABLE */}
      {activeTab === 'orders' && (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-neutral-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <p className="font-medium text-neutral-600">Loading customer orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-neutral-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                    <p className="font-semibold text-neutral-700">No orders recorded yet</p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="hover:bg-neutral-50/50 transition">
                    <td className="p-3.5 font-mono font-semibold text-neutral-800">
                      #{o._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-neutral-900">{o.user?.name || o.shippingAddress?.fullName || 'Customer'}</p>
                      <p className="text-[11px] text-neutral-400">{o.user?.email || o.shippingAddress?.mobileNumber}</p>
                    </td>
                    <td className="p-3.5 text-neutral-600">
                      {o.items?.length} items ({o.items?.map((i) => `${i.title.slice(0, 18)}...`).join(', ')})
                    </td>
                    <td className="p-3.5 font-bold text-neutral-900">{formatPrice(o.totalPrice)}</td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {o.isPaid ? 'Paid' : (o.paymentStatus || 'Pending')}
                      </span>
                      <span className="block text-[10px] text-neutral-400 mt-0.5">{o.paymentMethod}</span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={o.status}
                        onChange={(e) => handleOrderStatusUpdate(o._id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg border border-neutral-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ADD NEW PRODUCT FORM */}
      {activeTab === 'addProduct' && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-neutral-900 mb-4 pb-3 border-b border-neutral-100 flex items-center gap-2">
            <PlusCircle size={18} className="text-emerald-700" /> Add New Product to Store
          </h2>

          {formMsg && (
            <div
              className={`p-3 rounded-xl text-xs mb-4 ${
                formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {formMsg.text}
            </div>
          )}

          <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                placeholder="e.g. Apple MacBook Air M3 (16GB RAM/512GB SSD)"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  placeholder="e.g. Apple, Lenovo, Sony"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Category *</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Price (₹ INR) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="49999"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">MRP (₹ INR)</label>
                <input
                  type="number"
                  min="0"
                  value={newProduct.mrp}
                  onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                  placeholder="59999"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Stock Count *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newProduct.countInStock}
                  onChange={(e) => setNewProduct({ ...newProduct, countInStock: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Product specs, features, warranty..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Upload Image (Multer)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-xs text-neutral-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Or Image URL</label>
                <input
                  type="url"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Tags (comma-separated for AI RAG Search)</label>
              <input
                type="text"
                value={newProduct.tags}
                onChange={(e) => setNewProduct({ ...newProduct, tags: e.target.value })}
                placeholder="laptop, under 50000, gaming, 16gb ram"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingProduct}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition disabled:opacity-50"
            >
              {submittingProduct ? 'Saving & Generating Embeddings...' : 'Publish Product to Store'}
            </button>
          </form>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-pop-in">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 className="text-sm font-bold text-neutral-900">Edit Product Information</h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.countInStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, countInStock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
