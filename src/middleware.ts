import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


async function maintenanceHash(): Promise<string | null> {
  const secret = process.env.MAINTENANCE_PREVIEW_SECRET;
  if (!secret || secret.length < 24) return null;
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('maintenance-v1:' + secret));
  return Array.from(new Uint8Array(bytes)).map(x => x.toString(16).padStart(2, '0')).join('');
}
export async function middleware(request: NextRequest) {

  const { pathname, searchParams } = request.nextUrl;

  // Protect staff routes at the Edge before invoking privileged Supabase APIs.
  const { verifyStaffSession, sessionCookie, isSameOrigin } = await import('@/lib/adminSession');
  const method = request.method.toUpperCase();
  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  const isAdminApi = pathname.startsWith('/api/admin/');
  const publicStock = method === 'GET' && /^\/api\/admin\/stock\/?$/.test(pathname);
  const publicBanners = method === 'GET' &&
    /^\/api\/admin\/banners\/?$/.test(pathname) && searchParams.get('active') === 'true';
  const staffOrders = /^\/api\/orders\/?$/.test(pathname) && method !== 'POST';
  const adminOnly =
    (isAdminApi && !publicStock && !publicBanners) ||
    staffOrders ||
    (pathname.startsWith('/api/mail/') && !/^\/api\/mail\/inbound\/?$/.test(pathname)) ||
    /^\/api\/mail\/?$/.test(pathname) ||
    /^\/api\/packlink\/?$/.test(pathname) ||
    (/^\/api\/catalog\/hidden\/?$/.test(pathname) && isMutation) ||
    /^\/api\/fulfillment\/stock\/?$/.test(pathname) ||
    /^\/api\/fulfillment\/shipments\/?$/.test(pathname) ||
    (/^\/api\/checkout\/abandoned\/?$/.test(pathname) &&
      ((method === 'GET' && !searchParams.has('orderNumber')) ||
       (method === 'POST' && searchParams.get('action') === 'send_recovery')));
  const warehouseOnly = pathname.startsWith('/api/teamomar/') && !/^\/api\/teamomar\/auth\/?$/.test(pathname);
  if (adminOnly || warehouseOnly) {
    const adminValid = await verifyStaffSession(request.cookies.get(sessionCookie('admin'))?.value, 'admin');
    const omarValid = warehouseOnly && await verifyStaffSession(request.cookies.get(sessionCookie('omar'))?.value, 'omar');
    if (!adminValid && !omarValid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (isMutation && !isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  // Maintenance preview requires a configured secret. No hard-coded public passwords.
  const previewParam = searchParams.get('preview');
  const validPreview = process.env.MAINTENANCE_PREVIEW_SECRET;
  const previewHash = await maintenanceHash();
  if (previewHash && validPreview && previewParam === validPreview) {
    // Clone URL and remove the preview parameter
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete('preview');
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set('nf_maintenance_bypass', previewHash, {
      path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, sameSite: 'strict',
    });
    return response;
  }

  if (previewParam === 'exit' || previewParam === 'off') {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.pathname = '/maintenance';
    cleanUrl.searchParams.delete('preview');
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.delete('nf_maintenance_bypass');
    return response;
  }

  // 2. Check if Maintenance Mode is active
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  // Exempted paths that should ALWAYS be accessible
  const isExempt =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/wp-content') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/wp-admin') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/sitemap') ||
    pathname === '/robots.txt' ||
    pathname === '/favicon.ico' ||
    pathname === '/feeds/merchant.xml' ||
    pathname === '/maintenance';

  const hasBypassCookie = Boolean(previewHash && request.cookies.get('nf_maintenance_bypass')?.value === previewHash);

  if (isMaintenanceMode && !isExempt && !hasBypassCookie) {
    // Rewrite to /maintenance while preserving original URL
    const rewriteResponse = NextResponse.rewrite(new URL('/maintenance', request.url));
    rewriteResponse.headers.set('Retry-After', '86400');
    return rewriteResponse;
  }

  // 3. Enforce SEO trailing slash on page GET requests (exempting /api, files, and static assets)
  if (
    request.method === 'GET' &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/images') &&
    !pathname.startsWith('/wp-content') &&
    !pathname.endsWith('/') &&
    !pathname.includes('.')
  ) {
    const targetUrl = new URL(`${pathname}/${request.nextUrl.search}`, request.url);
    return NextResponse.redirect(targetUrl, 308);
  }

  const response = NextResponse.next();

  // Extract hostname from headers or request URL
  const hostHeader =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    request.nextUrl.hostname ||
    '';

  const hostname = hostHeader.split(':')[0].trim().toLowerCase();

  // Prevent indexing for any vercel preview / deployment domain
  if (hostname.endsWith('.vercel.app')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
