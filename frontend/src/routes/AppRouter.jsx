/**
 * routes/AppRouter.jsx
 * Complete route map — sidebar layout with floating top bar.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import Navbar from '../components/common/Navbar.jsx';

// Auth pages
import Login    from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';

// Dashboard
import Home from '../pages/Home.jsx';

// Lost & Found
import LostFound       from '../pages/LostFound.jsx';
import LostFoundCreate from '../pages/LostFoundCreate.jsx';
import LostFoundDetail from '../pages/LostFoundDetail.jsx';

// Marketplace
import Marketplace       from '../pages/Marketplace.jsx';
import MarketplaceCreate from '../pages/MarketplaceCreate.jsx';
import MarketplaceDetail from '../pages/MarketplaceDetail.jsx';

// AI Notes
import Notes from '../pages/Notes.jsx';

// ── Layout ────────────────────────────────────────────────────────────────────
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    {/*
      Sidebar is 260px wide + 16px from left edge + 16px gap = 292px offset.
      Top bar is 56px tall + 16px from top + 16px gap = 88px offset.
      On mobile (<900px) sidebar is hidden, top bar spans full width.
    */}
    <main style={{
      marginLeft:  'calc(var(--sidebar-width, 260px) + 32px)',
      marginTop:   'calc(56px + 32px)',   /* topbar height + top offset + gap */
      minHeight:   'calc(100vh - 88px)',
      background:  'transparent',
      overflowX:   'hidden',
      transition:  'margin-left var(--transition-base)',
    }}>
      {children}
    </main>

    {/* Mobile: sidebar hidden so remove margin */}
    <style>{`
      @media (max-width: 900px) {
        main { margin-left: 0 !important; }
      }
    `}</style>
  </>
);

// ── Guard: redirect logged-in users away from auth pages ─────────────────────
const PublicOnlyRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return isAuth ? <Navigate to="/" replace /> : children;
};

// ── Wrap a page in layout + private guard ─────────────────────────────────────
const Page = ({ element }) => (
  <PrivateRoute>
    <MainLayout>{element}</MainLayout>
  </PrivateRoute>
);

export default function AppRouter() {
  return (
    <Routes>
      {/* ── Public auth routes ─────────────────────────────────────────────── */}
      <Route path="/login"    element={<PublicOnlyRoute><Login    /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

      {/* ── Dashboard ──────────────────────────────────────────────────────── */}
      <Route path="/"  element={<Page element={<Home />} />} />

      {/* ── Lost & Found ───────────────────────────────────────────────────── */}
      <Route path="/lostfound"         element={<Page element={<LostFound />}       />} />
      <Route path="/lostfound/create"  element={<Page element={<LostFoundCreate />} />} />
      <Route path="/lostfound/:id"     element={<Page element={<LostFoundDetail />} />} />

      {/* ── Marketplace ────────────────────────────────────────────────────── */}
      <Route path="/marketplace"         element={<Page element={<Marketplace />}       />} />
      <Route path="/marketplace/create"  element={<Page element={<MarketplaceCreate />} />} />
      <Route path="/marketplace/:id"     element={<Page element={<MarketplaceDetail />} />} />

      {/* ── AI Notes ───────────────────────────────────────────────────────── */}
      <Route path="/notes" element={<Page element={<Notes />} />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
