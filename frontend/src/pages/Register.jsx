/**
 * pages/Register.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Registration page — Dark Modular theme.
 * Focused centered card with progress indicator.
 * Two-column name/college row on desktop, stacked on mobile.
 *
 * All form validation, state hooks, and API logic are unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';

const INITIAL = { name: '', email: '', college: '', password: '', confirm: '' };

export default function Register() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]        = useState(INITIAL);
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading] = useState(false);
  const [errors,   setErrors]  = useState({});
  const [step,     setStep]    = useState(1); // 2-step form on mobile

  const change = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name     = 'Full name is required';
    else if (form.name.length < 2) e.name     = 'Name must be at least 2 characters';

    if (!form.email.trim())        e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';

    if (!form.password)            e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';

    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authApi.register({
        name:     form.name.trim(),
        email:    form.email.trim(),
        college:  form.college.trim(),
        password: form.password,
      });
      login(res.data.user, res.data.token);
      toast.success(`Welcome to UniVerse, ${res.data.user.name}! 🎉`);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:       '100vh',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      background:      'var(--bg-base)',
      padding:         'var(--space-6)',
      position:        'relative',
    }}>
      {/* Ambient background glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={glow({ top: '-15%', right: '-8%',  color: 'var(--color-primary)', size: 480 })} />
        <div style={glow({ bottom: '-10%', left: '-8%', color: 'var(--color-accent)',   size: 360 })} />
      </div>

      {/* ── Register card ────────────────────────────────────────────────────── */}
      <div style={{
        position:     'relative',
        zIndex:       1,
        width:        '100%',
        maxWidth:     540,
        background:   'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',    /* 32px */
        padding:      'var(--space-10) var(--space-8)',
        boxShadow:    'var(--shadow-lg)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', color: '#fff', fontWeight: 800,
            margin: '0 auto var(--space-4)',
          }}>
            U
          </div>
          <h1 style={{
            fontSize:      'var(--text-2xl)',
            fontWeight:    800,
            marginBottom:  'var(--space-2)',
            letterSpacing: '-0.02em',
          }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Join thousands of students on UniVerse
          </p>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 'var(--space-6)' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width:        s <= step ? 28 : 8,
              height:       6,
              borderRadius: 'var(--radius-pill)',
              background:   s <= step ? 'var(--color-primary)' : 'var(--bg-elevated)',
              transition:   'all var(--transition-base)',
            }} />
          ))}
        </div>

        <form id="register-form" onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* ── Row 1: Name + College ──────────────────────────────────────── */}
          <div className="reg-row-2col">
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">Full name *</label>
              <input
                id="reg-name" name="name" type="text"
                placeholder="Alex Smith"
                value={form.name} onChange={change}
                onFocus={() => setStep(1)}
                style={errors.name ? { boxShadow: '0 0 0 2px var(--color-danger)' } : {}}
              />
              {errors.name && <FieldError msg={errors.name} />}
            </div>

            <div className="form-group">
              <label htmlFor="reg-college" className="form-label">College / University</label>
              <input
                id="reg-college" name="college" type="text"
                placeholder="MIT, Stanford…"
                value={form.college} onChange={change}
              />
            </div>
          </div>

          {/* ── Email ──────────────────────────────────────────────────────── */}
          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email address *</label>
            <input
              id="reg-email" name="email" type="email"
              placeholder="alex@university.edu"
              value={form.email} onChange={change}
              onFocus={() => setStep(2)}
              style={errors.email ? { boxShadow: '0 0 0 2px var(--color-danger)' } : {}}
            />
            {errors.email && <FieldError msg={errors.email} />}
          </div>

          {/* ── Password ───────────────────────────────────────────────────── */}
          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">Password * (min. 6 characters)</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password" name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password} onChange={change}
                onFocus={() => setStep(3)}
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
            {form.password && <PasswordStrength password={form.password} />}
          </div>

          {/* ── Confirm password ───────────────────────────────────────────── */}
          <div className="form-group">
            <label htmlFor="reg-confirm" className="form-label">Confirm password *</label>
            <input
              id="reg-confirm" name="confirm"
              type={showPass ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={form.confirm} onChange={change}
              style={errors.confirm ? { boxShadow: '0 0 0 2px var(--color-danger)' } : {}}
            />
            {errors.confirm && <FieldError msg={errors.confirm} />}
            {form.confirm && form.password === form.confirm && (
              <span style={{ color: 'var(--color-success)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 4 }}>
                ✓ Passwords match
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            style={{
              width:        '100%',
              marginTop:    'var(--space-2)',
              padding:      'var(--space-4) var(--space-6)',
              borderRadius: 'var(--radius-pill)',
              background:   loading ? 'var(--color-primary-dark)' : 'var(--color-primary)',
              color:        '#fff',
              fontWeight:   700,
              fontSize:     'var(--text-base)',
              border:       'none',
              cursor:       loading ? 'not-allowed' : 'pointer',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              gap:          'var(--space-2)',
              transition:   'background var(--transition-fast), box-shadow var(--transition-fast)',
              opacity:      loading ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'var(--color-primary-dark)'; e.currentTarget.style.boxShadow = '0 0 20px var(--color-primary-glow)'; }}}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {loading ? <Spinner size="sm" /> : 'Create account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Already have an account?{' '}
          <Link to="/login" id="go-login"
                style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
            Sign in →
          </Link>
        </p>
      </div>

      {/* Responsive 2-col row */}
      <style>{`
        .reg-row-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }
        @media (max-width: 480px) {
          .reg-row-2col { grid-template-columns: 1fr; }
        }
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

const glow = ({ top, left, bottom, right, color, size = 240 }) => ({
  position:     'absolute',
  top, left, bottom, right,
  width:        size,
  height:       size,
  borderRadius: '50%',
  background:   color,
  opacity:      0.07,
  filter:       `blur(${size * 0.35}px)`,
  pointerEvents: 'none',
});

// ── Password strength indicator ───────────────────────────────────────────────
function PasswordStrength({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;

  const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'var(--color-danger)', 'var(--color-warning)', 'var(--color-info)', 'var(--color-success)'];

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, height: 4, borderRadius: 'var(--radius-pill)' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex:         1,
            borderRadius: 'var(--radius-pill)',
            background:   i <= score ? colors[score] : 'var(--bg-elevated)',
            transition:   'background var(--transition-fast)',
          }} />
        ))}
      </div>
      {score > 0 && (
        <span style={{ fontSize: 'var(--text-xs)', color: colors[score], marginTop: 4, display: 'block' }}>
          {levels[score]}
        </span>
      )}
    </div>
  );
}
