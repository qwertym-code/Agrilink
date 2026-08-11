/**
 * Single source of truth for order maths. The client fetches these via
 * /api/config so the cart preview matches what checkout actually charges —
 * duplicating the numbers in the frontend is how totals drift apart.
 */
export const CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';
export const DELIVERY_FEE = 29;
export const FREE_DELIVERY_ABOVE = 500;

export function calcDeliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
}

/** Rupees, rounded to 2dp to keep float drift out of stored totals. */
export const money = (n) => Math.round(n * 100) / 100;
