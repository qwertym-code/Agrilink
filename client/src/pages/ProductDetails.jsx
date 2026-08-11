import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { useCart } from '../context/CartContext';
import TopBar from '../components/TopBar';
import { formatPrice, titleCase } from '../utils/format';
import { PlusIcon, MinusIcon, StarIcon, CartIcon, PinIcon } from '../components/Icons';
import ProductImage from '../components/ProductImage';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/products/${id}`)
      .then(({ data }) => { if (!cancelled) setProduct(data.product); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <>
        <TopBar title="Loading…" back />
        <div className="ag-shell px-3 pt-3">
          <div className="ag-skeleton mb-3" style={{ height: 260 }} />
          <div className="ag-skeleton mb-2" style={{ height: 28, width: '60%' }} />
          <div className="ag-skeleton" style={{ height: 80 }} />
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <TopBar title="Product" back />
        <div className="ag-shell px-3 pt-4">
          <div className="ag-panel text-center">
            <p className="fw-semibold mb-1">{error || 'Product not found'}</p>
            <button className="btn btn-agrilink btn-sm mt-2" onClick={() => navigate('/shop')}>
              Back to shop
            </button>
          </div>
        </div>
      </>
    );
  }

  const soldOut = product.stock <= 0;
  // Never let the stepper offer more than exists — checkout would reject it.
  const maxQty = Math.max(1, product.stock);

  const handleAdd = () => {
    add(product, quantity);
    navigate('/cart');
  };

  return (
    <>
      <TopBar title="Agrilink" back />

      <div className="ag-shell px-3 pt-3">
        <div className="ag-card mb-3">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            category={product.category}
            iconSize={92}
            style={{ aspectRatio: '4 / 3' }}
          >
            {product.tags?.[0] && (
              <span className={`ag-badge tag-${product.tags[0]}`}>{titleCase(product.tags[0])}</span>
            )}
          </ProductImage>
        </div>

        <div className="d-flex align-items-start justify-content-between gap-3">
          <h1 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>{product.name}</h1>
          <div className="text-end">
            <div className="ag-price-board lg">
              {formatPrice(product.price)}
              <span className="unit">{product.unit}</span>
            </div>
            {product.rating > 0 && (
              <div className="ag-muted d-flex align-items-center gap-1 justify-content-end" style={{ fontSize: '0.8rem' }}>
                <StarIcon size={13} /> {product.rating.toFixed(1)}
              </div>
            )}
          </div>
        </div>

        <div className="ag-muted mb-3" style={{ fontSize: '0.85rem' }}>
          {product.retailer?.farmName || 'Local farm'} · {product.unit}
        </div>

        {product.retailer?.location && (
          <div className="d-flex align-items-center gap-1 ag-muted mb-3" style={{ fontSize: '0.82rem' }}>
            <PinIcon size={14} /> {product.retailer.location}
          </div>
        )}

        {product.description && (
          <p style={{ fontSize: '0.92rem', lineHeight: 1.5 }}>{product.description}</p>
        )}

        <div className="ag-panel d-flex align-items-center justify-content-between gap-3 mt-3">
          <div className="ag-stepper">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
              <MinusIcon size={16} />
            </button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty} aria-label="Increase quantity">
              <PlusIcon size={16} />
            </button>
          </div>

          <button className="btn btn-agrilink flex-grow-1 d-flex align-items-center justify-content-center gap-2" onClick={handleAdd} disabled={soldOut}>
            <CartIcon size={17} />
            {soldOut ? 'Sold out' : 'Add to Cart'}
          </button>
        </div>

        <div className="ag-muted text-center mt-2" style={{ fontSize: '0.78rem' }}>
          {soldOut ? 'Out of stock right now' : `${product.stock} available`}
        </div>
      </div>
    </>
  );
}
