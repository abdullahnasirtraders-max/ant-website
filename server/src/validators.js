import { z } from 'zod';
import { CATEGORIES, MAX_QTY, ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, PROVINCES } from './constants.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const phone = z.string().trim().transform((v) => v.replace(/[\s-]/g, '')).pipe(
  z.string().regex(/^(\+92|0092|92|0)?\d{9,11}$/, 'Enter a valid Pakistani phone number'),
);
const imageUrl = z.string().trim().max(500).refine((v) => v === '' || v.startsWith('https://') || v.startsWith('/'), 'Image must be an https URL');

export const cartItems = z.array(z.object({ productId: objectId, quantity: z.coerce.number().int().min(1).max(MAX_QTY) })).min(1).max(30);
export const quoteBody = z.object({ items: cartItems });

export const orderBody = z.object({
  customer: z.object({
    name: z.string().trim().min(2, 'Enter your full name').max(100),
    phone,
    email: z.string().trim().toLowerCase().email('Enter a valid email').max(120),
    address: z.string().trim().min(8, 'Enter your full address').max(300),
    city: z.string().trim().min(2, 'Enter your city').max(80),
    province: z.enum(PROVINCES, { errorMap: () => ({ message: 'Select a province' }) }),
    postalCode: z.string().trim().max(10).regex(/^\d*$/, 'Digits only').optional().default(''),
  }),
  items: cartItems,
  paymentMethod: z.enum(PAYMENT_METHODS),
  notes: z.string().trim().max(500).optional().default(''),
});

export const productBody = z.object({
  name: z.string().trim().min(2).max(120),
  sku: z.string().trim().max(40).optional().default(''),
  category: z.enum(CATEGORIES),
  shortDescription: z.string().trim().max(200).optional().default(''),
  description: z.string().trim().max(4000).optional().default(''),
  price: z.coerce.number().int().min(0).max(10_000_000),
  image: z.object({ url: imageUrl, publicId: z.string().max(200).optional().default('') }).optional().default({ url: '', publicId: '' }),
  specifications: z.array(z.object({ label: z.string().trim().min(1).max(60), value: z.string().trim().min(1).max(200) })).max(20).optional().default([]),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
});

export const productListQuery = z.object({
  category: z.enum(CATEGORIES).optional(),
  featured: z.enum(['true', 'false']).optional().transform((v) => v === 'true'),
  q: z.string().trim().max(60).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(60),
});

export const orderUpdate = z.object({ status: z.enum(ORDER_STATUSES).optional(), paymentStatus: z.enum(PAYMENT_STATUSES).optional() });
export const announcementBody = z.object({
  text: z.string().trim().min(2).max(240),
  linkUrl: z.string().trim().max(300).optional().default(''),
  linkLabel: z.string().trim().max(40).optional().default(''),
  isActive: z.boolean().optional().default(true),
});
const s = (n) => z.string().trim().max(n).optional().default('');
export const settingsBody = z.object({
  deliveryFee: z.coerce.number().int().min(0).max(100000),
  storeName: z.string().trim().min(1).max(100),
  phone: s(30), whatsapp: s(30), email: s(120), address: s(300),
  social: z.object({ facebook: s(300), instagram: s(300), youtube: s(300), tiktok: s(300) }).optional().default({}),
});
export const loginBody = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) });
export const idParam = z.object({ id: objectId });
