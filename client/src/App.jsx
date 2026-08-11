import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth, dashboardPath } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ConsumerDashboard from './pages/ConsumerDashboard';
import RetailerDashboard from './pages/RetailerDashboard';

/** Keeps a signed-in user off the login and register pages. */
function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={dashboardPath(user.role)} replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

          <Route
            path="/consumer"
            element={
              <ProtectedRoute role="consumer">
                <ConsumerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/retailer"
            element={
              <ProtectedRoute role="retailer">
                <RetailerDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
