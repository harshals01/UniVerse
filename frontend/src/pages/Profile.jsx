/**
 * pages/Profile.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium Profile Details page — view & edit user info.
 * Reads from AuthContext; saves via PUT /api/auth/me.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../api/authApi.js';
import {
  UserCircle, Mail, Building2, ShieldCheck,
  Pencil, Save, X, Check, Loader2, CalendarDays,
} from 'lucide-react';

export default function Profile() {
  const { user, login, token } = useAuth();

  /* ── Edit state ───────────────────────────────────────────────────────────── */
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error,   setError]     = useState('');

  const [form, setForm] = useState({
    name:    user?.name    ?? '',
    college: user?.college ?? '',
  });

  const successTimer = useRef(null);

  /* ── Handlers ─────────────────────────────────────────────────────────────── */
  const startEdit = () => {
    setForm({ name: user?.name ?? '', college: user?.college ?? '' });
    setError('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError('');
  };

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name cannot be empty.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await authApi.updateMe({ name: form.name.trim(), college: form.college.trim() });
      const updated = res?.user ?? res?.data?.user ?? null;
      if (updated) {
        login(updated, token);          // refresh context + localStorage
      }
      setEditing(false);
      setSuccess(true);
      clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Derived ──────────────────────────────────────────────────────────────── */
  const initial   = (user?.name ?? '?').charAt(0).toUpperCase();
  const joinedAt  = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <div className="page" style={{ maxWidth: 720 }}>

      {/* ── Page heading ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 6 }}>
          Account settings
        </p>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Your <span className="text-gradient">Profile</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 'var(--text-sm)' }}>
          Manage your personal information and account details.
        </p>
      </div>

      {/* ── Avatar + name hero card ─────────────────────────────────────────── */}
      <div className="pf-hero-card">
        {/* Glow orb */}
        <div className="pf-orb" />

        <div className="pf-avatar-wrap">
          <div className="pf-avatar">{initial}</div>
          {/* Online indicator */}
          <span className="pf-online-dot" title="Active" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 4 }}>
            {user?.name ?? '—'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            {user?.email ?? '—'}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <RoleBadge role={user?.role ?? 'student'} />
            {user?.college && <CollegeBadge college={user.college} />}
          </div>
        </div>

        {/* Edit / Save / Cancel controls */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignSelf: 'flex-start' }}>
          {!editing ? (
            <button id="profile-edit-btn" className="btn btn-secondary btn-sm" onClick={startEdit}>
              <Pencil size={13} /> Edit
            </button>
          ) : (
            <>
              <button id="profile-cancel-btn" className="btn btn-ghost btn-sm" onClick={cancelEdit} disabled={saving}>
                <X size={14} /> Cancel
              </button>
              <button id="profile-save-btn" className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={14} className="spin" /> : <Save size={13} />}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Success banner ──────────────────────────────────────────────────── */}
      {success && (
        <div className="pf-success-banner">
          <Check size={15} /> Profile updated successfully!
        </div>
      )}

      {/* ── Error banner ────────────────────────────────────────────────────── */}
      {error && (
        <div className="pf-error-banner">
          <X size={15} /> {error}
        </div>
      )}

      {/* ── Detail cards ────────────────────────────────────────────────────── */}
      <div className="pf-grid">

        {/* Personal Info */}
        <InfoCard
          title="Personal Information"
          icon={<UserCircle size={16} />}
          iconColor="#A78BFA"
          iconBg="rgba(139,92,246,0.15)"
        >
          <InfoField
            label="Full Name"
            name="name"
            value={editing ? form.name : (user?.name ?? '—')}
            editing={editing}
            onChange={handleChange}
            placeholder="Enter your full name"
            id="profile-field-name"
          />
          <InfoField
            label="College / University"
            name="college"
            value={editing ? form.college : (user?.college || '—')}
            editing={editing}
            onChange={handleChange}
            placeholder="Enter your college name"
            id="profile-field-college"
          />
        </InfoCard>

        {/* Account Info */}
        <InfoCard
          title="Account Information"
          icon={<ShieldCheck size={16} />}
          iconColor="#34D399"
          iconBg="rgba(16,185,129,0.15)"
        >
          <InfoFieldStatic
            label="Email address"
            icon={<Mail size={14} style={{ color: 'var(--text-muted)' }} />}
            value={user?.email ?? '—'}
          />
          <InfoFieldStatic
            label="Account role"
            icon={<ShieldCheck size={14} style={{ color: 'var(--text-muted)' }} />}
            value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
          />
          <InfoFieldStatic
            label="Member since"
            icon={<CalendarDays size={14} style={{ color: 'var(--text-muted)' }} />}
            value={joinedAt}
          />
        </InfoCard>

      </div>

      {/* ── Scoped styles ───────────────────────────────────────────────────── */}
      <style>{`
        /* Hero card */
        .pf-hero-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 28px 28px;
          background: linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.06) 100%), var(--bg-surface);
          border: 1px solid rgba(139,92,246,0.25);
          border-radius: var(--radius-2xl);
          backdrop-filter: var(--blur-md);
          box-shadow: var(--shadow-card), 0 0 0 1px rgba(255,255,255,0.04) inset;
          margin-bottom: 16px;
          overflow: hidden;
          flex-wrap: wrap;
        }
        .pf-orb {
          position: absolute;
          top: -70px; right: -70px;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Avatar */
        .pf-avatar-wrap { position: relative; flex-shrink: 0; }
        .pf-avatar {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B5CF6, #6366F1);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.75rem; font-weight: 800; color: #fff;
          box-shadow: 0 6px 24px rgba(139,92,246,0.45);
          border: 2px solid rgba(255,255,255,0.12);
        }
        .pf-online-dot {
          position: absolute; bottom: 4px; right: 4px;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #10B981;
          border: 2px solid var(--bg-deep);
          box-shadow: 0 0 8px rgba(16,185,129,0.60);
        }

        /* Badges */
        .pf-role-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px;
          border-radius: var(--radius-pill);
          font-size: var(--text-xs); font-weight: 600;
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.30);
          color: #C4B5FD;
        }
        .pf-college-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px;
          border-radius: var(--radius-pill);
          font-size: var(--text-xs); font-weight: 600;
          background: rgba(6,182,212,0.10);
          border: 1px solid rgba(6,182,212,0.25);
          color: #67E8F9;
        }

        /* Success / error banners */
        .pf-success-banner {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 18px;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.30);
          border-radius: var(--radius-lg);
          color: #34D399;
          font-size: var(--text-sm); font-weight: 500;
          margin-bottom: 16px;
          animation: fadeIn 0.25s ease;
        }
        .pf-error-banner {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 18px;
          background: rgba(244,63,94,0.10);
          border: 1px solid rgba(244,63,94,0.25);
          border-radius: var(--radius-lg);
          color: #FB7185;
          font-size: var(--text-sm); font-weight: 500;
          margin-bottom: 16px;
          animation: fadeIn 0.25s ease;
        }

        /* Grid */
        .pf-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 640px) {
          .pf-grid { grid-template-columns: 1fr; }
          .pf-hero-card { flex-direction: column; align-items: flex-start; }
        }

        /* Info card */
        .pf-info-card {
          padding: 22px;
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-xl);
          backdrop-filter: var(--blur-md);
          box-shadow: var(--shadow-sm);
        }
        .pf-card-header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .pf-card-icon {
          width: 32px; height: 32px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .pf-card-title {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        /* Info field */
        .pf-field { margin-bottom: 14px; }
        .pf-field:last-child { margin-bottom: 0; }
        .pf-field-label {
          font-size: var(--text-xs);
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
        }
        .pf-field-value {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          font-weight: 500;
          display: flex; align-items: center; gap: 8px;
          min-height: 36px;
        }
        .pf-field-input {
          width: 100%;
          padding: 9px 13px;
          background: var(--bg-input);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: var(--text-sm);
          font-family: var(--font-sans);
          outline: none;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .pf-field-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-glow-sm);
        }
        .pf-field-input::placeholder { color: var(--text-muted); }

        /* Spin animation for loader */
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────────── */

function RoleBadge({ role }) {
  return (
    <span className="pf-role-badge">
      <ShieldCheck size={11} />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function CollegeBadge({ college }) {
  return (
    <span className="pf-college-badge">
      <Building2 size={11} />
      {college}
    </span>
  );
}

function InfoCard({ title, icon, iconColor, iconBg, children }) {
  return (
    <div className="pf-info-card">
      <div className="pf-card-header">
        <div className="pf-card-icon" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
        <span className="pf-card-title">{title}</span>
      </div>
      {children}
    </div>
  );
}

function InfoField({ label, name, value, editing, onChange, placeholder, id }) {
  return (
    <div className="pf-field">
      <p className="pf-field-label">{label}</p>
      {editing ? (
        <input
          id={id}
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pf-field-input"
          autoComplete="off"
        />
      ) : (
        <p className="pf-field-value">{value}</p>
      )}
    </div>
  );
}

function InfoFieldStatic({ label, icon, value }) {
  return (
    <div className="pf-field">
      <p className="pf-field-label">{label}</p>
      <p className="pf-field-value">
        {icon}
        {value}
      </p>
    </div>
  );
}
