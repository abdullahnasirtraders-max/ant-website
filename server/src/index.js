import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDb } from './db.js';

connectDb()
  .then(() => createApp().listen(env.port, () => console.log(`[api] listening on :${env.port}`)))
  .catch((e) => { console.error('[boot] failed:', e.message); process.exit(1); });
