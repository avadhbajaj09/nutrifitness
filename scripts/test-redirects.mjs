#!/usr/bin/env node
/**
 * scripts/test-redirects.mjs
 * Comprehensive redirect & routing test suite for NutriFitness.ch
 * Usage: node scripts/test-redirects.mjs [baseUrl]
 * Default: https://nutrifitness-bice.vercel.app
 */

const rawBase = process.argv[2] || 'https://nutrifitness-bice.vercel.app';
const BASE_URL = rawBase.replace(/\/+$/, '');

console.log('='.repeat(70));
console.log(`  NUTRIFITNESS REDIRECT & ROUTING TEST SUITE`);
console.log(`  Target Domain: ${BASE_URL}`);
console.log('='.repeat(70) + '\n');

let passedCount = 0;
let failedCount = 0;

function report(pass, name, details = '') {
  if (pass) {
    passedCount++;
    console.log(`  ✅ PASS: ${name}${details ? ` -> ${details}` : ''}`);
  } else {
    failedCount++;
    console.log(`  ❌ FAIL: ${name}${details ? ` (${details})` : ''}`);
  }
}

async function fetchHeadOrGet(url, options = {}) {
  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent': 'NutriFitness-Redirect-Tester/1.0',
        ...(options.headers || {}),
      },
    });
    return res;
  } catch (err) {
    return { error: err.message };
  }
}

// ---------------------------------------------------------------------------
// SUITE 1: Trailing Slash Normalization (308 Permanent Redirect)
// ---------------------------------------------------------------------------
console.log('--- 1. TRAILING SLASH REDIRECT TESTS (308) ---');
const trailingSlashTests = [
  { path: '/boutique', expectedTarget: '/boutique/' },
  { path: '/blog', expectedTarget: '/blog/' },
  { path: '/marques', expectedTarget: '/marques/' },
  { path: '/panier', expectedTarget: '/panier/' },
  { path: '/commande', expectedTarget: '/commande/' },
  { path: '/click-and-collect', expectedTarget: '/click-and-collect/' },
  { path: '/proteines-geneve', expectedTarget: '/proteines-geneve/' },
  { path: '/creatine-geneve', expectedTarget: '/creatine-geneve/' },
  { path: '/complements-alimentaires-geneve', expectedTarget: '/complements-alimentaires-geneve/' },
  { path: '/marque/marvelous', expectedTarget: '/marque/marvelous/' },
  { path: '/categorie/proteines', expectedTarget: '/categorie/proteines/' },
  { path: '/produit/sandwich-keto-bar', expectedTarget: '/produit/sandwich-keto-bar/' },
];

for (const t of trailingSlashTests) {
  const url = `${BASE_URL}${t.path}`;
  const res = await fetchHeadOrGet(url);

  if (res.error) {
    report(false, `Trailing slash ${t.path}`, `Network error: ${res.error}`);
    continue;
  }

  const location = res.headers?.get('location') || '';
  const is308 = res.status === 308;
  const targetMatches = location === t.expectedTarget || location === `${BASE_URL}${t.expectedTarget}`;

  report(
    is308 && targetMatches,
    `${t.path} -> 308 redirect`,
    `Status ${res.status}, Location: ${location}`
  );
}

// ---------------------------------------------------------------------------
// SUITE 2: Internal Application Redirects
// ---------------------------------------------------------------------------
console.log('\n--- 2. INTERNAL APPLICATION REDIRECTS ---');
const appRedirectTests = [
  {
    path: '/my-account/',
    description: '/my-account/ redirects to /compte/',
    validate: (res, body) => {
      const loc = res.headers?.get('location') || '';
      return res.status === 307 || res.status === 308 || (res.status === 200 && body.includes('/compte/'));
    },
  },
  {
    path: '/admin/',
    description: '/admin/ redirects to /admin/products',
    validate: (res, body) => {
      const loc = res.headers?.get('location') || '';
      return (res.status === 307 || res.status === 308) && (loc.includes('/admin/products') || body.includes('/admin/products'));
    },
  },
  {
    path: '/admin/shipping/',
    description: '/admin/shipping/ redirects to /admin/products',
    validate: (res, body) => {
      const loc = res.headers?.get('location') || '';
      return (res.status === 307 || res.status === 308) && (loc.includes('/admin/products') || body.includes('/admin/products'));
    },
  },
];

