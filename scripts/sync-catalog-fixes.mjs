import pg from 'pg';
import { PRODUCTS } from '../src/lib/catalog.ts';

const isDryRun = process.argv.includes('--dry-run');

async function run() {
  const client = new pg.Client({
    connectionString: 'postgresql://postgres:Not1just%25maddy@db.punhmwlpaghmjndpyusf.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  console.log(`Starting catalog sync (DryRun: ${isDryRun})...`);
  await client.query('BEGIN');

  try {
    // 1. Fix base_price for parent variable products with base_price <= 0
    console.log('\n--- 1. Syncing base_price for variable products ---');
    const priceUpdates = await client.query(`
      UPDATE products p
      SET base_price = sub.min_price, updated_at = NOW()
      FROM (
        SELECT product_id, MIN(price) AS min_price
        FROM product_variants
        WHERE price > 0
        GROUP BY product_id
      ) sub
      WHERE p.id = sub.product_id
        AND (p.base_price IS NULL OR p.base_price <= 0)
        AND p.status = 'published'
        AND p.deleted_at IS NULL
      RETURNING p.id, p.slug, p.name, p.base_price;
    `);

    console.log(`Updated base_price on ${priceUpdates.rows.length} products:`);
    for (const r of priceUpdates.rows) {
      console.log(`  ✅ ${r.slug} (${r.name}) -> CHF ${r.base_price}`);
    }

    // 2. Fix broken wp-content images in products
    console.log('\n--- 2. Syncing valid images from catalog.ts ---');
    const wpProducts = await client.query(`
      SELECT id, woo_id, slug, name, images
      FROM products
      WHERE images::text LIKE '%nutrifitness.ch/wp-content%'
        AND status = 'published'
        AND deleted_at IS NULL
    `);

    console.log(`Found ${wpProducts.rows.length} products with dead nutrifitness.ch/wp-content image URLs in DB.`);

    let imagesUpdatedCount = 0;
    for (const p of wpProducts.rows) {
      // Find matching static product in catalog.ts
      const sp = PRODUCTS.find(prod => {
        const pSlug = prod.slug?.fr || prod.slug;
        const pId = prod.id;
        const pWid = prod.wooId || prod.id?.replace(/^prod-/, '');
        return pSlug === p.slug || pId === p.id || (p.woo_id && String(p.woo_id) === String(pWid));
      });

      if (!sp || !Array.isArray(sp.images) || sp.images.length === 0) {
        console.warn(`  ⚠️ No static match for: ${p.slug}`);
        continue;
      }

      // Filter out any dead nutrifitness.ch/wp-content URLs from static images
      const validImgs = sp.images.filter(img => {
        const src = typeof img === 'string' ? img : img.src;
        return src && typeof src === 'string' && !src.includes('nutrifitness.ch/wp-content');
      });

      let finalImgs = validImgs;
      if (finalImgs.length === 0 && p.slug === 'gallon-nf-22l') {
        finalImgs = [{
          src: 'https://punhmwlpaghmjndpyusf.supabase.co/storage/v1/object/public/product-images/images/placeholder.webp',
          alt: 'Gallon 2.2L'
        }];
      }

      if (finalImgs.length > 0) {
        await client.query(`
          UPDATE products
          SET images = $1, updated_at = NOW()
          WHERE id = $2
        `, [JSON.stringify(finalImgs), p.id]);
        imagesUpdatedCount++;
        console.log(`  📸 ${p.slug}: replaced ${p.images?.length || 0} dead images with ${finalImgs.length} valid images (primary: ${finalImgs[0]?.src?.slice(0, 70)}...)`);
      } else {
        console.warn(`  ⚠️ Could not find valid non-wp image for: ${p.slug}`);
      }
    }

    console.log(`Updated images on ${imagesUpdatedCount} products.`);

    // 3. Fix broken variant images
    console.log('\n--- 3. Syncing broken variant images ---');
    const brokenVariants = await client.query(`
      SELECT pv.id as variant_id, pv.sku, pv.attribute_value, pv.image_url,
             p.id as product_id, p.slug as product_slug, p.images as product_images
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.image_url LIKE '%nutrifitness.ch/wp-content%'
    `);

    console.log(`Found ${brokenVariants.rows.length} variants with dead nutrifitness.ch/wp-content URLs.`);
    let variantImagesFixed = 0;
    for (const v of brokenVariants.rows) {
      // Fetch refreshed product images
      const prodRes = await client.query('SELECT images FROM products WHERE id = $1', [v.product_id]);
      const pImgs = prodRes.rows[0]?.images || [];
      const primary = pImgs[0]?.src || (typeof pImgs[0] === 'string' ? pImgs[0] : null);
      if (primary && !primary.includes('nutrifitness.ch/wp-content')) {
        await client.query(`
          UPDATE product_variants
          SET image_url = $1
          WHERE id = $2
        `, [primary, v.variant_id]);
        variantImagesFixed++;
      }
    }
    console.log(`Fixed ${variantImagesFixed} variants with primary product image.`);

    if (isDryRun) {
      console.log('\n[DRY RUN] Rolling back transaction. No data was modified.');
      await client.query('ROLLBACK');
    } else {
      console.log('\n[EXECUTE] Committing transaction.');
      await client.query('COMMIT');
    }
  } catch (err) {
    console.error('Error during catalog sync:', err);
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
