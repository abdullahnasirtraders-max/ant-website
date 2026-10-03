import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cloudinaryConfigured, env } from '../config/env.js';
import { COOKIE } from '../middleware/index.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Announcement, Settings, User } from '../models/misc.js';
import { deleteImage, uploadImage } from '../services/cloudinary.js';
import { getSettings } from '../services/settings.js';
import { AppError, asyncHandler } from '../utils/helpers.js';
import { ORDER_STATUSES } from '../constants.js';

// ---- auth ----
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);
const cookieOpts = () => ({ httpOnly: true, secure: env.isProd, sameSite: env.cookieSameSite, path: '/', maxAge: 8 * 3600 * 1000 });

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  const ok = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH); // constant-ish time
  if (!user || !ok) throw new AppError('Incorrect email or password.', 401);
  const token = jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, { expiresIn: '8h' });
  res.cookie(COOKIE, token, cookieOpts()).json({ user: { email: user.email } });
});
export const logout = (_req, res) => res.clearCookie(COOKIE, { ...cookieOpts(), maxAge: undefined }).json({ ok: true });
export const me = (req, res) => res.json({ user: { email: req.user.email }, uploadsEnabled: cloudinaryConfigured });

// ---- products ----
export const adminListProducts = asyncHandler(async (_req, res) =>
  res.json({ products: await Product.find().sort({ sortOrder: 1, createdAt: -1 }) }));

export const createProduct = asyncHandler(async (req, res) => {
  const slug = await Product.uniqueSlug(req.body.name);
  res.status(201).json({ product: await Product.create({ ...req.body, slug }) });
});
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found.', 404);
  const oldPublicId = product.image?.publicId;
  if (req.body.name !== product.name) product.slug = await Product.uniqueSlug(req.body.name, product._id);
  product.set(req.body);
  await product.save();
  if (oldPublicId && oldPublicId !== product.image?.publicId) deleteImage(oldPublicId);
  res.json({ product });
});
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found.', 404);
  deleteImage(product.image?.publicId);
  res.json({ ok: true });
});

export const uploadProductImage = asyncHandler(async (req, res) => {
  if (!cloudinaryConfigured) throw new AppError('Cloudinary is not configured. Paste an image URL instead.', 503);
  if (!req.file) throw new AppError('No image received.', 400);
  res.status(201).json(await uploadImage(req.file.buffer));
});

// ---- orders ----
export const listOrders = asyncHandler(async (req, res) => {
  const status = ORDER_STATUSES.includes(req.query.status) ? req.query.status : undefined;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = 20;
  const filter = status ? { status } : {};
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ orders, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});
export const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found.', 404);
  Object.assign(order, req.body);
  await order.save();
  res.json({ order });
});

export const deleteOrder = asyncHandler(async (req, res) => {
  if (!(await Order.findByIdAndDelete(req.params.id))) throw new AppError('Order not found.', 404);
  res.json({ ok: true });
});

// ---- announcements ----
export const listAllAnnouncements = asyncHandler(async (_req, res) => res.json({ announcements: await Announcement.find().sort({ createdAt: -1 }) }));
export const createAnnouncement = asyncHandler(async (req, res) => res.status(201).json({ announcement: await Announcement.create(req.body) }));
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const a = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!a) throw new AppError('Announcement not found.', 404);
  res.json({ announcement: a });
});
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  if (!(await Announcement.findByIdAndDelete(req.params.id))) throw new AppError('Announcement not found.', 404);
  res.json({ ok: true });
});

// ---- settings ----
export const updateSettings = asyncHandler(async (req, res) => {
  await getSettings();
  res.json({ settings: await Settings.findOneAndUpdate({ key: 'store' }, req.body, { new: true, runValidators: true }) });
});
