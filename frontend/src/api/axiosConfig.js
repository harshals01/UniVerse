/**
 * api/axiosConfig.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Configured Axios instance used by ALL api/* files.
 * Components never import axios directly — always import from api/*.
 *
 * Features:
 *  - baseURL points to /api (proxied to :5000 by Vite in dev)
 *  - Request interceptor: auto-attaches JWT from localStorage
 *  - Response interceptor: extracts .data, handles 401 auto-logout
 * ─────────────────────────────────────────────────────────────────────────────
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15s — generous for AI calls
});

// ── Request: attach JWT ────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campussync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response: unwrap data + handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,  // Unwrap — callers get { success, message, data } directly
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem('campussync_token');
      localStorage.removeItem('campussync_user');
      window.location.href = '/login';
    }
    // Re-throw with the server's error message if available
    const message =
      error.response?.data?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default api;
