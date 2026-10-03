import { MAX_QTY } from '../constants.js';
import { Product } from '../models/Product.js';
import { getSettings } from './settings.js';

/**
 * Single source of truth for cart/order money. The browser only sends
 * product ids + quantities; every price comes from the database.
 */
export async function quoteCart(items) {
  const merged = new Map();
  for (const { productId, quantity } of items) merged.set(productId, (merged.get(productId) || 0) + quantity);

  const products = await Product.find({ _id: { $in: [...merged.keys()] }, isActive: true });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const lines = [];
  const unavailable = [];
  for (const [productId, qty] of merged) {
    const p = byId.get(productId);
    if (!p) { unavailable.push(productId); continue; }
    const quantity = Math.min(qty, MAX_QTY);
    lines.push({
      productId, slug: p.slug, name: p.name, image: p.image?.url || '',
      unitPrice: p.price, quantity, lineTotal: p.price * quantity,
    });
  }
  const settings = await getSettings();
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const deliveryFee = lines.length ? settings.deliveryFee : 0;
  return { lines, unavailable, subtotal, deliveryFee, total: subtotal + deliveryFee, currency: 'PKR' };
}
