import fs from 'fs';
import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Not1just%25maddy@db.punhmwlpaghmjndpyusf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const metadataBySlug = {
  'aukan-pre-workout-300g': {
    brand: 'NutriFitness',
    categorySlug: 'pre-workout',
    priceChf: 40.00,
    format: '300g',
    desc: 'Pré-workout stimulant haut de gamme conçu pour une congestion maximale et un focus intense.',
  },
  'ghost-pre-workout-645g': {
    brand: 'Ghost',
    categorySlug: 'pre-workout',
    priceChf: 60.00,
    format: '645g',
    desc: 'Formule légendaire pré-entraînement Ghost alliant énergie explosive, vascularisation et focus aiguisé.',
  },
  'abe-ultimate-pre-workout-315g': {
    brand: 'Applied Nutrition',
    categorySlug: 'pre-workout',
    priceChf: 40.00,
    format: '315g',
    desc: 'Booster d\'entraînement numéro 1 au Royaume-Uni avec TeaCrine, Bêta-Alanine et Citrulline Malate.',
  },
  'infected-pre-workout-sans-stim-500g': {
    brand: 'Marvelous',
    categorySlug: 'pre-workout',
    priceChf: 40.00,
    format: '500g',
    desc: 'Pré-workout ultra dosé sans stimulants pour des pumps démesurés sans caféine, idéal en soirée.',
  },
  'muffin-keto-sans-sucres-50g': {
    brand: 'Pronutrition.it',
    categorySlug: 'snacks',
    priceChf: 4.00,
    format: '50g',
    desc: 'Muffin protéiné cétogène ultra moelleux sans sucres ajoutés avec cœur fondant gourmand.',
  },
  'ufo-blast': {
    brand: 'NutriFitness',
    categorySlug: 'pre-workout',
    priceChf: 40.00,
    format: '300g',
    desc: 'Formule pré-entraînement explosive pour booster l\'énergie et la concentration pendant l\'effort.',
  },
  'ginger-shot-60ml': {
    brand: 'Go Ginger',
    categorySlug: 'sante-bien-etre',
    priceChf: 3.90,
    format: '60ml',
    desc: 'Concentré de gingembre biologique pressé à froid pour booster l\'immunité et la vitalité naturelle.',
  },
  'stimx-300g': {
    brand: 'Dirty Squads',
    categorySlug: 'pre-workout',
    priceChf: 55.00,
    format: '300g',
    desc: 'Booster pré-entraînement hardcore haute intensité avec stimulants synergiques et focus laser.',
  },
  'grenade-carb-killa-barre-60g': {
    brand: 'Grenade',
    categorySlug: 'snacks',
    priceChf: 4.50,
    format: '60g',
    desc: 'Barre protéinée croustillante triple couche primée avec plus de 20 g de protéines et moins de 2 g de sucre.',
  },
  'carbo-reducer-90-caps': {
    brand: 'NutriFitness',
    categorySlug: 'perte-de-poids',
    priceChf: 34.90,
    format: '90 gélules',
    desc: 'Formule ciblée à base d\'extraits de haricot blanc (Phaseolamine) pour modérer l\'absorption des glucides.',
  },
  'esn-magnesium-caps-120-gelules': {
    brand: 'ESN',
    categorySlug: 'vitamines-mineraux',
    priceChf: 26.90,
    format: '120 gélules',
    desc: 'Bisglycinate de magnésium chélaté haute biodisponibilité pour la fonction musculaire et le système nerveux.',
  },
  'beta-alanine-en-poudre-250g': {
    brand: 'Dirty Squads',
    categorySlug: 'acides-amines',
    priceChf: 25.00,
    format: '250g',
    desc: 'Bêta-Alanine pure micronisée pour repousser le seuil d\'acide lactique et prolonger l\'endurance musculaire.',
  }
};

