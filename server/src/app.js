import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { CATEGORIES, TAGS } from './models/Product.js';
import { CURRENCY, CURRENCY_SYMBOL, DELIVERY_FEE, FREE_DELIVERY_ABOVE } from './config/pricing.js';

// Builds the app without connecting to anything or listening — server.js owns
// those side effects, which keeps this importable for tests later.
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

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

// Order matters: unmatched routes first, then the error formatter last.
app.use(notFound);
app.use(errorHandler);

export default app;
