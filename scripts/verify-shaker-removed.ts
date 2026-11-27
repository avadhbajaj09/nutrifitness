import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'https://nutrifitness.ch';

async function verifyShakerRemoval() {
  console.log('===============================================================');
  console.log('   VERIFY REMOVAL: SHAKER PRO 700ML SANS BPA');
  console.log('   Target: https://nutrifitness.ch');
  console.log('===============================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    console.log('1. Setting up consent and cart items on live storefront...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });

    await page.evaluate(() => {
      const consent = {
        necessary: true,
        analytics: true,
        marketing: true,
        updatedAt: new Date().toISOString()
      };
      document.cookie = `nf_consent=${encodeURIComponent(JSON.stringify(consent))}; path=/; max-age=31536000; SameSite=Lax`;

      const sampleCart = [
        {
          id: 'prod-applied-creatine-250',
          itemKey: 'APP-CREAT-250-Neutre-250g',
          sku: 'APP-CREAT-250',
          name: 'Applied Nutrition Creatine Monohydrate 250g',
          brand: 'Applied Nutrition',
          categorySlug: 'creatine',
          price: 34.90,
          quantity: 2,
          flavor: 'Neutre',
          size: '250g',
          shippingOrigin: 'switzerland',
          locationType: 'GENEVA_ONLY'
        }
      ];
      localStorage.setItem('nutrifitness_next_cart_v1', JSON.stringify(sampleCart));
    });

    // Reload page to initialize cart drawer with items
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    // Open Cart Drawer by clicking cart icon
    console.log('2. Opening Cart Drawer...');
    await page.evaluate(() => {
      const cartBtn = document.querySelector('button[aria-label*="panier"], button[aria-label*="cart"], header button:has(svg)') ||
                      Array.from(document.querySelectorAll('button')).find(b => b.innerHTML.includes('cart') || b.innerHTML.includes('panier'));
      if (cartBtn) (cartBtn as HTMLButtonElement).click();
    });

    await new Promise((r) => setTimeout(r, 1500));

    // Inspect live DOM
    const drawerHtml = await page.content();
    const hasShakerUpsell =
      drawerHtml.includes('Shaker Pro 700ml Sans BPA') ||
      drawerHtml.includes('Shaker Pro 700ml') ||
      drawerHtml.includes('nf-shaker-600ml');

    console.log('\n--- CHECK 1: Cart Drawer Upsell Booster ---');
    if (!hasShakerUpsell) {
      console.log('✅ PASS: "Shaker Pro 700ml Sans BPA" is completely absent from Cart Drawer');
    } else {
      console.log('❌ FAIL: "Shaker Pro 700ml Sans BPA" still detected in Cart Drawer');
    }

    // Check Checkout Page (/commande/)
    console.log('\n2. Checking Checkout Page (/commande/)...');
    await page.goto(`${BASE_URL}/commande/`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    const checkoutHtml = await page.content();
    const hasShakerInCheckout =
      checkoutHtml.includes('Shaker Pro 700ml Sans BPA') ||
      checkoutHtml.includes('Shaker Pro 700ml') ||
      checkoutHtml.includes('nf-shaker-600ml');

    console.log('--- CHECK 2: Checkout Page (/commande/) ---');
    if (!hasShakerInCheckout) {
      console.log('✅ PASS: "Shaker Pro 700ml Sans BPA" is completely absent from Checkout Page');
    } else {
      console.log('❌ FAIL: "Shaker Pro 700ml Sans BPA" still detected on Checkout Page');
    }

    // Check Panier Page (/panier/)
    console.log('\n3. Checking Panier Page (/panier/)...');
    await page.goto(`${BASE_URL}/panier/`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    const panierHtml = await page.content();
    const hasShakerInPanier =
      panierHtml.includes('Shaker Pro 700ml Sans BPA') ||
      panierHtml.includes('Shaker Pro 700ml') ||
      panierHtml.includes('nf-shaker-600ml');

    console.log('--- CHECK 3: Panier Page (/panier/) ---');
    if (!hasShakerInPanier) {
      console.log('✅ PASS: "Shaker Pro 700ml Sans BPA" is completely absent from Panier Page');
    } else {
      console.log('❌ FAIL: "Shaker Pro 700ml Sans BPA" still detected on Panier Page');
    }

    const allPassed = !hasShakerUpsell && !hasShakerInCheckout && !hasShakerInPanier;
    console.log('\n===============================================================');
    if (allPassed) {
      console.log('✅ ALL CHECKS PASSED: Shaker Pro 700ml Sans BPA has been removed completely!');
    } else {
      console.log('❌ SOME CHECKS FAILED');
      process.exit(1);
    }

    await page.close();
  } catch (err: any) {
    console.error('Error during verification:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyShakerRemoval();
