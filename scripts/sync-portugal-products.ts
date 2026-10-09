import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTS } from '../src/lib/catalog';

const supabase = createClient(
  'https://punhmwlpaghmjndpyusf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bmhtd2xwYWdobWpuZHB5dXNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTA4Mzc3NywiZXhwIjoyMTA2NjU5Nzc3fQ.zansLPHjqNj1IupmtuodY5GOgNO2QNjtFXEoym_J8Uk'
);

function toUuid(str: string) {
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16),
    '8' + hash.substring(17, 20),
    hash.substring(20, 32)
  ].join('-');
}

function normalizeName(name: string) {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

async function run() {
  console.log('Starting Portugal Products Sync...');

  // 1. Fix SANDWICH KETO BAR
  await supabase
    .from('products')
    .update({ main_location: 'GENEVA', updated_at: new Date().toISOString() })
    .ilike('name', '%SANDWICH KETO BAR%');
  console.log('Fixed SANDWICH KETO BAR to GENEVA.');

  const ptProducts = PRODUCTS.filter(p => p.shippingOrigin === 'portugal');
  console.log(`Found ${ptProducts.length} Portugal products in catalog.ts.`);

  let count = 0;
  for (const prod of ptProducts) {
    count++;
    const prodUuid = toUuid(prod.id);
    const prodName = typeof prod.name === 'object' ? prod.name.fr : prod.name;
    const prodSlug = typeof prod.slug === 'object' ? prod.slug.fr : prod.slug;
    const shortDesc = typeof prod.shortDescription === 'object' ? prod.shortDescription?.fr : (prod.shortDescription || '');
    const longDesc = typeof prod.longDescription === 'object' ? prod.longDescription?.fr : (prod.longDescription || '');
    const hasVariants = Array.isArray(prod.variants) && prod.variants.length > 0;
    const prodType = hasVariants ? 'variable' : 'simple';
    const price = Number(prod.priceChf) || 0;
    const images = Array.isArray(prod.images) ? prod.images : [];
    const brand = prod.brand || 'Marvelous';
    const sku = prod.id;

    // 1. Upsert product
    const { error: prodErr } = await supabase.from('products').upsert({
      id: prodUuid,
      woo_id: prod.id,
      sku: sku,
      normalized_name: normalizeName(prodName),
      name: prodName,
      slug: prodSlug,
      type: prodType,
      status: 'published',
      main_location: 'PORTUGAL',
      brand: brand,
      base_price: price,
      images: images,
      short_description: shortDesc,
      description: longDesc,
      is_featured: false,
      updated_at: new Date().toISOString()
    });
    if (prodErr) {
      console.error(`Error saving product ${prod.id}:`, prodErr);
      continue;
    }

    // 2. Clear old parent stock and insert new
    await supabase
      .from('product_stock')
      .delete()
      .eq('product_id', prodUuid)
      .is('variant_id', null);

    const { error: stockErr } = await supabase.from('product_stock').insert([
      {
        product_id: prodUuid,
        variant_id: null,
        origin_id: 'GENEVA',
        quantity: 0,
        is_active: false,
        updated_at: new Date().toISOString()
      },
      {
        product_id: prodUuid,
        variant_id: null,
        origin_id: 'PORTUGAL',
        quantity: 50,
        is_active: true,
        updated_at: new Date().toISOString()
      }
    ]);
    if (stockErr) console.error(`Error saving stock for ${prod.id}:`, stockErr);

    // 3. Upsert fulfillment stock
    await supabase.from('fulfillment_stock').upsert({
      product_id: prodUuid,
      product_sku: sku,
      origin_id: 'PORTUGAL',
      quantity: 50,
      updated_at: new Date().toISOString()
    }, { onConflict: 'product_id,variant_sku,origin_id' });

    // 4. Handle variants
    if (hasVariants && prod.variants) {
      for (const v of prod.variants) {
        const vUuid = toUuid(v.id || `${prod.id}-${v.sku || Math.random()}`);
        const vSku = v.sku || `${sku}-${v.id}`;
        const vFlavor = typeof v.flavorName === 'object' ? v.flavorName?.fr : (v.flavorName || '');
        const vAttrVal = vFlavor || v.format || 'Standard';
        const vPrice = Number(v.priceChf) || price;
        const vImg = v.image || (images[0]?.src ?? null);
        const vQty = Number(v.inventoryQuantity) || 50;

        await supabase.from('product_variants').upsert({
          id: vUuid,
          product_id: prodUuid,
          sku: vSku,
          attribute_name: 'Saveur / Format',
          attribute_value: vAttrVal,
          price: vPrice,
          image_url: vImg,
          stock_geneva: 0,
          stock_portugal: vQty,
          weight_grams: 0,
          updated_at: new Date().toISOString()
        });

        // Variant stock
        await supabase.from('product_stock').delete().eq('variant_id', vUuid);
        await supabase.from('product_stock').insert([
          {
            product_id: prodUuid,
            variant_id: vUuid,
            origin_id: 'GENEVA',
            quantity: 0,
            is_active: false,
            updated_at: new Date().toISOString()
          },
          {
            product_id: prodUuid,
            variant_id: vUuid,
            origin_id: 'PORTUGAL',
            quantity: vQty,
            is_active: true,
            updated_at: new Date().toISOString()
          }
        ]);
      }
    }

    if (count % 10 === 0 || count === ptProducts.length) {
      console.log(`Synced ${count} / ${ptProducts.length} Portugal products...`);
    }
  }

  console.log('Sync finished successfully!');
}

run().catch(err => {
  console.error('Fatal error in sync script:', err);
  process.exit(1);
});
