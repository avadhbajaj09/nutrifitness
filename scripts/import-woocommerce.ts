import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

const CSV_PATH = process.env.WOO_CSV_PATH || '/Users/shikha/Nutrifitness.ch/wc-product-export-7-10-2026-1791397377965.csv';
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:Not1just%25maddy@db.punhmwlpaghmjndpyusf.supabase.co:5432/postgres';

export function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugify(text: string): string {
  const norm = normalizeName(text);
  const slug = norm
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'produit';
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(cell);
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export async function importWooCommerce() {
  console.log('====================================================');
  console.log('   NutriFitness WooCommerce Catalog Import Script    ');
  console.log('====================================================');
  console.log('Reading CSV from:', CSV_PATH);

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV file not found at ${CSV_PATH}`);
  }

  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const parsed = parseCSV(raw);
  const headers = parsed[0].map(h => h.replace(/^\uFEFF/, '').trim());
  const dataRows = parsed.slice(1);
  const col: Record<string, number> = {};
  headers.forEach((h, i) => col[h] = i);

  console.log(`Parsed ${dataRows.length} data rows with ${headers.length} columns.`);

  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  try {
    // ----------------------------------------------------
    // STEP 1: Categories & Tags extraction
    // ----------------------------------------------------
    console.log('\n--- Processing Categories & Tags ---');
    const categoryMap = new Map<string, { name: string; slug: string }>(); // lowerName -> { name, slug }
    const tagMap = new Map<string, { name: string; slug: string }>();

    dataRows.forEach(r => {
      const catField = (r[col['Catégories']] || '').trim();
      if (catField) {
        catField.split(',').forEach(c => {
          const trimmed = c.trim();
          if (trimmed) {
            const key = trimmed.toLowerCase();
            if (!categoryMap.has(key)) {
              categoryMap.set(key, { name: trimmed, slug: slugify(trimmed) });
            }
          }
        });
      }

      const tagField = (r[col['Étiquettes']] || '').trim();
      if (tagField) {
        tagField.split(',').forEach(t => {
          const trimmed = t.trim();
          if (trimmed) {
            const key = trimmed.toLowerCase();
            if (!tagMap.has(key)) {
              tagMap.set(key, { name: trimmed, slug: slugify(trimmed) });
            }
          }
        });
      }
    });

    console.log(`Discovered ${categoryMap.size} unique categories and ${tagMap.size} unique tags.`);

    // Insert categories into DB
    const dbCategoryIds = new Map<string, string>(); // lowerName -> uuid
    for (const cat of categoryMap.values()) {
      const res = await client.query(
        `INSERT INTO categories (name, slug)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug
         RETURNING id, name`,
        [cat.name, cat.slug]
      );
      dbCategoryIds.set(cat.name.toLowerCase(), res.rows[0].id);
    }

    // Insert tags into DB
    const dbTagIds = new Map<string, string>(); // lowerName -> uuid
    for (const tag of tagMap.values()) {
      const res = await client.query(
        `INSERT INTO tags (name, slug)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug
         RETURNING id, name`,
        [tag.name, tag.slug]
      );
      dbTagIds.set(tag.name.toLowerCase(), res.rows[0].id);
    }

    // ----------------------------------------------------
    // STEP 2: Separate Parent Products vs Variations
    // ----------------------------------------------------
    const parentRows = dataRows.filter(r => {
      const t = (r[col['Type']] || '').trim().toLowerCase();
      return t === 'simple' || t === 'variable';
    });

    const variationRows = dataRows.filter(r => {
      const t = (r[col['Type']] || '').trim().toLowerCase();
      return t.includes('variation');
    });

    console.log(`\nIdentified:`);
    console.log(`- Parent products (simple + variable): ${parentRows.length}`);
    console.log(`- Variation rows: ${variationRows.length}`);

    // Track duplicates and changes
    let insertedParents = 0;
    let updatedParents = 0;
    const mergedList: { name: string; sku: string; reason: string }[] = [];
    const skippedList: { name: string; sku: string; reason: string }[] = [];

    // Map to find parents when attaching variations
    // Keys: woo_id, sku, normalized_name -> db product object
    const productByWooId = new Map<string, any>();
    const productBySku = new Map<string, any>();
    const productByNormName = new Map<string, any>();

    // Load existing products from DB to support idempotent updates
    const existingProductsRes = await client.query(`SELECT id, woo_id, sku, normalized_name, name, slug FROM products`);
    const dbProductMapBySku = new Map<string, any>();
    const dbProductMapByWooId = new Map<string, any>();
    const dbProductMapByNormName = new Map<string, any>();
    existingProductsRes.rows.forEach(p => {
      if (p.sku) dbProductMapBySku.set(p.sku.trim(), p);
      if (p.woo_id) dbProductMapByWooId.set(p.woo_id.trim(), p);
      if (p.normalized_name) dbProductMapByNormName.set(p.normalized_name.trim(), p);
    });

    console.log(`\nFound ${existingProductsRes.rows.length} existing products in database.`);

    // ----------------------------------------------------
    // STEP 3: Process and Insert/Update Parent Products
    // ----------------------------------------------------
    console.log('\n--- Importing Parent Products ---');
    for (const r of parentRows) {
      const wooId = (r[col['ID']] || '').trim();
      const sku = (r[col['UGS']] || '').trim();
      const name = (r[col['Nom']] || '').trim();
      const type = (r[col['Type']] || '').trim().toLowerCase();
      const publishedVal = (r[col['Publié']] || '').trim();
      const status = publishedVal === '1' ? 'published' : 'draft';
      const normName = normalizeName(name);

      const shortDesc = (r[col['Description courte']] || '').trim();
      const fullDesc = (r[col['Description']] || '').trim();
      const weightKg = parseFloat(r[col['Poids (kg)']] || '0') || 0;
      const weightGrams = Math.round(weightKg * 1000);
      const regPrice = parseFloat(r[col['Tarif régulier']] || '0') || 0;
      const salePrice = parseFloat(r[col['Tarif promo']] || '0') || null;
      const stockGeneva = parseInt(r[col['Stock']] || '0', 10) || 0;
      const isFeatured = (r[col['Mis en avant ?']] || '').trim() === '1';

      // Images parsing
      const rawImgs = (r[col['Images']] || '').split(',').map(s => s.trim()).filter(Boolean);
      const imagesList = rawImgs.map(imgUrl => ({
        src: imgUrl,
        alt: name
      }));

      // Base slug
      let baseSlug = slugify(name);

      // Match Key Priority: (1) SKU, (2) WooCommerce ID, (3) normalized name
      let existing = null;
      let matchReason = '';
      if (sku && dbProductMapBySku.has(sku)) {
        existing = dbProductMapBySku.get(sku);
        matchReason = `Matched by SKU (${sku})`;
      } else if (wooId && dbProductMapByWooId.has(wooId)) {
        existing = dbProductMapByWooId.get(wooId);
        matchReason = `Matched by Woo ID (${wooId})`;
      } else if (normName && dbProductMapByNormName.has(normName)) {
        existing = dbProductMapByNormName.get(normName);
        matchReason = `Matched by normalized name ("${normName}")`;
      }

      let productId = existing ? existing.id : null;

      if (existing) {
        // UPDATE existing product
        const updateRes = await client.query(
          `UPDATE products
           SET woo_id = COALESCE(NULLIF($1, ''), woo_id),
               sku = COALESCE(NULLIF($2, ''), sku),
               name = $3,
               normalized_name = $4,
               type = $5,
               status = $6,
               base_price = $7,
               compare_at_price = $8,
               weight_kg = $9,
               weight_grams = $10,
               short_description = $11,
               description = $12,
               images = $13::jsonb,
               is_featured = $14,
               updated_at = NOW()
           WHERE id = $15
           RETURNING id, slug, sku, woo_id, name, normalized_name`,
          [
            wooId || null,
            sku || null,
            name,
            normName,
            type === 'variable' ? 'variable' : 'simple',
            status,
            regPrice,
            salePrice,
            weightKg,
            weightGrams,
            shortDesc,
            fullDesc,
            JSON.stringify(imagesList),
            isFeatured,
            productId
          ]
        );
        updatedParents++;
        mergedList.push({ name, sku: sku || wooId, reason: matchReason });
        const updatedRow = updateRes.rows[0];
        if (wooId) productByWooId.set(wooId, updatedRow);
        if (sku) productBySku.set(sku, updatedRow);
        productByNormName.set(normName, updatedRow);
      } else {
        // Handle slug collision for new products
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (true) {
          const chk = await client.query(`SELECT id FROM products WHERE slug = $1`, [uniqueSlug]);
          if (chk.rows.length === 0) break;
          uniqueSlug = `${baseSlug}-${counter++}`;
        }

        // INSERT new product
        const insertRes = await client.query(
          `INSERT INTO products (
             woo_id, sku, name, normalized_name, slug, type, status, main_location,
             base_price, compare_at_price, weight_kg, weight_grams,
             short_description, description, images, is_featured
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'GENEVA', $8, $9, $10, $11, $12, $13, $14::jsonb, $15)
           RETURNING id, slug, sku, woo_id, name, normalized_name`,
          [
            wooId || null,
            sku || null,
            name,
            normName,
            uniqueSlug,
            type === 'variable' ? 'variable' : 'simple',
            status,
            regPrice,
            salePrice,
            weightKg,
            weightGrams,
            shortDesc,
            fullDesc,
            JSON.stringify(imagesList),
            isFeatured
          ]
        );
        insertedParents++;
        const newRow = insertRes.rows[0];
        productId = newRow.id;
        if (wooId) {
          productByWooId.set(wooId, newRow);
          dbProductMapByWooId.set(wooId, newRow);
        }
        if (sku) {
          productBySku.set(sku, newRow);
          dbProductMapBySku.set(sku, newRow);
        }
        productByNormName.set(normName, newRow);
        dbProductMapByNormName.set(normName, newRow);
      }

      // Link categories
      const catField = (r[col['Catégories']] || '').trim();
      if (catField && productId) {
        await client.query(`DELETE FROM product_categories WHERE product_id = $1`, [productId]);
        for (const catName of catField.split(',').map(s => s.trim().toLowerCase())) {
          const catId = dbCategoryIds.get(catName);
          if (catId) {
            await client.query(
              `INSERT INTO product_categories (product_id, category_id)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [productId, catId]
            );
          }
        }
      }

      // Link tags
      const tagField = (r[col['Étiquettes']] || '').trim();
      if (tagField && productId) {
        await client.query(`DELETE FROM product_tags WHERE product_id = $1`, [productId]);
        for (const tagName of tagField.split(',').map(s => s.trim().toLowerCase())) {
          const tagId = dbTagIds.get(tagName);
          if (tagId) {
            await client.query(
              `INSERT INTO product_tags (product_id, tag_id)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [productId, tagId]
            );
          }
        }
      }

      // Stock for simple products
      if (type === 'simple' && productId) {
        // Geneva stock (active)
        await client.query(
          `INSERT INTO product_stock (product_id, variant_id, origin_id, quantity, is_active)
           VALUES ($1, NULL, 'GENEVA', $2, true)
           ON CONFLICT (product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid), origin_id)
           DO UPDATE SET quantity = EXCLUDED.quantity, is_active = true, updated_at = NOW()`,
          [productId, stockGeneva]
        );
        // Portugal stock (inactive by default for CSV Geneva stock)
        await client.query(
          `INSERT INTO product_stock (product_id, variant_id, origin_id, quantity, is_active)
           VALUES ($1, NULL, 'PORTUGAL', 0, false)
           ON CONFLICT (product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid), origin_id)
           DO UPDATE SET updated_at = NOW()`,
          [productId]
        );
      }
    }

    console.log(`Parent products processed: ${insertedParents} inserted, ${updatedParents} updated.`);

    // ----------------------------------------------------
    // STEP 4: Process and Attach Variations
    // ----------------------------------------------------
    console.log('\n--- Processing Product Variations ---');
    let insertedVariants = 0;
    let updatedVariants = 0;
    const parentStockSum = new Map<string, number>(); // productId -> total stock geneva

    for (const v of variationRows) {
      const parentRef = (v[col['Parent']] || '').trim();
      let parentObj = null;

      if (parentRef.startsWith('id:')) {
        const id = parentRef.replace('id:', '').trim();
        parentObj = productByWooId.get(id);
      } else if (productByWooId.has(parentRef)) {
        parentObj = productByWooId.get(parentRef);
      } else if (productBySku.has(parentRef)) {
        parentObj = productBySku.get(parentRef);
      }

      if (!parentObj) {
        skippedList.push({
          name: v[col['Nom']],
          sku: v[col['UGS']],
          reason: `Parent reference not found: "${parentRef}"`
        });
        continue;
      }

      const parentId = parentObj.id;
      const vWooId = (v[col['ID']] || '').trim();
      const vSku = (v[col['UGS']] || '').trim();
      const vName = (v[col['Nom']] || '').trim();
      const vStock = parseInt(v[col['Stock']] || '0', 10) || 0;
      const vPrice = parseFloat(v[col['Tarif régulier']] || '0') || parentObj.base_price || 0;
      const vComparePrice = parseFloat(v[col['Tarif promo']] || '0') || null;
      const vWeightKg = parseFloat(v[col['Poids (kg)']] || '0') || 0;
      const vWeightGrams = Math.round(vWeightKg * 1000);

      // Dedicated flavor image
      const rawImgs = (v[col['Images']] || '').split(',').map(s => s.trim()).filter(Boolean);
      const vImageUrl = rawImgs[0] || (parentObj.images && parentObj.images[0]?.src) || null;

      // Extract flavor attribute
      let attrName = 'flavor';
      let attrVal = '';

      // Check attribute columns 1, 2, 3
      const a1Name = (v[col['Nom de l’attribut 1']] || '').trim();
      const a1Val = (v[col['Valeur(s) de l’attribut 1']] || '').trim();
      const a2Name = (v[col['Nom de l’attribut 2']] || '').trim();
      const a2Val = (v[col['Valeur(s) de l’attribut 2']] || '').trim();

      if (a1Val) {
        attrVal = a1Val;
        if (a1Name) attrName = a1Name.toLowerCase();
        if (a2Val) {
          attrVal += ` (${a2Val})`;
        }
      } else if (vName.includes(' - ')) {
        attrVal = vName.split(' - ').slice(1).join(' - ').trim();
      } else {
        attrVal = 'Standard';
      }

      // Check if variant already exists
      let existingVariant = null;
      if (vSku) {
        const vChk = await client.query(`SELECT id FROM product_variants WHERE sku = $1`, [vSku]);
        if (vChk.rows.length > 0) existingVariant = vChk.rows[0];
      }
      if (!existingVariant && vWooId) {
        const vChk = await client.query(`SELECT id FROM product_variants WHERE woo_id = $1`, [vWooId]);
        if (vChk.rows.length > 0) existingVariant = vChk.rows[0];
      }
      if (!existingVariant) {
        const vChk = await client.query(
          `SELECT id FROM product_variants WHERE product_id = $1 AND attribute_value = $2`,
          [parentId, attrVal]
        );
        if (vChk.rows.length > 0) existingVariant = vChk.rows[0];
      }

      let variantId = null;

      if (existingVariant) {
        const upRes = await client.query(
          `UPDATE product_variants
           SET woo_id = COALESCE(NULLIF($1, ''), woo_id),
               sku = COALESCE(NULLIF($2, ''), sku),
               attribute_name = $3,
               attribute_value = $4,
               price = $5,
               compare_at_price = $6,
               image_url = $7,
               stock_geneva = $8,
               weight_grams = $9,
               updated_at = NOW()
           WHERE id = $10
           RETURNING id`,
          [
            vWooId || null,
            vSku || null,
            attrName,
            attrVal,
            vPrice,
            vComparePrice,
            vImageUrl,
            vStock,
            vWeightGrams,
            existingVariant.id
          ]
        );
        variantId = upRes.rows[0].id;
        updatedVariants++;
      } else {
        const insRes = await client.query(
          `INSERT INTO product_variants (
             product_id, woo_id, sku, attribute_name, attribute_value,
             price, compare_at_price, image_url, stock_geneva, stock_portugal, weight_grams
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10)
           RETURNING id`,
          [
            parentId,
            vWooId || null,
            vSku || null,
            attrName,
            attrVal,
            vPrice,
            vComparePrice,
            vImageUrl,
            vStock,
            vWeightGrams
          ]
        );
        variantId = insRes.rows[0].id;
        insertedVariants++;
      }

      // Add to parent stock sum
      parentStockSum.set(parentId, (parentStockSum.get(parentId) || 0) + vStock);

      // Insert/update product_stock for this variant
      if (variantId) {
        // Geneva (active)
        await client.query(
          `INSERT INTO product_stock (product_id, variant_id, origin_id, quantity, is_active)
           VALUES ($1, $2, 'GENEVA', $3, true)
           ON CONFLICT (product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid), origin_id)
           DO UPDATE SET quantity = EXCLUDED.quantity, is_active = true, updated_at = NOW()`,
          [parentId, variantId, vStock]
        );
        // Portugal (inactive by default for CSV Geneva stock)
        await client.query(
          `INSERT INTO product_stock (product_id, variant_id, origin_id, quantity, is_active)
           VALUES ($1, $2, 'PORTUGAL', 0, false)
           ON CONFLICT (product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid), origin_id)
           DO UPDATE SET updated_at = NOW()`,
          [parentId, variantId]
        );
      }
    }

    console.log(`Variants processed: ${insertedVariants} inserted, ${updatedVariants} updated.`);

    // Update parent variable product overall stock
    for (const [pId, totalStock] of parentStockSum.entries()) {
      await client.query(
        `INSERT INTO product_stock (product_id, variant_id, origin_id, quantity, is_active)
         VALUES ($1, NULL, 'GENEVA', $2, true)
         ON CONFLICT (product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid), origin_id)
         DO UPDATE SET quantity = EXCLUDED.quantity, is_active = true, updated_at = NOW()`,
        [pId, totalStock]
      );
      await client.query(
        `INSERT INTO product_stock (product_id, variant_id, origin_id, quantity, is_active)
         VALUES ($1, NULL, 'PORTUGAL', 0, false)
         ON CONFLICT (product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid), origin_id)
         DO UPDATE SET updated_at = NOW()`,
        [pId]
      );
    }

    // ----------------------------------------------------
    // STEP 5: Audit Log entry
    // ----------------------------------------------------
    await client.query(
      `INSERT INTO product_audit_log (action, user_id, new_values)
       VALUES ('import', 'import-woocommerce-script', $1::jsonb)`,
      [
        JSON.stringify({
          source: CSV_PATH,
          parentRows: parentRows.length,
          variationRows: variationRows.length,
          insertedParents,
          updatedParents,
          insertedVariants,
          updatedVariants,
          timestamp: new Date().toISOString()
        })
      ]
    );

    // ----------------------------------------------------
    // STEP 6: Duplicate and Integrity Checks Report
    // ----------------------------------------------------
    console.log('\n====================================================');
    console.log('            IMPORT INTEGRITY REPORT                 ');
    console.log('====================================================');

    const dupSkuRes = await client.query(`
      SELECT sku, count(*) 
      FROM products 
      WHERE sku IS NOT NULL AND sku <> '' 
      GROUP BY sku 
      HAVING count(*) > 1
    `);
    console.log(`Duplicate product SKUs in DB: ${dupSkuRes.rows.length}`);
    if (dupSkuRes.rows.length > 0) {
      console.error('Duplicates detected:', dupSkuRes.rows);
    }

    const dupNameRes = await client.query(`
      SELECT normalized_name, count(*) 
      FROM products 
      GROUP BY normalized_name 
      HAVING count(*) > 1
    `);
    console.log(`Duplicate normalized product names in DB: ${dupNameRes.rows.length}`);
    if (dupNameRes.rows.length > 0) {
      console.warn('Duplicate names:', dupNameRes.rows);
    }

    const totalProductsCount = await client.query(`SELECT count(*) FROM products`);
    const totalVariantsCount = await client.query(`SELECT count(*) FROM product_variants`);
    const publishedCount = await client.query(`SELECT count(*) FROM products WHERE status = 'published' AND deleted_at IS NULL`);
    const draftCount = await client.query(`SELECT count(*) FROM products WHERE status = 'draft'`);

    console.log(`Total products in DB: ${totalProductsCount.rows[0].count}`);
    console.log(`Total variants in DB: ${totalVariantsCount.rows[0].count}`);
    console.log(`Published products count: ${publishedCount.rows[0].count}`);
    console.log(`Draft products count: ${draftCount.rows[0].count}`);
    console.log(`Merged / Updated rows: ${mergedList.length}`);
    console.log(`Skipped rows: ${skippedList.length}`);
    if (skippedList.length > 0) {
      console.log('Skipped details:', skippedList);
    }

    console.log('\n✅ Import completed successfully!\n');
    return {
      success: true,
      totalProducts: parseInt(totalProductsCount.rows[0].count, 10),
      totalVariants: parseInt(totalVariantsCount.rows[0].count, 10),
      published: parseInt(publishedCount.rows[0].count, 10),
      draft: parseInt(draftCount.rows[0].count, 10),
      duplicateSkus: dupSkuRes.rows.length,
      duplicateNames: dupNameRes.rows.length,
      skipped: skippedList
    };
  } finally {
    await client.end();
  }
}

// Allow direct CLI execution
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('import-woocommerce')) {
  importWooCommerce().catch(err => {
    console.error('Fatal import error:', err);
    process.exit(1);
  });
}
