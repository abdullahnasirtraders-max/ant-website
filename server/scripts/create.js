import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/misc.js';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');
}

await mongoose.connect(process.env.MONGODB_URI);

const passwordHash = await bcrypt.hash(password, 12);

const existing = await User.findOne({ email: email.toLowerCase() });

if (existing) {
  existing.passwordHash = passwordHash;
  existing.role = 'admin';
  await existing.save();
  console.log(`Admin updated: ${existing.email}`);
} else {
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role: 'admin',
  });

  console.log(`Admin created: ${user.email}`);
}

await mongoose.disconnect();