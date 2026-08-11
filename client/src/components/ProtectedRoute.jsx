import { Navigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext';

/**
 * Guards a route. Pass `role` to also restrict it to one kind of account:
 *   <ProtectedRoute role="retailer"><RetailerDashboard /></ProtectedRoute>
 *
 * This is a convenience, not a security boundary — the API enforces the same
 * rules with `protect` and `requireRole`, because anything in the browser can
 * be bypassed.
 */
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  // Wait for the session check, otherwise a signed-in user is bounced to
  // /login on every refresh before /me has answered.
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-agrilink" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) return <Navigate to={dashboardPath(user.role)} replace />;

  return children;
}
