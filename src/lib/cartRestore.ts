/** Short-lived, signed one-click abandoned-cart links; never expose orders by guessable ID alone. */
const encoder = new TextEncoder();
const RESTORE_LIFETIME = 7 * 24 * 60 * 60 * 1000;
function restoreSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : null;
}
async function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromUrlBase64(value: string): Uint8Array {
  const str = value.replace(/-/g, '+').replace(/_/g, '/');
  return new Uint8Array(Uint8Array.from(atob(str.padEnd(Math.ceil(str.length / 4) * 4, '=')), c => c.charCodeAt(0)));
}
function payload(orderNumber: string, expires: number): string {
  return 'cart-restore-v1:' + orderNumber + ':' + expires;
}
export async function createCartRestoreToken(orderNumber: string, now = Date.now()): Promise<string> {
  const secret = restoreSecret();
  if (!secret || !orderNumber || orderNumber.length > 120) throw new Error('Cart restore signing is not configured');
  const expires = now + RESTORE_LIFETIME;
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', await key(secret), encoder.encode(payload(orderNumber, expires))));
  return String(expires) + '.' + base64url(bytes);
}
export async function verifyCartRestoreToken(orderNumber: string, token: string | null, now = Date.now()): Promise<boolean> {
  const secret = restoreSecret();
  if (!secret || !token || orderNumber.length > 120 || !/^\d{13}\.[A-Za-z0-9_-]{43}$/.test(token)) return false;
  const [expiry, signature] = token.split('.');
  const expires = Number(expiry);
  if (expires <= now || expires > now + RESTORE_LIFETIME) return false;
  try {
    return await crypto.subtle.verify(
      'HMAC', await key(secret), fromUrlBase64(signature), encoder.encode(payload(orderNumber, expires))
    );
  } catch { return false; }
}
export async function cartRestoreUrl(orderNumber: string) {
  const token = await createCartRestoreToken(orderNumber);
  const url = new URL('/commande/', 'https://nutrifitness.ch');
  url.searchParams.set('restore', orderNumber);
  url.searchParams.set('token', token);
  return url.toString();
}
