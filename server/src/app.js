import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import ApiError from './utils/ApiError.js';
import { CATEGORIES, TAGS } from './models/Product.js';
import { CURRENCY, CURRENCY_SYMBOL, DELIVERY_FEE, FREE_DELIVERY_ABOVE } from './config/pricing.js';

// Builds the app without connecting to anything or listening — server.js owns
// those side effects, which keeps this importable for tests later.
const app = express();

// CLIENT_URL accepts a comma-separated list: production and local dev differ,
// and a split deploy means the API and the site never share an origin.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests, curl, and native apps send no Origin header.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);

      // Vercel gives every commit its own preview subdomain, so an exact list
      // can't cover them. Opt-in only — this is deliberately not the default.
      if (
        process.env.ALLOW_VERCEL_PREVIEWS === 'true' &&
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
      ) {
        return callback(null, true);
      }

      // 403, not 500: an unknown origin is a refusal, not a server fault, and
      // it shouldn't fill the logs with stack traces.
      callback(new ApiError(403, `Origin not allowed by CORS: ${origin}`));
    },
  })
);

app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Lets the client render prices and filters from the server's own values
// rather than a second copy that can drift out of sync.
app.get('/api/config', (req, res) =>
  res.json({
    currency: CURRENCY,
    currencySymbol: CURRENCY_SYMBOL,
    deliveryFee: DELIVERY_FEE,
    freeDeliveryAbove: FREE_DELIVERY_ABOVE,
    categories: CATEGORIES,
    tags: TAGS,
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Order matters: unmatched routes first, then the error formatter last.
app.use(notFound);
app.use(errorHandler);

export default app;
