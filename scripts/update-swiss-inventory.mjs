import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || 'https://punhmwlpaghmjndpyusf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bmhtd2xwYWdobWpuZHB5dXNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTA4Mzc3NywiZXhwIjoyMTA2NjU5Nzc3fQ.zansLPHjqNj1IupmtuodY5GOgNO2QNjtFXEoym_J8Uk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('=== Starting Exact Swiss Inventory Synchronization ===');

  // Load existing products and variants
  const { data: dbProducts, error: pErr } = await supabase.from('products').select('*');
  if (pErr) throw pErr;
  const { data: dbVariants, error: vErr } = await supabase.from('product_variants').select('*');
  if (vErr) throw vErr;

  console.log(`Loaded ${dbProducts.length} products and ${dbVariants.length} variants from Supabase.`);

  // 1. Ensure missing products exist in DB (status: 'published')
  const missingProds = [
    {
      slug: 'ginger-shot-60ml',
      name: 'GINGER SHOT BIO 60ML',
      brand: 'NutriFitness',
      base_price: 3.90,
      main_location: 'GENEVA',
      type: 'variable',
      status: 'published',
      variants: [
        { attr: 'LEMON', qty: 10, price: 3.90 },
        { attr: 'ORANGE', qty: 10, price: 3.90 },
        { attr: 'POMME', qty: 10, price: 3.90 }
      ]
    },
    {
      slug: 'grenade-carb-killa-barre-60g',
      name: 'GRENADE CARB KILLA BARRE 60G',
      brand: 'Grenade',
      base_price: 4.50,
      main_location: 'GENEVA',
      type: 'variable',
      status: 'published',
      variants: [
        { attr: 'CARAMEL CHAOS', qty: 20, price: 4.50 },
        { attr: 'FUDGE BROWNIE', qty: 20, price: 4.50 }
      ]
    },
    {
      slug: 'carbo-reducer-90-caps',
      name: 'CARBO REDUCER 90 CAPS',
      brand: 'NutriFitness',
      base_price: 34.90,
      main_location: 'GENEVA',
      type: 'simple',
      status: 'published',
      qty: 3
    },
    {
      slug: 'esn-magnesium-caps-120-gelules',
      name: 'ESN MAGNESIUM CAPS 120 GÉLULES',
      brand: 'ESN',
      base_price: 26.90,
      main_location: 'GENEVA',
      type: 'simple',
      status: 'published',
      qty: 8
    }
  ];

  for (const mp of missingProds) {
    let existing = dbProducts.find(p => p.slug === mp.slug);
    if (!existing) {
      console.log(`Creating missing product: ${mp.slug}`);
      const { data: newP, error: insertErr } = await supabase.from('products').insert({
        slug: mp.slug,
        name: mp.name,
        normalized_name: mp.name.toLowerCase(),
        brand: mp.brand,
        base_price: mp.base_price,
        main_location: 'GENEVA',
        type: mp.type,
        status: 'published'
      }).select().single();
      if (insertErr) {
        console.error(`Error inserting ${mp.slug}:`, insertErr);
      } else {
        existing = newP;
        dbProducts.push(newP);
      }
    }

    if (existing && mp.variants) {
      for (const mv of mp.variants) {
        let vExist = dbVariants.find(v => v.product_id === existing.id && v.attribute_value.toUpperCase() === mv.attr.toUpperCase());
        if (!vExist) {
          console.log(`Creating variant ${mv.attr} for ${mp.slug}`);
          const { data: newV, error: vInsertErr } = await supabase.from('product_variants').insert({
            product_id: existing.id,
            attribute_name: 'goûts',
            attribute_value: mv.attr,
            price: mv.price,
            stock_geneva: mv.qty,
            stock_portugal: 0
          }).select().single();
          if (vInsertErr) console.error(`Error inserting variant:`, vInsertErr);
          else dbVariants.push(newV);
        }
      }
    }
  }

  // 2. Exact inventory mapping definition
  const now = new Date().toISOString();

  // Singles: [slug, qty]
  const singleProducts = [
    ['omega-3-120-softgels', 7],
    ['beebad-250ml', 30],
    ['calcium-120-tabs', 3], // 3 calcio
    ['caffeine-200mg-60-tabs', 8], // 8 caféine pro
    ['l-acetil-carnitine-60-caps', 1], // 1 acetil
    ['caffeine-90-caps-100mg', 8], // 8 caf bigman
    ['berberina-60-tabs', 7], // 7 berberine
    ['super-digestive-60-caps', 15], // 15 s.digestive
    ['alive-systeme-immunitaire-120-caps', 29], // 29 Alive
    ['nac-pharma-grade-60-caps', 1], // 1 nac marv.
    ['dirty-cluster-dex-1kg', 7], // 7 cyclic
    ['carbo-reducer-90-caps', 3], // 3 carbo reducer
    ['carnitine-shot-lemon-20-fiolles', 3], // 3 carni shot
    ['glutamine-bigman-kyowa-300g', 2], // 2 gluta bm
    ['l-citrulline-100-pure-250g', 10], // 10 citru
    ['beta-alanine-en-poudre-250g', 3], // 3 beta
    ['glucoart-poudre-200g', 3], // 3 Glucoart poudre
    ['marvelous-code-x-vitamine-c-haute-dose', 15], // 15 vit c marv.
    ['magnesium-bisglycinate-90-caps', 41], // 41 mag marv
    ['mk7-vitamine-d3-k2-90-caps', 30], // 30 mk7
    ['marvelous-nad-cell-rejuvenation-longevite', 6], // 6 nad
    ['glicerol-300g', 3], // 3 glycérol
    ['picolinate-de-chrome-100-caps', 6], // 6 cromo
    ['magnesium-bisglycinate-60-tabs', 19], // 19 mag pro
    ['glutathion-liposomale-30-caps', 3], // 3 glutathion
    ['vitamine-c-liposomale-60-caps', 8], // 8 vit c lipo
    ['zinc-bisglycinate-160-caps', 5], // 5 zinc b-a bis (Body Attack)
    ['marvelous-collagene-peptides-aromatise', 4], // 4 col marv
    ['fer-liposomale-90-tabs', 4], // 4 fer lipo
    ['bromelaine-60-tabs-1000mg', 6], // 6 bromelina
    ['nac-vitamine-c-d-60-tabs', 9], // 9 nac pro
    ['esn-magnesium-caps-120-gelules', 8], // 8 mag esn
    ['zma-90-caps', 14], // 14 Zma
    ['creatine-en-poudre-300g', 49], // 49 creatine
    ['marvelous-glutamine-kyowa-300g', 27], // 27 gluta marv
    ['one-piece-whey-1kg-chocolat', 1], // 1 only whey
    ['proteine-vegan-riz-brun-bio-500g', 1], // 1 brown rice
    ['savior-recuperation-950g', 6], // 6 savior f-p
    ['creatine-poudre-90g', 60], // 60 creatine bm 90g
    ['glycine-300g', 7], // 7 glycine
    ['dirty-squads-creatine-monohydrate-micronisee', 19], // 19 ds crea
    ['peptan-collagen-lemon-300g', 8], // 8 col bm
    ['applied-creatine-monohydrate-250g', 12], // 12 crea a-n
    ['piadina-keto-120g', 22], // 22 Piadina
    ['blanc-d-oeuf-liquide-pasteurise-1l', 6], // 6 eggs
    ['more-spray-cooker-200ml', 6], // 6 more spray
    ['peanut-butter-cremeux-500g', 1], // 1 Peanut 500g pro
    ['shilajit-pure-resine', 30], // Shilajit 30
    ['calibration-organe-support-120-caps', 6], // 6 calibration
    ['hbvc-cholesterol-support-90-caps', 14], // 14 HBvc
    ['testoman-120-caps', 7], // 7 testoman
    ['fat-burn-60-caps', 1], // 1 fat burn ds
    ['ashwagandha-60-caps', 10], // 10 Ashw bm
    ['ashwagandha-ksm-66-600mg', 6], // 6 Ashw pro
    ['marvelous-amputation-bruleur-graisse-hardcore', 30] // 30 amputation
  ];

  for (const [slug, qty] of singleProducts) {
    const prod = dbProducts.find(p => p.slug === slug);
    if (!prod) {
      console.error(`ERROR: Product "${slug}" not found in DB!`);
      continue;
    }

    // Update parent product_stock
    const { data: existingPs } = await supabase
      .from('product_stock')
      .select('id')
      .eq('product_id', prod.id)
      .is('variant_id', null)
      .eq('origin_id', 'GENEVA')
      .maybeSingle();

    if (existingPs) {
      await supabase
        .from('product_stock')
        .update({ quantity: qty, is_active: qty > 0, updated_at: now })
        .eq('id', existingPs.id);
    } else {
      await supabase
        .from('product_stock')
        .insert({
          product_id: prod.id,
          variant_id: null,
          origin_id: 'GENEVA',
          quantity: qty,
          is_active: qty > 0,
          reserved_quantity: 0,
          updated_at: now
        });
    }

    // Update fulfillment_stock
    await supabase
      .from('fulfillment_stock')
      .upsert({
        product_id: prod.id,
        product_sku: prod.sku || prod.woo_id || prod.id,
        variant_sku: null,
        origin_id: 'GENEVA',
        quantity: qty,
        updated_at: now
      }, { onConflict: 'product_id,variant_sku,origin_id' });

    console.log(`[Single] ${slug} -> ${qty}`);
  }

  // Multi-variant products with EXACT variant resolution
  const multiProducts = [
    {
      slug: 'abe-drink',
      targets: [
        { matcher: (v) => v.attribute_value.includes('RED & BLUE'), qty: 6 },
        { matcher: (v) => v.attribute_value.includes('BLUE LAGOON'), qty: 6 },
        { matcher: (v) => v.attribute_value.includes('CHERRY SLUSHIE'), qty: 6 }
      ]
    },
    {
      slug: 'ginger-shot-60ml',
      targets: [
        { matcher: (v) => v.attribute_value.toUpperCase() === 'LEMON', qty: 10 },
        { matcher: (v) => v.attribute_value.toUpperCase() === 'ORANGE', qty: 10 },
        { matcher: (v) => v.attribute_value.toUpperCase() === 'POMME', qty: 10 }
      ]
    },
    {
      slug: 'frutilu-hydration-sachet',
      targets: [
        { matcher: (v) => v.attribute_value.includes('COCA COLA'), qty: 31 },
        { matcher: (v) => v.attribute_value.includes('POMME VERTE'), qty: 11 },
        { matcher: (v) => v.attribute_value.includes('LEMON LIME'), qty: 7 },
        { matcher: (v) => v.attribute_value.includes('ICE TEA PÊCHE'), qty: 24 }
      ]
    },
    {
      slug: 'bm-eaa-300g',
      targets: [
        { matcher: (v) => v.attribute_value.toUpperCase() === 'ORANGE', qty: 14 },
        { matcher: (v) => v.attribute_value.toUpperCase() === 'MELON', qty: 7 },
        { matcher: (v) => v.attribute_value.toUpperCase() === 'CITRON', qty: 6 }, // lemon
        { matcher: (v) => v.attribute_value.includes('COCA COLA'), qty: 3 } // cola
      ]
    },
    {
      slug: 'iso-bulk-whey-biologique',
      targets: [
        { matcher: (v) => v.attribute_value.includes('COOKIES (2KG)'), qty: 13 },
        { matcher: (v) => v.attribute_value.includes('TOFFEE'), qty: 5 },
        { matcher: (v) => v.attribute_value.includes('CHOCOLAT (1.8KG)'), qty: 7 },
        { matcher: (v) => v.attribute_value.includes('FRAISES (2KG)'), qty: 5 }
      ]
    },
    {
      slug: 'el-toro-100-clear-beef-proteine-1-8kg',
      targets: [
        { matcher: (v) => v.attribute_value.includes('ORANGE MANGUE'), qty: 5 },
        { matcher: (v) => v.attribute_value.includes('ICE TEA PÊCHE'), qty: 9 },
        { matcher: (v) => v.attribute_value.includes('PINA COLADA'), qty: 11 }
      ]
    },
    {
      slug: 'iso-90x-cfm-1kg',
      targets: [
        { matcher: (v) => v.attribute_value === 'COOKIE&CREAM', qty: 8 },
        { matcher: (v) => v.attribute_value === 'CHOCOLAT', qty: 11 },
        { matcher: (v) => v.attribute_value === 'VANILLE', qty: 8 },
        { matcher: (v) => v.attribute_value.includes('CHOCOLAT BLANC'), qty: 13 }
      ]
    },
    {
      slug: 'furiux-gainer-3kg',
      targets: [
        { matcher: (v) => v.attribute_value.toUpperCase() === 'CHOCOLAT', qty: 15 },
        { matcher: (v) => v.attribute_value.toUpperCase() === 'VANILLE', qty: 3 }
      ]
    },
    {
      slug: 'big-lean-mass-gainer',
      targets: [
        { matcher: (v) => v.attribute_value.includes('COOKIE & CREAM'), qty: 5 },
        { matcher: (v) => v.attribute_value.includes('VANILLE'), qty: 17 },
        { matcher: (v) => v.attribute_value.includes('CHOCOLAT'), qty: 5 }
      ]
    },
    {
      slug: 'on-whey-gold-proteine-768g',
      targets: [
        { matcher: (v) => v.attribute_value.toUpperCase().includes('BANANE'), qty: 1 },
        { matcher: (v) => v.attribute_value.toUpperCase() === 'FRAISES', qty: 1 },
        { matcher: (v) => v.attribute_value.toUpperCase().includes('VANILLA'), qty: 1 },
        { matcher: (v) => v.attribute_value.toUpperCase().includes('DOUBLE RICH CHOCOLATE'), qty: 1 }
      ]
    },
    {
      slug: 'farine-de-patate-douce',
      targets: [
        { matcher: (v) => v.attribute_value === '1kg', qty: 15 },
        { matcher: (v) => v.attribute_value === '2.3kg', qty: 1 }
      ]
    },
    {
      slug: 'cornetto-croissant-keto-50g',
      targets: [
        { matcher: (v) => v.attribute_value.includes('FRUITS DES BOIS'), qty: 20 },
        { matcher: (v) => v.attribute_value.includes('CREME PATISSIÈRE'), qty: 20 },
        { matcher: (v) => v.attribute_value.includes('PISTACHE'), qty: 20 },
        { matcher: (v) => v.attribute_value === 'CHOCOLAT', qty: 20 }
      ]
    },
    {
      slug: 'farine-avoine-1kg',
      targets: [
        { matcher: (v) => v.attribute_value === 'CACAO', qty: 5 },
        { matcher: (v) => v.attribute_value.includes('NOISETTES & CHOCO'), qty: 6 },
        { matcher: (v) => v.attribute_value === 'BISCUITS CACAO', qty: 5 },
        { matcher: (v) => v.attribute_value.includes('CHOCO BLANC & COCO'), qty: 5 },
        { matcher: (v) => v.attribute_value.includes('CARAMEL SALÉ'), qty: 4 }
      ]
    },
    {
      slug: 'dirty-amino-x9-300g',
      targets: [
        { matcher: (v) => v.attribute_value === 'TUTTI-FRUTTI', qty: 5 },
        { matcher: (v) => v.attribute_value === 'LEMON', qty: 9 },
        { matcher: (v) => v.attribute_value === 'PASTÈQUE', qty: 7 }
      ]
    },
    {
      slug: 'beurre-de-cacahuete-1kg',
      targets: [
        { matcher: (v) => v.attribute_value === 'CREAMY', qty: 1 },
        { matcher: (v) => v.attribute_value === 'CRUNCHY', qty: 1 }
      ]
    },
    {
      slug: 'grenade-carb-killa-barre-60g',
      targets: [
        { matcher: (v) => v.attribute_value.includes('CARAMEL'), qty: 20 },
        { matcher: (v) => v.attribute_value.includes('FUDGE'), qty: 20 }
      ]
    },
    {
      slug: 'sandwich-keto-bar',
      targets: [
        { matcher: (v) => v.attribute_value === 'BEURRE DE CACAHUÈTE', qty: 11 },
        { matcher: (v) => v.attribute_value === 'BEURRE DE CACAHUÈTE & VANILLE', qty: 7 },
        { matcher: (v) => v.attribute_value === 'BEURRE DE CACAHUÈTE & CARAMEL', qty: 9 },
        { matcher: (v) => v.attribute_value === 'BEURRE DE CACAHUÈTE & CHOCOLAT', qty: 13 }
      ]
    },
    {
      slug: 'farine-de-riz-1-5kg',
      targets: [
        { matcher: (v) => v.attribute_value === 'CHOCOLAT NOISETTES', qty: 9 }, // avelena
        { matcher: (v) => v.attribute_value === 'CHOCOLAT BLANC', qty: 10 },
        { matcher: (v) => v.attribute_value === 'CHOCOLAT', qty: 20 }
      ]
    },
    {
      slug: 'ghost-pre-workout-645g',
      targets: [
        { matcher: (v) => v.attribute_value.includes('BLUE RASPBERRY'), qty: 4 },
        { matcher: (v) => v.attribute_value.includes('ORANGE CREAM'), qty: 1 },
        { matcher: (v) => v.attribute_value.toUpperCase().includes('PASTÈQUE'), qty: 5 }
      ]
    },
    {
      slug: 'abe-ultimate-pre-workout-315g',
      targets: [
        { matcher: (v) => v.attribute_value.includes('Candy Ice Blast'), qty: 8 },
        { matcher: (v) => v.attribute_value.includes('Love Hearts'), qty: 2 },
        { matcher: (v) => v.attribute_value.includes('Energy Drink'), qty: 5 },
        { matcher: (v) => v.attribute_value.includes('Framboises Bleues'), qty: 2 },
        { matcher: (v) => v.attribute_value.toUpperCase() === 'COLA', qty: 2 }
      ]
    },
    {
      slug: 'aukan-pre-workout-300g',
      targets: [
        { matcher: (v) => v.attribute_value === 'CASSIS', qty: 5 }, // black
        { matcher: (v) => v.attribute_value === 'CITRON', qty: 7 }, // lemon
        { matcher: (v) => v.attribute_value === 'MOJITO', qty: 8 }
      ]
    },
    {
      slug: 'stimx-300g',
      targets: [
        { matcher: (v) => v.attribute_value === 'TUTTI FRUTTI', qty: 6 },
        { matcher: (v) => v.attribute_value === 'RED COLA', qty: 1 },
        { matcher: (v) => v.attribute_value === 'LEMON', qty: 9 }
      ]
    },
    {
      slug: 'infected-pre-workout-sans-stim-500g',
      targets: [
        { matcher: (v) => v.attribute_value.includes('FRUITS PUNCH'), qty: 1 },
        { matcher: (v) => v.attribute_value.includes('PASTÈQUE'), qty: 4 }
      ]
    },
    {
      slug: 'marvelous-hydralytes-electrolytes-eau-de-coco',
      targets: [
        { matcher: (v) => v.attribute_value.includes('coconut water'), qty: 32 },
        { matcher: (v) => v.attribute_value.includes('lemon mint'), qty: 10 }
      ]
    }
  ];

  for (const mp of multiProducts) {
    const prod = dbProducts.find(p => p.slug === mp.slug);
    if (!prod) {
      console.error(`ERROR: Multi-variant product "${mp.slug}" not found in DB!`);
      continue;
    }

    const prodVariants = dbVariants.filter(v => v.product_id === prod.id);
    let totalStock = 0;

    for (const tgt of mp.targets) {
      const match = prodVariants.find(tgt.matcher);
      if (!match) {
        console.warn(`[${mp.slug}] No variant matched target! Available:`, prodVariants.map(v => v.attribute_value));
        continue;
      }

      totalStock += tgt.qty;

      // Update product_variants
      await supabase
        .from('product_variants')
        .update({ stock_geneva: tgt.qty, updated_at: now })
        .eq('id', match.id);

      // Upsert product_stock
      const { data: existingPs } = await supabase
        .from('product_stock')
        .select('id')
        .eq('product_id', prod.id)
        .eq('variant_id', match.id)
        .eq('origin_id', 'GENEVA')
        .maybeSingle();

      if (existingPs) {
        await supabase
          .from('product_stock')
          .update({ quantity: tgt.qty, is_active: tgt.qty > 0, updated_at: now })
          .eq('id', existingPs.id);
      } else {
        await supabase
          .from('product_stock')
          .insert({
            product_id: prod.id,
            variant_id: match.id,
            origin_id: 'GENEVA',
            quantity: tgt.qty,
            is_active: tgt.qty > 0,
            reserved_quantity: 0,
            updated_at: now
          });
      }

      // Upsert fulfillment_stock
      await supabase
        .from('fulfillment_stock')
        .upsert({
          product_id: prod.id,
          product_sku: prod.sku || prod.woo_id || prod.id,
          variant_sku: match.sku || null,
          origin_id: 'GENEVA',
          quantity: tgt.qty,
          updated_at: now
        }, { onConflict: 'product_id,variant_sku,origin_id' });

      console.log(`[Variant] ${mp.slug} -> "${match.attribute_value}" = ${tgt.qty}`);
    }

    // Update parent product_stock
    const { data: parentPs } = await supabase
      .from('product_stock')
      .select('id')
      .eq('product_id', prod.id)
      .is('variant_id', null)
      .eq('origin_id', 'GENEVA')
      .maybeSingle();

    if (parentPs) {
      await supabase
        .from('product_stock')
        .update({ quantity: totalStock, is_active: totalStock > 0, updated_at: now })
        .eq('id', parentPs.id);
    } else {
      await supabase
        .from('product_stock')
        .insert({
          product_id: prod.id,
          variant_id: null,
          origin_id: 'GENEVA',
          quantity: totalStock,
          is_active: totalStock > 0,
          reserved_quantity: 0,
          updated_at: now
        });
    }

    console.log(`[Parent Total] ${mp.slug} -> ${totalStock}`);
  }

  console.log('=== Supabase exact update complete! ===');

  // 3. Update src/lib/catalog.ts
  console.log('--- Updating src/lib/catalog.ts in-memory json ---');
  const catalogPath = path.resolve('src/lib/catalog.ts');
  const rawCatalog = fs.readFileSync(catalogPath, 'utf8');

  const prefixMarker = 'export const PRODUCTS: ProductItem[] = ';
  const pStart = rawCatalog.indexOf(prefixMarker);
  const pEnd = rawCatalog.lastIndexOf('];');

  const before = rawCatalog.slice(0, pStart + prefixMarker.length);
  const jsonStr = rawCatalog.slice(pStart + prefixMarker.length, pEnd + 1);
  const after = rawCatalog.slice(pEnd + 1);

  const catalogProducts = JSON.parse(jsonStr);

  // Apply single products
  for (const [slug, qty] of singleProducts) {
    const cp = catalogProducts.find(p => p.slug?.fr === slug || p.id === slug || p.id === `prod-${slug}`);
    if (cp) {
      cp.stockGeneva = qty;
      cp.inStock = qty > 0;
      if (cp.variants && cp.variants.length > 0) {
        cp.variants.forEach(v => {
          v.stockGeneva = qty;
          v.inventoryQuantity = qty;
          v.inStock = qty > 0;
        });
      }
    }
  }

  // Apply multi products
  for (const mp of multiProducts) {
    const cp = catalogProducts.find(p => p.slug?.fr === mp.slug || p.id === mp.slug || p.id === `prod-${mp.slug}`);
    if (cp && cp.variants) {
      let total = 0;
      for (const tgt of mp.targets) {
        const v = cp.variants.find(variant => {
          const name = (variant.flavorName?.fr || variant.format || '').toUpperCase();
          const sampleDbVar = { attribute_value: name };
          return tgt.matcher(sampleDbVar);
        });
        if (v) {
          v.stockGeneva = tgt.qty;
          v.inventoryQuantity = tgt.qty;
          v.inStock = tgt.qty > 0;
          total += tgt.qty;
        }
      }
      cp.stockGeneva = total;
      cp.inStock = total > 0;
    }
  }

  // Save updated catalog.ts
  const updatedCatalogContent = before + JSON.stringify(catalogProducts, null, 2) + after;
  fs.writeFileSync(catalogPath, updatedCatalogContent, 'utf8');
  console.log('=== src/lib/catalog.ts successfully updated! ===');
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
