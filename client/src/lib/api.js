/**
 * =====================================================================
 * Contributor: LAVANYA
 * Role: Lead Frontend UI/UX & Assistant Engineer
 * Syllabus Sessions: Sessions 27-28 (Async/Await & Fetch API REST Client)
 * Feature: Unified API Service Layer & HTTP Request Abstraction
 * =====================================================================
 */
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'smartcart_token';

// LocalStorage helpers for JWT Token (Session 29-30)
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Generic request helper with fetch, async/await, and error handling
async function request(path, { method = 'GET', body, isFormData = false, auth = false } = {}) {
  const headers = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach JWT Bearer token if route requires auth (Session 39)
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
  // ── Authentication APIs (Session 39) ──
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me', { auth: true }),
  updateProfile: (payload) => request('/auth/profile', { method: 'PUT', body: payload, auth: true }),

  // ── Product CRUD APIs (Sessions 38, 40, 41) ──
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.minPrice) query.set('minPrice', params.minPrice);
    if (params.maxPrice) query.set('maxPrice', params.maxPrice);
    if (params.sort) query.set('sort', params.sort);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${qs}`);
  },
  getCategories: () => request('/products/categories'),
  getFilters: () => request('/products/filters'),
  syncPublic: () => request('/products/sync-public', { method: 'POST' }),
  getProduct: (id) => request(`/products/${id}`),
  
  // Create product with Multer file upload (Session 40)
  createProduct: (formData) => request('/products', { method: 'POST', body: formData, isFormData: true }),
  updateProduct: (id, formData) => request(`/products/${id}`, { method: 'PUT', body: formData, isFormData: true }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // ── Assistant Chatbot (Price & Variety Recommendations) ──
  chat: (message) => request('/chat', { method: 'POST', body: { message } }),

  // ── Order APIs (Session 41 - Mongoose Populate) ──
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload, auth: true }),
  getMyOrders: () => request('/orders/mine', { auth: true }),
  getAllOrders: () => request('/orders'),
};

export default api;
