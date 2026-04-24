/**
 * pages/Login.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Login page — Dark Modular theme.
 * Split-screen on desktop (decorative left panel + form right),
 * focused single-card on mobile.
 *
 * All form validation, state hooks, and API logic are unchanged.
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

  const [form, setForm]        = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading] = useState(false);

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
    if (!validate(form)) return;

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
      minHeight:       '100vh',
      display:         'flex',
      background:      'var(--bg-base)',
    }}>

      {/* ── Left decorative panel (desktop only) ─────────────────────────────── */}
      <div className="auth-art-panel">
        {/* Ambient glows */}
        <div style={glow({ top: '10%', left: '15%', color: '#8B5CF6', size: 320 })} />
        <div style={glow({ top: '65%', left: '55%', color: '#6366F1', size: 220 })} />
        <div style={glow({ top: '40%', left: '80%', color: '#06B6D4', size: 160 })} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 360 }}>
          {/* Brand mark */}
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', color: '#fff', fontWeight: 800,
            margin: '0 auto var(--space-6)',
            boxShadow: '0 8px 32px rgba(139,92,246,0.40)',
          }}>
            U
          </div>

          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-3)', letterSpacing: '-0.02em' }}>
            UniVerse
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 'var(--text-sm)' }}>
            Your all-in-one campus platform — Lost & Found, Marketplace, and AI-powered Notes.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-8)', alignItems: 'flex-start' }}>
            {[
              { icon: '🔍', label: 'Lost & Found — recover what matters' },
              { icon: '🛍️', label: 'Marketplace — trade with students' },
              { icon: '✨', label: 'AI Notes — study smarter' },
            ].map(f => (
              <div key={f.label} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(139,92,246,0.10)',
                border: '1px solid rgba(139,92,246,0.20)',
                fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
              }}>
                <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Login card ─────────────────────────────────────────────────── */}
      <div style={{
        flex:           1,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        'var(--space-8) var(--space-6)',
      }}>
        <div style={{
          width:          '100%',
          maxWidth:       440,
          background:     'rgba(18,22,34,0.80)',
          border:         '1px solid var(--border-glass)',
          borderRadius:   'var(--radius-xl)',
          padding:        'var(--space-10) var(--space-8)',
          boxShadow:      'var(--shadow-lg), 0 0 60px rgba(139,92,246,0.08)',
          backdropFilter: 'var(--blur-md)',
          position:       'relative',
          overflow:       'hidden',
        }}>
          {/* inner shine */}
          <div style={{ position:'absolute',inset:0,borderRadius:'inherit',background:'linear-gradient(135deg,rgba(255,255,255,0.04) 0%,transparent 50%)',pointerEvents:'none' }} />

          {/* Header */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h1 style={{
              fontSize:    'var(--text-3xl)',
              fontWeight:  800,
              marginBottom: 'var(--space-2)',
              letterSpacing: '-0.02em',
            }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
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
                style={errors.email ? { boxShadow: '0 0 0 2px var(--color-danger)' } : {}}
              />
              {errors.email && <FieldError msg={errors.email} />}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={change}
                  style={{
                    paddingRight: 48,
                    ...(errors.password ? { boxShadow: '0 0 0 2px var(--color-danger)' } : {}),
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1,
                  }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
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
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 'var(--space-2)' }}
            >
              {loading ? <Spinner size="sm" /> : 'Sign in →'}
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
            <Link to="/register" id="go-register"
                  style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
              Create one free →
            </Link>
          </p>
        </div>
      </div>

      {/* Scoped responsive + art panel styles */}
      <style>{`
        .auth-art-panel {
          width: 420px; flex-shrink: 0;
          background: rgba(11,15,23,0.90);
          border-right: 1px solid var(--border-glass);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: var(--space-12);
          position: relative; overflow: hidden;
        }
        @media (max-width: 768px) { .auth-art-panel { display: none; } }
      `}</style>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const FieldError = ({ msg }) => (
  <span style={{ color: 'var(--color-danger)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 4 }}>
    ⚠ {msg}
  </span>
);

const glow = ({ top, left, color, size = 240 }) => ({
  position:     'absolute', top, left,
  width:        size, height: size,
  borderRadius: '50%',
  background:   color,
  opacity:      0.07,
  filter:       `blur(${size * 0.35}px)`,
  pointerEvents: 'none',
});
