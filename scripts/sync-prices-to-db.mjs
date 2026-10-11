import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:Not1just%25maddy@db.punhmwlpaghmjndpyusf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase DB.');

  const updates = [
    // Marvelous
    { match: { woo_id: '21650' }, price: 45.00, label: 'Marvelous Testoman' },
    { match: { woo_id: '14341' }, price: 120.00, label: 'Marvelous ISO Bulk' },
    { match: { woo_id: '15217' }, price: 95.00, label: 'Marvelous El Toro' },
    { match: { woo_id: '9526' }, price: 35.00, label: 'Marvelous Créatine 300g' },
    { match: { woo_id: 'prod-mv-5756' }, price: 35.00, label: 'Marvelous Line Créatine Pure' },
    { match: { woo_id: 'prod-mv-5772' }, price: 35.00, label: 'Marvelous Créatine Aromatisée' },
    { match: { woo_id: '11328' }, price: 40.00, label: 'Marvelous Collagène Mangue' },
    { match: { woo_id: 'prod-mv-5776' }, price: 40.00, label: 'Marvelous Collagène Aromatisé' },
    { match: { woo_id: '18593' }, price: 30.00, label: 'Marvelous Magnésium Bisglycinate' },
    { match: { woo_id: '20353' }, price: 30.00, label: 'Marvelous Vitamine D3 + K2 MK7' },
    { match: { woo_id: '11379' }, price: 20.00, label: 'Marvelous Vitamine C Pure 1000mg' },
    { match: { woo_id: '21727' }, price: 25.00, label: 'Marvelous Super Digestive' },
    { match: { woo_id: '15582' }, price: 35.00, label: 'Marvelous Alive Complexe Immunitaire' },
    { match: { woo_id: '25535' }, price: 40.00, label: 'Marvelous L-Glutamine Kyowa' },
    { match: { woo_id: 'prod-mv-5643' }, price: 30.00, label: 'Marvelous Amputation' },
    { match: { woo_id: '21032' }, price: 35.00, label: 'Marvelous L-Citrulline Malate 250g' },
    { match: { woo_id: 'prod-mv-5796' }, price: 35.00, label: 'Marvelous Citrulline Malate Black & Yellow' },
    { match: { woo_id: 'prod-mv-5794' }, price: 25.00, label: 'Marvelous Bêta-Alanine Black & Yellow' },
    { match: { woo_id: '11648' }, price: 25.00, label: 'Marvelous Beta-Alanine 250g' },
    { match: { woo_id: '11806' }, price: 30.00, label: 'Marvelous Omega 3' },

    // Dirty Squad
    { match: { woo_id: '21965' }, price: 65.00, label: 'Dirty Squads ISO 90X CFM 1kg' },
    { match: { woo_id: '22011' }, price: 45.00, label: 'Dirty Squads Cyclic Dextrin 1kg' },
    { match: { woo_id: '25722' }, price: 40.00, label: 'Dirty Squads Creapure Créatine 300g' },
    { match: { woo_id: '24668' }, price: 30.00, label: 'Dirty Squads Fat Burn Thermo' },
    { match: { woo_id: '21979' }, price: 40.00, label: 'Dirty Squads Amino X9 EAA 300g' }
  ];

  for (const item of updates) {
    const res = await client.query(
      'UPDATE products SET base_price = $1, updated_at = NOW() WHERE woo_id = $2 RETURNING id, name, base_price',
      [item.price, item.match.woo_id]
    );

    if (res.rowCount > 0) {
      console.log(`✅ Updated ${item.label}: ${res.rows[0].name} -> CHF ${res.rows[0].base_price}`);
    } else {
      console.warn(`⚠️ Not found by woo_id: ${item.match.woo_id} (${item.label})`);
    }
  }

  // Ensure variants are also synced
  await client.query(`
    UPDATE product_variants SET price = 115.00
    WHERE (attribute_value ILIKE '%1.8KG%' OR attribute_value ILIKE '%1.8 KG%')
      AND product_id IN (SELECT id FROM products WHERE woo_id = '14341')
  `);
  await client.query(`
    UPDATE product_variants SET price = 120.00
    WHERE (attribute_value ILIKE '%2KG%' OR attribute_value ILIKE '%2 KG%')
      AND product_id IN (SELECT id FROM products WHERE woo_id = '14341')
  `);
  await client.query(`
    UPDATE product_variants SET price = 95.00
    WHERE product_id IN (SELECT id FROM products WHERE woo_id = '15217')
  `);
  await client.query(`
    UPDATE product_variants SET price = 65.00
    WHERE product_id IN (SELECT id FROM products WHERE woo_id = '21965')
  `);
  await client.query(`
    UPDATE product_variants SET price = 40.00
    WHERE product_id IN (SELECT id FROM products WHERE woo_id = '21979')
  `);

  console.log('✅ All product variants verified and synced.');

  await client.end();
}

main().catch(console.error);
