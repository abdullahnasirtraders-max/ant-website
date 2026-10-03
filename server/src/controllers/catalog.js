import { z } from 'zod';
import { cloudinaryConfigured, env } from '../config/env.js';
import { PROVINCES } from '../constants.js';
import { Announcement } from '../models/misc.js';
import { Product } from '../models/Product.js';
import { createOrder } from '../services/orders.js';
import { paymentsConfigured } from '../services/payments/index.js';
import { quoteCart } from '../services/pricing.js';
import { getSettings } from '../services/settings.js';
import { AppError, asyncHandler, escapeRegex } from '../utils/helpers.js';
import { productListQuery } from '../validators.js';

export const publicConfig = (_req, res) =>
  res.json({ currency: 'PKR', provinces: PROVINCES, paymentMethods: { cod: true, online: paymentsConfigured() } });

export const getPublicSettings = asyncHandler(async (_req, res) => res.json({ settings: await getSettings() }));
export const listAnnouncements = asyncHandler(async (_req, res) =>
  res.json({ announcements: await Announcement.find({ isActive: true }).sort({ createdAt: -1 }).limit(3) }));

export const listProducts = asyncHandler(async (req, res) => {
  const { category, featured, q, limit } = productListQuery.parse(req.query);
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (featured) filter.isFeatured = true;
  if (q) filter.name = { $regex: escapeRegex(q), $options: 'i' };
  res.json({ products: await Product.find(filter).sort({ sortOrder: 1, createdAt: -1 }).limit(limit) });
});

export const getProduct = asyncHandler(async (req, res) => {
  const slug = z.string().max(120).parse(req.params.slug);
  const product = await Product.findOne({ slug, isActive: true });
  if (!product) throw new AppError('Product not found.', 404);
  const related = await Product.find({ isActive: true, _id: { $ne: product._id } })
    .sort({ sortOrder: 1 }).limit(12);
  related.sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category));
  res.json({ product, related: related.slice(0, 3) });
});

export const quote = asyncHandler(async (req, res) => res.json(await quoteCart(req.body.items)));

export const placeOrder = asyncHandler(async (req, res) => {
  const { order, payment } = await createOrder(req.body);
  res.status(201).json({
    order: { orderNumber: order.orderNumber, total: order.total, subtotal: order.subtotal, deliveryFee: order.deliveryFee,
      paymentMethod: order.paymentMethod, status: order.status, items: order.items },
    payment,
  });
});

const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const sitemap = asyncHandler(async (_req, res) => {
  const products = await Product.find({ isActive: true }).select('slug updatedAt');
  const urls = ['/', '/products', '/about', '/contact'].map((p) => `<url><loc>${xml(env.siteUrl + p)}</loc></url>`)
    .concat(products.map((p) => `<url><loc>${xml(`${env.siteUrl}/products/${p.slug}`)}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`));
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`);
});

export const uploadsEnabled = () => cloudinaryConfigured;
