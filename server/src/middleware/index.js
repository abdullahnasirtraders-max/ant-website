import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { User } from '../models/misc.js';
import { AppError, asyncHandler } from '../utils/helpers.js';

export const COOKIE = 'ant_admin';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  try { req[source] = schema.parse(req[source]); next(); } catch (e) { next(e); }
};

export const requireAdmin = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[COOKIE];
  if (!token) throw new AppError('Please sign in.', 401);
  let payload;
  try { payload = jwt.verify(token, env.jwtSecret); } catch { throw new AppError('Session expired. Please sign in again.', 401); }
  const user = await User.findById(payload.sub);
  if (!user || user.role !== 'admin') throw new AppError('Not authorised.', 403);
  req.user = user;
  next();
});

// CSRF defence: cross-origin requests with a custom header trigger a CORS preflight,
// which only our allow-listed origins pass. Plain HTML forms cannot set this header.
export const requireCsrfHeader = (req, _res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('x-ant-csrf') !== '1') {
    return next(new AppError('Missing CSRF header.', 403));
  }
  next();
};

export function notFound(_req, _res, next) { next(new AppError('Not found.', 404)); }

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const details = {};
    for (const i of err.issues) details[i.path.join('.') || '_'] ??= i.message;
    return res.status(400).json({ message: 'Please check the highlighted fields.', details });
  }
  if (err instanceof AppError) return res.status(err.status).json({ message: err.message, details: err.details });
  if (err?.code === 11000) return res.status(409).json({ message: 'A record with that value already exists.' });
  if (err?.name === 'MulterError') return res.status(400).json({ message: err.message });
  if (err?.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier.' });
  console.error('[error]', err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
}
