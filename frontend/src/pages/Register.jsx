/**
 * pages/Register.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Registration page — name, email, college, password + confirm.
 * On success: logs user in immediately and navigates to dashboard.
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
  const [form, setForm]       = useState(INITIAL);
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
    if (!form.name.trim())          e.name    = 'Full name is required';
    else if (form.name.length < 2)  e.name    = 'Name must be at least 2 characters';

    if (!form.email.trim())         e.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';

    if (!form.password)             e.password = 'Password is required';
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
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: 'var(--space-6)',
    }}>
      {/* Background decoration */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
        <div style={{ position:'absolute', top:'-20%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'var(--color-primary)', opacity:0.04, filter:'blur(80px)' }} />
        <div style={{ position:'absolute', bottom:'-10%', left:'-10%', width:400, height:400, borderRadius:'50%', background:'var(--color-accent)', opacity:0.05, filter:'blur(60px)' }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 520,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-10) var(--space-8)',
        boxShadow: 'var(--shadow-lg)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>⚡</div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Join thousands of students on UniVerse
          </p>
        </div>

        {/* Progress dots */}
        <div style={{ display:'flex', justifyContent:'center', gap: 8, marginBottom:'var(--space-6)' }}>
          {[1,2,3].map(s => (
            <div key={s} style={{
              width: s <= step ? 24 : 8, height: 8,
              borderRadius: 'var(--radius-full)',
              background: s <= step ? 'var(--color-primary)' : 'var(--border-default)',
              transition: 'all var(--transition-base)',
            }} />
          ))}
        </div>

        <form id="register-form" onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* ── Row 1: Name + College ──────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">Full name *</label>
              <input
                id="reg-name" name="name" type="text"
                placeholder="Alice Smith"
                value={form.name} onChange={change}
                onFocus={() => setStep(1)}
                style={errors.name ? { borderColor: 'var(--color-danger)' } : {}}
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

          {/* ── Email ────────────────────────────────────────────────────────── */}
          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email address *</label>
            <input
              id="reg-email" name="email" type="email"
              placeholder="alice@university.edu"
              value={form.email} onChange={change}
              onFocus={() => setStep(2)}
              style={errors.email ? { borderColor: 'var(--color-danger)' } : {}}
            />
            {errors.email && <FieldError msg={errors.email} />}
          </div>

          {/* ── Password ─────────────────────────────────────────────────────── */}
          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">Password * (min. 6 characters)</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password" name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password} onChange={change}
                onFocus={() => setStep(3)}
                style={{ paddingRight: 48, ...(errors.password ? { borderColor: 'var(--color-danger)' } : {}) }}
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <FieldError msg={errors.password} />}

            {/* Password strength bar */}
            {form.password && <PasswordStrength password={form.password} />}
          </div>

          {/* ── Confirm password ─────────────────────────────────────────────── */}
          <div className="form-group">
            <label htmlFor="reg-confirm" className="form-label">Confirm password *</label>
            <input
              id="reg-confirm" name="confirm"
              type={showPass ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={form.confirm} onChange={change}
              style={errors.confirm ? { borderColor: 'var(--color-danger)' } : {}}
            />
            {errors.confirm && <FieldError msg={errors.confirm} />}
            {form.confirm && form.password === form.confirm && (
              <span style={{ color:'var(--color-success)', fontSize:'var(--text-xs)' }}>✓ Passwords match</span>
            )}
          </div>

          {/* Submit */}
          <button id="register-submit" type="submit" className="btn btn-primary btn-lg"
            disabled={loading} style={{ width:'100%', marginTop:'var(--space-2)' }}>
            {loading ? <Spinner size="sm" /> : 'Create account →'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'var(--space-6)', color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>
          Already have an account?{' '}
          <Link to="/login" id="go-login" style={{ color:'var(--color-primary-light)', fontWeight:600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Field error helper ────────────────────────────────────────────────────────
const FieldError = ({ msg }) => (
  <span style={{ color:'var(--color-danger)', fontSize:'var(--text-xs)' }}>⚠ {msg}</span>
);

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
    <div style={{ marginTop: 4 }}>
      <div style={{ display:'flex', gap:3, height:3 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex:1, borderRadius:'var(--radius-full)',
            background: i <= score ? colors[score] : 'var(--border-default)',
            transition: 'background var(--transition-fast)',
          }} />
        ))}
      </div>
      {score > 0 && (
        <span style={{ fontSize:'var(--text-xs)', color: colors[score] }}>
          {levels[score]}
        </span>
      )}
    </div>
  );
}
