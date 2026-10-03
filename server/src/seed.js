import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { connectDb } from './db.js';
import { Product } from './models/Product.js';
import { User } from './models/misc.js';
import { getSettings } from './services/settings.js';

const reset = process.argv.includes('--reset');
const PLACEHOLDER = 'Placeholder description. Replace this with the real product description from the admin dashboard.';
// [name, category, brand, price]. Placeholder catalogue: replace via the admin dashboard.
const items = [
  ['Dongfeng Bus Air Filter', 'Buses', 'Dongfeng', 4500], ['Yutong Bus Air Filter', 'Buses', 'Yutong', 5200], ['Weichai Air Filter', 'Vehicles', 'Weichai', 3400],
  ['Heavy-Duty Air Filter', 'Industrial', '', 9800], ['Dongfeng Oval Air Filter', 'Buses', 'Dongfeng', 4200], ['ANT Industrial Air Filter', 'Industrial', 'ANT', 12500],
];

await connectDb();

if (env.admin.email && env.admin.password) {
  if (!(await User.exists({ email: env.admin.email.toLowerCase() }))) {
    await User.create({ email: env.admin.email, passwordHash: await bcrypt.hash(env.admin.password, 12) });
    console.log(`[seed] admin created: ${env.admin.email}`);
  } else console.log('[seed] admin already exists');
} else console.warn('[seed] ADMIN_EMAIL / ADMIN_PASSWORD not set: no admin created');

await getSettings();
if (reset) await Product.deleteMany({});
if ((await Product.countDocuments()) === 0) {
  for (const [i, [name, category, brand, price]] of items.entries()) {
    const part = `ANT-${String(i + 1).padStart(3, '0')}`;
    await Product.create({
      name, slug: await Product.uniqueSlug(name), category, price, sku: part,
      shortDescription: 'Specifications available on request.', description: PLACEHOLDER,
      image: { url: `/placeholders/product-${i + 1}.jpg`, publicId: '' },
      specifications: [...(brand ? [{ label: 'Brand', value: brand }] : []), { label: 'Application', value: category }, { label: 'Part number', value: part }, { label: 'Dimensions', value: 'To be added' }],
      isFeatured: i < 4, sortOrder: i,
    });
  }
  console.log(`[seed] ${items.length} placeholder products created`);
} else console.log('[seed] products exist (use --reset to replace)');

await mongoose.disconnect();
