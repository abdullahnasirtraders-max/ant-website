import { Order } from '../models/Order.js';
import { AppError, makeOrderNumber } from '../utils/helpers.js';
import { getProvider } from './payments/index.js';
import { quoteCart } from './pricing.js';

export async function createOrder({ customer, items, paymentMethod, notes }) {
  const online = paymentMethod === 'online';
  const provider = online ? getProvider() : null;
  if (online && !provider) throw new AppError('Online payment is not available yet. Please choose Cash on Delivery.', 503);

  const quote = await quoteCart(items);
  if (!quote.lines.length) throw new AppError('Your cart has no available products.', 400);
  if (quote.unavailable.length) throw new AppError('Some products are no longer available. Please review your cart.', 409, { unavailable: quote.unavailable });

  const order = await Order.create({
    orderNumber: makeOrderNumber(),
    customer, notes, paymentMethod,
    paymentStatus: online ? 'Pending' : 'Unpaid',
    items: quote.lines.map((l) => ({ product: l.productId, name: l.name, slug: l.slug, image: l.image, unitPrice: l.unitPrice, quantity: l.quantity, lineTotal: l.lineTotal })),
    subtotal: quote.subtotal, deliveryFee: quote.deliveryFee, total: quote.total,
  });

  if (!online) return { order };
  try {
    const session = await provider.createSession(order);
    order.paymentRef = session.reference || '';
    await order.save();
    return { order, payment: { redirectUrl: session.redirectUrl } };
  } catch (e) {
    console.error('[payment] createSession failed', e);
    order.paymentStatus = 'Failed';
    await order.save();
    throw new AppError('Could not start the online payment. Please try again or choose Cash on Delivery.', 502);
  }
}
