/** Any request that matches no route. */
export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * The single place errors become responses, so every endpoint fails in the
 * same shape: { message, errors? }.
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Mongoose validation — report per field so the form can highlight them.
  if (err.name === 'ValidationError') {
    const errors = {};
    for (const [field, detail] of Object.entries(err.errors)) {
      errors[field] = detail.message;
    }
    return res.status(400).json({ message: 'Please correct the highlighted fields', errors });
  }

  // Malformed ObjectId and friends.
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for ${err.path}` });
  }

  // Unique index violation. Registration names the colliding field on purpose —
  // it cannot proceed anyway, so vagueness would cost usability and buy nothing.
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    const label = field === 'phone' ? 'phone number' : field;
    return res.status(409).json({
      message: `An account with this ${label} already exists`,
      errors: { [field]: `This ${label} is already registered` },
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Your session is invalid or has expired. Please log in again.' });
  }

  const status = err.statusCode || 500;

  // Server faults are logged in full but never described to the client.
  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 ? 'Something went wrong on our end' : err.message,
    ...(err.errors ? { errors: err.errors } : {}),
  });
}
