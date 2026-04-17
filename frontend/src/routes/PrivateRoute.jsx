/**
 * routes/PrivateRoute.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps any route that requires authentication.
 *
 * States:
 *  loading  → show spinner (AuthContext is hydrating token from localStorage)
 *  isAuth   → render children
 *  !isAuth  → redirect to /login, preserving the original path in state
 *             so after login we can redirect back: navigate(state.from || '/')
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FullPageSpinner } from '../components/common/Spinner.jsx';

export default function PrivateRoute({ children }) {
  const { isAuth, loading } = useAuth();
  const location = useLocation();

  // Auth is still being restored from localStorage — show spinner, not redirect
  if (loading) return <FullPageSpinner text="Verifying session…" />;

  // Not logged in — redirect to login and remember where the user wanted to go
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
