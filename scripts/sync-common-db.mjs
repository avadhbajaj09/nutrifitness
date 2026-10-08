import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Not1just%25maddy@db.punhmwlpaghmjndpyusf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const wooIds = [
    '22386', '21979', '22011', '25722', '24668', '21951', '21965', '24641',
    '15582', '11648', '11269', '20464', '9526', '15217', '11389', '21724',
    '11296', '20198', '14341', '21032', '18593', '20531', '25535', '20353',
    '20727', '21419', '11806', '11328', '20370', '9378', '20358', '21727',
    '21650', '11379', '12992'
  ];

  // Update products to COMMON
  const inList = wooIds.map(x => `'${x}'`).join(',');
  const prodRes = await client.query(`
    UPDATE products 
    SET main_location = 'COMMON', updated_at = NOW() 
    WHERE woo_id IN (${inList}) 
    RETURNING id, woo_id, sku, name
  `);
  console.log(`Updated ${prodRes.rowCount} products in Supabase to main_location = 'COMMON'`);

  // Ensure stock records for both GENEVA and PORTUGAL
  for (const row of prodRes.rows) {
    await client.query(
      `DELETE FROM product_stock WHERE product_id = $1 AND origin_id IN ('GENEVA', 'PORTUGAL') AND variant_id IS NULL`,
      [row.id]
    );
    await client.query(
      `INSERT INTO product_stock (product_id, origin_id, quantity, is_active) VALUES ($1, 'GENEVA', 25, true), ($1, 'PORTUGAL', 25, true)`,
      [row.id]
    );

    // Also update fulfillment_stock
    await client.query(
      `DELETE FROM fulfillment_stock WHERE product_id = $1 AND origin_id IN ('GENEVA', 'PORTUGAL')`,
      [row.id]
    );
    await client.query(
      `INSERT INTO fulfillment_stock (product_id, product_sku, origin_id, quantity) VALUES ($1, $2, 'GENEVA', 25), ($1, $2, 'PORTUGAL', 25)`,
      [row.id, row.sku || `SKU-${row.woo_id}`]
    );
  }

  console.log(`Successfully synced both product_stock and fulfillment_stock for all 35 products!`);
  await client.end();
}

run().catch(console.error);
