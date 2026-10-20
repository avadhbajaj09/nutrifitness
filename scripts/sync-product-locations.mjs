import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Not1just%25maddy@db.punhmwlpaghmjndpyusf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  const res = await client.query('SELECT id, woo_id, name, slug, main_location FROM products');
  console.log('Total products in DB:', res.rows.length);

  // 1. Sync database stock for all PORTUGAL products
  console.log('Synchronizing database stock for PORTUGAL products...');
  const ptProds = res.rows.filter(r => r.main_location === 'PORTUGAL');
  for (const p of ptProds) {
    // Zero out Geneva stock in product_variants
    await client.query('UPDATE product_variants SET stock_geneva = 0 WHERE product_id = $1', [p.id]);
    // Ensure Portugal stock is at least 50 if zero
    await client.query('UPDATE product_variants SET stock_portugal = 50 WHERE product_id = $1 AND (stock_portugal IS NULL OR stock_portugal <= 0)', [p.id]);

    // Zero out Geneva stock in fulfillment_stock
    await client.query(
      "UPDATE fulfillment_stock SET quantity = 0 WHERE origin_id = 'GENEVA' AND (product_id = $1 OR product_id = $2 OR product_id = $3)",
      [p.id, p.woo_id || '', 'prod-' + (p.woo_id || '')]
    );

    // Deactivate Geneva in product_stock
    await client.query(
      "UPDATE product_stock SET is_active = false, quantity = 0 WHERE origin_id = 'GENEVA' AND product_id = $1",
      [p.id]
    );
    // Ensure Portugal is active in product_stock
    await client.query(
      "UPDATE product_stock SET is_active = true WHERE origin_id = 'PORTUGAL' AND product_id = $1",
      [p.id]
    );
  }
  console.log('Zeroed out Geneva stock for', ptProds.length, 'Portugal products in DB.');

  // 2. Sync database stock for all GENEVA products
  console.log('Synchronizing database stock for GENEVA products...');
  const genProds = res.rows.filter(r => r.main_location === 'GENEVA');
  for (const p of genProds) {
    await client.query('UPDATE product_variants SET stock_portugal = 0 WHERE product_id = $1', [p.id]);
    await client.query(
      "UPDATE fulfillment_stock SET quantity = 0 WHERE origin_id = 'PORTUGAL' AND (product_id = $1 OR product_id = $2 OR product_id = $3)",
      [p.id, p.woo_id || '', 'prod-' + (p.woo_id || '')]
    );
    await client.query(
      "UPDATE product_stock SET is_active = false, quantity = 0 WHERE origin_id = 'PORTUGAL' AND product_id = $1",
      [p.id]
    );
    await client.query(
      "UPDATE product_stock SET is_active = true WHERE origin_id = 'GENEVA' AND product_id = $1",
      [p.id]
    );
  }
  console.log('Zeroed out Portugal stock for', genProds.length, 'Geneva products in DB.');

  await client.end();
}

run().catch(console.error);
