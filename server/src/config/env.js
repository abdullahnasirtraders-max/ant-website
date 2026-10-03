import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';
const need = (key, devDefault) => {
  const v = process.env[key] || (isProd ? undefined : devDefault);
  if (!v) throw new Error(`Missing required environment variable: ${key}`);
  return v;
};

const jwtSecret = need('JWT_SECRET', 'dev-only-secret-change-me');
if (isProd && jwtSecret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters in production');

export const env = {
  isProd,
  port: Number(process.env.PORT || 5000),
  mongoUri: need('MONGODB_URI', 'mongodb://127.0.0.1:27017/ant-store'),
  jwtSecret,
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
  siteUrl: (process.env.SITE_URL || 'http://localhost:5173').replace(/\/$/, ''),
  cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',
  admin: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  payment: {
    provider: process.env.PAYMENT_PROVIDER || '',
    merchantId: process.env.PAYMENT_MERCHANT_ID || '',
    secretKey: process.env.PAYMENT_SECRET_KEY || '',
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
  },
};
export const cloudinaryConfigured = Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);
