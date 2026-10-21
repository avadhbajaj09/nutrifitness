import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = '/Users/shikha/.gemini/antigravity/brain/6ed42661-0b6c-4c15-9a16-fecaba576d70/screenshots/verification';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  console.log('Browser launched');

  // 1. Mobile verification (390 x 844, iPhone 12/13/14)
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  
  // Pre-set consent cookie so banner doesn't obstruct view
  await mobilePage.setCookie({
    name: 'nf_consent',
    value: encodeURIComponent(JSON.stringify({ necessary: true, analytics: true, marketing: true, updatedAt: new Date().toISOString() })),
    domain: 'nutrifitness.ch',
    path: '/'
  });

  await mobilePage.goto('https://nutrifitness.ch', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 1: Mobile Hero Slider (top)
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1000));
  await mobilePage.screenshot({ path: path.join(OUT_DIR, '01_mobile_hero_slider.png') });
  console.log('Saved 01_mobile_hero_slider.png');

  // Screenshot 2: Mobile Product Cards (prices & buttons)
  await mobilePage.evaluate(() => {
    const card = document.querySelector('article');
    if (card) {
      card.scrollIntoView({ behavior: 'instant', block: 'center' });
    } else {
      window.scrollTo(0, 650);
    }
  });
  await new Promise(r => setTimeout(r, 1500));
  await mobilePage.screenshot({ path: path.join(OUT_DIR, '02_mobile_product_cards.png') });
  console.log('Saved 02_mobile_product_cards.png');

  // Screenshot 3: Mobile Shop By Goal (vertical portrait cards)
  await mobilePage.evaluate(() => {
    const h2s = Array.from(document.querySelectorAll('h2, h3'));
    const goalHeading = h2s.find(h => h.textContent.includes('Objectif') || h.textContent.includes('OBJECTIF'));
    if (goalHeading) {
      goalHeading.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      window.scrollTo(0, 1600);
    }
  });
  await new Promise(r => setTimeout(r, 1500));
  await mobilePage.screenshot({ path: path.join(OUT_DIR, '03_mobile_shop_by_goal.png') });
  console.log('Saved 03_mobile_shop_by_goal.png');

  // Screenshot 4: Mobile Footer scrolled to bottom (full content & bottom tab bar clearance)
  await mobilePage.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 1500));
  await mobilePage.screenshot({ path: path.join(OUT_DIR, '04_mobile_footer_bottom.png') });
  console.log('Saved 04_mobile_footer_bottom.png');

  // Screenshot 4b: Mobile Footer Middle (showing the 2-column links and showroom details)
  await mobilePage.evaluate(() => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  });
  await new Promise(r => setTimeout(r, 1500));
  await mobilePage.screenshot({ path: path.join(OUT_DIR, '04b_mobile_footer_links.png') });
  console.log('Saved 04b_mobile_footer_links.png');

  // 2. Desktop verification (1440 x 900)
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await desktopPage.setCookie({
    name: 'nf_consent',
    value: encodeURIComponent(JSON.stringify({ necessary: true, analytics: true, marketing: true, updatedAt: new Date().toISOString() })),
    domain: 'nutrifitness.ch',
    path: '/'
  });
  await desktopPage.goto('https://nutrifitness.ch', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  await desktopPage.screenshot({ path: path.join(OUT_DIR, '05_desktop_hero.png') });
  console.log('Saved 05_desktop_hero.png');

  await desktopPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1500));
  await desktopPage.screenshot({ path: path.join(OUT_DIR, '06_desktop_footer.png') });
  console.log('Saved 06_desktop_footer.png');

  await browser.close();
  console.log('Verification screenshots captured successfully!');
}

main().catch(err => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
