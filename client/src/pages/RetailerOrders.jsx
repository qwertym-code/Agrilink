import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import TopBar from '../components/TopBar';
import { formatPrice, titleCase } from '../utils/format';
import { PinIcon, CheckIcon } from '../components/Icons';
import ProductImage from '../components/ProductImage';

/** Incoming orders. The API strips other retailers' lines before sending. */
export default function RetailerOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/orders/incoming')
      .then(({ data }) => { if (!cancelled) setOrders(data.orders); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const setFulfilled = async (orderId, fulfilled) => {
    setSaving(orderId);
    setError('');
    try {
      const { data } = await api.patch(`/orders/${orderId}/fulfil`, { fulfilled });
      // Patch just this row rather than refetching the list — the rest of the
      // page hasn't changed and a full reload would lose the scroll position.
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, mineFulfilled: fulfilled, status: data.status }
            : o
        )
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(null);
    }
  };

  return (
    <>
      <TopBar title="Incoming orders" back />

      <div className="ag-shell px-3 pt-3">
        {error && <div className="alert alert-danger py-2">{error}</div>}

        {loading ? (
          <div className="ag-skeleton" style={{ height: 140 }} />
        ) : orders.length === 0 ? (
          <div className="ag-panel text-center">
            <p className="fw-semibold mb-1">No orders yet</p>
            <p className="ag-muted mb-0" style={{ fontSize: '0.85rem' }}>
              When someone buys your produce, the order shows up here.
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="ag-panel mb-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="fw-semibold" style={{ fontSize: '0.92rem' }}>
                    #{String(order._id).slice(-6).toUpperCase()}
                  </div>
                  <div className="ag-muted" style={{ fontSize: '0.76rem' }}>
                    {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-end">
                  <div className="ag-price">{formatPrice(order.itemsTotal)}</div>
                  <span className="badge rounded-pill" style={{ background: 'var(--ag-green-soft)', color: 'var(--ag-green-dark)', fontSize: '0.68rem' }}>
                    {titleCase(order.status)}
                  </span>
                </div>
              </div>

              {order.items.map((item) => (
                <div key={item.product} className="d-flex align-items-center gap-2 py-1">
                  <ProductImage
                    src={item.imageUrl}
                    alt={item.name}
                    iconSize={14}
                    style={{ width: 36, height: 36, flex: '0 0 auto', borderRadius: 8 }}
                  />
                  <span className="flex-grow-1" style={{ fontSize: '0.85rem' }}>{item.name}</span>
                  <span className="ag-muted" style={{ fontSize: '0.8rem' }}>x{item.quantity}</span>
                </div>
              ))}

              <hr className="my-2" />

              <div className="d-flex gap-2 align-items-start">
                <PinIcon size={15} className="text-agrilink mt-1" />
                <div style={{ fontSize: '0.82rem' }}>
                  <div className="fw-semibold">{order.consumer?.name}</div>
                  <div className="ag-muted">
                    {order.deliveryAddress.line1}, {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
                  </div>
                  {order.consumer?.phone && (
                    <a href={`tel:+91${order.consumer.phone}`} className="text-decoration-none fw-semibold">
                      +91 {order.consumer.phone}
                    </a>
                  )}
                </div>
                <span className="ms-auto badge rounded-pill text-bg-light" style={{ fontSize: '0.68rem' }}>
                  {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Card (demo)'}
                </span>
              </div>

              <div className="d-flex align-items-center gap-2 mt-3">
                {order.mineFulfilled ? (
                  <>
                    <span
                      className="d-inline-flex align-items-center gap-1 fw-semibold"
                      style={{ color: 'var(--ag-green)', fontSize: '0.85rem' }}
                    >
                      <CheckIcon size={16} /> Handed over
                    </span>
                    {/* Undo stays available: marking the wrong order is easy on
                        a phone, and the fix shouldn't need a support request. */}
                    <button
                      className="btn btn-sm border-0 ag-muted ms-auto p-1"
                      style={{ fontSize: '0.78rem', textDecoration: 'underline' }}
                      onClick={() => setFulfilled(order._id, false)}
                      disabled={saving === order._id}
                    >
                      Undo
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-agrilink btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setFulfilled(order._id, true)}
                    disabled={saving === order._id}
                  >
                    <CheckIcon size={16} />
                    {saving === order._id ? 'Saving…' : 'Mark as handed over'}
                  </button>
                )}
              </div>

              {order.sharedWithOtherFarms && (
                <p className="ag-muted mt-2 mb-0" style={{ fontSize: '0.72rem' }}>
                  This basket also has produce from another farm. Marking yours
                  handed over won't complete the whole order.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
