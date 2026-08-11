import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useShopConfig } from '../context/ShopConfigContext';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import { formatPrice } from '../utils/format';
import { PlusIcon, MinusIcon, TrashIcon } from '../components/Icons';
import ProductImage from '../components/ProductImage';

export default function Cart() {
  const { items, setQuantity, remove, subtotal, count } = useCart();
  const { deliveryFeeFor, freeDeliveryAbove } = useShopConfig();
  const { user } = useAuth();
  const navigate = useNavigate();

  const deliveryFee = deliveryFeeFor(subtotal);
  const total = subtotal + deliveryFee;

  // Consumers check out; anyone else is sent to sign in first.
  const goToCheckout = () => navigate(user ? '/checkout' : '/login');

  if (items.length === 0) {
    return (
      <>
        <TopBar title="Cart" back />
        <div className="ag-shell px-3 pt-4">
          <div className="ag-panel text-center">
            <p className="fw-semibold mb-1">Your cart is empty</p>
            <p className="ag-muted mb-3" style={{ fontSize: '0.85rem' }}>
              Add some fresh produce and it'll show up here.
            </p>
            <Link to="/shop" className="btn btn-agrilink btn-sm">Browse produce</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={`Cart (${count})`} back />

      <div className="ag-shell px-3 pt-3">
        <div className="ag-panel mb-3">
          {items.map(({ product, quantity }, index) => (
            <div key={product._id}>
              <div className="d-flex gap-3 align-items-center py-2">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  iconSize={20}
                  style={{ width: 62, height: 62, flex: '0 0 auto', borderRadius: 10 }}
                />

                <div className="flex-grow-1 min-width-0">
                  <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{product.name}</div>
                  <div className="ag-muted" style={{ fontSize: '0.75rem' }}>
                    {formatPrice(product.price)} · {product.unit}
                  </div>

                  <div className="d-flex align-items-center gap-2 mt-2">
                    <div className="ag-stepper">
                      <button onClick={() => setQuantity(product._id, quantity - 1)} aria-label="Decrease">
                        <MinusIcon size={15} />
                      </button>
                      <span>{quantity}</span>
                      <button
                        onClick={() => setQuantity(product._id, quantity + 1)}
                        disabled={product.stock != null && quantity >= product.stock}
                        aria-label="Increase"
                      >
                        <PlusIcon size={15} />
                      </button>
                    </div>

                    <button className="btn btn-sm border-0 ag-muted p-1" onClick={() => remove(product._id)} aria-label={`Remove ${product.name}`}>
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>

                <div className="ag-price text-end" style={{ fontSize: '0.92rem' }}>
                  {formatPrice(product.price * quantity)}
                </div>
              </div>

              {index < items.length - 1 && <hr className="my-1" />}
            </div>
          ))}
        </div>

        <div className="ag-panel mb-3">
          <Row label="Subtotal" value={formatPrice(subtotal)} />
          <Row
            label="Delivery fee"
            value={deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
          />
          {deliveryFee > 0 && (
            <div className="ag-muted" style={{ fontSize: '0.76rem' }}>
              Free delivery on orders over {formatPrice(freeDeliveryAbove)}
            </div>
          )}
          <hr className="my-2" />
          <div className="d-flex justify-content-between fw-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <button className="btn btn-agrilink w-100 py-2" onClick={goToCheckout}>
          {user ? 'Proceed to checkout' : 'Sign in to check out'} · {formatPrice(total)}
        </button>
      </div>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="d-flex justify-content-between" style={{ fontSize: '0.88rem' }}>
      <span className="ag-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
