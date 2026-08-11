/**
 * Reduces any Indian mobile number to its bare 10 digits.
 *
 *   "+91 98765 43210" -> "9876543210"
 *   "09876543210"     -> "9876543210"
 *   "9876543210"      -> "9876543210"
 *
 * Used on both write (schema hook) and read (login lookup), so a number
 * registered in one format still resolves when typed in another.
 */
export default function normalizePhone(input) {
  if (input === null || input === undefined) return '';

  const digits = String(input).replace(/\D/g, '');

  // Strip the +91 country code, or the leading 0 trunk prefix.
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);

  return digits;
}
