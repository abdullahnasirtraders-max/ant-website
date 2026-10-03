import mongoose from 'mongoose';
import { jsonPlugin } from '../utils/helpers.js';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true },
);
userSchema.plugin(jsonPlugin);
export const User = mongoose.model('User', userSchema);

const announcementSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 240 },
    linkUrl: { type: String, trim: true, maxlength: 300, default: '' },
    linkLabel: { type: String, trim: true, maxlength: 40, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
announcementSchema.plugin(jsonPlugin);
export const Announcement = mongoose.model('Announcement', announcementSchema);

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'store', unique: true },
    deliveryFee: { type: Number, default: 300, min: 0 }, // placeholder PKR amount, editable in admin
    storeName: { type: String, default: 'ANT — Abdullah Nasir Traders' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    social: {
      facebook: { type: String, default: '' }, instagram: { type: String, default: '' },
      youtube: { type: String, default: '' }, tiktok: { type: String, default: '' },
    },
  },
  { timestamps: true },
);
settingsSchema.plugin(jsonPlugin);
export const Settings = mongoose.model('Settings', settingsSchema);
