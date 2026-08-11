import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import TopBar from '../components/TopBar';
import { formatPrice, titleCase } from '../utils/format';
import { CheckIcon, PinIcon } from '../components/Icons';
import ProductImage from '../components/ProductImage';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get(`/orders/${id}`)
      .then(({ data }) => { if (!cancelled) setOrder(data.order); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <>
        <TopBar title="Order" back />
        <div className="ag-shell px-3 pt-3"><div className="ag-skeleton" style={{ height: 220 }} /></div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <TopBar title="Order" back />
        <div className="ag-shell px-3 pt-4">
          <div className="ag-panel text-center">
            <p className="fw-semibold mb-2">{error || 'Order not found'}</p>
            <Link to="/orders" className="btn btn-agrilink btn-sm">Your orders</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Order placed" back />

      <div className="ag-shell px-3 pt-3">
        <div className="ag-panel text-center mb-3">
          <div
            className="ag-success-tick rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
            style={{ width: 52, height: 52, background: 'var(--ag-green)', color: '#fff' }}
          >
            <CheckIcon size={28} />
          </div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.15rem' }}>Thanks for your order</h2>
          <p className="ag-muted mb-0" style={{ fontSize: '0.85rem' }}>
            Order #{String(order._id).slice(-6).toUpperCase()} · {titleCase(order.status)}
          </p>
        </div>

        {order.paymentStatus === 'simulated' && (
          <div className="ag-demo-note mb-3">
            <strong>Demo payment.</strong> No money was taken for this order. It is recorded as unpaid.
          </div>
        )}

        <div className="ag-panel mb-3">
          <h3 className="ag-section-title">Items</h3>
          {order.items.map((item) => (
            <div key={item.product} className="d-flex align-items-center gap-3 py-2">
              <ProductImage
                src={item.imageUrl}
                alt={item.name}
                iconSize={16}
                style={{ width: 44, height: 44, flex: '0 0 auto', borderRadius: 8 }}
              />
              <div className="flex-grow-1">
                <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{item.name}</div>
                <div className="ag-muted" style={{ fontSize: '0.73rem' }}>
                  x{item.quantity} · {formatPrice(item.price)}/ea
                </div>
              </div>
              <div className="ag-price" style={{ fontSize: '0.88rem' }}>
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}

          <hr className="my-2" />
          <Row label="Subtotal" value={formatPrice(order.subtotal)} />
          <Row label="Delivery fee" value={order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)} />
          <Row label="Payment" value={order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Card / UPI (demo)'} />
          <div className="d-flex justify-content-between fw-bold mt-2">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="ag-panel mb-3">
          <h3 className="ag-section-title">Delivering to</h3>
          <div className="d-flex gap-2">
            <PinIcon size={16} className="text-agrilink mt-1" />
            <div style={{ fontSize: '0.88rem' }}>
              {order.deliveryAddress.line1}<br />
              {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
            </div>
          </div>
        </div>

        <Link to="/shop" className="btn btn-agrilink-outline w-100">Continue shopping</Link>
      </div>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="d-flex justify-content-between" style={{ fontSize: '0.85rem' }}>
      <span className="ag-muted">{label}</span><span>{value}</span>
    </div>
  );
}