for (const t of appRedirectTests) {
  const url = `${BASE_URL}${t.path}`;
  const res = await fetchHeadOrGet(url);

  if (res.error) {
    report(false, t.description, `Network error: ${res.error}`);
    continue;
  }

  let body = '';
  try {
    body = await res.text();
  } catch (e) {}

  const passed = t.validate(res, body);
  const loc = res.headers?.get('location') || (body.includes('NEXT_REDIRECT') ? 'Client Digest Redirect' : 'none');
  report(passed, t.description, `Status: ${res.status}, Target: ${loc}`);
}

// ---------------------------------------------------------------------------
// SUITE 3: Core 200 OK Routes (Direct Resolution)
// ---------------------------------------------------------------------------
console.log('\n--- 3. CORE CANONICAL ENDPOINTS (200 OK) ---');
const coreRoutes = [
  '/',
  '/boutique/',
  '/blog/',
  '/marques/',
  '/click-and-collect/',
  '/proteines-geneve/',
  '/creatine-geneve/',
  '/complements-alimentaires-geneve/',
  '/marque/marvelous/',
  '/marque/pronutrition/',
  '/categorie/proteines/',
  '/produit/sandwich-keto-bar/',
  '/sitemap.xml',
  '/sitemap-index.xml',
  '/robots.txt',
  '/feeds/merchant.xml',
  '/feeds/merchant.xml?country=FR',
];

for (const path of coreRoutes) {
  const url = `${BASE_URL}${path}`;
  const res = await fetchHeadOrGet(url);

  if (res.error) {
    report(false, `${path} returns 200 OK`, `Network error: ${res.error}`);
    continue;
  }

  report(res.status === 200, `${path} returns 200 OK`, `Status: ${res.status}`);
}

// ---------------------------------------------------------------------------
// SUITE 4: 404 Not Found Page
// ---------------------------------------------------------------------------
console.log('\n--- 4. CUSTOM 404 NOT FOUND HANDLING ---');
const notFoundPath = '/non-existent-random-page-test-404/';
const res404 = await fetchHeadOrGet(`${BASE_URL}${notFoundPath}`);
if (res404.error) {
  report(false, 'Custom 404 returns status 404', `Network error: ${res404.error}`);
} else {
  report(res404.status === 404, 'Non-existent URL returns 404 status', `Status: ${res404.status}`);
}

// ---------------------------------------------------------------------------
// SUITE 5: Preview Domain Header (X-Robots-Tag)
// ---------------------------------------------------------------------------
console.log('\n--- 5. PREVIEW DOMAIN ROBOTS HEADERS ---');
const isVercelPreview = BASE_URL.includes('.vercel.app');
if (isVercelPreview) {
  const homeRes = await fetchHeadOrGet(`${BASE_URL}/`);
  const robotsHeader = homeRes.headers?.get('x-robots-tag') || '';
  const hasNoindex = robotsHeader.toLowerCase().includes('noindex');
  report(
    hasNoindex,
    'Vercel preview domain includes X-Robots-Tag: noindex',
    `Header: "${robotsHeader}"`
  );
} else {
  console.log(`  ℹ️  Domain is not *.vercel.app, skipping Vercel preview header check.`);
}

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log('\n' + '='.repeat(70));
console.log(`  TEST RESULTS SUMMARY`);
console.log(`  Passed: ${passedCount}`);
console.log(`  Failed: ${failedCount}`);
console.log(`  Total:  ${passedCount + failedCount}`);
console.log('='.repeat(70) + '\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
