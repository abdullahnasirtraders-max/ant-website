import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import * as pub from '../controllers/catalog.js';
import * as admin from '../controllers/admin.js';
import { getProvider } from '../services/payments/index.js';
import { Order } from '../models/Order.js';
import { requireAdmin, requireCsrfHeader, validate } from '../middleware/index.js';
import { announcementBody, idParam, loginBody, orderBody, orderUpdate, productBody, quoteBody, settingsBody } from '../validators.js';
import { AppError, asyncHandler } from '../utils/helpers.js';

const limiter = (windowMs, limit) => rateLimit({ windowMs, limit, standardHeaders: 'draft-7', legacyHeaders: false, message: { message: 'Too many requests. Please try again later.' } });

// ---------- public ----------
export const publicRouter = express.Router();
publicRouter.get('/health', (_req, res) => res.json({ ok: true }));
publicRouter.get('/config/public', pub.publicConfig);
publicRouter.get('/settings', pub.getPublicSettings);
publicRouter.get('/announcements', pub.listAnnouncements);
publicRouter.get('/products', pub.listProducts);
publicRouter.get('/products/:slug', pub.getProduct);
publicRouter.post('/cart/quote', validate(quoteBody), pub.quote);
publicRouter.post('/orders', limiter(60 * 60 * 1000, 20), validate(orderBody), pub.placeOrder);

// ---------- payments webhook (provider-agnostic) ----------
export const paymentRouter = express.Router();
paymentRouter.post('/webhook/:provider', asyncHandler(async (req, res) => {
  const provider = getProvider();
  if (!provider || provider.name !== req.params.provider) throw new AppError('Unknown payment provider.', 404);
  const result = await provider.verifyWebhook(req); // provider must verify the signature
  const order = await Order.findOne({ orderNumber: result.orderNumber });
  if (!order) throw new AppError('Order not found.', 404);
  order.paymentStatus = result.status === 'paid' ? 'Paid' : 'Failed';
  order.paymentRef = result.reference || order.paymentRef;
  await order.save();
  res.json({ ok: true });
}));

// ---------- admin ----------
export const authRouter = express.Router();
authRouter.post('/login', limiter(15 * 60 * 1000, 10), requireCsrfHeader, validate(loginBody), admin.login);
authRouter.post('/logout', requireCsrfHeader, admin.logout);
authRouter.get('/me', requireAdmin, admin.me);

const upload = multer({
  storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) ? null : new AppError('Use a JPG, PNG or WebP image.', 400), true),
});

export const adminRouter = express.Router();
adminRouter.use(requireAdmin, requireCsrfHeader);
adminRouter.get('/products', admin.adminListProducts);
adminRouter.post('/products', validate(productBody), admin.createProduct);
adminRouter.put('/products/:id', validate(idParam, 'params'), validate(productBody), admin.updateProduct);
adminRouter.delete('/products/:id', validate(idParam, 'params'), admin.deleteProduct);
adminRouter.post('/uploads/image', upload.single('image'), admin.uploadProductImage);
adminRouter.get('/orders', admin.listOrders);
adminRouter.patch('/orders/:id', validate(idParam, 'params'), validate(orderUpdate), admin.updateOrder);
adminRouter.delete('/orders/:id', validate(idParam, 'params'), admin.deleteOrder);
adminRouter.get('/announcements', admin.listAllAnnouncements);
adminRouter.post('/announcements', validate(announcementBody), admin.createAnnouncement);
adminRouter.put('/announcements/:id', validate(idParam, 'params'), validate(announcementBody), admin.updateAnnouncement);
adminRouter.delete('/announcements/:id', validate(idParam, 'params'), admin.deleteAnnouncement);
adminRouter.get('/settings', pub.getPublicSettings);
adminRouter.put('/settings', validate(settingsBody), admin.updateSettings);
