
import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Not1just%25maddy@db.punhmwlpaghmjndpyusf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  const broken = await client.query(`
    SELECT pv.id as variant_id, pv.sku, pv.attribute_name, pv.attribute_value, pv.image_url as old_url,
           p.id as product_id, p.name as product_name, p.images as product_images
    FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    WHERE pv.image_url LIKE '%nutrifitness.ch/wp-content%' OR pv.image_url IS NULL OR pv.image_url = ''
  `);

  console.log('Found', broken.rows.length, 'variants to fix.');

  let updated = 0;
  for (const row of broken.rows) {
    const pImgs = row.product_images || [];
    let validImg = null;
    for (const img of pImgs) {
      const src = typeof img === 'string' ? img : img.src;
      if (src && src.includes('supabase.co')) {
        validImg = src;
        break;
      }
    }

    if (validImg) {
      await client.query('UPDATE product_variants SET image_url = $1 WHERE id = $2', [
        validImg,
        row.variant_id
      ]);
      updated++;
      console.log('Fixed variant:', row.product_name, '-', row.attribute_value, '->', validImg);
    }
  }

  console.log('Variants fixed in DB:', updated);

  // Update UFO BLAST
  const placeholderUrl = 'https://punhmwlpaghmjndpyusf.supabase.co/storage/v1/object/public/product-images/images/placeholder.webp';
  const ufoRes = await client.query('UPDATE products SET images = $1 WHERE slug = $2', [
    JSON.stringify([{ src: placeholderUrl, alt: 'UFO BLAST' }]),
    'ufo-blast'
  ]);
  console.log('Updated UFO BLAST in products:', ufoRes.rowCount);

  await client.end();
}

run().catch(console.error);
