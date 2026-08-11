import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

/**
 * Verifies the Bearer token and attaches the live user to `req.user`.
 * The user is re-read from the database rather than trusted from the token,
 * so a deleted or role-changed account cannot keep acting on an old payload.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorised — please log in');
  }

  const token = header.slice(7).trim();
  if (!token) throw new ApiError(401, 'Not authorised — please log in');

  // A bad or expired token throws here and is mapped to 401 by errorHandler.
  const payload = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'The account for this session no longer exists');

  req.user = user;
  next();
});

/**
 * Restricts a route to specific roles. Runs after `protect`.
 *   router.get('/produce', protect, requireRole('retailer'), handler)
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to access this resource'));
  }
  next();
};
