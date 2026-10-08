import pg from 'pg';
import { readFileSync } from 'fs';

const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:Not1just%25maddy@db.punhmwlpaghmjndpyusf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log('Connected to Supabase');
  
  const schema = readFileSync('supabase/migrations/001_fulfillment_schema.sql', 'utf8');
  await client.query(schema);
  console.log('Schema migration complete');
  
  const seed = readFileSync('supabase/migrations/002_fulfillment_seed.sql', 'utf8');
  await client.query(seed);
  console.log('Seed migration complete');

  const catalog = readFileSync('supabase/migrations/003_catalog_and_locations.sql', 'utf8');
  await client.query(catalog);
  console.log('Catalog & locations migration complete');

  const delivery = readFileSync('supabase/migrations/004_delivery_engine.sql', 'utf8');
  await client.query(delivery);
  console.log('Delivery engine migration complete');
} catch(e) {
  console.error('Migration error:', e);
} finally {
  await client.end();
}
