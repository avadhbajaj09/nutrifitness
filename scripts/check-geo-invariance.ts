import http from 'http';
import { isProductDeliverableToCountry } from '../src/lib/delivery/defaults';

const PORT = process.env.PORT || 3000;
const BASE_HOST = 'nutrifitness.ch';

// 1. UNIT TEST DELIVERABILITY MATRIX
function runDeliverabilityMatrixUnitTests(): boolean {
  console.log('====================================================');
  console.log('1. UNIT TESTING DELIVERABILITY MATRIX');
  console.log('====================================================');

  const testOrigins = [
    { origin: 'GENEVA_ONLY', loc: 'GENEVA_ONLY', ship: 'switzerland', stockG: 10, stockP: 0 },
    { origin: 'PORTUGAL_ONLY', loc: 'PORTUGAL_ONLY', ship: 'portugal', stockG: 0, stockP: 10 },
    { origin: 'COMMON', loc: 'COMMON', ship: 'common', stockG: 5, stockP: 10 },
  ];

  const countries = ['CH', 'LI', 'PT', 'DE', 'US'];

  // Expected deliverability matrix:
  // CH & LI: true for all 3 origins
  // PT & DE: false for GENEVA_ONLY, true for PORTUGAL_ONLY and COMMON
  // US: false for all 3 origins
  const expectedMatrix: Record<string, Record<string, boolean>> = {
    GENEVA_ONLY: { CH: true, LI: true, PT: false, DE: false, US: false },
    PORTUGAL_ONLY: { CH: true, LI: true, PT: true, DE: true, US: false },
    COMMON: { CH: true, LI: true, PT: true, DE: true, US: false },
  };

  let allPassed = true;
  console.log('| Origin | Country | Expected | Actual | Result |');
  console.log('|---|---|---|---|---|');

  for (const o of testOrigins) {
    for (const c of countries) {
      const expected = expectedMatrix[o.origin][c];
      const actual = isProductDeliverableToCountry(c, o.loc, o.ship, o.stockG, o.stockP);
      const passed = actual === expected;
      if (!passed) allPassed = false;
      console.log(`| ${o.origin} | ${c} | ${expected} | ${actual} | ${passed ? 'PASS' : 'FAIL'} |`);
    }
  }

  if (!allPassed) {
    console.error('\n❌ Deliverability Matrix Unit Tests FAILED');
  } else {
    console.log('\n✅ All 15 Deliverability Matrix Unit Tests PASSED');
  }

  return allPassed;
}

// 2. GEO-INVARIANCE HTTP CHECKS
interface FetchOptions {
  path: string;
  headers: Record<string, string>;
}

function fetchHtml(options: FetchOptions): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const defaultHeaders: Record<string, string> = {
      Host: BASE_HOST,
      'User-Agent': 'GeoInvarianceGuard/1.0',
      Cookie: 'nf_maintenance_bypass=true',
    };

    const mergedHeaders = { ...defaultHeaders, ...options.headers };

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: options.path,
        method: 'GET',
        headers: mergedHeaders,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          resolve({
            status: res.statusCode || 0,
            body,
          });
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

function extractMainContent(html: string): string {
  const match = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (!match) return '';
  let content = match[1];

  // Normalize Next.js script tags or build tokens if present inside main
  content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
  content = content.replace(/\r\n/g, '\n').trim();
  return content;
}

function extractJsonLdBlocks(html: string): string[] {
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const blocks: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    try {
      // Parse and canonicalize JSON to normalize harmless formatting differences
      const parsed = JSON.parse(m[1].trim());
      blocks.push(JSON.stringify(parsed));
    } catch {
      blocks.push(m[1].trim());
    }
  }
  return blocks;
}

