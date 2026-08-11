import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, titleCase } from '../utils/format';
import { PlusIcon, CheckIcon } from './Icons';
import ProductImage from './ProductImage';

/**
 * Grid tile: square photo with a corner badge, name, unit, price and an add
 * button. The button stops propagation so tapping it never opens the detail
 * page underneath.
 */
export default function ProductCard({ product }) {
  const { add, quantityOf } = useCart();
  const inCart = quantityOf(product._id);
  const soldOut = product.stock <= 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!soldOut) add(product, 1);
  };

  return (
    <Link to={`/product/${product._id}`} className="ag-card text-decoration-none text-reset d-flex flex-column">
      <ProductImage src={product.imageUrl} alt={product.name} iconSize={30}>
        {product.tags?.[0] && <span className="ag-badge">{titleCase(product.tags[0])}</span>}

        {soldOut && (
          <span className="ag-badge" style={{ left: 'auto', right: 8, background: '#d92d20', color: '#fff' }}>
            Sold out
          </span>
        )}
      </ProductImage>

      <div className="p-2 d-flex flex-column flex-grow-1">
        <div className="fw-semibold" style={{ fontSize: '0.85rem', lineHeight: 1.25 }}>{product.name}</div>
        <div className="ag-muted" style={{ fontSize: '0.72rem' }}>{product.unit}</div>

        <div className="d-flex align-items-center justify-content-between mt-auto pt-2">
          <span className="ag-price" style={{ fontSize: '0.9rem' }}>{formatPrice(product.price)}</span>
          <button
            className="ag-add-btn"
            onClick={handleAdd}
            disabled={soldOut}
            aria-label={`Add ${product.name} to cart`}
          >
            {inCart ? <CheckIcon size={16} /> : <PlusIcon size={16} />}
          </button>
        </div>
      </div>
    </Link>
  );
}
