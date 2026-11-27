/**
 * src/lib/tracking-exclusion.ts
 *
 * Centralized governance module to exclude:
 * 1. Admin and staff pages (/admin, /wp-admin, /mail, /teamomar, /maintenance, etc.)
 * 2. Logged-in administrators and staff (localStorage, sessionStorage, staff cookies, preview bypass)
 * 3. Development and preview environments (localhost, 127.0.0.1, *.vercel.app, NODE_ENV !== 'production')
 *
 * From:
 * - Google Analytics 4 (GA4) / Google Tag Manager (GTM)
 * - Meta Pixel (browser fbq)
 * - Meta Conversions API (CAPI server events)
 *
 * Genuine customer tracking on production (nutrifitness.ch) remains 100% unaffected.
 */

export const ADMIN_PAGE_PREFIXES = [
  '/admin',
  '/wp-admin',
  '/mail',
  '/teamomar',
  '/maintenance',
  '/api/admin',
  '/api/teamomar',
] as const;

export const STAFF_STORAGE_KEYS = [
  'nf_admin_auth',
  'nutrifitness_admin_auth',
  'nutrifitness_omar_auth',
  'teamomar_auth',
  'nf_staff_session',
] as const;

export const STAFF_COOKIE_NAMES = [
  'nf_maintenance_bypass',
  'nf_is_staff',
  'nf_admin_auth',
  'nutrifitness_admin_auth',
  'nutrifitness_omar_auth',
  'teamomar_session',
] as const;

export const KNOWN_STAFF_EMAILS = [
  'admin@nutrifitness.ch',
  'infonutrifitness.ch@gmail.com',
  'marco@nutrifitness.ch',
  'omar@nutrifitness.ch',
] as const;

/**
 * Checks whether a given path is an administrative or internal staff portal.
 */
export function isAdminPath(pathname?: string | null): boolean {
  if (!pathname) return false;
  const clean = pathname.toLowerCase().trim();
  return ADMIN_PAGE_PREFIXES.some(prefix => clean === prefix || clean.startsWith(`${prefix}/`));
}

/**
 * Checks whether a hostname or environment indicates non-production (local, preview, staging).
 */
export function isDevHost(hostname?: string | null): boolean {
  if (!hostname) return false;
  const host = hostname.toLowerCase().split(':')[0].trim();
  if (host === 'localhost' || host === '127.0.0.1') return true;
  if (host.endsWith('.local') || host.endsWith('.internal')) return true;
  if (host.includes('vercel.app')) return true;
  return false;
}

/**
 * Client-side check: is the current environment development or staging?
 */
export function isClientDevEnvironment(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development';
  }
  // Allow explicit testing override if needed
  if (window.location.search.includes('force_tracking=1')) return false;

  if (process.env.NODE_ENV !== 'production') return true;
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') return true;
  return isDevHost(window.location.hostname);
}

/**
 * Client-side check: is the current user a logged-in administrator or staff member?
 */
