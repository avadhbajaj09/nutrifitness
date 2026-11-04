const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Client } = require('pg');

const OUT_DIR = path.resolve(__dirname, '../nutrifitness-product-images');
const ZIP_FILE = path.resolve(__dirname, '../nutrifitness-product-images.zip');
const DESKTOP_ZIP = path.resolve('/Users/shikha/Desktop/nutrifitness-product-images.zip');

async function main() {
  console.log('🚀 Starting NutriFitness Product Images Downloader...');
  console.log(`📁 Target directory: ${OUT_DIR}`);

  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const client = new Client({
    connectionString: 'postgresql://postgres:Not1just%25maddy@db.punhmwlpaghmjndpyusf.supabase.co:5432/postgres'
  });
  await client.connect();

  const prodRes = await client.query(`
    SELECT id, name, slug, brand, images
    FROM products
    WHERE deleted_at IS NULL
    ORDER BY brand, name
  `);

  const varRes = await client.query(`
    SELECT pv.id, pv.product_id, pv.image_url, pv.attribute_value, pv.sku, p.slug, p.brand
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE pv.image_url IS NOT NULL
  `);

  await client.end();

  const items = [];
  const seenUrls = new Set();

  for (const p of prodRes.rows) {
    const brand = (p.brand || 'Other').trim().replace(/[/\\?%*:|"<>]/g, '-');
    const slug = (p.slug || p.id).trim().replace(/[/\\?%*:|"<>]/g, '-');
    if (Array.isArray(p.images)) {
      p.images.forEach((img, idx) => {
        const u = typeof img === 'string' ? img : img && img.src;
        if (u && u.startsWith('http') && !seenUrls.has(u)) {
          seenUrls.add(u);
          items.push({
            url: u,
            brand,
            slug,
            baseName: `${slug}-${idx + 1}`
          });
        }
      });
    }
  }

  for (const v of varRes.rows) {
    const u = v.image_url;
    if (u && u.startsWith('http') && !seenUrls.has(u)) {
      seenUrls.add(u);
      const brand = (v.brand || 'Other').trim().replace(/[/\\?%*:|"<>]/g, '-');
      const slug = (v.slug || v.product_id).trim().replace(/[/\\?%*:|"<>]/g, '-');
      const flv = (v.attribute_value || v.sku || 'variant').toLowerCase().replace(/[^a-z0-9]/g, '-');
      items.push({
        url: u,
        brand,
        slug,
        baseName: `${slug}-${flv}`
      });
    }
  }

  console.log(`📸 Found ${items.length} unique images to download across ${prodRes.rows.length} products.`);

  // Worker pool for fast concurrent downloads
  const CONCURRENCY = 12;
  let index = 0;
  let downloadedCount = 0;
  let failedCount = 0;

  function getExtension(url, contentType) {
    if (contentType) {
      if (contentType.includes('webp')) return '.webp';
      if (contentType.includes('png')) return '.png';
      if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
      if (contentType.includes('svg')) return '.svg';
    }
    const cleanUrl = url.split('?')[0];
    const extMatch = cleanUrl.match(/\.(png|jpe?g|webp|svg|gif)$/i);
    if (extMatch) return extMatch[0].toLowerCase();
    return '.png';
  }

  async function downloadWorker(workerId) {
    while (index < items.length) {
      const item = items[index++];
      const brandDir = path.join(OUT_DIR, item.brand);
      if (!fs.existsSync(brandDir)) {
        fs.mkdirSync(brandDir, { recursive: true });
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(item.url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
        });
        clearTimeout(timeout);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const ext = getExtension(item.url, res.headers.get('content-type'));
        const fileName = `${item.baseName}${ext}`;
        const filePath = path.join(brandDir, fileName);

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filePath, buffer);
        downloadedCount++;

        if (downloadedCount % 25 === 0 || downloadedCount === items.length) {
          process.stdout.write(`⏳ Progress: ${downloadedCount}/${items.length} images downloaded...\r`);
        }
      } catch (err) {
        failedCount++;
        // console.warn(`Failed ${item.url}:`, err.message);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => downloadWorker(i));
  await Promise.all(workers);

  console.log(`\n✅ Download complete: ${downloadedCount} downloaded, ${failedCount} skipped.`);

  // Create Zip Archive
  console.log('📦 Compressing images into ZIP archive...');
  if (fs.existsSync(ZIP_FILE)) fs.unlinkSync(ZIP_FILE);

  try {
    execSync(`cd "${path.dirname(OUT_DIR)}" && zip -r "${ZIP_FILE}" "${path.basename(OUT_DIR)}"`, {
      stdio: 'pipe'
    });
    const stats = fs.statSync(ZIP_FILE);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`🎉 ZIP Archive created successfully: ${ZIP_FILE} (${sizeMb} MB)`);

    // Copy to Desktop if available
    try {
      fs.copyFileSync(ZIP_FILE, DESKTOP_ZIP);
      console.log(`💻 Copied directly to your Desktop: ${DESKTOP_ZIP}`);
    } catch (e) {}

    // Also copy to public/downloads for web browser download
    const publicDownloads = path.resolve(__dirname, '../public/downloads');
    if (!fs.existsSync(publicDownloads)) fs.mkdirSync(publicDownloads, { recursive: true });
    const publicZip = path.join(publicDownloads, 'nutrifitness-product-images.zip');
    fs.copyFileSync(ZIP_FILE, publicZip);
    console.log(`🌐 Accessible via website link: /downloads/nutrifitness-product-images.zip`);

  } catch (zipErr) {
    console.error('Error creating zip:', zipErr);
  }
}

main().catch(console.error);