async function main() {
  await client.connect();

  const slugs = Object.keys(metadataBySlug);
  const pRes = await client.query('SELECT * FROM products WHERE slug = ANY($1)', [slugs]);
  const vRes = await client.query('SELECT * FROM product_variants WHERE product_id = ANY($1)', [pRes.rows.map(p => p.id)]);

  const filePath = 'src/lib/catalog.ts';
  const content = fs.readFileSync(filePath, 'utf8');
  const prefixMarker = 'export const PRODUCTS: ProductItem[] = ';
  const pStart = content.indexOf(prefixMarker);
  const pEnd = content.lastIndexOf('];');

  const beforeProducts = content.slice(0, pStart + prefixMarker.length);
  const productsJsonStr = content.slice(pStart + prefixMarker.length, pEnd + 1);
  const afterProducts = content.slice(pEnd + 1);

  const existingProducts = JSON.parse(productsJsonStr);
  const existingSlugs = new Set(existingProducts.map(p => p.slug?.fr || p.slug));

  let addedCount = 0;

  for (const dbP of pRes.rows) {
    if (existingSlugs.has(dbP.slug)) {
      console.log(`Product "${dbP.slug}" already exists in catalog. Skipping.`);
      continue;
    }

    const meta = metadataBySlug[dbP.slug] || {};
    const variants = vRes.rows.filter(v => v.product_id === dbP.id);

    const price = Number(meta.priceChf) || Number(dbP.base_price) || 29.90;

    // Build variants
    const mappedVariants = variants.map((v, idx) => {
      const flavorVal = v.attribute_value || 'Standard';
      return {
        id: v.id || `var-${dbP.slug}-${idx}`,
        sku: v.sku || `${dbP.slug}-${idx}`,
        flavorName: {
          fr: flavorVal,
          de: flavorVal,
          it: flavorVal,
          en: flavorVal
        },
        format: meta.format || 'Standard',
        priceChf: Number(v.price) || price,
        inventoryQuantity: (Number(v.stock_geneva) || 0) + (Number(v.stock_portugal) || 0) || 50,
        inStock: true,
        stockGeneva: Number(v.stock_geneva) || 10,
        stockPortugal: Number(v.stock_portugal) || 50,
        image: v.image_url || (Array.isArray(dbP.images) && dbP.images[0]?.src) || '/images/placeholder.webp'
      };
    });

    const defaultImages = Array.isArray(dbP.images) && dbP.images.length > 0
      ? dbP.images.map(img => ({
          src: typeof img === 'string' ? img : img.src,
          alt: {
            fr: (typeof img === 'object' && img.alt) || dbP.name,
            de: (typeof img === 'object' && img.alt) || dbP.name,
            it: (typeof img === 'object' && img.alt) || dbP.name,
            en: (typeof img === 'object' && img.alt) || dbP.name
          },
          width: 800,
          height: 800
        }))
      : [{
          src: '/images/placeholder.webp',
          alt: { fr: dbP.name, de: dbP.name, it: dbP.name, en: dbP.name },
          width: 800,
          height: 800
        }];

    const newProd = {
      id: dbP.woo_id ? `prod-${dbP.woo_id}` : `prod-${dbP.id.slice(0, 8)}`,
      slug: {
        fr: dbP.slug,
        de: dbP.slug,
        it: dbP.slug,
        en: dbP.slug
      },
      name: {
        fr: dbP.name,
        de: dbP.name,
        it: dbP.name,
        en: dbP.name
      },
      brand: meta.brand || dbP.brand || 'NutriFitness',
      categorySlug: meta.categorySlug || 'pre-workout',
      taxCategory: 'food_reduced',
      priceChf: price,
      images: defaultImages,
      shortDescription: {
        fr: meta.desc || dbP.short_description || `${dbP.name} disponible chez NutriFitness Suisse.`,
        de: meta.desc || `${dbP.name} erhältlich bei NutriFitness Schweiz.`,
        it: meta.desc || `${dbP.name} disponibile da NutriFitness Svizzera.`,
        en: meta.desc || `${dbP.name} available at NutriFitness Switzerland.`
      },
      directAnswerAeo: {
        fr: `${dbP.name} est un complément nutritionnel de référence disponible en stock à Genève chez NutriFitness avec livraison 24h en Suisse.`,
        de: `${dbP.name} ist ein hochwertiges Nahrungsergänzungsmittel bei NutriFitness Genf mit 24h-Lieferung in der Schweiz.`,
        it: `${dbP.name} è un integratore di riferimento disponibile presso NutriFitness Ginevra con consegna in 24h in Svizzera.`,
        en: `${dbP.name} is a premium sports nutrition supplement in stock at NutriFitness Geneva with 24h delivery across Switzerland.`
      },
      longDescription: {
        fr: `<p>${meta.desc || dbP.name}</p><p>Certifié conforme aux normes suisses FSVO / DFI. Stocké et expédié depuis Genève.</p>`,
        de: `<p>${meta.desc || dbP.name}</p>`,
        it: `<p>${meta.desc || dbP.name}</p>`,
        en: `<p>${meta.desc || dbP.name}</p>`
      },
      usageInstructions: {
        fr: 'Consulter l\'étiquetage du produit pour les conseils d\'utilisation détaillés.',
        de: 'Bitte beachten Sie die Hinweise auf der Verpackung.',
        it: 'Consultare l\'etichetta per le istruzioni d\'uso dettagliate.',
        en: 'Refer to product packaging for detailed usage directions.'
      },
      ingredients: {
        fr: 'Voir liste complète sur l\'emballage d\'origine.',
        de: 'Siehe Inhaltsstoffe auf der Originalverpackung.',
        it: 'Vedere la lista ingredienti sulla confezione originale.',
        en: 'See full ingredients list on original packaging.'
      },
      allergens: {
        fr: 'Peut contenir des traces de lait, soja, œuf ou fruits à coque.',
        de: 'Kann Spuren von Milch, Soja, Ei oder Schalenfrüchten enthalten.',
        it: 'Può contenere tracce di latte, soia, uova o frutta a guscio.',
        en: 'May contain traces of milk, soy, egg or tree nuts.'
      },
      nutrition: {
        servingSize: meta.format || '1 portion',
        servingsPerContainer: 30,
        energyKj: 0,
        energyKcal: 0,
        fatG: 0,
        saturatedFatG: 0,
        carbsG: 0,
        sugarsG: 0,
        proteinG: 0,
        saltG: 0
      },
      variants: mappedVariants,
      shippingOrigin: 'switzerland',
      locationType: 'GENEVA_ONLY',
      stockGeneva: 25,
      stockPortugal: 0,
      inventoryQuantity: 25,
      inStock: true,
      status: 'published'
    };

    existingProducts.push(newProd);
    addedCount++;
    console.log(`Added "${dbP.name}" (${dbP.slug}) to catalog.`);
  }

  if (addedCount > 0) {
    const newContent = beforeProducts + JSON.stringify(existingProducts, null, 2) + afterProducts;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Successfully added ${addedCount} missing products to src/lib/catalog.ts! Total products: ${existingProducts.length}`);
  } else {
    console.log('No new products to add.');
  }

  await client.end();
}

main().catch(err => {
  console.error('Error adding products:', err);
  process.exit(1);
});
