import fs from 'fs';
import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Not1just%25maddy@db.punhmwlpaghmjndpyusf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();

  const dbRes = await client.query('SELECT id, woo_id, name, slug, main_location FROM products');
  const dbBySlug = new Map();
  const dbByWoo = new Map();
  const dbById = new Map();

  for (const r of dbRes.rows) {
    if (r.slug) dbBySlug.set(r.slug.toLowerCase().trim(), r);
    if (r.woo_id) dbByWoo.set(r.woo_id.toString().trim(), r);
    if (r.id) dbById.set(r.id.toString().trim(), r);
  }

  const filePath = 'src/lib/catalog.ts';
  const content = fs.readFileSync(filePath, 'utf8');

  const prefixMarker = 'export const PRODUCTS: ProductItem[] = ';
  const pStart = content.indexOf(prefixMarker);
  if (pStart === -1) {
    throw new Error('Could not find PRODUCTS in catalog.ts');
  }

  const pEnd = content.lastIndexOf('];');
  const beforeProducts = content.slice(0, pStart + prefixMarker.length);
  const productsJsonStr = content.slice(pStart + prefixMarker.length, pEnd + 1);
  const afterProducts = content.slice(pEnd + 1);

  const products = JSON.parse(productsJsonStr);

  let updatedPortugal = 0;
  let updatedGeneva = 0;
  let updatedCommon = 0;

  for (const p of products) {
    const slugFr = p.slug?.fr ? p.slug.fr.toLowerCase().trim() : '';
    const cleanId = (p.id || '').replace(/^prod-/, '').trim();
    
    const dbItem = dbBySlug.get(slugFr) || dbByWoo.get(cleanId) || dbById.get(p.id) || dbByWoo.get(p.id);

    if (!dbItem) continue;

    const loc = dbItem.main_location;

    if (loc === 'PORTUGAL') {
      updatedPortugal++;
      p.shippingOrigin = 'portugal';
      p.locationType = 'PORTUGAL_ONLY';
      p.stockGeneva = 0;
      if (!p.stockPortugal || p.stockPortugal <= 0) p.stockPortugal = 50;

      if (Array.isArray(p.variants)) {
        for (const v of p.variants) {
          v.stockGeneva = 0;
          if (!v.stockPortugal || v.stockPortugal <= 0) v.stockPortugal = 50;
          v.inStock = true;
        }
      }

      // Update AEO text
      const prodName = typeof p.name === 'string' ? p.name : (p.name?.fr || 'Ce produit');
      p.directAnswerAeo = {
        fr: `${prodName} est un complément nutritionnel de référence expédié directement depuis nos entrepôts au Portugal avec livraison suivie en 3-5 jours ouvrables.`,
        en: `${prodName} is a premium sports nutrition supplement shipped directly from our European warehouse in Portugal with tracked delivery in 3-5 business days.`,
        de: `${prodName} ist ein hochwertiges Nahrungsergänzungsmittel, direkt aus unserem Lager in Portugal mit Sendungsverfolgung in 3-5 Werktagen geliefert.`,
        it: `${prodName} è un integratore di riferimento spedito direttamente dal nostro magazzino in Portogallo con spedizione tracciata in 3-5 giorni lavorativi.`
      };
    } else if (loc === 'COMMON') {
      updatedCommon++;
      p.shippingOrigin = 'common';
      p.locationType = 'COMMON';
      if (!p.stockGeneva || p.stockGeneva <= 0) p.stockGeneva = 25;
      if (!p.stockPortugal || p.stockPortugal <= 0) p.stockPortugal = 50;

      if (Array.isArray(p.variants)) {
        for (const v of p.variants) {
          if (!v.stockGeneva || v.stockGeneva <= 0) v.stockGeneva = 25;
          if (!v.stockPortugal || v.stockPortugal <= 0) v.stockPortugal = 50;
          v.inStock = true;
        }
      }
    } else if (loc === 'GENEVA') {
      updatedGeneva++;
      p.shippingOrigin = 'switzerland';
      p.locationType = 'GENEVA_ONLY';
      p.stockPortugal = 0;
      if (!p.stockGeneva || p.stockGeneva <= 0) p.stockGeneva = 25;

      if (Array.isArray(p.variants)) {
        for (const v of p.variants) {
          v.stockPortugal = 0;
          if (!v.stockGeneva || v.stockGeneva <= 0) v.stockGeneva = 25;
          v.inStock = true;
        }
      }
    }
  }

  console.log(`Synced catalog.ts:`);
  console.log(` - Portugal: ${updatedPortugal}`);
  console.log(` - Geneva: ${updatedGeneva}`);
  console.log(` - Common: ${updatedCommon}`);

  const newContent = beforeProducts + JSON.stringify(products, null, 2) + afterProducts;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Successfully written to src/lib/catalog.ts');

  await client.end();
}

main().catch(console.error);
