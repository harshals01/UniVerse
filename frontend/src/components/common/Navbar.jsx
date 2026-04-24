/**
 * components/common/Navbar.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Dark Modular navigation — TOP horizontal bar on all screen sizes.
 * Mobile: links collapse into a hamburger drawer.
 *
 * All NavLink `to` paths, auth logic, and route IDs are unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_LINKS = [
  { to: '/',            label: 'Home',        icon: '⌂',  id: 'nav-home'        },
  { to: '/lostfound',   label: 'Lost & Found', icon: '◎',  id: 'nav-lostfound'   },
  { to: '/marketplace', label: 'Marketplace',  icon: '◈',  id: 'nav-marketplace' },
  { to: '/notes',       label: 'AI Notes',     icon: '✦',  id: 'nav-notes'       },
];

export default function Navbar() {
  const { user, logout, isAuth } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  if (!isAuth) return null;

  return (
    <>
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className="universe-topbar">

        {/* Brand */}
        <NavLink to="/" id="nav-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', color: '#fff', fontWeight: 800, flexShrink: 0,
          }}>
            U
          </div>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
            UniVerse
          </span>
        </NavLink>

        {/* Desktop nav links — centered */}
        <nav className="topbar-links no-tap-min">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              id={link.id}
              end={link.to === '/'}
              style={({ isActive }) => ({
                display:        'flex',
                alignItems:     'center',
                gap:            6,
                padding:        '6px 14px',
                borderRadius:   'var(--radius-pill)',
                textDecoration: 'none',
                fontWeight:     600,
                fontSize:       'var(--text-sm)',
                transition:     'background var(--transition-fast), color var(--transition-fast)',
                background:     isActive ? 'var(--color-primary)' : 'transparent',
                color:          isActive ? '#fff' : 'var(--text-muted)',
                whiteSpace:     'nowrap',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.style.background.includes('var(--color-primary)')) {
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.style.background.includes('var(--color-primary)')) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: user avatar dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {user && (
            <div style={{ position: 'relative' }}>
              {/* Avatar chip — click to toggle dropdown */}
              <button
                id="nav-profile"
                onClick={() => setDropdownOpen(o => !o)}
                aria-label="Account menu"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '4px 10px 4px 4px',
                  cursor: 'pointer',
                  transition: 'border-color var(--transition-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="topbar-username">{user.name?.split(' ')[0]}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: 2 }}>
                  {dropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <>
                  {/* Click-away backdrop */}
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="nav-dropdown">
                    <NavLink
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: 'var(--space-3) var(--space-4)',
                        textDecoration: 'none',
                        color: 'var(--text-secondary)',
                        fontWeight: 600, fontSize: 'var(--text-sm)',
                        borderRadius: 'var(--radius-md)',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>👤</span> Profile
                    </NavLink>

                    <div style={{ height: 1, background: 'var(--border-subtle)', margin: 'var(--space-1) 0' }} />

                    <button
                      id="nav-logout"
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'transparent',
                        border: 'none', cursor: 'pointer',
                        color: '#f87171',
                        fontWeight: 600, fontSize: 'var(--text-sm)',
                        borderRadius: 'var(--radius-md)',
                        width: '100%', textAlign: 'left',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.10)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>⏏</span> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="topbar-hamburger icon-btn no-tap-min"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{
              background: 'var(--bg-elevated)',
              border: 'none', cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: '7px 10px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '1rem',
              transition: 'background var(--transition-fast)',
              display: 'none',   /* shown via CSS on mobile */
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ──────────────────────────────────────────────────── */}
      {menuOpen && (
        <div
          className="topbar-drawer"
          onClick={() => setMenuOpen(false)}
        >
          <div className="topbar-drawer-inner" onClick={e => e.stopPropagation()}>
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                id={`mob-${link.id}`}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  display:        'flex',
                  alignItems:     'center',
                  gap:            12,
                  padding:        'var(--space-4) var(--space-5)',
                  textDecoration: 'none',
                  fontWeight:     600,
                  fontSize:       'var(--text-base)',
                  borderRadius:   'var(--radius-md)',
                  color:          isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                  background:     isActive ? 'rgba(229,69,3,0.10)' : 'transparent',
                  transition:     'background var(--transition-fast), color var(--transition-fast)',
                })}
              >
                <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center' }}>{link.icon}</span>
                {link.label}
              </NavLink>
            ))}

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--bg-elevated)', margin: 'var(--space-3) 0' }} />

            {/* Profile + logout in drawer */}
            <NavLink
              to="/profile"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 'var(--space-4) var(--space-5)',
                textDecoration: 'none',
                fontWeight: 600, fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center' }}>👤</span>
              {user?.name}
            </NavLink>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 'var(--space-4) var(--space-5)',
                background: 'rgba(239,68,68,0.08)',
                border: 'none', cursor: 'pointer',
                color: '#f87171',
                fontWeight: 600, fontSize: 'var(--text-base)',
                borderRadius: 'var(--radius-md)',
                width: '100%', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center' }}>⏏</span>
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* ── Scoped styles ─────────────────────────────────────────────────── */}
      <style>{`
        /* Top bar */
        .universe-topbar {
          position:        fixed;
          top:             0;
          left:            0;
          right:           0;
          height:          60px;
          background:      var(--bg-surface);
          display:         flex;
          align-items:     center;
          gap:             var(--space-4);
          padding:         0 var(--space-6);
          z-index:         var(--z-sticky);
          /* subtle bottom tonal separation */
          box-shadow:      0 1px 0 var(--border-subtle);
        }

        /* Desktop nav links — centered */
        .topbar-links {
          display:         flex;
          align-items:     center;
          justify-content: center;
          gap:             var(--space-1);
          flex:            1;
        }

        /* Avatar dropdown panel */
        .nav-dropdown {
          position:      absolute;
          top:           calc(100% + 8px);
          right:         0;
          min-width:     160px;
          background:    var(--bg-surface);
          border:        1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          box-shadow:    var(--shadow-lg);
          padding:       var(--space-2);
          z-index:       100;
          animation:     fadeIn 0.12s ease both;
        }

        /* User name label — hidden below 900px */
        .topbar-username {
          font-size:  var(--text-sm);
          font-weight: 600;
          color:      var(--text-secondary);
        }
        @media (max-width: 900px) {
          .topbar-username { display: none; }
        }

        /* Hide desktop links + show hamburger on mobile */
        @media (max-width: 768px) {
          .topbar-links       { display: none; }
          .topbar-hamburger   { display: flex !important; }
        }

        /* Mobile drawer overlay */
        .topbar-drawer {
          position:   fixed;
          inset:      60px 0 0 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          z-index:    calc(var(--z-sticky) - 1);
          animation:  fadeIn 0.15s ease both;
        }
        .topbar-drawer-inner {
          position:       absolute;
          top:            0;
          right:          0;
          width:          min(320px, 90vw);
          height:         100%;
          background:     var(--bg-surface);
          padding:        var(--space-4);
          display:        flex;
          flex-direction: column;
          gap:            var(--space-1);
          overflow-y:     auto;
          animation:      slideInRight 0.2s ease both;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
