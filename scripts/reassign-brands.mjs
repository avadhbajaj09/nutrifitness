import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:Not1just%25maddy@db.punhmwlpaghmjndpyusf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

function getNewBrand(slug, name, images) {
  const s = (slug || '').toLowerCase();
  const n = (name || '').toLowerCase();
  const img = JSON.stringify(images || '').toLowerCase();

  // Exactly keep NutriFitness for the 2 accessories
  if (s === 'gallon-nf-2-2l' || s === 'gallon-nf-22l' || s === 'nf-gourde-600ml') {
    return 'NutriFitness';
  }
  if (s === 'le-guide-ultime-des-complements') {
    return 'NutriFitness Ebooks';
  }

  // UFO
  if (s.includes('ufo') || n.includes('ufo')) {
    return 'UFO_REMOVE';
  }
  // Dymatize
  if (s.includes('dymatiz') || n.includes('dymatiz') || s.includes('mega-mass')) {
    return 'DYMATIZE_REMOVE';
  }

  // Applied Nutrition
  if (s.includes('applied') || s.includes('abe-') || n.includes('applied')) {
    return 'Applied Nutrition';
  }

  // Optimum Nutrition
  if (s.includes('gold-standard') || s.includes('on-whey') || n.includes('optimum')) {
    return 'Optimum Nutrition';
  }

  // Ghost
  if (s.includes('ghost') || n.includes('ghost')) {
    return 'Ghost';
  }

  // Ozer
  if (s.includes('ozer') || n.includes('ozer')) {
    return 'Ozer';
  }

  // More
  if (s.includes('more-spray') || n.includes('more spray')) {
    return 'More';
  }

  // Nutry
  if (s.includes('nutry-nuts') || n.includes('nutry nuts')) {
    return 'Nutry';
  }

  // Bio Pour Tous
  if (s.includes('ginger-shot') || s.includes('go-ginger') || s.includes('bio-pour-tous') || s.includes('proteine-vegan-riz-brun-bio')) {
    return 'Bio Pour Tous';
  }

  // Shilajit
  if (s.includes('shilajit')) {
    return 'Shilajit';
  }

  // Eurovo
  if (s.includes('blanc-d-oeuf') || s.includes('eurovo')) {
    return 'Eurovo';
  }

  // Beebad
  if (s.includes('beebad')) {
    return 'Beebad';
  }

  // Powerfood
  if (s.includes('pw-creapure')) {
    return 'Powerfood';
  }

  // Dirty Squads
  if (img.includes('dirtysquads') || s.includes('dirty') || s.includes('stimx') || s.includes('infected') || s.includes('recharge') || s.includes('savior') || s.includes('stage-diuretique') || s.includes('calibration') || s.includes('hbvc') || s.includes('hype-amino') || s.includes('nox-burn') || s.includes('ds-creapure') || s.includes('hydra-electrolytes') || s.includes('fat-burn')) {
    return 'Dirty Squads';
  }

  // Marvelous
  if (img.includes('marvelous') || n.includes('marvelous') || s.includes('muscles-whey') || s.includes('one-piece-whey') || s.includes('glicerol') || s.includes('ignite-burn') || s.includes('lean-af') || s.includes('bulk-whey') || s.includes('big-lean-mass') || s.includes('glutathion-liposomale')) {
    return 'Marvelous';
  }

  // Bigman
  if (s.includes('bigman') || s.includes('furiux') || s.includes('ultimate-whey') || s.includes('aukan') || s.includes('testoman') || s.includes('testo-anabol') || s.includes('big-flapjack') || s.includes('carbo-reducer') || s.includes('iso-90x') || s.includes('iso-80x') || s.includes('anabolic-mass') || s.includes('el-toro') || s.includes('bm-eaa') || s.includes('carnitine-shot')) {
    return 'Bigman';
  }

  // Pronutrition
  return 'Pronutrition.it';
}

async function run() {
  await client.connect();
  console.log('Connected to Supabase DB');

  // 1. Mark UFO and Dymatize products as draft and deleted
  const resDel = await client.query("UPDATE products SET status = 'draft', deleted_at = NOW() WHERE brand ILIKE '%dymatiz%' OR brand ILIKE '%ufo%' OR slug ILIKE '%dymatiz%' OR slug ILIKE '%ufo%' OR name ILIKE '%dymatiz%' OR name ILIKE '%ufo%' RETURNING slug, name");
  console.log('Marked Dymatize & UFO as draft/deleted in DB:', resDel.rows);

  // 2. Query all products where brand = 'NutriFitness' or 'Nutrifit'
  const resNF = await client.query("SELECT id, slug, name, images FROM products WHERE brand ILIKE '%nutrifit%'");
  console.log('Found ' + resNF.rows.length + ' products with brand Nutrifit* in DB');

  let updatedCount = 0;
  for (const r of resNF.rows) {
    const brand = getNewBrand(r.slug, r.name, r.images);
    if (brand === 'UFO_REMOVE' || brand === 'DYMATIZE_REMOVE') {
      await client.query("UPDATE products SET status = 'draft', deleted_at = NOW() WHERE id = $1", [r.id]);
      console.log('Set to draft:', r.slug);
    } else if (brand !== 'NutriFitness') {
      await client.query("UPDATE products SET brand = $1 WHERE id = $2", [brand, r.id]);
      updatedCount++;
    } else {
      console.log('Keeping as NutriFitness:', r.slug, '(' + r.name + ')');
    }
  }
  console.log('Reassigned brand for ' + updatedCount + ' products.');

  // Verify published products under NutriFitness in DB
  const resFinal = await client.query("SELECT id, slug, name, brand, status FROM products WHERE brand ILIKE '%nutrifit%' AND status = 'published'");
  console.log('FINAL published products under NutriFitness brand in DB:');
  console.table(resFinal.rows);

  // Check any published Dymatize or UFO remaining
  const resCheck = await client.query("SELECT slug, name, brand, status FROM products WHERE (brand ILIKE '%dymatiz%' OR brand ILIKE '%ufo%' OR slug ILIKE '%dymatiz%' OR slug ILIKE '%ufo%') AND status = 'published'");
  console.log('Any published Dymatize / UFO in DB:', resCheck.rows);

  await client.end();
}

run().catch((err) => {
  console.error('Error running script:', err);
  process.exit(1);
});
