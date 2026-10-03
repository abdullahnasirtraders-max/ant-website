/**
 * Payment provider contract. Copy this file (e.g. payfast.provider.js), implement the
 * three methods using the gateway's docs + the PAYMENT_* env vars, then register it in ./index.js
 * and set PAYMENT_PROVIDER=<key>. Nothing here ever reports a payment as successful by itself.
 *
 *   isConfigured()            -> boolean  (are all required credentials present?)
 *   createSession(order)      -> { redirectUrl, reference }   (send the customer to the gateway)
 *   verifyWebhook(req)        -> { orderNumber, status: 'paid' | 'failed', reference }
 *                                MUST verify the gateway signature (req.rawBody is available).
 */
const notReady = () => { throw new Error('Payment provider is a template and not implemented.'); };

export default {
  name: 'template',
  isConfigured: () => false,
  createSession: notReady,
  verifyWebhook: notReady,
};
