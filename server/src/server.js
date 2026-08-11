import 'dotenv/config';
import dns from 'node:dns';
import connectDB from './config/db.js';

// Atlas `mongodb+srv://` URIs need an SRV lookup, which Node performs with its
// own resolver rather than the OS one. If that resolver points at a local DNS
// proxy that isn't running, every connection fails with querySrv ECONNREFUSED
// even though nslookup and Compass resolve fine. Setting DNS_SERVERS routes
// lookups around it.
if (process.env.DNS_SERVERS) {
  const servers = process.env.DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean);
  dns.setServers(servers);
  console.log(`DNS resolver overridden: ${servers.join(', ')}`);
}

// Fail loudly at startup rather than per-request. A missing JWT_SECRET would
// otherwise let the server boot and then reject every login with a 500.
const required = ['MONGO_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(
    `\nMissing required environment variable(s): ${missing.join(', ')}\n` +
    `Copy server/.env.example to server/.env and fill them in.\n`
  );
  process.exit(1);
}

// Imported after the check so config is validated before anything reads it.
const { default: app } = await import('./app.js');

const PORT = process.env.PORT || 5000;

try {
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`Agrilink API listening on http://localhost:${PORT}`));
} catch (err) {
  console.error(`\nCould not connect to MongoDB: ${err.message}\n`);
  process.exit(1);
}
