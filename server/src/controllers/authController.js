import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import generateToken from '../utils/generateToken.js';
import normalizePhone from '../utils/normalizePhone.js';

// One message for every login failure. Distinguishing "no such user" from
// "wrong password" would turn this endpoint into a way to check which emails
// and phone numbers hold accounts.
const INVALID_CREDENTIALS = 'Invalid email/phone or password';

// The only roles obtainable through public signup.
const SIGNUP_ROLES = ['consumer', 'retailer'];

/** POST /api/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, farmName, location } = req.body;

  // Whitelist, not blacklist. The schema enum also permits 'admin', so without
  // this check anyone could grant themselves platform access simply by posting
  // role: "admin". Admins are only ever created by the make-admin script,
  // which requires database credentials.
  if (!SIGNUP_ROLES.includes(role)) {
    throw new ApiError(400, 'Please choose whether you are a consumer or a retailer');
  }

  const doc = { name, email, phone, password, role };

  // Only retailers carry shop details; ignore them for consumers rather than
  // storing fields that role can never use.
  if (role === 'retailer') {
    doc.farmName = farmName;
    doc.location = location;
  }

  const user = await User.create(doc);

  res.status(201).json({ user: user.toJSON(), token: generateToken(user) });
});

/** POST /api/auth/login — accepts either an email or a phone number. */
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, 'Please enter your email/phone and your password');
  }

  // An email always contains '@' and a phone number never can, so this single
  // test picks the right field — and the right index — without an $or scan.
  const query = String(identifier).includes('@')
    ? { email: String(identifier).toLowerCase().trim() }
    : { phone: normalizePhone(identifier) };

  const user = await User.findOne(query).select('+password');
  if (!user) throw new ApiError(401, INVALID_CREDENTIALS);

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) throw new ApiError(401, INVALID_CREDENTIALS);

  res.json({ user: user.toJSON(), token: generateToken(user) });
});

/** GET /api/auth/me — confirms a stored token still refers to a live account. */
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toJSON() });
});
