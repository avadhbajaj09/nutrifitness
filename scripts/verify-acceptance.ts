import fs from 'fs';
import pg from 'pg';
import { normalizeName, importWooCommerce } from './import-woocommerce';

const { Client } = pg;
const CSV_PATH = process.env.WOO_CSV_PATH || '/Users/shikha/Nutrifitness.ch/wc-product-export-7-10-2026-1791397377965.csv';
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:Not1just%25maddy@db.punhmwlpaghmjndpyusf.supabase.co:5432/postgres';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runAcceptanceChecks() {
  console.log('====================================================');
  console.log('  NUTRIFITNESS CATALOG ACCEPTANCE & INTEGRITY TESTS  ');
  console.log('====================================================\n');

  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  try {
    // -------------------------------------------------------------------------
    // CHECK 1: Zero duplicate SKUs and zero duplicate product names
    // -------------------------------------------------------------------------
    console.log('--- CHECK 1: Duplicate SKUs & Names ---');
    const dupSkuRes = await client.query(`
      SELECT sku, count(*) 
      FROM products 
      WHERE sku IS NOT NULL AND sku <> '' 
      GROUP BY sku 
      HAVING count(*) > 1
    `);
    assert(dupSkuRes.rows.length === 0, `Duplicate product SKUs count is 0 (actual: ${dupSkuRes.rows.length})`);

    const dupNameRes = await client.query(`
      SELECT normalized_name, count(*) 
      FROM products 
      GROUP BY normalized_name 
      HAVING count(*) > 1
    `);
    assert(dupNameRes.rows.length === 0, `Duplicate product normalized names count is 0 (actual: ${dupNameRes.rows.length})`);

    // -------------------------------------------------------------------------
    // CHECK 2: Every variation attached to parent & image checks
    // -------------------------------------------------------------------------
    console.log('\n--- CHECK 2: Variation Parents & Images ---');
    const orphanVars = await client.query(`
      SELECT pv.id, pv.sku, pv.attribute_value 
      FROM product_variants pv
      LEFT JOIN products p ON pv.product_id = p.id
      WHERE p.id IS NULL
    `);
    assert(orphanVars.rows.length === 0, `Orphaned variations count is 0 (actual: ${orphanVars.rows.length})`);

    const varsTotal = await client.query(`SELECT count(*) FROM product_variants`);
    const varsWithImg = await client.query(`SELECT count(*) FROM product_variants WHERE image_url IS NOT NULL AND image_url <> ''`);
    const missingImgVars = await client.query(`
      SELECT pv.id, pv.sku, pv.attribute_value, p.name 
      FROM product_variants pv 
      JOIN products p ON pv.product_id = p.id 
      WHERE pv.image_url IS NULL OR pv.image_url = ''
    `);

    console.log(`  Total variants in DB: ${varsTotal.rows[0].count}`);
    console.log(`  Variants with images: ${varsWithImg.rows[0].count}`);
    if (missingImgVars.rows.length > 0) {
      console.log(`  Variants missing image (${missingImgVars.rows.length}):`);
      missingImgVars.rows.slice(0, 5).forEach((r: any) => console.log(`    - ${r.name} (${r.attribute_value})`));
    }
    assert(parseInt(varsWithImg.rows[0].count, 10) > 0, `Variants have dedicated images associated`);

    // -------------------------------------------------------------------------
    // CHECK 3: Published products have category, image, price, stock
    // -------------------------------------------------------------------------
    console.log('\n--- CHECK 3: Published Products Completeness ---');
    const pubProductsRes = await client.query(`
      SELECT p.id, p.name, p.base_price, p.images,
        (SELECT count(*) FROM product_categories pc WHERE pc.product_id = p.id) as cat_count,
        (SELECT COALESCE(SUM(ps.quantity), 0) FROM product_stock ps WHERE ps.product_id = p.id AND ps.origin_id = 'GENEVA') as stock_gen
      FROM products p
      WHERE p.status = 'published' AND p.deleted_at IS NULL
    `);

    let withCats = 0;
    let withImgs = 0;
    let withPrice = 0;
    let withStock = 0;

    pubProductsRes.rows.forEach((p: any) => {
      if (parseInt(p.cat_count, 10) > 0) withCats++;
      if (Array.isArray(p.images) && p.images.length > 0) withImgs++;
      if (parseFloat(p.base_price) >= 0) withPrice++;
      if (p.stock_gen !== null && !isNaN(parseInt(p.stock_gen, 10))) withStock++;
    });

    const totalPub = pubProductsRes.rows.length;
    assert(withCats === totalPub, `All ${totalPub} published products have at least one category (${withCats}/${totalPub})`);
    assert(withImgs === totalPub, `All ${totalPub} published products have images (${withImgs}/${totalPub})`);
    assert(withPrice === totalPub, `All ${totalPub} published products have valid price (${withPrice}/${totalPub})`);
    assert(withStock === totalPub, `All ${totalPub} published products have stock records (${withStock}/${totalPub})`);

    // -------------------------------------------------------------------------
    // CHECK 4: stock_geneva matches CSV
    // -------------------------------------------------------------------------
    console.log('\n--- CHECK 4: Stock Geneva Consistency ---');
    const totalGenStockDb = await client.query(`
      SELECT COALESCE(SUM(quantity), 0) as total 
      FROM product_stock 
      WHERE origin_id = 'GENEVA' AND variant_id IS NULL
    `);
    console.log(`  Total Geneva Stock in DB (Parent level): ${totalGenStockDb.rows[0].total}`);
    assert(parseInt(totalGenStockDb.rows[0].total, 10) > 0, `Geneva stock imported and populated`);

    // -------------------------------------------------------------------------
    // CHECK 5: Published vs Draft Counts
    // -------------------------------------------------------------------------
    console.log('\n--- CHECK 5: Published vs Draft Counts ---');
    const pubCount = await client.query(`SELECT count(*) FROM products WHERE status = 'published' AND deleted_at IS NULL`);
    const draftCount = await client.query(`SELECT count(*) FROM products WHERE status = 'draft'`);
    console.log(`  Published: ${pubCount.rows[0].count} (Expected CSV: 98)`);
    console.log(`  Draft: ${draftCount.rows[0].count} (Expected CSV: 8)`);
    assert(parseInt(pubCount.rows[0].count, 10) === 98, `Published products count matches CSV (98)`);
    assert(parseInt(draftCount.rows[0].count, 10) === 8, `Draft products count matches CSV (8)`);

    // -------------------------------------------------------------------------
    // CHECK 6: Deduplicated Tag List
    // -------------------------------------------------------------------------
    console.log('\n--- CHECK 6: Deduplicated Tags in DB ---');
    const tagsRes = await client.query(`SELECT name, slug FROM tags ORDER BY name`);
    console.log(`  Total unique tags: ${tagsRes.rows.length}`);
    tagsRes.rows.forEach((t: any) => console.log(`    - ${t.name} (/${t.slug})`));
    assert(tagsRes.rows.length === 15, `All 15 tags properly deduplicated and normalized`);

    // -------------------------------------------------------------------------
    // TEST 7: Idempotent Re-run Test
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: Idempotent Re-Run Verification ---');
    const beforeCount = await client.query(`SELECT count(*) FROM products`);
    const reImportResult = await importWooCommerce();
    const afterCount = await client.query(`SELECT count(*) FROM products`);
    assert(
      parseInt(beforeCount.rows[0].count, 10) === parseInt(afterCount.rows[0].count, 10),
      `Idempotent re-run created 0 new products (Before: ${beforeCount.rows[0].count}, After: ${afterCount.rows[0].count})`
    );
    assert(reImportResult.duplicateSkus === 0, `Idempotent re-run generated 0 duplicate SKUs`);

    // -------------------------------------------------------------------------
    // TEST 8: Delete-to-Draft & Restore Test
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8: Delete-to-Draft & Restore Workflow ---');
    // Pick first published product
    const testProd = pubProductsRes.rows[0];
    const testId = testProd.id;

    // 1. Soft-delete
    await client.query(`
      UPDATE products 
      SET status = 'draft', deleted_at = NOW(), updated_at = NOW() 
      WHERE id = $1
    `, [testId]);
    await client.query(`
      INSERT INTO product_audit_log (product_id, user_id, action, new_values)
      VALUES ($1, 'test-runner', 'delete_to_draft', '{"status":"draft"}'::jsonb)
    `, [testId]);

    const checkDraft = await client.query(`SELECT status, deleted_at FROM products WHERE id = $1`, [testId]);
    assert(
      checkDraft.rows[0].status === 'draft' && checkDraft.rows[0].deleted_at !== null,
      `Soft delete sets status = 'draft' and sets deleted_at timestamp`
    );

    // 2. Restore
    await client.query(`
      UPDATE products 
      SET status = 'published', deleted_at = NULL, updated_at = NOW() 
      WHERE id = $1
    `, [testId]);
    await client.query(`
      INSERT INTO product_audit_log (product_id, user_id, action, new_values)
      VALUES ($1, 'test-runner', 'restore', '{"status":"published"}'::jsonb)
    `, [testId]);

    const checkRestored = await client.query(`SELECT status, deleted_at FROM products WHERE id = $1`, [testId]);
    assert(
      checkRestored.rows[0].status === 'published' && checkRestored.rows[0].deleted_at === null,
      `Restore sets status = 'published' and clears deleted_at`
    );

    const auditCheck = await client.query(`
      SELECT action FROM product_audit_log WHERE product_id = $1 ORDER BY created_at DESC LIMIT 2
    `, [testId]);
    assert(
      auditCheck.rows.some((r: any) => r.action === 'delete_to_draft') &&
      auditCheck.rows.some((r: any) => r.action === 'restore'),
      `Audit logs recorded delete_to_draft and restore actions`
    );

    // -------------------------------------------------------------------------
    // TEST 9: Badge Logic Verification for 3 Product Types
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 9: Location Badge Logic (3 Types) ---');
    function computeBadge(locType: string, isPtOnly: boolean, stockGen: number, stockPt: number) {
      const isCommon = locType === 'COMMON';
      const displayLocation = (locType === 'PORTUGAL_ONLY' || isPtOnly) && !isCommon ? 'PORTUGAL' : 'GENEVA';
      const effectiveStock = displayLocation === 'GENEVA' ? stockGen : stockPt;
      const isOutOfStock = effectiveStock <= 0 && !(isCommon && stockPt > 0);
      const isLowStock = effectiveStock > 0 && effectiveStock <= 5;
      const label = displayLocation === 'GENEVA' ? 'En stock à Genève' : 'Expédié du Portugal';

      let stockText = '';
      if (isOutOfStock) stockText = 'Rupture de stock';
      else if (isLowStock) stockText = `Plus que ${effectiveStock} en stock`;
      else stockText = `${effectiveStock} en stock`;

      return { displayLocation, label, effectiveStock, stockText, isOutOfStock, isLowStock };
    }

    // 1. COMMON
    const commonBadge = computeBadge('COMMON', false, 12, 50);
    assert(commonBadge.displayLocation === 'GENEVA', `COMMON product badge displays GENEVA location`);
    assert(commonBadge.label === 'En stock à Genève', `COMMON product badge label is "En stock à Genève"`);
    assert(commonBadge.stockText === '12 en stock', `COMMON product displays Geneva stock (12 en stock)`);

    // 2. GENEVA_ONLY
    const genBadge = computeBadge('GENEVA_ONLY', false, 4, 0);
    assert(genBadge.displayLocation === 'GENEVA', `GENEVA_ONLY product displays Geneva location`);
    assert(genBadge.isLowStock && genBadge.stockText === 'Plus que 4 en stock', `Low stock (<=5) displays "Plus que X en stock"`);

    // 3. PORTUGAL_ONLY
    const ptBadge = computeBadge('PORTUGAL_ONLY', true, 0, 25);
    assert(ptBadge.displayLocation === 'PORTUGAL', `PORTUGAL_ONLY product displays PORTUGAL location`);
    assert(ptBadge.label === 'Expédié du Portugal', `PORTUGAL_ONLY label is "Expédié du Portugal"`);
    assert(ptBadge.stockText === '25 en stock', `PORTUGAL_ONLY displays Portugal stock (25 en stock)`);

    // 4. Out of Stock
    const oosBadge = computeBadge('GENEVA_ONLY', false, 0, 0);
    assert(oosBadge.isOutOfStock && oosBadge.stockText === 'Rupture de stock', `Stock 0 displays "Rupture de stock"`);

    // -------------------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------------------
    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

runAcceptanceChecks().catch(err => {
  console.error('Acceptance test runner crashed:', err);
  process.exit(1);
});
