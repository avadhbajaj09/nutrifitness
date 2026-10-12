/**
 * Swiss TWINT Payment Gateway Configuration & Helpers
 * Store UUID / Terminal: e63424a8-576d-c293-a4de-891c3737aa8b (hex: e63424a8576dc293a4de891c3737aa8b)
 */

export const TWINT_CONFIG = {
  storeUuid: process.env.NEXT_PUBLIC_TWINT_STORE_UUID || process.env.TWINT_STORE_UUID || 'e63424a8-576d-c293-a4de-891c3737aa8b',
  rawKey: 'e63424a8576dc293a4de891c3737aa8b',
  merchantName: 'NutriFitness Genève',
  location: 'Rue des Pâquis 34, 1201 Genève',
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
