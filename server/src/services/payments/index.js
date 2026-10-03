import { env } from '../../config/env.js';
import template from './template.provider.js';

// Register real providers here, e.g. { payfast, jazzcash, easypaisa }.
const registry = { template };

export const getProvider = () => {
  const p = registry[env.payment.provider];
  return p && p.isConfigured() ? p : null;
};
export const paymentsConfigured = () => Boolean(getProvider());
