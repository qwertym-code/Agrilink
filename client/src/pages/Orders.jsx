import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import TopBar from '../components/TopBar';
import { formatPrice, titleCase } from '../utils/format';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/orders')
      .then(({ data }) => { if (!cancelled) setOrders(data.orders); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <TopBar title="Your orders" back />

      <div className="ag-shell px-3 pt-3">
        {error && <div className="alert alert-danger py-2">{error}</div>}

        {loading ? (
          <div className="ag-skeleton" style={{ height: 120 }} />
        ) : orders.length === 0 ? (
          <div className="ag-panel text-center">
            <p className="fw-semibold mb-1">No orders yet</p>
            <p className="ag-muted mb-3" style={{ fontSize: '0.85rem' }}>Your past orders will appear here.</p>
            <Link to="/shop" className="btn btn-agrilink btn-sm">Browse produce</Link>
          </div>
        ) : (
          orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="ag-panel d-block mb-2 text-decoration-none text-reset"
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                    #{String(order._id).slice(-6).toUpperCase()}
                  </div>
                  <div className="ag-muted" style={{ fontSize: '0.76rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {order.items.length} item{order.items.length === 1 ? '' : 's'}
                  </div>
                </div>
                <div className="text-end">
                  <div className="ag-price">{formatPrice(order.total)}</div>
                  <span className="badge rounded-pill" style={{ background: 'var(--ag-green-soft)', color: 'var(--ag-green-dark)', fontSize: '0.68rem' }}>
                    {titleCase(order.status)}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
