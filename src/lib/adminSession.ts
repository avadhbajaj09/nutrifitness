/** Signed sessions for admin and Portugal warehouse staff. No browser-stored password. */
export type StaffRole = 'admin' | 'omar';
export const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
export const sessionCookie = (role: StaffRole) => role === 'admin' ? 'nf_admin_session' : 'nf_omar_session';
const encoder = new TextEncoder();
function toUrlBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromUrlBase64(value: string): Uint8Array {
  const base = value.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base.padEnd(Math.ceil(base.length / 4) * 4, '=')), c => c.charCodeAt(0));
}
async function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
function secret(): string | null {
  const value = process.env.ADMIN_SESSION_SECRET?.trim();
  return value && value.length >= 32 ? value : null;
}
export function isSessionConfigured(): boolean { return Boolean(secret()); }
export async function createStaffSession(role: StaffRole, now = Date.now()): Promise<string> {
  const value = secret();
  if (!value) throw new Error('ADMIN_SESSION_SECRET must be configured securely');
  const payload = 'v1.' + role + '.' + (now + SESSION_DURATION_MS);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', await key(value), encoder.encode(payload)));
  return payload + '.' + toUrlBase64(bytes);
}
export async function verifyStaffSession(token: string | null | undefined, role: StaffRole, now = Date.now()): Promise<boolean> {
  const value = secret();
  if (!value || !token || token.length > 256) return false;
  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== 'v1' || parts[1] !== role ||
      !/^\d{13}$/.test(parts[2]) || !/^[A-Za-z0-9_-]{43}$/.test(parts[3])) return false;
  const expires = Number(parts[2]);
  if (expires <= now || expires > now + SESSION_DURATION_MS) return false;
  try {
    return await crypto.subtle.verify(
      'HMAC', await key(value), fromUrlBase64(parts[3]), encoder.encode(parts.slice(0, 3).join('.'))
    );
  } catch { return false; }
}
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}
export async function validStaffPassword(role: StaffRole, supplied: unknown): Promise<boolean> {
  const expected = role === 'admin' ? process.env.NUTRIFITNESS_ADMIN_PASSWORD : process.env.OMAR_ADMIN_PASSWORD;
  if (typeof supplied !== 'string' || supplied.length > 256 || !expected || expected.length < 12 || !secret()) return false;
  const hash = async (s: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(s)));
  const actualHash = await hash(supplied);
  const expectedHash = await hash(expected);
  let difference = 0;
  for (let i = 0; i < expectedHash.length; i++) difference |= actualHash[i] ^ expectedHash[i];
  return difference === 0;
}
