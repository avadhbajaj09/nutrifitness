import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Secret preview query param check (?preview=nutrifit or ?preview=exit)
  const previewParam = searchParams.get('preview')?.toLowerCase();
  const validSecrets = ['nutrifit', 'nutrifitness', 'marco', '1201', 'active'];

  if (previewParam && validSecrets.includes(previewParam)) {
    // Clone URL and remove the preview parameter
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete('preview');
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set('nf_maintenance_bypass', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
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

  const hasBypassCookie = request.cookies.get('nf_maintenance_bypass')?.value === 'true';

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
