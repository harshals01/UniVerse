/**
 * components/common/Navbar.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Top navigation bar — visible on every protected page.
 * Shows: Logo | Nav links | User info + Logout
 * Collapses links to a hamburger menu on mobile.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_LINKS = [
  { to: '/',            label: '🏠 Home',        id: 'nav-home'        },
  { to: '/lostfound',   label: '🔍 Lost & Found', id: 'nav-lostfound'  },
  { to: '/marketplace', label: '🛒 Marketplace',  id: 'nav-marketplace' },
  { to: '/notes',       label: '🤖 AI Notes',     id: 'nav-notes'       },
];

export default function Navbar() {
  const { user, logout, isAuth } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      position:   'sticky',
      top:        0,
      zIndex:     'var(--z-sticky)',
      background: 'rgba(13, 13, 20, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        height: 64, gap: 'var(--space-6)',
      }}>

        {/* ── Logo ──────────────────────────────────────────────────────────── */}
        <NavLink to="/" id="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: '1.4rem' }}>⚡</span>
          <span style={{
            fontWeight: 800, fontSize: 'var(--text-lg)',
            background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-accent))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            UniVerse
          </span>
        </NavLink>

        {/* ── Desktop Nav links ─────────────────────────────────────────────── */}
        {isAuth && (
          <div style={{ display: 'flex', gap: 'var(--space-1)', marginLeft: 'var(--space-4)' }}
               className="desktop-nav">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                id={link.id}
                end={link.to === '/'}
                style={({ isActive }) => ({
                  padding:      '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize:     'var(--text-sm)',
                  fontWeight:   isActive ? 600 : 400,
                  color:        isActive ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                  background:   isActive ? 'var(--color-primary-glow)' : 'transparent',
                  textDecoration: 'none',
                  transition:   'all var(--transition-fast)',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* ── Spacer ────────────────────────────────────────────────────────── */}
        <div style={{ flex: 1 }} />

        {/* ── User section ──────────────────────────────────────────────────── */}
        {isAuth && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {/* Avatar */}
            <NavLink to="/profile" id="nav-profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 700, color: '#fff',
                flexShrink: 0,
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hide-mobile">
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  {user.name}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                  {user.college || 'Student'}
                </p>
              </div>
            </NavLink>

            {/* Logout */}
            <button
              id="nav-logout"
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="btn btn-primary btn-sm">Sign in</NavLink>
        )}

        {/* ── Mobile hamburger ──────────────────────────────────────────────── */}
        {isAuth && (
          <button
            className="mobile-only btn btn-ghost btn-sm"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        )}
      </div>

      {/* ── Mobile dropdown menu ──────────────────────────────────────────────── */}
      {menuOpen && isAuth && (
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          padding: 'var(--space-4)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
        }}>
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                background: isActive ? 'var(--color-primary-glow)' : 'transparent',
                textDecoration: 'none', fontWeight: isActive ? 600 : 400,
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hide-mobile  { display: none !important; }
          .mobile-only  { display: flex !important; }
        }
        .mobile-only { display: none; }
      `}</style>
    </nav>
  );
}
