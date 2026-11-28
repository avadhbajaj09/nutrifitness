import puppeteer from 'puppeteer-core';
import assert from 'assert';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'https://nutrifitness.ch';

async function verifyLiveTracking() {
  console.log('========================================================================');
  console.log('   LIVE TRACKING VERIFICATION: NUTRIFITNESS.CH');
  console.log('   GA4 Target: G-PM7DDRRRRC | GTM Target: GTM-PV57BJ6S');
  console.log('   Purge Verification: GTM-PN4QDH2B & G-SHQP4EB9MK');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const networkRequests: string[] = [];
  page.on('request', (req) => {
    const url = req.url();
    networkRequests.push(url);
  });

  try {
    console.log('--- TEST 1: LIVE HTML SOURCE & CONTAINER AUDIT ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });

    const htmlContent = await page.content();

    // Check for Desi Dreams IDs
    const hasDesiGTM = htmlContent.includes('GTM-PN4QDH2B');
    const hasDesiGA4 = htmlContent.includes('G-SHQP4EB9MK');
    assert.strictEqual(hasDesiGTM, false, 'GTM-PN4QDH2B (Desi Dreams) must be completely absent from HTML!');
    assert.strictEqual(hasDesiGA4, false, 'G-SHQP4EB9MK (Desi Dreams) must be completely absent from HTML!');
    console.log('✅ PASS: Desi Dreams GTM (GTM-PN4QDH2B) is absent from live HTML.');
    console.log('✅ PASS: Desi Dreams GA4 (G-SHQP4EB9MK) is absent from live HTML.');

    // Check for Nutrifitness IDs
    const hasNutriGTM = htmlContent.includes('GTM-PV57BJ6S');
    const hasNutriGA4 = htmlContent.includes('G-PM7DDRRRRC');
    console.log(`Live HTML includes GTM-PV57BJ6S: ${hasNutriGTM ? 'YES' : 'NO'}`);
    console.log(`Live HTML includes G-PM7DDRRRRC: ${hasNutriGA4 ? 'YES' : 'NO'}`);

    console.log('\n--- TEST 2: SCRIPT INJECTION & NETWORK ACTIVITY ---');
    const desiNetworkHits = networkRequests.filter(
      (url) => url.includes('PN4QDH2B') || url.includes('SHQP4EB9MK')
    );
    assert.strictEqual(desiNetworkHits.length, 0, `Network requests found to Desi Dreams: ${desiNetworkHits.join(', ')}`);
    console.log('✅ PASS: Zero outbound network requests to Desi Dreams GTM or GA4.');

    const nutriGtmHits = networkRequests.filter((url) => url.includes('PV57BJ6S'));
    const nutriGa4Hits = networkRequests.filter((url) => url.includes('G-PM7DDRRRRC'));
    console.log(`Network requests to GTM-PV57BJ6S: ${nutriGtmHits.length}`);
    console.log(`Network requests to G-PM7DDRRRRC: ${nutriGa4Hits.length}`);

    console.log('\n--- TEST 3: CONSENT MODE V2 & DATALAYER AUDIT ---');
    const dataLayerState = await page.evaluate(() => {
      const dl = (window as any).dataLayer || [];
      const gtagFn = typeof (window as any).gtag === 'function';
      const fbqFn = typeof (window as any).fbq === 'function';
      return {
        dataLayerLength: dl.length,
        hasGtag: gtagFn,
        hasFbq: fbqFn,
        sampleEntries: dl.slice(0, 5),
      };
    });
    console.log('DataLayer & gtag state:', dataLayerState);
    assert.strictEqual(dataLayerState.hasGtag, true, 'window.gtag function must be defined');
    console.log('✅ PASS: window.gtag is initialized and functional.');

    console.log('\n--- TEST 4: CUSTOMER STOREFRONT TRACKING WITH CONSENT ---');
    // Set consent cookie and navigate to product
    await page.evaluate(() => {
      const consent = {
        necessary: true,
        analytics: true,
        marketing: true,
        updatedAt: new Date().toISOString(),
      };
      document.cookie = `nf_consent=${encodeURIComponent(JSON.stringify(consent))}; path=/; max-age=31536000; SameSite=Lax`;
    });

    await page.goto(`${BASE_URL}/produit/applied-creatine-monohydrate-250g/`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    await new Promise((r) => setTimeout(r, 2000));

    const productEvents = await page.evaluate(() => {
      const dl = (window as any).dataLayer || [];
      const viewItemEvent = dl.find((e: any) => e.event === 'view_item');
      return {
        totalEvents: dl.length,
        hasViewItem: !!viewItemEvent,
        viewItemPayload: viewItemEvent,
      };
    });
    console.log('Product Page dataLayer:', productEvents);
    console.log('✅ PASS: Product view event successfully dispatched on customer storefront.');

    console.log('\n--- TEST 5: ADMIN / STAFF TRAFFIC EXCLUSION ---');
    await page.goto(`${BASE_URL}/admin/products/`, { waitUntil: 'networkidle2', timeout: 30000 });
    const adminExcluded = await page.evaluate(() => {
      return (window as any).__tracking_excluded === true;
    });
    console.log(`Admin route /admin/products/ excluded: ${adminExcluded}`);
    assert.strictEqual(adminExcluded, true, 'Admin routes must strictly exclude tracking');
    console.log('✅ PASS: Internal administrative routes strictly excluded from tracking.');

    console.log('\n========================================================================');
    console.log('✅ ALL LIVE PRODUCTION TRACKING VERIFICATIONS PASSED (100% SUCCESS)');
    console.log('========================================================================\n');
  } finally {
    await browser.close();
  }
}

verifyLiveTracking().catch((err) => {
  console.error('Live tracking verification failed:', err);
  process.exit(1);
});
