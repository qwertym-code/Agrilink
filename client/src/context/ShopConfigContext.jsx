import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const ShopConfigContext = createContext(null);
export const useShopConfig = () => useContext(ShopConfigContext);

// Used until /api/config answers, and if it never does. Keeps the UI rendering
// rather than blocking the whole shop on one request.
const FALLBACK = {
  currencySymbol: '₹',
  deliveryFee: 29,
  freeDeliveryAbove: 500,
  categories: ['vegetables', 'fruits', 'dairy', 'bakery', 'other'],
  tags: ['organic', 'local', 'sale', 'fresh-today', 'new'],
};

/** Delivery fee and category list come from the server so the cart preview
 *  cannot disagree with what checkout actually charges. */
export function ShopConfigProvider({ children }) {
  const [config, setConfig] = useState(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    api.get('/config')
      .then(({ data }) => { if (!cancelled) setConfig({ ...FALLBACK, ...data }); })
      .catch(() => { /* fallback already in place */ });
    return () => { cancelled = true; };
  }, []);

  const deliveryFeeFor = (subtotal) =>
    subtotal >= config.freeDeliveryAbove ? 0 : config.deliveryFee;

  return (
    <ShopConfigContext.Provider value={{ ...config, deliveryFeeFor }}>
      {children}
    </ShopConfigContext.Provider>
  );
}
