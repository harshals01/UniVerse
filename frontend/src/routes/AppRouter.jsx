/**
 * routes/AppRouter.jsx
 * Complete route map for all UniVerse modules.
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
    {/* Top bar is 60px tall — push content below it. No left margin needed. */}
    <main style={{
      marginTop:  'var(--topbar-height, 60px)',
      minHeight:  'calc(100vh - var(--topbar-height, 60px))',
      background: 'var(--bg-base)',
      overflowX:  'hidden',
    }}>
      {children}
    </main>
  </>
);


// ── Guard: redirect logged-in users away from auth pages ─────────────────────
const PublicOnlyRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return isAuth ? <Navigate to="/" replace /> : children;
};

// ── Wrap a page in Navbar layout + private guard ──────────────────────────────
const Page = ({ element }) => (
  <PrivateRoute>
    <MainLayout>{element}</MainLayout>
  </PrivateRoute>
);

export default function AppRouter() {
  return (
    <Routes>
      {/* ── Public auth routes ────────────────────────────────────────────── */}
      <Route path="/login"    element={<PublicOnlyRoute><Login    /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

      {/* ── Dashboard ─────────────────────────────────────────────────────── */}
      <Route path="/"  element={<Page element={<Home />} />} />

      {/* ── Lost & Found ──────────────────────────────────────────────────── */}
      <Route path="/lostfound"         element={<Page element={<LostFound />}       />} />
      <Route path="/lostfound/create"  element={<Page element={<LostFoundCreate />} />} />
      <Route path="/lostfound/:id"     element={<Page element={<LostFoundDetail />} />} />

      {/* ── Marketplace ───────────────────────────────────────────────────── */}
      <Route path="/marketplace"         element={<Page element={<Marketplace />}       />} />
      <Route path="/marketplace/create"  element={<Page element={<MarketplaceCreate />} />} />
      <Route path="/marketplace/:id"     element={<Page element={<MarketplaceDetail />} />} />

      {/* ── AI Notes ──────────────────────────────────────────────────────── */}
      <Route path="/notes" element={<Page element={<Notes />} />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
