import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { useShopConfig } from '../context/ShopConfigContext';
import ProductCard from '../components/ProductCard';
import TopBar from '../components/TopBar';
import { SearchIcon } from '../components/Icons';
import { titleCase } from '../utils/format';

/**
 * Catalog screen. Filters live in the URL so a filtered view can be shared,
 * bookmarked, and survives the back button.
 */
export default function Shop() {
  const { tags } = useShopConfig();
  const [params, setParams] = useSearchParams();

  const category = params.get('category') || 'all';
  const tag = params.get('tag') || 'all';
  const q = params.get('q') || '';

  const [search, setSearch] = useState(q);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { setSearch(q); }, [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/products', { params: { category, tag, q, limit: 50 } })
      .then(({ data }) => { if (!cancelled) { setProducts(data.items); setError(''); } })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category, tag, q]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setParam('q', search.trim());
  };

  return (
    <>
      <TopBar title={category === 'all' ? 'Shop' : titleCase(category)} back />

      <div className="ag-shell px-3 pt-3">
        <form onSubmit={submitSearch} className="ag-search mb-3">
          <SearchIcon size={18} className="ag-muted" />
          <input
            type="search"
            placeholder="Search fresh produce…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </form>

        <div className="ag-chips mb-3">
          <button className={`ag-chip ${tag === 'all' ? 'active' : ''}`} onClick={() => setParam('tag', 'all')}>
            All
          </button>
          {tags.map((t) => (
            <button
              key={t}
              className={`ag-chip ${tag === t ? 'active' : ''}`}
              onClick={() => setParam('tag', t)}
            >
              {titleCase(t)}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {loading ? (
          <div className="ag-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="ag-skeleton" style={{ height: 210 }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="ag-panel text-center ag-muted">
            <p className="mb-1 fw-semibold">Nothing matches those filters</p>
            <p className="mb-0" style={{ fontSize: '0.85rem' }}>Try clearing the search or picking a different chip.</p>
          </div>
        ) : (
          <>
            <div className="ag-muted mb-2" style={{ fontSize: '0.8rem' }}>
              {products.length} item{products.length === 1 ? '' : 's'}
            </div>
            <div className="ag-grid">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </>
  );
}