export function isClientStaffUser(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Check localStorage & sessionStorage for admin tokens
  for (const key of STAFF_STORAGE_KEYS) {
    try {
      const localVal = localStorage.getItem(key);
      if (localVal && localVal.trim() !== '' && localVal !== 'false' && localVal !== 'null') {
        return true;
      }
      const sessVal = sessionStorage.getItem(key);
      if (sessVal && sessVal.trim() !== '' && sessVal !== 'false' && sessVal !== 'null') {
        return true;
      }
    } catch {}
  }

  // 2. Check document cookies for staff/bypass tokens
  try {
    const cookies = document.cookie || '';
    for (const cookieName of STAFF_COOKIE_NAMES) {
      const match = cookies.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`));
      if (match && match[1] && match[1] !== 'false' && match[1] !== 'null') {
        return true;
      }
    }
  } catch {}

  // 3. Check maintenance bypass query secret
  try {
    const search = window.location.search.toLowerCase();
    if (
      search.includes('preview=nutrifit') ||
      search.includes('preview=marco') ||
      search.includes('preview=1201') ||
      search.includes('preview=active')
    ) {
      return true;
    }
  } catch {}

  return false;
}

/**
 * Synchronizes staff status to a 30-day cookie so server endpoints (CAPI, Checkout) automatically know.
 */
export function syncStaffCookie(): void {
  if (typeof window === 'undefined') return;
  if (isClientStaffUser()) {
    try {
      document.cookie = 'nf_is_staff=true; path=/; max-age=2592000; SameSite=Lax';
    } catch {}
  }
}

/**
 * Clears staff cookie on logout.
 */
export function clearStaffCookie(): void {
  if (typeof window === 'undefined') return;
  try {
    document.cookie = 'nf_is_staff=; path=/; max-age=0; SameSite=Lax';
  } catch {}
}

/**
 * Master client-side evaluation: should tracking (GA4, Pixel, CAPI) be excluded?
 */
export function isTrackingExcluded(): boolean {
  if (typeof window === 'undefined') return false;

  // Manual disable query for tests or debugging
  if (window.location.search.includes('disable_tracking=1')) return true;

  // 1. Exclude if on any admin / staff page
  if (isAdminPath(window.location.pathname)) return true;

  // 2. Exclude if logged in as admin or staff
  if (isClientStaffUser()) {
    syncStaffCookie();
    return true;
  }

  // 3. Exclude if running in development or preview environment
  if (isClientDevEnvironment()) return true;

  return false;
}

/**
 * Server-side evaluation: determines if an incoming HTTP request belongs to staff, admin page, or dev.
 */
export function isServerTrackingExcluded(params: {
  cookieHeader?: string | null;
  refererHeader?: string | null;
  hostHeader?: string | null;
  eventSourceUrl?: string | null;
  email?: string | null;
}): { excluded: boolean; reason?: string } {
  // 1. Environment check
  if (process.env.NODE_ENV !== 'production' && process.env.FORCE_META_CAPI !== 'true') {
    return { excluded: true, reason: 'Development environment (NODE_ENV !== production)' };
  }
  if (process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development') {
    return { excluded: true, reason: 'Vercel preview/dev deployment' };
  }
  if (params.hostHeader && isDevHost(params.hostHeader)) {
    return { excluded: true, reason: `Dev/preview hostname: ${params.hostHeader}` };
  }

  // 2. Admin page referer or event_source_url check
  if (params.refererHeader) {
    try {
      const refUrl = new URL(params.refererHeader, 'https://nutrifitness.ch');
      if (isAdminPath(refUrl.pathname)) {
        return { excluded: true, reason: `Admin page referer: ${refUrl.pathname}` };
      }
    } catch {
      if (isAdminPath(params.refererHeader)) {
        return { excluded: true, reason: `Admin page referer: ${params.refererHeader}` };
      }
    }
  }
  if (params.eventSourceUrl) {
    try {
      const srcUrl = new URL(params.eventSourceUrl, 'https://nutrifitness.ch');
      if (isAdminPath(srcUrl.pathname)) {
        return { excluded: true, reason: `Admin event source URL: ${srcUrl.pathname}` };
      }
    } catch {
      if (isAdminPath(params.eventSourceUrl)) {
        return { excluded: true, reason: `Admin event source URL: ${params.eventSourceUrl}` };
      }
    }
  }

  // 3. Staff cookies check
  const cookies = params.cookieHeader || '';
  if (cookies) {
    for (const cookieName of STAFF_COOKIE_NAMES) {
      const match = cookies.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`));
      if (match && match[1] && match[1] !== 'false' && match[1] !== 'null') {
        return { excluded: true, reason: `Staff cookie present: ${cookieName}` };
      }
    }
  }

  // 4. Known staff email check
  if (params.email) {
    const cleanEmail = params.email.trim().toLowerCase();
    if (KNOWN_STAFF_EMAILS.some(staffEmail => cleanEmail === staffEmail || cleanEmail.endsWith('@nutrifitness.ch'))) {
      return { excluded: true, reason: `Staff email address: ${cleanEmail}` };
    }
  }

  return { excluded: false };
}
