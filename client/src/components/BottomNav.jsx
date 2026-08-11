import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { HomeIcon, ShopIcon, CartIcon, UserIcon } from './Icons';

const TABS = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/shop', label: 'Shop', Icon: ShopIcon },
  { to: '/cart', label: 'Cart', Icon: CartIcon },
  { to: '/profile', label: 'Profile', Icon: UserIcon },
];

/** Fixed tab bar, mobile only — hidden at >=768px where the top navbar takes over. */
export default function BottomNav() {
  const { count } = useCart();
  const { user } = useAuth();

  // Retailers manage stock and admins watch the platform — neither shops, so
  // the storefront tabs would just be noise for them.
  if (user?.role === 'retailer' || user?.role === 'admin') return null;

  return (
    <nav className="ag-tabbar">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `ag-tab ${isActive ? 'active' : ''}`}>
          <span className="ag-tab-icon">
            <Icon />
            {/* key={count} remounts the bubble so the pop animation replays
                on every change — CSS animations don't restart on their own. */}
            {to === '/cart' && count > 0 && (
              <span className="ag-tab-count" key={count}>{count}</span>
            )}
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
