/**
 * context/AuthContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Global authentication state: user, token, login, logout.
 * Persists to localStorage so refresh doesn't log the user out.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('campussync_token'));
  const [loading, setLoading] = useState(true); // true = hydrating from storage

  // ── Hydrate user from token on mount ──────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      const stored = localStorage.getItem('campussync_token');
      if (!stored) { setLoading(false); return; }
      try {
        const res = await authApi.getMe();
        setUser(res.data.user);
      } catch {
        // Token expired — clear storage silently
        localStorage.removeItem('campussync_token');
        localStorage.removeItem('campussync_user');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback((userData, jwt) => {
    localStorage.setItem('campussync_token', jwt);
    localStorage.setItem('campussync_user',  JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('campussync_token');
    localStorage.removeItem('campussync_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuth: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
