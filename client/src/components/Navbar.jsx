import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CartIcon } from './Icons';

/**
 * Desktop header. Hidden below 768px, where BottomNav takes over — the mockups
 * are phone-first, so the tab bar is the primary navigation.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const link = ({ isActive }) =>
    `nav-link px-2 ${isActive ? 'text-agrilink fw-semibold' : 'ag-muted'}`;

  return (
    <nav className="d-none d-md-block bg-white border-bottom">
      <div className="ag-shell d-flex align-items-center gap-3 px-3 py-2" style={{ paddingBottom: 0 }}>
        <Link to="/" className="fw-bold text-agrilink text-decoration-none fs-5">Agrilink</Link>

        <div className="d-flex align-items-center ms-auto gap-1">
          {user?.role === 'retailer' ? (
            <>
              <NavLink to="/retailer" className={link}>My listings</NavLink>
              <NavLink to="/retailer/orders" className={link}>Orders</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end className={link}>Home</NavLink>
              <NavLink to="/shop" className={link}>Shop</NavLink>
              <NavLink to="/cart" className={link}>
                <span className="position-relative">
                  <CartIcon size={18} />
                  {count > 0 && <span className="ag-tab-count" key={count}>{count}</span>}
                </span>
              </NavLink>
            </>
          )}

          {user ? (
            <>
              <NavLink to="/profile" className={link}>{user.name}</NavLink>
              <button className="btn btn-agrilink-outline btn-sm" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={link}>Log in</NavLink>
              <Link className="btn btn-agrilink btn-sm" to="/register">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
