import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import { UserIcon, CartIcon, ShopIcon } from '../components/Icons';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!user) {
    return (
      <>
        <TopBar title="Profile" />
        <div className="ag-shell px-3 pt-4">
          <div className="ag-panel text-center">
            <p className="fw-semibold mb-1">You're not signed in</p>
            <p className="ag-muted mb-3" style={{ fontSize: '0.85rem' }}>
              Sign in to track orders and check out faster.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <Link to="/login" className="btn btn-agrilink btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-agrilink-outline btn-sm">Sign up</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Profile" />

      <div className="ag-shell px-3 pt-3">
        <div className="ag-panel text-center mb-3">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
            style={{ width: 60, height: 60, background: 'var(--ag-green-soft)', color: 'var(--ag-green)' }}
          >
            <UserIcon size={30} />
          </div>
          <h2 className="fw-bold mb-0" style={{ fontSize: '1.1rem' }}>
            {user.role === 'retailer' ? user.farmName : user.name}
          </h2>
          <p className="ag-muted mb-0" style={{ fontSize: '0.82rem' }}>
            {user.role === 'retailer' ? `${user.name} · ${user.location}` : 'Consumer account'}
          </p>
        </div>

        <div className="ag-panel mb-3">
          <Row label="Email" value={user.email} />
          <Row label="Phone" value={`+91 ${user.phone}`} />
          <Row label="Account type" value={user.role === 'retailer' ? 'Retailer / Farmer' : 'Consumer'} />
        </div>

        <div className="ag-panel mb-3 p-0 overflow-hidden">
          {user.role === 'retailer' ? (
            <>
              <MenuLink to="/retailer" icon={<ShopIcon size={18} />} label="My listings" />
              <MenuLink to="/retailer/orders" icon={<CartIcon size={18} />} label="Incoming orders" />
            </>
          ) : (
            <MenuLink to="/orders" icon={<CartIcon size={18} />} label="Your orders" />
          )}
        </div>

        <button className="btn btn-agrilink-outline w-100" onClick={handleLogout}>Log out</button>
      </div>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.87rem' }}>
      <span className="ag-muted">{label}</span>
      <span className="text-end">{value}</span>
    </div>
  );
}

function MenuLink({ to, icon, label }) {
  return (
    <Link to={to} className="d-flex align-items-center gap-3 p-3 text-decoration-none text-reset border-bottom">
      <span className="text-agrilink">{icon}</span>
      <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>{label}</span>
      <span className="ms-auto ag-muted">›</span>
    </Link>
  );
}
