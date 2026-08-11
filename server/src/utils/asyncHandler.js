/**
 * Forwards rejected promises from async route handlers to the error middleware.
 * Without this, an awaited failure inside a handler hangs the request instead
 * of producing a response.
 */
export default function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
