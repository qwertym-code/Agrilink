import mongoose from 'mongoose';

/**
 * Opens the single shared Mongoose connection.
 * Callers await this before the HTTP server starts listening, so the API is
 * never up while the database is unreachable.
 */
export default async function connectDB(uri) {
  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

  // A connection that drops after startup must be loud, not silent.
  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));

  return conn;
}
