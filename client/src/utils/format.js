const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** ₹3.99 · ₹29 · ₹1,299.50 */
export const formatPrice = (value) => rupees.format(Number(value) || 0);

export const titleCase = (s = '') => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
