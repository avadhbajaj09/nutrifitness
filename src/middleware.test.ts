import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import { createStaffSession, verifyStaffSession } from './lib/adminSession';

function createMockRequest(url: string, headers: Record<string, string> = {}) {
  const req = new NextRequest(new URL(url), {
    headers: new Headers(headers)
  });
  return req;
}

async function main() {
console.log('Testing middleware X-Robots-Tag logic...\n');

let failed = false;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASSED: ${message}`);
  } else {
    console.error(`❌ FAILED: ${message}`);
    failed = true;
  }
}

// Case 1: .vercel.app domain via host header
{
  const req = createMockRequest('https://localhost:3000/', {
    host: 'nutrifitness-bice.vercel.app'
  });
  const res = await middleware(req);
  assert(
    res.headers.get('x-robots-tag') === 'noindex, nofollow, noarchive',
    'nutrifitness-bice.vercel.app gets X-Robots-Tag: noindex, nofollow, noarchive'
  );
}

// Case 2: Preview vercel domain with port
{
  const req = createMockRequest('https://localhost:3000/', {
    host: 'preview-git-feature-nutrifitness.vercel.app:443'
  });
  const res = await middleware(req);
  assert(
    res.headers.get('x-robots-tag') === 'noindex, nofollow, noarchive',
    'preview-git-feature-nutrifitness.vercel.app:443 gets X-Robots-Tag'
  );
}

// Case 3: x-forwarded-host vercel domain
{
  const req = createMockRequest('https://localhost:3000/', {
    'x-forwarded-host': 'custom-preview.vercel.app'
  });
  const res = await middleware(req);
  assert(
    res.headers.get('x-robots-tag') === 'noindex, nofollow, noarchive',
    'custom-preview.vercel.app via x-forwarded-host gets X-Robots-Tag'
  );
}

// Case 4: Production domain nutrifitness.ch
{
  const req = createMockRequest('https://localhost:3000/', {
    host: 'nutrifitness.ch'
  });
  const res = await middleware(req);
  assert(
    res.headers.get('x-robots-tag') === null,
    'nutrifitness.ch does NOT get X-Robots-Tag'
  );
}

// Case 5: Production domain www.nutrifitness.ch
{
  const req = createMockRequest('https://localhost:3000/', {
    host: 'www.nutrifitness.ch'
  });
  const res = await middleware(req);
  assert(
    res.headers.get('x-robots-tag') === null,
    'www.nutrifitness.ch does NOT get X-Robots-Tag'
  );
}

// Case 6: Production domain with x-forwarded-host
{
  const req = createMockRequest('https://localhost:3000/', {
    'x-forwarded-host': 'nutrifitness.ch',
    host: 'internal-load-balancer'
  });
  const res = await middleware(req);
  assert(
    res.headers.get('x-robots-tag') === null,
    'nutrifitness.ch via x-forwarded-host does NOT get X-Robots-Tag'
  );
}

// Case 7: Page GET request without trailing slash gets 308 redirect
{
  const req = new NextRequest(new URL('https://nutrifitness.ch/boutique'), {
    method: 'GET',
    headers: new Headers({ host: 'nutrifitness.ch' })
  });
  const res = await middleware(req);
  assert(
    res.status === 308 && res.headers.get('location') === 'https://nutrifitness.ch/boutique/',
    'GET /boutique redirects with 308 to /boutique/'
  );
}

// Case 8: Stripe webhook API route without trailing slash is NOT redirected
{
  const req = new NextRequest(new URL('https://nutrifitness.ch/api/webhooks/stripe'), {
    method: 'POST',
    headers: new Headers({ host: 'nutrifitness.ch' })
  });
  const res = await middleware(req);
  assert(
    res.status !== 308 && res.headers.get('location') === null,
    'POST /api/webhooks/stripe does NOT get 308 redirect'
  );
}

// Case 9: Stripe webhook API route with trailing slash is NOT redirected
{
  const req = new NextRequest(new URL('https://nutrifitness.ch/api/webhooks/stripe/'), {
    method: 'POST',
    headers: new Headers({ host: 'nutrifitness.ch' })
  });
  const res = await middleware(req);
  assert(
    res.status !== 308 && res.headers.get('location') === null,
    'POST /api/webhooks/stripe/ does NOT get 308 redirect'
  );
}


// Critical regression: privileged APIs require a valid signed session.
{
  const noCookie = await middleware(new NextRequest('https://nutrifitness.ch/api/orders/', { method: 'GET' }));
  assert(noCookie.status === 401, 'Customer orders cannot be listed without staff login');
  const adminApi = await middleware(new NextRequest('https://nutrifitness.ch/api/admin/products/', { method: 'PATCH' }));
  assert(adminApi.status === 401, 'Product mutations cannot proceed without admin login');
  const warehouseApi = await middleware(new NextRequest('https://nutrifitness.ch/api/teamomar/orders/', { method: 'GET' }));
  assert(warehouseApi.status === 401, 'Warehouse orders cannot be listed anonymously');
  const publicStock = await middleware(new NextRequest('https://nutrifitness.ch/api/admin/stock/', { method: 'GET' }));
  assert(publicStock.status !== 401, 'Public storefront stock visibility remains available');
}
{
  process.env.ADMIN_SESSION_SECRET = 'test-session-secret-only-not-production-1234567890';
  process.env.NUTRIFITNESS_ADMIN_PASSWORD = 'test-admin-password-only-12345';
  const token = await createStaffSession('admin');
  const valid = await verifyStaffSession(token, 'admin');
  assert(valid, 'Signed admin token verifies');
  assert(!(await verifyStaffSession(token, 'omar')), 'Admin token cannot be exchanged for Omar role');
  assert(!(await verifyStaffSession(token.slice(0, -1) + (token.endsWith('A') ? 'B' : 'A'), 'admin')), 'Tampered token is rejected');
  const authenticatedGet = await middleware(new NextRequest('https://nutrifitness.ch/api/orders/', {
    method: 'GET', headers: { cookie: 'nf_admin_session=' + token }
  }));
  assert(authenticatedGet.status !== 401, 'Admin may list orders with a signed cookie');
  const csrf = await middleware(new NextRequest('https://nutrifitness.ch/api/orders/', {
    method: 'PATCH', headers: { cookie: 'nf_admin_session=' + token, origin: 'https://evil.example' }
  }));
  assert(csrf.status === 403, 'Cross-site write denied even with valid session cookie');
  const sameOrigin = await middleware(new NextRequest('https://nutrifitness.ch/api/orders/', {
    method: 'PATCH', headers: { cookie: 'nf_admin_session=' + token, origin: 'https://nutrifitness.ch' }
  }));
  assert(sameOrigin.status !== 401 && sameOrigin.status !== 403, 'Same-origin staff write passes middleware');
  delete process.env.ADMIN_SESSION_SECRET;
  delete process.env.NUTRIFITNESS_ADMIN_PASSWORD;
}
if (failed) {
  process.exit(1);
} else {
  console.log('\nAll middleware tests passed successfully!');
}

}
main().catch(error => { console.error(error); process.exit(1); });
