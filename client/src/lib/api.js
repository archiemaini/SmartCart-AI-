/**
 * =====================================================================
 * SmartCart Client API Service Layer
 * Supports: Auth, Addresses, Products, Admin RBAC, RAG Chat,
 * Razorpay Payment Gateway, and Personalized Recommendations
 * =====================================================================
 */
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'smartcart_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = 'GET', body, isFormData = false, auth = false } = {}) {
  const headers = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = tokenStore.get();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  // ── Authentication & User Profile ──
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  verifyLoginOtp: (payload) => request('/auth/verify-login-otp', { method: 'POST', body: payload }),
  resendLoginOtp: (email) => request('/auth/resend-login-otp', { method: 'POST', body: { email } }),
  checkEmail: (email, context = 'login') =>
    request(`/auth/check-email?email=${encodeURIComponent(email)}&context=${context}&_t=${Date.now()}`),
  me: () => request('/auth/me', { auth: true }),
  updateProfile: (payload) => request('/auth/profile', { method: 'PUT', body: payload, auth: true }),
  getRecentEmails: () => request('/auth/recent-emails'),

  // ── Delivery Address Management (Feature 7) ──
  getAddresses: () => request('/auth/addresses', { auth: true }),
  addAddress: (payload) => request('/auth/addresses', { method: 'POST', body: payload, auth: true }),
  updateAddress: (id, payload) => request(`/auth/addresses/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteAddress: (id) => request(`/auth/addresses/${id}`, { method: 'DELETE', auth: true }),

  // ── Cart Persistence (Core Requirement) ──
  getCart: () => request('/auth/cart', { auth: true }),
  syncCart: (items) => request('/auth/cart', { method: 'PUT', body: { items }, auth: true }),

  // ── Products Catalog (Feature 2) ──
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.minPrice) query.set('minPrice', params.minPrice);
    if (params.maxPrice) query.set('maxPrice', params.maxPrice);
    if (params.sort) query.set('sort', params.sort);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${qs}`, { auth: true });
  },
  getCategories: () => request('/products/categories'),
  getFilters: () => request('/products/filters'),
  syncRealProducts: () => request('/products/sync-real', { method: 'POST', auth: true }),
  syncPublic: () => request('/products/sync-public', { method: 'POST', auth: true }),
  getProduct: (id) => request(`/products/${id}`, { auth: true }),

  // ── Admin Product Management (Feature 5) ──
  createProduct: (formData) => request('/products', { method: 'POST', body: formData, isFormData: true, auth: true }),
  updateProduct: (id, formData) => request(`/products/${id}`, { method: 'PUT', body: formData, isFormData: true, auth: true }),
  updateStock: (id, countInStock) => request(`/products/${id}/stock`, { method: 'PATCH', body: { countInStock }, auth: true }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE', auth: true }),

  // ── AI RAG Shopping Assistant (Feature 3) ──
  chat: (message, history = []) => request('/chat', { method: 'POST', body: { message, history } }),

  // ── Personalized Recommendations (Feature 4) ──
  getRecommendations: () => request('/recommendations', { auth: true }),
  trackActivity: (payload) => request('/recommendations/track', { method: 'POST', body: payload, auth: true }),

  // ── Orders & Inventory ──
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload, auth: true }),
  getMyOrders: () => request('/orders/mine', { auth: true }),
  getAllOrders: () => request('/orders', { auth: true }),
  getOrderById: (id) => request(`/orders/${id}`, { auth: true }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: { status }, auth: true }),
  getAdminStats: () => request('/orders/admin/stats', { auth: true }),

  // ── Payment Gateway Integration (Feature 6) ──
  getPaymentConfig: () => request('/payment/config'),
  createPaymentOrder: (payload) => request('/payment/create-order', { method: 'POST', body: payload, auth: true }),
  verifyPayment: (payload) => request('/payment/verify', { method: 'POST', body: payload, auth: true }),
  recordPaymentFailure: (payload) => request('/payment/failed', { method: 'POST', body: payload, auth: true }),
};

export default api;
