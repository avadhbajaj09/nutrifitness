import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = '/Users/shikha/.gemini/antigravity/brain/6ed42661-0b6c-4c15-9a16-fecaba576d70/screenshots/verification';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  // Pre-set consent cookie and cart with 1 product
  await page.setCookie({
    name: 'nf_consent',
    value: encodeURIComponent(JSON.stringify({ necessary: true, analytics: true, marketing: true, updatedAt: new Date().toISOString() })),
    domain: 'nutrifitness.ch',
    path: '/'
  });

  await page.goto('https://nutrifitness.ch', { waitUntil: 'networkidle2' });

  // Add product to cart by clicking Ajouter on homepage
  await page.evaluate(() => {
    const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Ajouter'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Navigate to checkout
  await page.goto('https://nutrifitness.ch/commande', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Click TWINT payment option by clicking the label
  await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('label'));
    const twintLabel = labels.find(l => l.textContent?.includes('TWINT Suisse'));
    if (twintLabel) {
      twintLabel.click();
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  // Extract QR code URL, deep link href, and displayed text
  const data = await page.evaluate(() => {
    const qrImg = document.querySelector('img[alt="Code QR TWINT"]');
    const deepLink = document.querySelector('a[href*="twint://"]');
    const uuidSpan = Array.from(document.querySelectorAll('span')).find(s => s.textContent?.includes('UUID:'));
    return {
      qrSrc: qrImg ? qrImg.src : null,
      deepLinkHref: deepLink ? deepLink.href : null,
      uuidText: uuidSpan ? uuidSpan.textContent : null,
    };
  });

  console.log('--- TWINT LIVE VERIFICATION RESULTS ---');
  console.log('QR Code Image URL:', data.qrSrc);
  console.log('Mobile App Deep Link:', data.deepLinkHref);
  console.log('Displayed UUID:', data.uuidText);

  // Scroll to payment options and capture screenshot
  await page.evaluate(() => {
    const label = Array.from(document.querySelectorAll('label')).find(l => l.textContent.includes('TWINT Suisse'));
    if (label) {
      label.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'twint_checkout_test.png') });

  await browser.close();
  console.log('Verification finished successfully!');
}

main().catch(err => {
  console.error('Error in TWINT verification:', err);
  process.exit(1);
});
