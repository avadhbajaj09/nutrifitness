import { NextRequest } from 'next/server';
import { middleware } from './middleware';

function createMockRequest(url: string, headers: Record<string, string> = {}) {
  const req = new NextRequest(new URL(url), {
    headers: new Headers(headers)
  });
  return req;
}

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
  const res = middleware(req);
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
  const res = middleware(req);
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
  const res = middleware(req);
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
  const res = middleware(req);
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
  const res = middleware(req);
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
  const res = middleware(req);
  assert(
    res.headers.get('x-robots-tag') === null,
    'nutrifitness.ch via x-forwarded-host does NOT get X-Robots-Tag'
  );
}

if (failed) {
  process.exit(1);
} else {
  console.log('\nAll middleware tests passed successfully!');
}
