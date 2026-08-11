import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth, dashboardPath } from './context/AuthContext';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import RetailerDashboard from './pages/RetailerDashboard';
import RetailerOrders from './pages/RetailerOrders';
import AdminDashboard from './pages/AdminDashboard';

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

      <main>
        <Routes>
          {/* Browsing is open — shoppers see produce before signing up. */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

          <Route
            path="/checkout"
            element={<ProtectedRoute role="consumer"><Checkout /></ProtectedRoute>}
          />
          <Route
            path="/orders"
            element={<ProtectedRoute role="consumer"><Orders /></ProtectedRoute>}
          />
          {/* Both roles may open an order: buyers see theirs, sellers see
              orders containing their produce. The API enforces which. */}
          <Route
            path="/orders/:id"
            element={<ProtectedRoute><OrderDetails /></ProtectedRoute>}
          />

          <Route
            path="/retailer"
            element={<ProtectedRoute role="retailer"><RetailerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/retailer/orders"
            element={<ProtectedRoute role="retailer"><RetailerOrders /></ProtectedRoute>}
          />

          <Route
            path="/admin"
            element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BottomNav />
    </>
  );
}
