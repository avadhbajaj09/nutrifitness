import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:Not1just%25maddy@db.punhmwlpaghmjndpyusf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

function isNumericBarcode(str) {
  if (!str || typeof str !== 'string') return false;
  const clean = str.trim();
  return /^\d{8}$|^\d{12,14}$/.test(clean);
}

async function run() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL.');

  // 1. Direct DB updates: set gtin13 = sku where sku is a valid barcode
  const updateDbVars1 = await client.query(`
    UPDATE product_variants
    SET gtin13 = sku, updated_at = NOW()
    WHERE (gtin13 IS NULL OR gtin13 = '') AND sku ~ '^[0-9]{8}$|^[0-9]{12,14}$'
    RETURNING id, sku;
  `);
  console.log(`Updated ${updateDbVars1.rowCount} product_variants directly from numeric sku in DB.`);

  const updateDbProds1 = await client.query(`
    UPDATE products
    SET gtin13 = sku, updated_at = NOW()
    WHERE (gtin13 IS NULL OR gtin13 = '') AND sku ~ '^[0-9]{8}$|^[0-9]{12,14}$'
    RETURNING id, sku;
  `);
  console.log(`Updated ${updateDbProds1.rowCount} products directly from numeric sku in DB.`);

  // 2. Load catalog.ts and update both catalog file and DB
  const catalogPath = path.resolve('src/lib/catalog.ts');
  const rawCatalog = fs.readFileSync(catalogPath, 'utf8');

  // Load current DB products and variants
  const dbProds = (await client.query('SELECT id, woo_id, slug, sku, gtin13 FROM products')).rows;
  const dbVars = (await client.query('SELECT id, product_id, woo_id, sku, attribute_value, gtin13 FROM product_variants')).rows;

  const dbProdMap = new Map();
  dbProds.forEach(p => {
    if (p.id) dbProdMap.set(p.id, p);
    if (p.woo_id) dbProdMap.set(String(p.woo_id), p);
    if (p.slug) dbProdMap.set(p.slug.toLowerCase().trim(), p);
  });

  // Dynamically import PRODUCTS
  const { PRODUCTS } = await import('../src/lib/catalog.ts');
  let catalogUpdatedCount = 0;
  let dbVarsUpdatedFromCatalog = 0;

  for (const product of PRODUCTS) {
    let firstGtin = null;

    if (Array.isArray(product.variants)) {
      for (const variant of product.variants) {
        if (isNumericBarcode(variant.sku)) {
          variant.gtin13 = variant.sku.trim();
          if (!firstGtin) firstGtin = variant.gtin13;
          catalogUpdatedCount++;
        }
      }
    }

    if (!firstGtin && isNumericBarcode(product.sku)) {
      firstGtin = product.sku.trim();
    }

    if (firstGtin) {
      product.gtin13 = firstGtin;
    }

    // Now sync this product's variants to Supabase
    const cleanId = (product.id || '').replace(/^prod-/, '');
    const dbP = dbProdMap.get(product.id) || dbProdMap.get(cleanId) || dbProdMap.get(product.slug?.fr?.toLowerCase().trim());
    if (dbP) {
      if (firstGtin && (!dbP.gtin13 || dbP.gtin13 === '')) {
        await client.query('UPDATE products SET gtin13 = $1, updated_at = NOW() WHERE id = $2', [firstGtin, dbP.id]);
      }

      const pVars = dbVars.filter(v => v.product_id === dbP.id);
      for (const variant of (product.variants || [])) {
        if (isNumericBarcode(variant.sku)) {
          const barcode = variant.sku.trim();
          const cleanVarId = (variant.id || '').replace(/^var-/, '');
          const target = pVars.find(dbV =>
            dbV.id === variant.id ||
            (dbV.woo_id && (String(dbV.woo_id) === variant.id || String(dbV.woo_id) === cleanVarId)) ||
            (dbV.sku && dbV.sku === variant.sku) ||
            (dbV.attribute_value && variant.flavorName?.fr && dbV.attribute_value.toLowerCase().trim() === variant.flavorName.fr.toLowerCase().trim())
          );
          if (target && (!target.gtin13 || target.gtin13 === '')) {
            await client.query('UPDATE product_variants SET gtin13 = $1, sku = COALESCE(sku, $1), updated_at = NOW() WHERE id = $2', [barcode, target.id]);
            dbVarsUpdatedFromCatalog++;
          }
        }
      }
    }
  }

  // 3. Any parent products in DB that still have no gtin13, copy from their first variant that has a gtin13
  const updateParentFromVar = await client.query(`
    UPDATE products p
    SET gtin13 = v.gtin13, updated_at = NOW()
    FROM (
      SELECT DISTINCT ON (product_id) product_id, gtin13
      FROM product_variants
      WHERE gtin13 IS NOT NULL AND gtin13 != ''
      ORDER BY product_id, created_at ASC
    ) v
    WHERE p.id = v.product_id AND (p.gtin13 IS NULL OR p.gtin13 = '')
    RETURNING p.id, p.gtin13;
  `);
  console.log(`Updated ${updateParentFromVar.rowCount} parent products in DB from their variant GTINs.`);

  // 4. Write back to src/lib/catalog.ts
  const prefixMarker = 'export const PRODUCTS: ProductItem[] = ';
  const pStart = rawCatalog.indexOf(prefixMarker);
  const pEnd = rawCatalog.lastIndexOf('];');

  if (pStart >= 0 && pEnd > pStart) {
    const before = rawCatalog.slice(0, pStart + prefixMarker.length);
    const after = rawCatalog.slice(pEnd + 1);
    const updatedContent = before + JSON.stringify(PRODUCTS, null, 2) + after;
    fs.writeFileSync(catalogPath, updatedContent, 'utf8');
    console.log(`Successfully rewrote src/lib/catalog.ts with ${catalogUpdatedCount} variant GTINs and parent GTINs!`);
  } else {
    console.warn('Could not locate PRODUCTS array markers in catalog.ts');
  }

  // 5. Final DB verification
  const totalDbProdsWithGtin = (await client.query("SELECT count(*) FROM products WHERE gtin13 IS NOT NULL AND gtin13 != ''")).rows[0].count;
  const totalDbVarsWithGtin = (await client.query("SELECT count(*) FROM product_variants WHERE gtin13 IS NOT NULL AND gtin13 != ''")).rows[0].count;

  console.log(`\n=== FINAL DB STATUS ===`);
  console.log(`Products with GTIN-13 in Supabase: ${totalDbProdsWithGtin} / 159`);
  console.log(`Product Variants with GTIN-13 in Supabase: ${totalDbVarsWithGtin} / 223`);

  await client.end();
}

run().catch(err => {
  console.error('Fatal error during sync:', err);
  process.exit(1);
});
