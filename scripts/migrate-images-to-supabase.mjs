import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

// 1. Read env
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const idx = l.indexOf('=');
      return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
    })
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://punhmwlpaghmjndpyusf.supabase.co';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const pgClient = new pg.Client({
  connectionString: 'postgresql://postgres:Not1just%25maddy@db.punhmwlpaghmjndpyusf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

function getAllFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) getAllFiles(full, files);
    else files.push(full);
  }
  return files;
}

async function uploadInBatches(fileList, batchSize = 10) {
  console.log(`Starting upload of ${fileList.length} files to 'product-images' bucket...`);
  let uploaded = 0;
  let errors = 0;

  for (let i = 0; i < fileList.length; i += batchSize) {
    const batch = fileList.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (localPath) => {
        try {
          // Normalize relative path in bucket
          // e.g. "public/wp-content/uploads/2024/06/foo.png" -> "wp-content/uploads/2024/06/foo.png"
          // "public/images/products/marvelous/73.png" -> "images/products/marvelous/73.png"
          const bucketPath = localPath.replace(/^public\//, '');
          const fileBuffer = fs.readFileSync(localPath);
          const mime = getMimeType(localPath);

          const { error } = await supabase.storage.from('product-images').upload(bucketPath, fileBuffer, {
            contentType: mime,
            upsert: true
          });

          if (error) {
            console.error(`Failed ${bucketPath}:`, error.message);
            errors++;
          } else {
            uploaded++;
          }
        } catch (err) {
          console.error(`Error uploading ${localPath}:`, err.message);
          errors++;
        }
      })
    );
    if ((i + batchSize) % 50 < batchSize || i + batchSize >= fileList.length) {
      console.log(`Progress: ${Math.min(i + batchSize, fileList.length)} / ${fileList.length} files processed...`);
    }
  }

  console.log(`Upload complete! Successfully uploaded: ${uploaded}, Errors: ${errors}`);
}

async function main() {
  await pgClient.connect();

  // 1. Gather all files
  const wpFiles = getAllFiles('public/wp-content/uploads');
  const prodFiles = getAllFiles('public/images/products');
  const allFiles = [...wpFiles, ...prodFiles];

  console.log(`Found ${wpFiles.length} wp-content files and ${prodFiles.length} product images.`);
  await uploadInBatches(allFiles, 15);

  // 2. Build local file existence lookup
  const localUploadedSet = new Set(allFiles.map(f => f.replace(/^public\//, '')));

  function getCdnUrlFor(storagePath) {
    const clean = storagePath.startsWith('/') ? storagePath.slice(1) : storagePath;
    return `${supabaseUrl}/storage/v1/object/public/product-images/${clean}`;
  }

  // Helper to map any URL or relative path to a valid CDN URL if file exists
  function resolveToCdnUrl(urlOrPath) {
    if (!urlOrPath) return null;
    if (urlOrPath.includes('punhmwlpaghmjndpyusf.supabase.co/storage')) {
      return urlOrPath; // already CDN
    }
    // Remove protocol and host if present
    const relativePath = urlOrPath.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/+/, '');
    if (localUploadedSet.has(relativePath)) {
      return getCdnUrlFor(relativePath);
    }
    return null;
  }

  // 3. Load catalog.ts mappings
  console.log('Reading catalog.ts for image references...');
  const catalogContent = fs.readFileSync('src/lib/catalog.ts', 'utf8');
  // Simple regex parser for catalog products: id and images
  const catMatches = [];
  const catRegex = /"id":\s*"(prod-\d+)"[\s\S]*?"images":\s*\[([\s\S]*?)\]/g;
  let m;
  while ((m = catRegex.exec(catalogContent)) !== null) {
    const pId = m[1];
    const imgBlock = m[2];
    const srcMatch = imgBlock.match(/"src":\s*"([^"]+)"/);
    if (srcMatch) {
      catMatches.push({ id: pId, src: srcMatch[1] });
    }
  }
  const catMap = new Map();
  catMatches.forEach(c => catMap.set(c.id, c.src));
  console.log(`Parsed ${catMatches.length} products with images from catalog.ts`);

  // 4. Update products table
  console.log('Updating products table...');
  const prodRes = await pgClient.query('SELECT id, woo_id, name, slug, images FROM products');
  let updatedProducts = 0;
  let remainingMissing = [];

  for (const p of prodRes.rows) {
    let imagesArr = Array.isArray(p.images) ? [...p.images] : [];
    let changed = false;

    // Check catalog.ts fallback if no valid images exist
    const catSrc = catMap.get('prod-' + p.woo_id) || catMap.get(p.id);

    if (imagesArr.length === 0 && catSrc) {
      const cdn = resolveToCdnUrl(catSrc);
      if (cdn) {
        imagesArr = [{ src: cdn, alt: p.name }];
        changed = true;
      }
    }

    // Map existing images in array
    const mappedImages = [];
    for (const img of imagesArr) {
      const src = img.src || img;
      const cdnUrl = resolveToCdnUrl(src);
      if (cdnUrl) {
        mappedImages.push({
          ...img,
          src: cdnUrl,
          alt: img.alt || p.name
        });
        if (src !== cdnUrl) changed = true;
      } else if (catSrc) {
        const catCdn = resolveToCdnUrl(catSrc);
        if (catCdn) {
          mappedImages.push({
            ...img,
            src: catCdn,
            alt: img.alt || p.name
          });
          changed = true;
        } else {
          mappedImages.push(img);
        }
      } else {
        mappedImages.push(img);
      }
    }

    if (changed || mappedImages.length > 0) {
      await pgClient.query('UPDATE products SET images = $1, updated_at = NOW() WHERE id = $2', [
        JSON.stringify(mappedImages),
        p.id
      ]);
      updatedProducts++;
    }

    // Check if product is still missing a valid working image
    const hasValidImage = mappedImages.some(img => img.src && img.src.includes('supabase.co/storage'));
    if (!hasValidImage) {
      remainingMissing.push({ id: p.id, name: p.name, woo_id: p.woo_id, slug: p.slug });
    }
  }

  console.log(`Updated ${updatedProducts} products in database.`);

  // 5. Update product_variants table
  console.log('Updating product_variants table...');
  const varRes = await pgClient.query('SELECT id, product_id, sku, image_url FROM product_variants WHERE image_url IS NOT NULL');
  let updatedVariants = 0;

  for (const v of varRes.rows) {
    const cdnUrl = resolveToCdnUrl(v.image_url);
    if (cdnUrl && cdnUrl !== v.image_url) {
      await pgClient.query('UPDATE product_variants SET image_url = $1, updated_at = NOW() WHERE id = $2', [
        cdnUrl,
        v.id
      ]);
      updatedVariants++;
    }
  }

  console.log(`Updated ${updatedVariants} product variants with CDN URLs.`);

  console.log('\n--- MIGRATION SUMMARY ---');
  console.log(`Total Products: ${prodRes.rows.length}`);
  console.log(`Products with Valid Cloud CDN Images: ${prodRes.rows.length - remainingMissing.length}`);
  console.log(`Products Missing Photos: ${remainingMissing.length}`);
  if (remainingMissing.length > 0) {
    console.log('Missing products list:');
    remainingMissing.forEach(p => console.log(` - [${p.woo_id || 'NO_WOO'}] ${p.name} (slug: ${p.slug})`));
  }

  await pgClient.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
