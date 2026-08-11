import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const STORAGE_KEY = 'agrilink_cart';

/**
 * The cart lives in the browser until checkout. Only product ids and
 * quantities are ever sent to the server, which re-reads prices from the
 * database — so a tampered cart cannot change what an order costs.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return []; // corrupt storage shouldn't take the whole app down
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((line) => line.product._id === product._id);
      if (existing) {
        return prev.map((line) =>
          line.product._id === product._id
            ? { ...line, quantity: line.quantity + quantity }
            : line
        );
      }
      // Store a slim snapshot: enough to render the cart without refetching.
      const { _id, name, price, unit, imageUrl, stock } = product;
      return [...prev, { product: { _id, name, price, unit, imageUrl, stock }, quantity }];
    });
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      quantity < 1
        ? prev.filter((line) => line.product._id !== productId)
        : prev.map((line) => (line.product._id === productId ? { ...line, quantity } : line))
    );
  }, []);

  const remove = useCallback((productId) => {
    setItems((prev) => prev.filter((line) => line.product._id !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(
    () => ({
      count: items.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: items.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    }),
    [items]
  );

  const quantityOf = useCallback(
    (productId) => items.find((line) => line.product._id === productId)?.quantity || 0,
    [items]
  );

  return (
    <CartContext.Provider value={{ items, add, setQuantity, remove, clear, count, subtotal, quantityOf }}>
      {children}
    </CartContext.Provider>
  );
}
