import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useShopConfig } from '../context/ShopConfigContext';
import ProductCard from '../components/ProductCard';
import { SearchIcon, PinIcon, categoryIcon } from '../components/Icons';
import { titleCase } from '../utils/format';

export default function Home() {
  const { user } = useAuth();
  const { categories } = useShopConfig();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.get('/products', { params: { limit: 12 } })
      .then(({ data }) => { if (!cancelled) setProducts(data.items); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="ag-shell px-3 pt-3">
      <h1 className="fw-bold text-agrilink mb-3" style={{ fontSize: '1.4rem' }}>Agrilink</h1>

      <form onSubmit={search} className="ag-search mb-2">
        <SearchIcon size={18} className="ag-muted" />
        <input
          type="search"
          placeholder="Search fresh produce…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
        />
      </form>

      <div className="d-flex align-items-center gap-1 ag-muted mb-3" style={{ fontSize: '0.82rem' }}>
        <PinIcon size={15} />
        {user ? `Delivering to ${user.name}` : 'Sign in to set a delivery address'}
      </div>

      <div className="ag-hero mb-4">
        <span className="badge rounded-pill bg-light text-dark align-self-start mb-2">Farm Fresh</span>
        <h2 className="fw-bold mb-2" style={{ fontSize: '1.35rem' }}>Seasonal Picks</h2>
        <Link to="/shop" className="btn btn-light btn-sm rounded-pill fw-semibold align-self-start px-3">
          Shop Now
        </Link>
      </div>

      <h2 className="ag-section-title">Categories</h2>
      <div className="d-flex gap-4 mb-4 overflow-auto pb-1">
        {categories.filter((c) => c !== 'other').map((cat) => {
          const Icon = categoryIcon[cat];
          return (
            <button key={cat} className="ag-cat" onClick={() => navigate(`/shop?category=${cat}`)}>
              <span className="ag-cat-icon">{Icon ? <Icon size={24} /> : null}</span>
              <span>{titleCase(cat)}</span>
            </button>
          );
        })}
      </div>

      <div className="d-flex align-items-center justify-content-between">
        <h2 className="ag-section-title mb-2">Featured Products</h2>
        <Link to="/shop" className="text-decoration-none fw-semibold" style={{ fontSize: '0.85rem' }}>See all</Link>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {loading ? (
        <div className="ag-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ag-skeleton" style={{ height: 210 }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="ag-panel text-center ag-muted">
          <p className="mb-1 fw-semibold">No produce listed yet</p>
          <p className="mb-0" style={{ fontSize: '0.85rem' }}>
            Once farmers add their listings, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="ag-grid">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