async function runGeoInvarianceChecks(): Promise<boolean> {
  console.log('\n====================================================');
  console.log('2. TESTING SERVER GEO-INVARIANCE (6 PRODUCT URLS)');
  console.log('====================================================');

  const testProducts = [
    { slug: 'sandwich-keto-bar', origin: 'GENEVA_ONLY' },
    { slug: 'applied-creatine-monohydrate-250g', origin: 'GENEVA_ONLY' },
    { slug: 'marvelous-experiment-pre-workout-booster', origin: 'PORTUGAL_ONLY' },
    { slug: 'marvelous-escape-formule-sommeil-recuperation', origin: 'PORTUGAL_ONLY' },
    { slug: 'marvelous-glutamine-kyowa-300g', origin: 'COMMON' },
    { slug: 'fat-burn-60-caps', origin: 'COMMON' },
  ];

  const variations = [
    { name: 'x-vercel-ip-country: CH', headers: { 'x-vercel-ip-country': 'CH' } },
    { name: 'x-vercel-ip-country: PT', headers: { 'x-vercel-ip-country': 'PT' } },
    { name: 'x-vercel-ip-country: US', headers: { 'x-vercel-ip-country': 'US' } },
    { name: 'Accept-Language: de', headers: { 'Accept-Language': 'de' } },
    { name: 'Accept-Language: en', headers: { 'Accept-Language': 'en' } },
    { name: 'Cookie: nf_country=PT', headers: { Cookie: 'nf_country=PT; nf_maintenance_bypass=true' } },
  ];

  let allPassed = true;
  const resultsTable: {
    product: string;
    origin: string;
    variation: string;
    status: number;
    mainMatch: boolean;
    jsonLdMatch: boolean;
    pass: boolean;
  }[] = [];

  for (const prod of testProducts) {
    const path = `/produit/${prod.slug}/`;
    // Baseline fetch with no extra headers
    let baselineRes: { status: number; body: string };
    try {
      baselineRes = await fetchHtml({ path, headers: {} });
    } catch (err: any) {
      console.error(`Failed to connect to local server on port ${PORT}: ${err?.message}`);
      console.error('Make sure the server is running ("npm run start" or "next start -p 3000").');
      return false;
    }

    if (baselineRes.status !== 200) {
      console.error(`❌ Baseline request for ${path} returned status ${baselineRes.status}`);
      allPassed = false;
      continue;
    }

    const baselineMain = extractMainContent(baselineRes.body);
    const baselineJsonLd = extractJsonLdBlocks(baselineRes.body);

    for (const v of variations) {
      const vRes = await fetchHtml({ path, headers: v.headers });
      const vMain = extractMainContent(vRes.body);
      const vJsonLd = extractJsonLdBlocks(vRes.body);

      const mainMatch = baselineMain === vMain;
      const jsonLdMatch = JSON.stringify(baselineJsonLd) === JSON.stringify(vJsonLd);
      const passed = vRes.status === 200 && mainMatch && jsonLdMatch;

      if (!passed) {
        allPassed = false;
      }

      resultsTable.push({
        product: prod.slug,
        origin: prod.origin,
        variation: v.name,
        status: vRes.status,
        mainMatch,
        jsonLdMatch,
        pass: passed,
      });
    }
  }

  console.log('| Product | Origin | Variant | HTTP | Main HTML | JSON-LD | Result |');
  console.log('|---|---|---|---|---|---|---|');
  for (const r of resultsTable) {
    console.log(
      `| ${r.product} | ${r.origin} | ${r.variation} | ${r.status} | ${r.mainMatch ? 'IDENTICAL' : 'DIFF'} | ${
        r.jsonLdMatch ? 'IDENTICAL' : 'DIFF'
      } | ${r.pass ? 'PASS' : 'FAIL'} |`
    );
  }

  if (allPassed) {
    console.log('\n✅ All geo-invariance checks PASSED: Server HTML & JSON-LD are 100% byte-invariant.');
  } else {
    console.error('\n❌ Geo-invariance checks FAILED: Differences detected across headers/cookies.');
  }

  return allPassed;
}

async function main() {
  const matrixPass = runDeliverabilityMatrixUnitTests();
  const geoPass = await runGeoInvarianceChecks();

  if (matrixPass && geoPass) {
    console.log('\n🎉 ALL CHECKS PASSED SUCCESSFULLY (Exit 0)');
    process.exit(0);
  } else {
    console.error('\n💥 SOME CHECKS FAILED (Exit 1)');
    process.exit(1);
  }
}

main();
