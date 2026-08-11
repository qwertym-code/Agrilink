import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Builds the app without connecting to anything or listening — server.js owns
// those side effects, which keeps this importable for tests later.
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);

// Order matters: unmatched routes first, then the error formatter last.
app.use(notFound);
app.use(errorHandler);

export default app;
