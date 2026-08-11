import jwt from 'jsonwebtoken';

/**
 * Signs a session token. `role` rides in the payload so `requireRole` can
 * reject unauthorised requests without a database round-trip.
 */
export default function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}
