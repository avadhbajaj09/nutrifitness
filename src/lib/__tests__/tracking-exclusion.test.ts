import {
  isAdminPath,
  isDevHost,
  isServerTrackingExcluded,
  ADMIN_PAGE_PREFIXES,
  STAFF_STORAGE_KEYS,
  STAFF_COOKIE_NAMES,
  KNOWN_STAFF_EMAILS,
} from '../tracking-exclusion';

console.log('Running Tracking Governance & Exclusion Test Suite...\n');

let failed = false;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASSED: ${message}`);
  } else {
    console.error(`❌ FAILED: ${message}`);
    failed = true;
  }
}

// -------------------------------------------------------------
// 1. Admin & Staff Page Route Identification
// -------------------------------------------------------------
console.log('--- 1. ADMIN & STAFF PAGE EXCLUSION TESTS ---');

const adminPathsToTest = [
  '/admin',
  '/admin/',
  '/admin/products',
  '/admin/products/',
  '/admin/shipping',
  '/admin/shipping-label',
  '/wp-admin',
  '/wp-admin/',
  '/wp-admin/orders',
  '/mail',
  '/mail/',
  '/mail/inbox',
  '/teamomar',
  '/teamomar/',
  '/teamomar/orders',
  '/maintenance',
  '/maintenance/',
  '/api/admin/products',
  '/api/teamomar/orders',
];

for (const p of adminPathsToTest) {
  assert(isAdminPath(p), `Admin path correctly identified and excluded: ${p}`);
}

const customerPathsToTest = [
  '/',
  '/boutique',
  '/boutique/',
  '/categorie/creatine/',
  '/categorie/proteines/',
  '/produit/applied-creatine-monohydrate-250g/',
  '/produit/ashwagandha-ksm-66-600mg/',
  '/panier',
  '/panier/',
  '/commande',
  '/commande/',
  '/a-propos/',
  '/contact/',
  '/creatine-geneve/',
  '/complements-alimentaires-geneve/',
  '/blog/whey-isolate-ou-concentree/',
];

for (const p of customerPathsToTest) {
  assert(!isAdminPath(p), `Customer storefront path correctly permitted: ${p}`);
}

// -------------------------------------------------------------
// 2. Development & Preview Environment Detection
// -------------------------------------------------------------
console.log('\n--- 2. DEV & PREVIEW HOST DETECTION TESTS ---');

const devHosts = [
  'localhost',
  'localhost:3000',
  '127.0.0.1',
  '127.0.0.1:8080',
  'macbook.local',
  'macbook.local:3000',
  'corp.internal',
  'nutrifitness-bice.vercel.app',
  'preview-branch-nutrifitness.vercel.app',
  'git-feat-exclude-admin.vercel.app',
];

for (const h of devHosts) {
  assert(isDevHost(h), `Dev/preview host correctly identified as dev: ${h}`);
}

const prodHosts = [
  'nutrifitness.ch',
  'www.nutrifitness.ch',
  'nutrifitness.ch:443',
  'www.nutrifitness.ch:443',
];

for (const h of prodHosts) {
  assert(!isDevHost(h), `Production host correctly identified as production: ${h}`);
}

// -------------------------------------------------------------
// 3. Server-Side Tracking Exclusion (CAPI, Checkout, Webhooks)
// -------------------------------------------------------------
console.log('\n--- 3. SERVER-SIDE TRACKING EXCLUSION TESTS ---');

// Helper to safely set NODE_ENV in test
function setEnv(env: string) {
  (process.env as Record<string, string | undefined>).NODE_ENV = env;
}

// Case A: Dev / preview host in production NODE_ENV simulation
{
  const oldEnv = process.env.NODE_ENV;
  setEnv('production');
  try {
    const res = isServerTrackingExcluded({
      hostHeader: 'nutrifitness-bice.vercel.app',
    });
    assert(res.excluded, 'Vercel preview host is excluded from server tracking');
  } finally {
    setEnv(oldEnv || 'development');
  }
}

// Case B: Admin page referer
{
  const oldEnv = process.env.NODE_ENV;
  setEnv('production');
  try {
    const res = isServerTrackingExcluded({
      refererHeader: 'https://nutrifitness.ch/admin/products',
      hostHeader: 'nutrifitness.ch',
    });
    assert(res.excluded, 'Request from admin referer /admin/products is excluded');
    assert(res.reason?.includes('Admin page referer') === true, 'Reason states admin page referer');
  } finally {
    setEnv(oldEnv || 'development');
  }
}

// Case C: Admin page event source URL
{
  const oldEnv = process.env.NODE_ENV;
  setEnv('production');
  try {
    const res = isServerTrackingExcluded({
      eventSourceUrl: 'https://nutrifitness.ch/wp-admin/',
      hostHeader: 'nutrifitness.ch',
    });
    assert(res.excluded, 'Event with source URL /wp-admin/ is excluded');
  } finally {
    setEnv(oldEnv || 'development');
  }
}

// Case D: Staff cookie present (nf_maintenance_bypass)
{
  const oldEnv = process.env.NODE_ENV;
  setEnv('production');
  try {
    const res = isServerTrackingExcluded({
      cookieHeader: 'session=123; nf_maintenance_bypass=true; _fbp=fb.1.123',
      hostHeader: 'nutrifitness.ch',
    });
    assert(res.excluded, 'Request with nf_maintenance_bypass cookie is excluded');
  } finally {
    setEnv(oldEnv || 'development');
  }
}

// Case E: Staff cookie present (nf_is_staff)
{
  const oldEnv = process.env.NODE_ENV;
  setEnv('production');
  try {
    const res = isServerTrackingExcluded({
      cookieHeader: 'nf_is_staff=true; _ga=GA1.1.123',
      hostHeader: 'nutrifitness.ch',
    });
    assert(res.excluded, 'Request with nf_is_staff cookie is excluded');
  } finally {
    setEnv(oldEnv || 'development');
  }
}

// Case F: Staff email address
{
  const oldEnv = process.env.NODE_ENV;
  setEnv('production');
  try {
    for (const email of KNOWN_STAFF_EMAILS) {
      const res = isServerTrackingExcluded({
        email,
        hostHeader: 'nutrifitness.ch',
      });
      assert(res.excluded, `Staff email ${email} is excluded from CAPI`);
    }

    const customStaff = isServerTrackingExcluded({
      email: 'internal-tester@nutrifitness.ch',
      hostHeader: 'nutrifitness.ch',
    });
    assert(customStaff.excluded, 'Any @nutrifitness.ch domain email is excluded');
  } finally {
    setEnv(oldEnv || 'development');
  }
}

// Case G: Genuine customer in production on storefront
{
  const oldEnv = process.env.NODE_ENV;
  setEnv('production');
  try {
    const res = isServerTrackingExcluded({
      cookieHeader: 'nf_consent=%7B%22necessary%22%3Atrue%2C%22analytics%22%3Atrue%2C%22marketing%22%3Atrue%7D; _fbp=fb.1.987; _fbc=fb.1.987.Abc',
      refererHeader: 'https://nutrifitness.ch/produit/applied-creatine-monohydrate-250g/',
      hostHeader: 'nutrifitness.ch',
      eventSourceUrl: 'https://nutrifitness.ch/commande',
      email: 'customer@bluewin.ch',
    });
    assert(!res.excluded, 'Genuine customer in production on storefront is NOT excluded (tracking active!)');
  } finally {
    setEnv(oldEnv || 'development');
  }
}

// -------------------------------------------------------------
// 4. Verification Summary
// -------------------------------------------------------------
console.log('\n----------------------------------------------');
if (failed) {
  console.error('❌ Tracking Governance Tests Failed!');
  process.exit(1);
} else {
  console.log('✅ ALL Tracking Governance Tests Passed Successfully!');
  process.exit(0);
}
