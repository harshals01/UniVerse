/**
 * components/common/Navbar.jsx
 * Premium dark glass floating sidebar + top utility bar.
 * Mobile: bottom glass dock + slide-in drawer.
 */
import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard, ShoppingBag, PackageSearch,
  Sparkles, UserCircle, LogOut, Bell, X, Menu,
  ChevronDown,
} from 'lucide-react';
import Logo from './Logo';

const NAV_LINKS = [
  { to: '/',            label: 'Dashboard',   Icon: LayoutDashboard, id: 'nav-home'        },
  { to: '/lostfound',   label: 'Lost & Found', Icon: PackageSearch,   id: 'nav-lostfound'   },
  { to: '/marketplace', label: 'Marketplace',  Icon: ShoppingBag,     id: 'nav-marketplace' },
  { to: '/notes',       label: 'AI Notes',     Icon: Sparkles,        id: 'nav-notes'       },
];

export default function Navbar() {
  const { user, logout, isAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDrawerOpen(false);
    setDropdownOpen(false);
  };

  if (!isAuth) return null;

  const pageTitle = NAV_LINKS.find(l =>
    l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to)
  )?.label ?? 'UniVerse';

  return (
    <>
      {/* ── Floating Left Sidebar (desktop) ─────────────────────────────────── */}
      <aside className="uv-sidebar">
        {/* Logo */}
        <NavLink to="/" id="nav-logo" className="uv-sidebar-logo">
          <Logo size={28} style={{ color: 'var(--color-primary)', filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' }} />
          <span className="uv-logo-text">UniVerse</span>
        </NavLink>

        {/* Nav items */}
        <nav className="uv-sidebar-nav">
          {NAV_LINKS.map(({ to, label, Icon, id }) => (
            <NavLink
              key={to} to={to} id={id}
              end={to === '/'}
              className={({ isActive }) => `uv-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="uv-nav-icon"><Icon size={18} strokeWidth={1.8} /></span>
              <span className="uv-nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Profile card at bottom */}
        {user && (
          <div className="uv-sidebar-profile">
            <div className="uv-avatar-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, truncate: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.name?.split(' ')[0]}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              id="nav-logout"
              className="uv-logout-btn"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={15} strokeWidth={2} />
            </button>
          </div>
        )}
      </aside>

      {/* ── Floating Top Utility Bar (desktop) ──────────────────────────────── */}
      <header className="uv-topbar">
        {/* Page title */}
        <span className="uv-topbar-title">{pageTitle}</span>

        {/* Right controls */}
        <div className="uv-topbar-right">
          {/* Notifications */}
          <button className="btn-icon" aria-label="Notifications">
            <Bell size={16} strokeWidth={1.8} />
          </button>

          {/* Avatar dropdown */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                id="nav-profile"
                onClick={() => setDropdownOpen(o => !o)}
                className="uv-profile-chip"
                aria-label="Account menu"
              >
                <div className="uv-avatar-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hide-mobile" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {user.name?.split(' ')[0]}
                </span>
                <ChevronDown size={13} style={{ color: 'var(--text-muted)', transition: 'transform var(--transition-fast)', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>

              {dropdownOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setDropdownOpen(false)} />
                  <div className="uv-dropdown animate-scale">
                    <NavLink to="/profile" onClick={() => setDropdownOpen(false)} className="uv-dropdown-item">
                      <UserCircle size={15} /> Profile
                    </NavLink>
                    <div className="uv-dropdown-divider" />
                    <button id="nav-logout-dd" onClick={handleLogout} className="uv-dropdown-item danger">
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="btn-icon uv-hamburger"
            onClick={() => setDrawerOpen(o => !o)}
            aria-label="Menu"
          >
            <Menu size={18} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ───────────────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="uv-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="uv-drawer animate-slide-left" onClick={e => e.stopPropagation()}>
            <div className="uv-drawer-header">
              <Logo size={28} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontWeight: 800, fontSize: 'var(--text-base)' }}>UniVerse</span>
              <button className="btn-icon" style={{ marginLeft: 'auto' }} onClick={() => setDrawerOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {NAV_LINKS.map(({ to, label, Icon, id }) => (
                <NavLink
                  key={to} to={to} id={`mob-${id}`}
                  end={to === '/'}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) => `uv-nav-item${isActive ? ' active' : ''}`}
                  style={{ padding: '12px 16px' }}
                >
                  <span className="uv-nav-icon"><Icon size={18} strokeWidth={1.8} /></span>
                  <span className="uv-nav-label">{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="uv-dropdown-divider" style={{ margin: '12px 0' }} />

            {user && (
              <div className="uv-sidebar-profile">
                <div className="uv-avatar-sm">{user.name?.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{user.name?.split(' ')[0]}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{user.email}</p>
                </div>
                <button onClick={handleLogout} className="uv-logout-btn" title="Sign out">
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Scoped Styles ───────────────────────────────────────────────────── */}
      <style>{`
        /* ── Sidebar ── */
        .uv-sidebar {
          position:   fixed;
          top:        16px;
          left:       16px;
          bottom:     16px;
          width:      var(--sidebar-width, 260px);
          background: var(--bg-sidebar);
          border:     1px solid var(--border-glass);
          border-radius: var(--radius-2xl);
          backdrop-filter: var(--blur-md);
          box-shadow: var(--shadow-lg), 0 0 0 1px rgba(255,255,255,0.04) inset;
          display:    flex;
          flex-direction: column;
          padding:    20px 12px;
          z-index:    var(--z-sticky);
          overflow:   hidden;
        }
        .uv-sidebar::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Logo */
        .uv-sidebar-logo {
          display:     flex;
          align-items: center;
          gap:         10px;
          padding:     8px 10px 20px;
          text-decoration: none;
        }
        .uv-logo-mark {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, #8B5CF6, #6366F1);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem; font-weight: 800; color: #fff;
          box-shadow: 0 4px 16px rgba(139,92,246,0.40);
          flex-shrink: 0;
        }
        .uv-logo-text {
          font-size:    var(--text-base);
          font-weight:  800;
          color:        var(--text-primary);
          letter-spacing: -0.01em;
        }

        /* Nav */
        .uv-sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
        .uv-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          text-decoration: none;
          font-size: var(--text-sm); font-weight: 500;
          color: var(--text-muted);
          transition: all var(--transition-fast);
          position: relative;
        }
        .uv-nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }
        .uv-nav-item.active {
          background: linear-gradient(135deg, rgba(139,92,246,0.20) 0%, rgba(99,102,241,0.12) 100%);
          color: #C4B5FD;
          font-weight: 600;
          box-shadow: 0 0 0 1px rgba(139,92,246,0.25);
        }
        .uv-nav-item.active .uv-nav-icon { color: #A78BFA; }
        .uv-nav-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .uv-nav-label { flex: 1; }

        /* Profile card */
        .uv-sidebar-profile {
          display: flex; align-items: center; gap: 10px;
          padding: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          margin-top: 8px;
        }
        .uv-avatar-sm {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #8B5CF6, #6366F1);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; color: #fff;
          flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(139,92,246,0.30);
        }
        .uv-logout-btn {
          background: rgba(244,63,94,0.08);
          border: 1px solid rgba(244,63,94,0.20);
          border-radius: 8px; padding: 6px;
          color: rgba(244,63,94,0.70);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .uv-logout-btn:hover {
          background: rgba(244,63,94,0.15);
          color: #F43F5E;
          box-shadow: 0 0 12px rgba(244,63,94,0.20);
        }

        /* ── Top bar ── */
        .uv-topbar {
          position:    fixed;
          top:         16px;
          left:        calc(var(--sidebar-width, 260px) + 32px);
          right:       16px;
          height:      56px;
          background:  rgba(11,15,23,0.80);
          border:      1px solid var(--border-glass);
          border-radius: var(--radius-2xl);
          backdrop-filter: var(--blur-md);
          box-shadow:  var(--shadow-md);
          display:     flex;
          align-items: center;
          padding:     0 20px;
          gap:         12px;
          z-index:     var(--z-sticky);
        }
        .uv-topbar-title {
          font-size:   var(--text-base);
          font-weight: 700;
          color:       var(--text-primary);
          flex: 1;
          letter-spacing: -0.01em;
        }
        .uv-topbar-right {
          display: flex; align-items: center; gap: 8px;
        }

        /* Profile chip */
        .uv-profile-chip {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-pill);
          padding: 4px 12px 4px 4px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .uv-profile-chip:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(139,92,246,0.30);
        }

        /* Dropdown */
        .uv-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          min-width: 170px;
          background: rgba(11,15,23,0.95);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          padding: 6px;
          z-index: 100;
          backdrop-filter: var(--blur-md);
        }
        .uv-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          font-size: var(--text-sm); font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          cursor: pointer;
          transition: all var(--transition-fast);
          background: transparent; border: none; width: 100%; text-align: left;
          font-family: inherit;
        }
        .uv-dropdown-item:hover { background: rgba(255,255,255,0.06); color: var(--text-primary); }
        .uv-dropdown-item.danger { color: #FB7185; }
        .uv-dropdown-item.danger:hover { background: rgba(244,63,94,0.10); }
        .uv-dropdown-divider { height: 1px; background: var(--border-glass); margin: 4px 0; }

        /* ── Hamburger — only on mobile ── */
        .uv-hamburger { display: none; }

        /* ── Mobile drawer ── */
        .uv-drawer-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.60);
          backdrop-filter: blur(4px);
          z-index: calc(var(--z-sticky) + 10);
        }
        .uv-drawer {
          position: absolute; top: 0; left: 0; bottom: 0;
          width: min(300px, 85vw);
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border-glass);
          padding: 16px 12px;
          display: flex; flex-direction: column; gap: 4px;
          overflow-y: auto;
        }
        .uv-drawer-header {
          display: flex; align-items: center; gap: 10px;
          padding: 4px 8px 16px;
        }
        @keyframes animate-slide-left {
          from { transform: translateX(-100%); } to { transform: translateX(0); }
        }
        .animate-slide-left { animation: animate-slide-left 0.22s ease both; }

        /* ── Responsive breakpoints ── */
        @media (max-width: 900px) {
          .uv-sidebar { display: none; }
          .uv-topbar {
            left: 16px;
            border-radius: var(--radius-xl);
          }
          .uv-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
