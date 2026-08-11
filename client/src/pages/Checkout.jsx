import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage, getFieldErrors } from '../api/axios';
import { useCart } from '../context/CartContext';
import { useShopConfig } from '../context/ShopConfigContext';
import TopBar from '../components/TopBar';
import { formatPrice } from '../utils/format';
import { PinIcon, CheckIcon } from '../components/Icons';
import ProductImage from '../components/ProductImage';

const PAYMENT_OPTIONS = [
  { id: 'cod', label: 'Cash on delivery', note: 'Pay the farmer when your order arrives.', real: true },
  { id: 'card', label: 'Card / UPI', note: 'Demo only — nothing is charged.', real: false },
];

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { deliveryFeeFor } = useShopConfig();
  const navigate = useNavigate();

  const [address, setAddress] = useState({ line1: '', city: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = deliveryFeeFor(subtotal);
  const total = subtotal + deliveryFee;

  const update = (field) => (e) => setAddress((prev) => ({ ...prev, [field]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      // Only ids and quantities go up. The server prices the order itself.
      const { data } = await api.post('/orders', {
        items: items.map(({ product, quantity }) => ({ product: product._id, quantity })),
        deliveryAddress: address,
        paymentMethod,
      });
      clear();
      navigate(`/orders/${data.order._id}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <TopBar title="Checkout" back />
        <div className="ag-shell px-3 pt-4">
          <div className="ag-panel text-center">
            <p className="fw-semibold mb-2">Your cart is empty</p>
            <button className="btn btn-agrilink btn-sm" onClick={() => navigate('/shop')}>Browse produce</button>
          </div>
        </div>
      </>
    );
  }

  // Mongoose reports nested paths as "deliveryAddress.city".
  const fieldError = (name) => fieldErrors[`deliveryAddress.${name}`] || fieldErrors[name];

  return (
    <>
      <TopBar title="Checkout" back />

      <form onSubmit={placeOrder} className="ag-shell px-3 pt-3">
        {error && <div className="alert alert-danger py-2">{error}</div>}

        <h2 className="ag-section-title">Order Summary</h2>
        <div className="ag-panel mb-3">
          {items.map(({ product, quantity }) => (
            <div key={product._id} className="d-flex align-items-center gap-3 py-2">
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                iconSize={16}
                style={{ width: 44, height: 44, flex: '0 0 auto', borderRadius: 8 }}
              />
              <div className="flex-grow-1">
                <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{product.name}</div>
                <div className="ag-muted" style={{ fontSize: '0.73rem' }}>
                  x{quantity} · {formatPrice(product.price)}/ea
                </div>
              </div>
              <div className="ag-price" style={{ fontSize: '0.88rem' }}>
                {formatPrice(product.price * quantity)}
              </div>
            </div>
          ))}

          <hr className="my-2" />
          <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
          <SummaryRow label="Delivery fee" value={deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)} />
          <div className="d-flex justify-content-between fw-bold mt-2">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
        </div>

        <h2 className="ag-section-title">Delivery Details</h2>
        <div className="ag-panel mb-3">
          <div className="d-flex align-items-center gap-2 ag-muted mb-2" style={{ fontSize: '0.82rem' }}>
            <PinIcon size={15} /> Where should the farmer deliver?
          </div>

          <label className="form-label small fw-semibold mb-1" htmlFor="line1">Address</label>
          <input
            id="line1"
            className={`ag-input mb-1 ${fieldError('line1') ? 'is-invalid' : ''}`}
            placeholder="House / street"
            value={address.line1}
            onChange={update('line1')}
            required
          />
          {fieldError('line1') && <div className="text-danger small mb-2">{fieldError('line1')}</div>}

          <div className="row g-2 mt-1">
            <div className="col-7">
              <label className="form-label small fw-semibold mb-1" htmlFor="city">City / town</label>
              <input
                id="city"
                className={`ag-input ${fieldError('city') ? 'is-invalid' : ''}`}
                value={address.city}
                onChange={update('city')}
                required
              />
              {fieldError('city') && <div className="text-danger small">{fieldError('city')}</div>}
            </div>
            <div className="col-5">
              <label className="form-label small fw-semibold mb-1" htmlFor="pincode">PIN code</label>
              <input
                id="pincode"
                className={`ag-input ${fieldError('pincode') ? 'is-invalid' : ''}`}
                inputMode="numeric"
                maxLength={6}
                value={address.pincode}
                onChange={update('pincode')}
                required
              />
              {fieldError('pincode') && <div className="text-danger small">{fieldError('pincode')}</div>}
            </div>
          </div>
        </div>

        <h2 className="ag-section-title">Payment Method</h2>
        <div className="ag-panel mb-3">
          {PAYMENT_OPTIONS.map((option) => (
            <label
              key={option.id}
              className="d-flex align-items-center gap-3 py-2"
              style={{ cursor: 'pointer' }}
            >
              <input
                type="radio"
                name="paymentMethod"
                className="form-check-input mt-0"
                checked={paymentMethod === option.id}
                onChange={() => setPaymentMethod(option.id)}
              />
              <span className="flex-grow-1">
                <span className="fw-semibold d-block" style={{ fontSize: '0.9rem' }}>{option.label}</span>
                <span className="ag-muted" style={{ fontSize: '0.76rem' }}>{option.note}</span>
              </span>
              {paymentMethod === option.id && <CheckIcon size={18} className="text-agrilink" />}
            </label>
          ))}

          {/* Stated plainly rather than hidden in fine print: an order that
              looks paid but isn't causes real disputes. */}
          {paymentMethod === 'card' && (
            <div className="ag-demo-note mt-2">
              <strong>Demo payment.</strong> No card details are collected and no money moves.
              The order is recorded as unpaid. Swap in a real gateway before going live.
            </div>
          )}
        </div>

        <button className="btn btn-agrilink w-100 py-2 mb-2" type="submit" disabled={submitting}>
          {submitting ? 'Placing order…' : `Place Order · ${formatPrice(total)}`}
        </button>
      </form>
    </>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="d-flex justify-content-between" style={{ fontSize: '0.85rem' }}>
      <span className="ag-muted">{label}</span><span>{value}</span>
    </div>
  );
}
