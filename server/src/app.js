import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { sitemap } from './controllers/catalog.js';
import { errorHandler, notFound } from './middleware/index.js';
import { adminRouter, authRouter, paymentRouter, publicRouter } from './routes/index.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1); // Railway / Vercel proxies
  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: (origin, cb) => cb(null, !origin || env.clientOrigins.includes(origin)), credentials: true }));
  app.use(express.json({ limit: '100kb', verify: (req, _res, buf) => { req.rawBody = buf; } }));
  app.use(cookieParser());
  app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: 'draft-7', legacyHeaders: false }));

  app.get('/sitemap.xml', sitemap);
  app.use('/api', publicRouter);
  app.use('/api/payments', paymentRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
