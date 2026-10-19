/**
 * Swiss TWINT Payment Gateway Configuration & Helpers
 * Store UUID / Terminal: 284f5777-02b6-4718-9f87-bbb1c4224429: 1 NUTRIFIT, www.nutrifitness.ch
 */

export const TWINT_CONFIG = {
  storeUuid: process.env.NEXT_PUBLIC_TWINT_STORE_UUID || process.env.TWINT_STORE_UUID || '284f5777-02b6-4718-9f87-bbb1c4224429',
  rawKey: '284f577702b647189f87bbb1c4224429',
  merchantName: '1 NUTRIFIT, www.nutrifitness.ch',
  location: 'Genève, Suisse',
  mameToken: process.env.TWINT_MAME_TOKEN || '2465|F1KM1YheJp0H1ZkMea5bwZ4ndi2yl7eo9dJkgt7Ga516e187',
  webhookSecret: process.env.TWINT_WEBHOOK_SECRET || 'cc630fe3fb5520c7ee579f3cea59799c51bdbd249fc3aee1c5f69f39c9e5ed405b8713b0e501e3ce5b50dd1eb194ad6cec4739de830d7063b56069b3484fb666',
};

/**
 * Builds the official TWINT pay URL / Universal link for a transaction.
 */
export function buildTwintPayUrl(params: {
  amount?: number;
  orderId?: string;
  currency?: string;
}): string {
  const currency = params.currency || 'CHF';
  const amountStr = params.amount !== undefined ? params.amount.toFixed(2) : '';
  const orderId = params.orderId || '';

  const query = new URLSearchParams({
    storeUUID: TWINT_CONFIG.storeUuid,
    currency,
  });

  if (amountStr) query.set('amount', amountStr);
  if (orderId) query.set('orderId', orderId);

  return `https://pay.twint.ch/?${query.toString()}`;
}

/**
 * Builds the native TWINT app scheme deep-link for mobile devices.
 */
export function buildTwintAppDeepLink(params: {
  amount?: number;
  orderId?: string;
  currency?: string;
}): string {
  const currency = params.currency || 'CHF';
  const amountStr = params.amount !== undefined ? params.amount.toFixed(2) : '';
  const orderId = params.orderId || '';

  const query = new URLSearchParams({
    storeUUID: TWINT_CONFIG.storeUuid,
    currency,
  });

  if (amountStr) query.set('amount', amountStr);
  if (orderId) query.set('orderId', orderId);

  return `twint://app/pay?${query.toString()}`;
}

/**
 * Returns QR code image URL for a given TWINT transaction.
 */
export function getTwintQrImageUrl(params: {
  amount?: number;
  orderId?: string;
  currency?: string;
  size?: number;
}): string {
  const payUrl = buildTwintPayUrl(params);
  const size = params.size || 200;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payUrl)}`;
}
