/**
 * context/AuthContext.jsx

 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi.js';

const AuthContext = createContext(null);

const readToken = () => localStorage.getItem('campussync_token');
const readUser = () => {
  try {
    const raw = localStorage.getItem('campussync_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readUser());
  const [token, setToken] = useState(() => readToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = readToken();
    if (!storedToken) return; // Nothing to verify

    let cancelled = false;
    authApi.getMe()
      .then((res) => {
        if (cancelled) return;
        // Refresh cached user data with latest from server
        const freshUser = res.data?.user ?? res.user ?? null;
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem('campussync_user', JSON.stringify(freshUser));
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Token expired or invalid — clear silently
        localStorage.removeItem('campussync_token');
        localStorage.removeItem('campussync_user');
        setToken(null);
        setUser(null);
      });

    return () => { cancelled = true; };
  }, []);

  const login = useCallback((userData, jwt) => {
    localStorage.setItem('campussync_token', jwt);
    localStorage.setItem('campussync_user', JSON.stringify(userData));
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
