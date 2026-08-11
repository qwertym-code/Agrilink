/**
 * Seeds a demo farm and its produce so the storefront has something to show.
 *
 *   npm run seed          add demo data, leave anything existing alone
 *   npm run seed -- --reset   delete the demo farm's listings first
 *
 * Only touches the demo retailer's own records. Real accounts and real orders
 * are never read or modified.
 */
import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';

const DEMO_EMAIL = 'greenacres@agrilink.demo';
const DEMO_PHONE = '9000000001';

const PRODUCE = [
  { name: 'Organic Heirloom Carrots', price: 45, unit: '1 bunch (approx. 500g)', category: 'vegetables', tags: ['organic', 'fresh-today'], stock: 40, description: 'Sweet, crunchy heirloom carrots pulled this morning. Great raw, roasted, or in a poriyal.', imageUrl: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&q=80' },
  { name: 'Farm Fresh Broccoli', price: 60, unit: 'per head', category: 'vegetables', tags: ['local'], stock: 25, description: 'Tight, deep-green florets. Grown without synthetic pesticides.', imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&q=80' },
  { name: 'Mixed Bell Peppers', price: 90, unit: '3 pack', category: 'vegetables', tags: ['fresh-today'], stock: 30, description: 'Red, yellow and green capsicum. Thick-walled and glossy.', imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80' },
  { name: 'Organic Spinach', price: 30, unit: '250g / Bunch', category: 'vegetables', tags: ['organic'], stock: 50, description: 'Tender baby spinach leaves, washed and ready to cook.', imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80' },
  { name: 'Dinosaur Kale', price: 55, unit: '1 bunch', category: 'vegetables', tags: ['organic', 'new'], stock: 18, description: 'Lacinato kale with a deep, nutty flavour that holds up to heat.', imageUrl: 'https://images.unsplash.com/photo-1524179091875-b494986a4c2b?w=600&q=80' },
  { name: 'Gala Apples', price: 140, unit: '1 kg / Bag', category: 'fruits', tags: ['local'], stock: 35, description: 'Crisp, mildly sweet Gala apples from the hills.', imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80' },
  { name: 'Fresh Strawberries', price: 180, unit: '200g punnet', category: 'fruits', tags: ['new', 'fresh-today'], stock: 12, description: 'Picked at peak ripeness. Best eaten within two days.', imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80' },
  { name: 'Alphonso Mangoes', price: 320, unit: '1 kg (3–4 pcs)', category: 'fruits', tags: ['local', 'sale'], stock: 20, description: 'Ratnagiri Alphonso, naturally ripened without carbide.', imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80' },
  { name: 'Farm Fresh Milk', price: 62, unit: '1 litre', category: 'dairy', tags: ['fresh-today'], stock: 60, description: 'Full-cream cow milk, bottled the morning it is milked.', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80' },
  { name: 'Homemade Curd', price: 45, unit: '400g tub', category: 'dairy', tags: ['local'], stock: 28, description: 'Thick set curd, mildly sour, no stabilisers.', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80' },
  { name: 'Artisan Sourdough', price: 150, unit: '500g loaf', category: 'bakery', tags: ['new'], stock: 10, description: 'Naturally leavened over 24 hours. Crackling crust, open crumb.', imageUrl: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=600&q=80' },
  { name: 'Whole Wheat Bread', price: 55, unit: '400g loaf', category: 'bakery', tags: ['local'], stock: 22, description: 'Soft everyday loaf made with stone-ground atta.', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80' },
];

if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
}

const reset = process.argv.includes('--reset');

await mongoose.connect(process.env.MONGO_URI);
console.log(`connected to ${mongoose.connection.name}`);

// Reuse the demo farm if it exists so re-running doesn't pile up accounts.
let retailer = await User.findOne({ email: DEMO_EMAIL });

if (!retailer) {
  retailer = await User.create({
    name: 'Ramesh Kumar',
    email: DEMO_EMAIL,
    phone: DEMO_PHONE,
    password: 'demo1234',
    role: 'retailer',
    farmName: 'Green Acres Farm',
    location: 'Thondamuthur, Coimbatore',
  });
  console.log(`created demo retailer  ${DEMO_EMAIL} / demo1234`);
} else {
  console.log(`reusing demo retailer  ${DEMO_EMAIL}`);
}

if (reset) {
  const { deletedCount } = await Product.deleteMany({ retailer: retailer._id });
  console.log(`--reset: removed ${deletedCount} existing demo listings`);
}

let created = 0;
let skipped = 0;

for (const item of PRODUCE) {
  const exists = await Product.findOne({ name: item.name, retailer: retailer._id });
  if (exists) { skipped += 1; continue; }
  await Product.create({ ...item, retailer: retailer._id });
  created += 1;
}

console.log(`products: ${created} created, ${skipped} already present`);
console.log(`total active listings: ${await Product.countDocuments({ isActive: true })}`);

await mongoose.disconnect();
