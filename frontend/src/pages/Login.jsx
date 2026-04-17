/**
 * pages/Login.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Login page — centered card, email + password, redirects after success.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { useFormValidation, rules } from '../hooks/useFormValidation.js';

export default function Login() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const redirectTo   = location.state?.from?.pathname || '/';

  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const { errors, validate, clearError } = useFormValidation({
    email:    [rules.required('Email is required'), rules.email()],
    password: [rules.required('Password is required')],
  });

  const change = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    clearError(e.target.name);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authApi.login({ email: form.email.trim(), password: form.password });
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg-base)',
    }}>
      {/* ── Left decorative panel (hidden on mobile) ─────────────────────── */}
      <div className="auth-art" style={{
        flex: 1, background: 'linear-gradient(135deg, #13131f 0%, #1a0a2e 50%, #0d0d20 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'var(--space-12)', position: 'relative', overflow: 'hidden',
      }}>
        <GlowOrb top="10%" left="20%" color="var(--color-primary)" />
        <GlowOrb top="60%" left="70%" color="var(--color-accent)" size={180} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>⚡</div>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
            UniVerse
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 280, lineHeight: 1.8 }}>
            Your all-in-one campus platform — Lost & Found, Marketplace, and AI-powered Notes.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-8)', alignItems: 'flex-start' }}>
            {['🔍 Lost & Found — Recover what matters', '🛒 Marketplace — Buy & sell with students', '🤖 AI Notes — Study smarter, not harder'].map(f => (
              <div key={f} style={{
                padding: '10px 16px', borderRadius: 'var(--radius-md)',
                background: 'rgba(108,99,255,0.12)',
                border: '1px solid var(--border-primary)',
                fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                textAlign: 'left',
              }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Login form ────────────────────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: 'var(--space-12) var(--space-8)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Sign in to your UniVerse account
          </p>
        </div>

        <form id="login-form" onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={change}
              style={errors.email ? { borderColor: 'var(--color-danger)' } : {}}
            />
            {errors.email && <FieldError msg={errors.email} />}
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label htmlFor="login-password" className="form-label">Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={change}
                style={{ paddingRight: 48, ...(errors.password ? { borderColor: 'var(--color-danger)' } : {}) }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: 'var(--text-sm)',
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <FieldError msg={errors.password} />}
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginTop: 'var(--space-2)', position: 'relative' }}
          >
            {loading ? <Spinner size="sm" /> : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', margin: 'var(--space-6) 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Don't have an account?{' '}
          <Link to="/register" id="go-register" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>
            Create one free
          </Link>
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-art { display: none !important; } }
      `}</style>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
const FieldError = ({ msg }) => (
  <span style={{ color: 'var(--color-danger)', fontSize: 'var(--text-xs)' }}>⚠ {msg}</span>
);

const GlowOrb = ({ top, left, color, size = 240 }) => (
  <div style={{
    position:  'absolute', top, left,
    width:     size, height: size,
    borderRadius: '50%',
    background: color,
    opacity:   0.08,
    filter:    `blur(${size * 0.3}px)`,
    pointerEvents: 'none',
  }} />
);
