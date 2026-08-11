/**
 * Promotes an existing account to admin.
 *
 *   npm run make-admin -- someone@example.com
 *   npm run make-admin -- 9876543210
 *   npm run make-admin -- someone@example.com --revoke
 *
 * Admin is deliberately unreachable through the API: signup whitelists
 * consumer/retailer, and nothing exposes role changes over HTTP. Running this
 * requires the database credentials in server/.env, which is the point —
 * platform access should need more than a form submission.
 */
import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import User from '../models/User.js';
import normalizePhone from '../utils/normalizePhone.js';

const args = process.argv.slice(2);
const identifier = args.find((a) => !a.startsWith('--'));
const revoke = args.includes('--revoke');

if (!identifier) {
  console.error('\nUsage: npm run make-admin -- <email or phone> [--revoke]\n');
  process.exit(1);
}

if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
}

await mongoose.connect(process.env.MONGO_URI);

const query = identifier.includes('@')
  ? { email: identifier.toLowerCase().trim() }
  : { phone: normalizePhone(identifier) };

const user = await User.findOne(query);

if (!user) {
  console.error(`\nNo account found for "${identifier}".`);
  console.error('The account must be registered through the app first.\n');
  await mongoose.disconnect();
  process.exit(1);
}

if (revoke) {
  if (user.role !== 'admin') {
    console.log(`\n${user.email} is not an admin (role: ${user.role}). Nothing to do.\n`);
  } else {
    // Revoking has to restore a usable role, and consumer is the safe default:
    // retailer would imply shop fields this account may never have had.
    user.role = 'consumer';
    await user.save();
    console.log(`\nRevoked admin from ${user.email}. Role is now consumer.\n`);
  }
} else if (user.role === 'admin') {
  console.log(`\n${user.email} is already an admin.\n`);
} else {
  const previous = user.role;
  user.role = 'admin';
  await user.save();
  console.log(`\n${user.email} promoted from ${previous} to admin.`);
  console.log('Sign out and back in — the old token still carries the previous role.\n');
}

await mongoose.disconnect();
