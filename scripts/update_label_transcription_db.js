const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://punhmwlpaghmjndpyusf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('Supabase service role or anon key missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const VERIFIED_PRODUCTS = [
  {
    slug: 'abe-drink',
    nutrition: {
      servingSize: '1 canette (330 ml)',
      servingsPerContainer: 1,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Niacine (Vitamine B3)', amount: '32 mg', nrv: '200%' },
        { name: 'Vitamine B12', amount: '10 µg', nrv: '400%' },
        { name: 'Citrulline', amount: '2 g' },
        { name: 'Bêta-Alanine', amount: '2 g' },
        { name: 'Bétaïne Anhydre', amount: '1 g' },
        { name: 'Caféine', amount: '200 mg' },
        { name: 'Taurine', amount: '200 mg' },
        { name: 'L-Tyrosine', amount: '200 mg' }
      ]
    },
    ingredients: 'Eau gazéifiée, bêta-alanine, malate de citrulline, bétaïne anhydre, acidifiant (acide citrique), arôme naturel, caféine anhydre, taurine, L-tyrosine, édulcorant (sucralose), nicotinamide (vitamine B3), cyanocobalamine (vitamine B12).',
    usage_instructions: 'Consommer 1 canette bien fraîche 20 à 30 minutes avant l\'entraînement ou lors d\'une baisse d\'énergie. Ne pas dépasser 1 canette par jour.',
    allergens: 'Sans allergènes majeurs. Teneur élevée en caféine (200 mg / 330 ml). Déconseillé aux enfants et aux femmes enceintes.'
  },
  {
    slug: 'abe-ultimate-pre-workout-315g',
    nutrition: {
      servingSize: '1 dosette (10.5 g)',
      servingsPerContainer: 30,
      energyKcal: 1,
      energyKj: 4,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0.319,
      activeIngredients: [
        { name: 'Citrulline Malate 2:1', amount: '4 g' },
        { name: 'Créatine Monohydrate', amount: '3.25 g' },
        { name: 'Bêta-Alanine', amount: '2 g' },
        { name: 'Taurine', amount: '200 mg' },
        { name: 'Caféine Anhydre', amount: '200 mg' },
        { name: 'TeaCrine®', amount: '100 mg' },
        { name: 'Vitamine B12', amount: '100 µg', nrv: '4000%' }
      ]
    },
    ingredients: 'Malate de citrulline 2:1, créatine monohydrate, bêta-alanine, arôme, régulateurs d\'acidité (acide citrique, bicarbonate de sodium), taurine, caféine anhydre, TeaCrine® (théacrine), édulcorant (sucralose), antiagglomérants (dioxyde de silicium, silicate de calcium), vitamine B12 (cyanocobalamine).',
    usage_instructions: 'Mélanger 1 dosette (10.5 g) dans 250 ml d\'eau fraîche 15 à 30 minutes avant l\'effort physique. Ne pas dépasser la dose journalière recommandée.',
    allergens: 'Sans allergènes majeurs. Haute teneur en caféine (200 mg par dose).'
  },
  {
    slug: 'beebad-250ml',
    nutrition: {
      servingSize: '1 canette (250 ml)',
      servingsPerContainer: 1,
      energyKcal: 110,
      energyKj: 468,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 27,
      sugarsG: 27,
      proteinG: 0.1,
      saltG: 0.05,
      activeIngredients: [
        { name: 'Miel biologique', amount: '14%' },
        { name: 'Caféine naturelle', amount: '80 mg' },
        { name: 'Extrait de Propolis', amount: 'Présent' },
        { name: 'Gelée Royale', amount: 'Présent' },
        { name: 'Extrait de Maca', amount: 'Présent' },
        { name: 'Extrait de Ginseng', amount: 'Présent' },
        { name: 'Vitamines B3, B5, B6, B12', amount: '100% VNR' }
      ]
    },
    ingredients: 'Eau minérale gazéifiée, miel biologique (14%), acidifiant (acide citrique), arôme naturel, caféine naturelle de grains de café vert, extrait de propolis, gelée royale, extrait de racine de maca, extrait de ginseng, vitamines (B3, B5, B6, B12). Zéro sucre raffiné, zéro taurine artificielle.',
    usage_instructions: 'Boisson énergisante 100% naturelle à boire très fraîche avant l\'activité physique ou lors d\'un coup de fatigue intellectuelle.',
    allergens: 'Sans allergènes majeurs. Contient des produits de la ruche (miel, propolis, gelée royale).'
  },
  {
    slug: 'aukan-pre-workout-300g',
    nutrition: {
      servingSize: '1 dosette (10 g)',
      servingsPerContainer: 30,
      energyKcal: 12,
      energyKj: 50,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0.2,
      sugarsG: 0,
      proteinG: 2.8,
      saltG: 0.02,
      activeIngredients: [
        { name: 'L-Citrulline DL-Malate 1:1', amount: '3150 mg' },
        { name: 'Bêta-Alanine', amount: '2894 mg' },
        { name: 'Complexe A-AKG', amount: '1447 mg' },
        { name: 'L-Tyrosine', amount: '500 mg' },
        { name: 'Caféine Anhydre', amount: '180 mg' },
        { name: 'Extrait sec de thé vert (40% polyphénols, 7% EGCG)', amount: '150 mg' },
        { name: 'Extrait de graines de guarana (22% caféine)', amount: '90.9 mg' },
        { name: 'Niacine (Vitamine B3)', amount: '20.05 mg', nrv: '125%' },
        { name: 'BioPerine® (Poivre noir 95% pipérine)', amount: '2.5 mg' }
      ]
    },
    ingredients: 'L-citrulline DL-malate (1:1), bêta-alanine, complexe A-AKG (L-arginine, alpha-cétoglutarate de calcium), antiagglomérant (dioxyde de silicium), L-tyrosine, caféine anhydre, acidifiant (acide citrique), extrait sec de feuilles de thé vert (Camellia sinensis) (40% polyphénols, 20% catéchines, 7% EGCG), arôme, édulcorants (sucralose, acésulfame-K), extrait de graines de guarana (Paullinia cupana) (22% caféine), nicotinamide (vitamine B3), extrait de poivre noir BioPerine® (Piper nigrum) (95% pipérine).',
    usage_instructions: 'Mélanger 10 g (1 mesure rase) dans 200 à 250 ml d\'eau fraîche 20 à 30 minutes avant votre séance d\'entraînement.',
    allergens: 'Peut contenir des traces éventuelles de lait, soja, gluten, œufs et poisson.'
  },
  {
    slug: 'bm-eaa-300g',
    nutrition: {
      servingSize: '1 mesure (20 g)',
      servingsPerContainer: 15,
      energyKcal: 72,
      energyKj: 301,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0.5,
      sugarsG: 0,
      proteinG: 17.5,
      saltG: 0.1,
      activeIngredients: [
        { name: 'BCAA totaux (2:1:1)', amount: '5000 mg' },
        { name: 'L-Leucine', amount: '2500 mg' },
        { name: 'L-Isoleucine', amount: '1250 mg' },
        { name: 'L-Valine', amount: '1250 mg' },
        { name: 'L-Lysine', amount: '2250 mg' },
        { name: 'L-Thréonine', amount: '1500 mg' },
        { name: 'L-Phénylalanine', amount: '1500 mg' },
        { name: 'L-Méthionine', amount: '750 mg' },
        { name: 'L-Histidine', amount: '750 mg' },
        { name: 'L-Tryptophane', amount: '375 mg' },
        { name: 'Potassium', amount: '300 mg', nrv: '15%' },
        { name: 'Calcium', amount: '120 mg', nrv: '15%' },
        { name: 'Magnésium', amount: '56.25 mg', nrv: '15%' },
        { name: 'Zinc', amount: '5 mg', nrv: '50%' },
        { name: 'Vitamine B6', amount: '1.4 mg', nrv: '100%' }
      ]
    },
    ingredients: 'Complexe complet d\'acides aminés essentiels (L-leucine, L-lysine, L-thréonine, L-phénylalanine, L-isoleucine, L-valine, L-méthionine, L-histidine, L-tryptophane), citrate de potassium, sels de calcium de l\'acide citrique, sels de magnésium de l\'acide citrique, arôme, acidifiant (acide citrique), édulcorants (sucralose, acésulfame-K), citrate de zinc, chlorhydrate de pyridoxine (vitamine B6).',
    usage_instructions: 'Mélanger 20 g (1 dosette) dans 400 à 500 ml d\'eau fraîche. Consommer pendant ou immédiatement après l\'entraînement.',
    allergens: 'Peut contenir des traces de lait, soja, gluten et poisson.'
  },
  {
    slug: 'farine-de-riz-15kg',
    nutrition: {
      servingSize: '100 g',
      servingsPerContainer: 15,
      energyKcal: 358,
      energyKj: 1520,
      fatG: 1.2,
      saturatedFatG: 0.3,
      carbsG: 78,
      sugarsG: 0.3,
      fiberG: 2.5,
      proteinG: 8.2,
      saltG: 0.02
    },
    ingredients: '100% Farine de riz précuite micronisée de haute digestibilité.',
    usage_instructions: 'Adapter la quantité selon les besoins énergétiques (50 g à 100 g). Mélanger avec de l\'eau chaude ou froide, du lait végétal ou directement avec votre poudre de whey pour un repas glucidique instantané sans cuisson.',
    allergens: 'Naturellement sans gluten. Peut contenir des traces de lait, soja et fruits à coque.'
  },
  {
    slug: 'glycine-300g',
    nutrition: {
      servingSize: '1 dosette (5 g)',
      servingsPerContainer: 60,
      energyKcal: 20,
      energyKj: 84,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 5,
      saltG: 0,
      activeIngredients: [
        { name: 'L-Glycine pure de grade pharmaceutique', amount: '5000 mg' }
      ]
    },
    ingredients: '100% L-Glycine pure en poudre de grade pharmaceutique.',
    usage_instructions: 'Prendre 5 g (1 dosette) par jour, dissous dans 200 à 250 ml d\'eau ou de tisane, 30 minutes avant le coucher ou après l\'entraînement.',
    allergens: 'Sans allergènes majeurs. Peut contenir des traces de lait, soja, gluten et poisson.'
  },
  {
    slug: 'zinc-bisglycinate-160-caps',
    nutrition: {
      servingSize: '1 gélule',
      servingsPerContainer: 160,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Zinc (Bisglycinate de zinc chélaté)', amount: '5.3 mg', nrv: '53%' }
      ]
    },
    ingredients: 'Agent de charge (cellulose microcristalline), agent d\'enrobage (hydroxypropylméthylcellulose), bisglycinate de zinc (chélaté Albion® TRAACS®), antiagglomérant (sels de magnésium d\'acides gras alimentaires).',
    usage_instructions: 'Prendre 1 gélule par jour avec un grand verre d\'eau au cours d\'un repas principal.',
    allergens: 'Sans gluten, sans lactose, sans gélatine animale. 100% Vegan.'
  },
  {
    slug: 'dirty-amino-x9-300g',
    nutrition: {
      servingSize: '1 dosette (10 g)',
      servingsPerContainer: 30,
      energyKcal: 36,
      energyKj: 153,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0.5,
      sugarsG: 0,
      proteinG: 8.5,
      saltG: 0.05,
      activeIngredients: [
        { name: 'L-Leucine (fermentée végétale)', amount: '2974 mg' },
        { name: 'L-Glutamine pure', amount: '1000 mg' },
        { name: 'L-Valine', amount: '698 mg' },
        { name: 'L-Isoleucine', amount: '634 mg' },
        { name: 'Eau de coco en poudre (Cocos nucifera)', amount: '500 mg' },
        { name: 'L-Lysine', amount: '444 mg' },
        { name: 'L-Thréonine', amount: '395 mg' },
        { name: 'L-Histidine', amount: '356 mg' },
        { name: 'L-Phénylalanine', amount: '356 mg' },
        { name: 'L-Méthionine', amount: '200 mg' },
        { name: 'L-Tryptophane', amount: '77 mg' }
      ]
    },
    ingredients: 'Complexe d\'acides aminés végétaux fermentés (BCAA 4:1:1 : L-leucine, L-valine, L-isoleucine), L-glutamine, poudre d\'eau de coco (Cocos nucifera), acides aminés essentiels EAA (L-lysine, L-thréonine, L-histidine, L-phénylalanine, L-méthionine, L-tryptophane), arôme naturel, acidifiant (acide malique), édulcorant (sucralose).',
    usage_instructions: 'Mélanger 10 g (1 dosette) dans 350-500 ml d\'eau fraîche. À siroter pendant l\'entraînement ou immédiatement après.',
    allergens: 'Sans allergènes majeurs. 100% Végétal.'
  },
  {
    slug: 'dirty-cluster-dex-1kg',
    nutrition: {
      servingSize: '1 dosette (20 g)',
      servingsPerContainer: 45,
      energyKcal: 76,
      energyKj: 323,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 19,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Cluster Dextrin® (Dextrine cyclique hautement ramifiée - HBCD)', amount: '20 000 mg' }
      ]
    },
    ingredients: '100% Dextrine cyclique hautement ramifiée brevetée (Cluster Dextrin®).',
    usage_instructions: 'Mélanger 20 g à 40 g dans votre boisson intra-entraînement avec de l\'eau et des acides aminés (BCAA/EAA) pour une énergie stable sans pic glycémique ni lourdeur digestive.',
    allergens: 'Sans gluten, sans lactose, sans allergènes.'
  },
  {
    slug: 'dirty-squads-creapure-creatine-pure',
    nutrition: {
      servingSize: '1 mesure (5 g)',
      servingsPerContainer: 60,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Créatine Monohydrate pure brevetée Creapure®', amount: '5000 mg' }
      ]
    },
    ingredients: '100% Créatine monohydrate micronisée de grade pharmaceutique Creapure® (origine Allemagne). Pureté certifiée > 99.95%.',
    usage_instructions: 'Prendre 1 mesure (3 g à 5 g) par jour dissoute dans 200-250 ml d\'eau ou dans votre shake post-entraînement.',
    allergens: 'Sans allergènes majeurs. 100% Vegan.'
  },
  {
    slug: 'dirty-squads-multi-v-vitamines-mineraux',
    nutrition: {
      servingSize: '1 gélule',
      servingsPerContainer: 60,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Vitamine A', amount: '783.8 µg RE', nrv: '98%' },
        { name: 'Vitamine D3', amount: '5.2 µg', nrv: '104%' },
        { name: 'Vitamine E', amount: '17.4 mg', nrv: '145%' },
        { name: 'Vitamine C', amount: '139 mg', nrv: '174%' },
        { name: 'Vitamine B1 (Thiamine)', amount: '1.4 mg', nrv: '127%' },
        { name: 'Vitamine B2 (Riboflavine)', amount: '1.6 mg', nrv: '114%' },
        { name: 'Vitamine B3 (Niacine)', amount: '18 mg', nrv: '112%' },
        { name: 'Vitamine B6', amount: '2 mg', nrv: '143%' },
        { name: 'Vitamine B9 (Acide folique)', amount: '200 µg', nrv: '100%' },
        { name: 'Vitamine B12', amount: '2.5 µg', nrv: '100%' },
        { name: 'Biotine (B8)', amount: '50 µg', nrv: '100%' },
        { name: 'Acide pantothénique (B5)', amount: '6 mg', nrv: '100%' },
        { name: 'Bromélaïne', amount: 'Présent' },
        { name: 'Papaïne', amount: 'Présent' },
        { name: 'Lactase', amount: 'Présent' }
      ]
    },
    ingredients: 'Complexe vitaminique complet, carbonate de calcium, oxyde de magnésium, extrait d\'ananas (bromélaïne), extrait de papaye (papaïne), enzyme lactase, gélule végétale (HPMC), antiagglomérant (sels de magnésium d\'acides gras).',
    usage_instructions: 'Prendre 1 gélule par jour le matin au petit-déjeuner avec un verre d\'eau.',
    allergens: 'Sans gluten, sans lactose.'
  },
  {
    slug: 'dirty-squads-omega-3-huile-poisson-pure',
    nutrition: {
      servingSize: '3 capsules',
      servingsPerContainer: 40,
      energyKcal: 27,
      energyKj: 113,
      fatG: 3,
      saturatedFatG: 0.3,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0.6,
      saltG: 0,
      activeIngredients: [
        { name: 'Huile de poisson concentrée pure', amount: '3000 mg' },
        { name: 'EPA (Acide eicosapentaénoïque)', amount: '540 mg' },
        { name: 'DHA (Acide docosahexaénoïque)', amount: '360 mg' },
        { name: 'Vitamine E (D-alpha-tocophérol)', amount: '15 mg', nrv: '125%' }
      ]
    },
    ingredients: 'Huile de poisson purifiée et standardisée sous forme naturelle de triglycérides, gélule (gélatine bovine, glycérine végétale, eau purifiée), antioxydant (D-alpha-tocophérol).',
    usage_instructions: 'Prendre 2 à 3 capsules par jour au cours des repas principaux avec un verre d\'eau.',
    allergens: 'Contient du poisson.'
  },
  {
    slug: 'dirty-squads-stimx-pre-workout-hardcore',
    nutrition: {
      servingSize: '1 dosette (10 g)',
      servingsPerContainer: 30,
      energyKcal: 14,
      energyKj: 58,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0.3,
      sugarsG: 0,
      proteinG: 3.2,
      saltG: 0.05,
      activeIngredients: [
        { name: 'Bêta-Alanine', amount: '2500 mg' },
        { name: 'L-Citrulline DL-Malate', amount: '2000 mg' },
        { name: 'Taurine', amount: '1000 mg' },
        { name: 'L-Arginine', amount: '1000 mg' },
        { name: 'L-Tyrosine', amount: '500 mg' },
        { name: 'Caféine Anhydre', amount: '380 mg' },
        { name: 'Bitartrate de Choline', amount: '300 mg' },
        { name: 'Extrait sec de Rhodiola Rosea (3% rosavines)', amount: '200 mg' },
        { name: 'Extrait de Citrus aurantium (6% synéphrine)', amount: '21 mg' },
        { name: 'BioPerine® (Poivre noir 95% pipérine)', amount: '5 mg' }
      ]
    },
    ingredients: 'Bêta-alanine, L-citrulline DL-malate, taurine, chlorhydrate de L-arginine, L-tyrosine, caféine anhydre, bitartrate de choline, extrait de racine de Rhodiola rosea (3% rosavines, 1% salidroside), extrait sec de Citrus aurantium (orange amère), arôme, acidifiant (acide citrique), édulcorants (sucralose, acésulfame-K), extrait de poivre noir BioPerine® (Piper nigrum).',
    usage_instructions: 'Mélanger 10 g (1 dosette) dans 250-300 ml d\'eau fraîche 20 à 30 minutes avant l\'entraînement. Ne pas consommer dans les 5 heures précédant le sommeil.',
    allergens: 'Haute teneur en caféine (380 mg par portion). Déconseillé aux mineurs et femmes enceintes.'
  },
  {
    slug: 'dirty-squads-testo-excess-booster-naturel',
    nutrition: {
      servingSize: '3 gélules',
      servingsPerContainer: 30,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Acide D-Aspartique (DAA)', amount: '1000 mg' },
        { name: 'Extrait de Tribulus Terrestris (90% saponines)', amount: '750 mg' },
        { name: 'Extrait sec de Fenugrec (50% saponines)', amount: '350 mg' },
        { name: 'Extrait sec de Maca 10:1', amount: '350 mg' },
        { name: 'Extrait d\'Ashwagandha KSM-66® (5% withanolides)', amount: '300 mg' },
        { name: 'Extrait de Saw Palmetto (Palmier nain)', amount: '100 mg' },
        { name: 'Zinc chélaté', amount: '15 mg', nrv: '150%' },
        { name: 'Vitamine B6', amount: '2 mg', nrv: '143%' }
      ]
    },
    ingredients: 'Acide D-aspartique, extrait de Tribulus terrestris (titré à 90% de saponines), extrait sec de graines de fenugrec (Trigonella foenum-graecum), extrait de racine de maca (Lepidium meyenii), extrait de racine d\'ashwagandha KSM-66® (Withania somnifera), extrait de palmier nain (Serenoa repens), bisglycinate de zinc, chlorhydrate de pyridoxine (vitamine B6), gélule végétale (HPMC).',
    usage_instructions: 'Prendre 3 gélules par jour réparties dans la journée : 2 gélules le matin et 1 gélule avant l\'entraînement ou le soir au coucher avec un verre d\'eau.',
    allergens: 'Sans allergènes majeurs. 100% végétal.'
  },
  {
    slug: 'fat-burn-60-caps',
    nutrition: {
      servingSize: '3 gélules',
      servingsPerContainer: 20,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Tartrate de L-Carnitine', amount: '500 mg' },
        { name: 'Extrait sec de thé vert (50% EGCG)', amount: '400 mg' },
        { name: 'Caféine anhydre', amount: '350 mg' },
        { name: 'L-Tyrosine', amount: '300 mg' },
        { name: 'Extrait de Commiphora mukul (Guggul 2.5%)', amount: '150 mg' },
        { name: 'Chitosane végétal', amount: '100 mg' },
        { name: 'Extrait sec de gingembre', amount: '50 mg' },
        { name: 'Extrait sec de café vert', amount: '50 mg' },
        { name: 'Extrait de Citrus aurantium (6% synéphrine)', amount: '21 mg' },
        { name: 'Extrait de poivre noir (pipérine 95%)', amount: '5 mg' }
      ]
    },
    ingredients: 'Tartrate de L-carnitine, extrait de thé vert (Camellia sinensis), caféine anhydre, L-tyrosine, extrait de guggul (Commiphora mukul), chitosane végétal, extrait de gingembre (Zingiber officinale), extrait de café vert (Coffea arabica), extrait d\'orange amère (Citrus aurantium), extrait de poivre noir BioPerine® (Piper nigrum), gélule végétale.',
    usage_instructions: 'Prendre 2 gélules le matin à jeun et 1 gélule 30 minutes avant votre séance d\'entraînement avec un grand verre d\'eau. Ne pas prendre en fin de journée.',
    allergens: 'Contient de la caféine (350 mg). Déconseillé aux personnes sensibles aux stimulants.'
  },
  {
    slug: 'iso-80x-grass-fed-2kg',
    nutrition: {
      servingSize: '1 dosette (30 g)',
      servingsPerContainer: 66,
      energyKcal: 115.82,
      energyKj: 484.6,
      fatG: 1.29,
      saturatedFatG: 0.81,
      carbsG: 1.65,
      sugarsG: 1.07,
      fiberG: 0.8,
      proteinG: 24,
      saltG: 0.22,
      activeIngredients: [
        { name: 'Complexe multi-enzymatique breveté DigeZyme®', amount: '33 mg' }
      ]
    },
    ingredients: 'Concentré de protéines de lactosérum (whey) issu à 100% de vaches élevées au pâturage en plein air (grass-fed) (lait), arômes, émulsifiant (lécithine de tournesol), complexe multi-enzymatique breveté DigeZyme® (alpha-amylase, protéase neutre, cellulase, lactase, lipase), édulcorant (sucralose).',
    usage_instructions: 'Mélanger 30 g (1 dosette) dans 200 à 250 ml d\'eau fraîche ou de lait végétal. Consommer le matin au réveil et immédiatement après la séance de musculation.',
    allergens: 'Contient du lait.'
  },
  {
    slug: 'alive-systeme-immunitaire-120-caps',
    nutrition: {
      servingSize: '4 gélules',
      servingsPerContainer: 30,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Mélange probiotique Megaflora 9 EVO® (9 souches vivantes)', amount: '250 mg' },
        { name: 'Extrait sec d\'aubépine (Crataegus)', amount: '150 mg' },
        { name: 'Extrait sec de chardon-marie (80% silymarine)', amount: '100 mg' },
        { name: 'N-Acétyl-L-Cystéine (NAC)', amount: '100 mg' },
        { name: 'Ashwagandha KSM-66® (5% withanolides)', amount: '100 mg' },
        { name: 'Extrait de curcuma (Curcuma longa)', amount: '100 mg' },
        { name: 'Acide Alpha-Lipoïque', amount: '50 mg' },
        { name: 'Coenzyme Q10', amount: '5 mg' },
        { name: 'Vitamine A', amount: '1000 µg RE', nrv: '125%' },
        { name: 'Vitamine D3', amount: '50 µg (2000 UI)', nrv: '1000%' },
        { name: 'Vitamine E', amount: '30 mg', nrv: '250%' },
        { name: 'Vitamine C', amount: '250 mg', nrv: '312%' },
        { name: 'Vitamine K2 MK-7', amount: '75 µg', nrv: '100%' },
        { name: 'Zinc chélaté', amount: '15 mg', nrv: '150%' },
        { name: 'Sélénium', amount: '100 µg', nrv: '182%' }
      ]
    },
    ingredients: 'Mélange probiotique Megaflora® 9 EVO, extraits secs standardisés (aubépine, chardon-marie, curcuma, ashwagandha KSM-66®), N-acétyl-cystéine, acide alpha-lipoïque, coenzyme Q10, complexe complet vitamines et minéraux chélatés, gélule végétale (HPMC).',
    usage_instructions: 'Prendre 2 gélules le matin au petit-déjeuner et 2 gélules le soir au dîner avec un grand verre d\'eau.',
    allergens: 'Sans allergènes majeurs. 100% végétal.'
  },
  {
    slug: 'calibration-organe-support-120-caps',
    nutrition: {
      servingSize: '4 gélules',
      servingsPerContainer: 30,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Extrait sec d\'Astragale racine (Astragalus)', amount: '600 mg' },
        { name: 'Extrait sec de Chardon-Marie (80% silymarine, 30% silybine)', amount: '500 mg' },
        { name: 'Extrait de Cordyceps (Cordyceps sinensis)', amount: '400 mg' },
        { name: 'N-Acétyl-L-Cystéine (NAC)', amount: '400 mg' },
        { name: 'Extrait de Saw Palmetto (Serenoa repens)', amount: '300 mg' },
        { name: 'Extrait de graine de Céleri', amount: '200 mg' },
        { name: 'Extrait sec d\'Aubépine', amount: '200 mg' }
      ]
    },
    ingredients: 'Extrait d\'astragale (Astragalus membranaceus), extrait de chardon-marie (Silybum marianum), extrait de cordyceps (Cordyceps sinensis), N-acétyl-cystéine, agent de charge (cellulose microcristalline), extrait de palmier nain (Serenoa repens), extrait de graines de céleri (Apium graveolens), extrait d\'aubépine (Crataegus pinnatifida), antiagglomérants (dioxyde de silicium, stéarate de magnésium), gélule végétale.',
    usage_instructions: 'Prendre 2 à 4 gélules par jour réparties au cours des repas avec un grand verre d\'eau.',
    allergens: 'Contient du céleri.'
  },
  {
    slug: 'marvelous-collagene-peptides-aromatise',
    nutrition: {
      servingSize: '1 dosette (12 g)',
      servingsPerContainer: 25,
      energyKcal: 43,
      energyKj: 180,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0.2,
      sugarsG: 0,
      proteinG: 10.5,
      saltG: 0.08,
      activeIngredients: [
        { name: 'Peptides de collagène bovin hydrolysé bio-actif type I & III', amount: '10 000 mg' },
        { name: 'Collagène marin hydrolysé bio-actif', amount: '500 mg' },
        { name: 'Acide Hyaluronique (Hyaluronate de sodium)', amount: '50 mg' },
        { name: 'Vitamine C (Acide L-ascorbique)', amount: '80 mg', nrv: '100%' },
        { name: 'Zinc', amount: '10 mg', nrv: '100%' }
      ]
    },
    ingredients: 'Peptides de collagène bovin hydrolysé bio-actif, régulateur d\'acidité (acide citrique), peptides de collagène de poisson marin hydrolysé, arôme naturel, acide L-ascorbique (vitamine C), hyaluronate de sodium (acide hyaluronique), oxyde de zinc, sel, édulcorants (acésulfame-K, sucralose), colorant naturel.',
    usage_instructions: 'Mélanger 12 g (1 dosette) dans 200 à 250 ml d\'eau fraîche, de thé tiède ou dans votre smoothie du matin.',
    allergens: 'Contient du poisson.'
  },
  {
    slug: 'marvelous-creatine-monohydrate-aromatisee',
    nutrition: {
      servingSize: '1 dosette (5 g)',
      servingsPerContainer: 60,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Créatine Monohydrate 100% pure micronisée 200 mesh', amount: '4500 mg' }
      ]
    },
    ingredients: '100% Créatine monohydrate micronisée pure de haute solubilité, arômes naturels, acidifiant (acide citrique), édulcorant (sucralose).',
    usage_instructions: 'Prendre 5 g (1 dosette) diluée dans 250 ml d\'eau fraîche ou dans votre shaker de récupération 30 minutes avant ou immédiatement après l\'effort physique.',
    allergens: 'Sans allergènes majeurs. 100% végétal.'
  },
  {
    slug: 'marvelous-hyper-trophy-proteine-anabolique',
    nutrition: {
      servingSize: '1 dosette (30 g)',
      servingsPerContainer: 33,
      energyKcal: 114.8,
      energyKj: 480,
      fatG: 1.16,
      saturatedFatG: 0.69,
      carbsG: 1.95,
      sugarsG: 1.2,
      fiberG: 0.5,
      proteinG: 24.2,
      saltG: 0.24,
      activeIngredients: [
        { name: 'Complexe multi-enzymatique breveté DigeZyme®', amount: '30 mg' }
      ]
    },
    ingredients: 'Matrice anabolique multi-phase de protéines de lactosérum (concentré de whey CFM, isolat de lactosérum natif WPI 90, caséine micellaire) (lait), arôme, complexe enzymatique DigeZyme®, épaississant (gomme xanthane), édulcorant (sucralose).',
    usage_instructions: 'Mélanger 30 g (1 dosette) dans 250 à 300 ml d\'eau ou de lait d\'amande. Consommer en collation ou immédiatement après la séance de musculation.',
    allergens: 'Contient du lait.'
  },
  {
    slug: 'marvelous-lean-af-cfm-whey-isolat-2kg',
    nutrition: {
      servingSize: '1 dosette (25 g)',
      servingsPerContainer: 80,
      energyKcal: 91.5,
      energyKj: 383,
      fatG: 0.2,
      saturatedFatG: 0.1,
      carbsG: 0.8,
      sugarsG: 0.3,
      proteinG: 22,
      saltG: 0.12,
      activeIngredients: [
        { name: 'Complexe enzymatique breveté DigeZyme®', amount: '25 mg' }
      ]
    },
    ingredients: 'Isolat de protéines de lactosérum 100% microfiltré à flux croisé (CFM) (lait), arôme naturel, épaississant (gomme guar), complexe multi-enzymatique breveté DigeZyme® (amylase, protéase, lactase, lipase, cellulase), édulcorant (sucralose).',
    usage_instructions: 'Mélanger 25 g à 30 g (1 dosette) dans 200 ml d\'eau fraîche. À consommer au réveil et dès la fin de l\'entraînement.',
    allergens: 'Contient du lait.'
  },
  {
    slug: 'mk7-vitamine-d3-k2-90-caps',
    nutrition: {
      servingSize: '2 gélules',
      servingsPerContainer: 45,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Vitamine D3 (Cholécalciférol naturelle)', amount: '50 µg (2000 UI)', nrv: '1000%' },
        { name: 'Vitamine K2 MK-7 (Ménaquinone-7 tout-trans naturelle)', amount: '75 µg', nrv: '100%' }
      ]
    },
    ingredients: 'Farine de riz biologique, gélule végétale (hydroxypropylméthylcellulose), ménaquinone-7 (vitamine K2 MK-7 issue de natto fermentation), cholécalciférol (vitamine D3 issue de la lanoline).',
    usage_instructions: 'Prendre 1 à 2 gélules par jour avec un grand verre d\'eau au cours d\'un repas contenant des lipides (petit-déjeuner ou déjeuner).',
    allergens: 'Sans allergènes majeurs. Sans OGM, sans gluten.'
  },
  {
    slug: 'nac-pharma-grade-60-caps',
    nutrition: {
      servingSize: '1 gélule',
      servingsPerContainer: 60,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'N-Acétyl-L-Cystéine pure de grade pharmaceutique', amount: '600 mg' }
      ]
    },
    ingredients: 'N-Acétyl-L-Cystéine (NAC), amidon de maïs, enveloppe de la gélule (hydroxypropylméthylcellulose), antiagglomérant (sels de magnésium d\'acides gras végétaux).',
    usage_instructions: 'Prendre 1 gélule par jour avec un grand verre d\'eau au cours d\'un repas.',
    allergens: 'Sans allergènes majeurs. 100% végétal.'
  },
  {
    slug: 'omega-3-120-softgels',
    nutrition: {
      servingSize: '3 capsules molles',
      servingsPerContainer: 40,
      energyKcal: 27,
      energyKj: 113,
      fatG: 3,
      saturatedFatG: 0.3,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0.6,
      saltG: 0,
      activeIngredients: [
        { name: 'Huile de poisson sauvage purifiée', amount: '3000 mg' },
        { name: 'EPA (Acide eicosapentaénoïque - 18%)', amount: '540 mg' },
        { name: 'DHA (Acide docosahexaénoïque - 12%)', amount: '360 mg' },
        { name: 'Vitamine E (D-alpha-tocophérol)', amount: '15 mg', nrv: '125%' }
      ]
    },
    ingredients: 'Huile de poisson sauvage purifiée (18% EPA et 12% DHA), antioxydant (D-alpha-tocophérol), capsule softgel (gélatine bovine, humectant glycérol végétal E-422, eau purifiée).',
    usage_instructions: 'Prendre 2 à 3 capsules par jour avec un grand verre d\'eau pendant le repas.',
    allergens: 'Contient du poisson.'
  },
  {
    slug: 'savior-recuperation-950g',
    nutrition: {
      servingSize: '1 dosette (38 g)',
      servingsPerContainer: 25,
      energyKcal: 136,
      energyKj: 570,
      fatG: 0.8,
      saturatedFatG: 0.4,
      carbsG: 10,
      sugarsG: 1.5,
      proteinG: 20,
      saltG: 0.3,
      activeIngredients: [
        { name: 'Créatine Creapure® micronisée pure', amount: '3000 mg' },
        { name: 'L-Glutamine Kyowa Quality® pure', amount: '3000 mg' },
        { name: 'BCAA totaux (2:1:1)', amount: '5000 mg' },
        { name: 'Cluster Dextrin® (Dextrine cyclique)', amount: '8000 mg' },
        { name: 'Sodium', amount: '250 mg' },
        { name: 'Potassium', amount: '200 mg' },
        { name: 'Magnésium', amount: '60 mg' }
      ]
    },
    ingredients: 'Matrice tout-en-un anabolique post-effort (isolat de lactosérum CFM, concentré de lactosérum) (lait), dextrine hautement ramifiée Cluster Dextrin®, créatine monohydrate Creapure®, L-glutamine fermentée Kyowa Quality®, complexe BCAA 2:1:1, complexe électrolytique (citrate de sodium, citrate de potassium, bisglycinate de magnésium), arômes, acidifiant (acide citrique), édulcorant (sucralose).',
    usage_instructions: 'Mélanger 38 g (1 dosette bombée) dans 350-450 ml d\'eau fraîche immédiatement après la fin de votre entraînement pour relancer l\'anabolisme.',
    allergens: 'Contient du lait.'
  },
  {
    slug: 'stage-diuretique-45-caps',
    nutrition: {
      servingSize: '3 gélules',
      servingsPerContainer: 15,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Extrait sec de Pissenlit (Taraxacum officinale)', amount: '450 mg' },
        { name: 'Extrait sec de Busserole (Arctostaphylos uva-ursi)', amount: '300 mg' },
        { name: 'Extrait sec de Prêle des champs (Equisetum arvense)', amount: '300 mg' },
        { name: 'Extrait sec de Baies de Genièvre (Juniperus communis)', amount: '150 mg' },
        { name: 'Extrait sec de Thé vert (Camellia sinensis)', amount: '150 mg' },
        { name: 'Citrate de Potassium', amount: '200 mg' },
        { name: 'Oxyde de Magnésium', amount: '100 mg' },
        { name: 'Vitamine B6', amount: '4.2 mg', nrv: '300%' }
      ]
    },
    ingredients: 'Agent de charge (cellulose microcristalline), extrait sec de racine de pissenlit (Taraxacum officinale), carbonate de calcium, extrait sec de feuilles de busserole (Arctostaphylos uva-ursi), extrait sec de parties aériennes de prêle des champs (Equisetum arvense), citrate de potassium, oxyde de magnésium, extrait sec de baies de genièvre (Juniperus communis), extrait sec de thé vert, chlorhydrate de pyridoxine (vitamine B6), gélule végétale (HPMC).',
    usage_instructions: 'Prendre 3 gélules par jour réparties dans la journée avec au moins 300 ml d\'eau par prise. Boire un minimum de 2 litres d\'eau par jour.',
    allergens: 'Sans allergènes majeurs.'
  },
  {
    slug: 'testoman-120-caps',
    nutrition: {
      servingSize: '4 gélules',
      servingsPerContainer: 30,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Acide D-Aspartique', amount: '1000 mg' },
        { name: 'Extrait sec d\'Ashwagandha KSM-66® (5:1)', amount: '300 mg' },
        { name: 'Extrait sec de Maca (10:1)', amount: '300 mg' },
        { name: 'Tartrate de L-Carnitine', amount: '250 mg' },
        { name: 'Extrait sec de Fenugrec (50% saponines)', amount: '200 mg' },
        { name: 'Extrait de Saw Palmetto (4:1)', amount: '100 mg' },
        { name: 'Magnésium', amount: '150 mg', nrv: '40%' },
        { name: 'Zinc chélaté', amount: '15 mg', nrv: '150%' },
        { name: 'Vitamine B6', amount: '2 mg', nrv: '143%' }
      ]
    },
    ingredients: 'Acide D-aspartique, gélatine bovine (gélule), extrait sec de racine d\'ashwagandha KSM-66® (Withania somnifera), extrait sec de racine de maca (Lepidium meyenii), tartrate de L-carnitine, extrait de graines de fenugrec (Trigonella foenum-graecum), oxyde de magnésium, extrait de palmier nain (Serenoa repens), bisglycinate de zinc, chlorhydrate de pyridoxine (vitamine B6).',
    usage_instructions: 'Prendre 4 gélules par jour : 2 gélules le matin au petit-déjeuner et 2 gélules le soir 45 minutes avant le coucher avec un verre d\'eau.',
    allergens: 'Sans gluten.'
  },
  {
    slug: 'vitamine-c-1000mg-90-caps',
    nutrition: {
      servingSize: '1 gélule',
      servingsPerContainer: 90,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Vitamine C pure (Acide L-ascorbique)', amount: '1000 mg', nrv: '1250%' }
      ]
    },
    ingredients: 'Acide L-ascorbique pur (vitamine C), enveloppe de la gélule végétale (hydroxypropylméthylcellulose), antiagglomérant (sels de magnésium d\'acides gras végétaux).',
    usage_instructions: 'Prendre 1 gélule par jour le matin avec un grand verre d\'eau au cours du petit-déjeuner.',
    allergens: 'Sans allergènes majeurs. 100% Vegan.'
  },
  {
    slug: 'on-whey-gold-proteine-768g',
    nutrition: {
      servingSize: '1 dosette (31 g)',
      servingsPerContainer: 24,
      energyKcal: 117,
      energyKj: 495,
      fatG: 1.4,
      saturatedFatG: 0.7,
      carbsG: 1.3,
      sugarsG: 0.7,
      fiberG: 0.7,
      proteinG: 24,
      saltG: 0.21,
      activeIngredients: [
        { name: 'BCAA naturels', amount: '5.5 g' },
        { name: 'Glutamine & Acide Glutamique', amount: '4 g' }
      ]
    },
    ingredients: 'Mélange de protéines de lactosérum (93%) (isolat de protéines de whey [lait] [émulsifiant : lécithine de tournesol], concentré de protéines de lactosérum [lait], isolat de protéines de lactosérum hydrolysées [lait]), arômes naturels, épaississant (gomme xanthane), édulcorants (sucralose, acésulfame-K).',
    usage_instructions: 'Mélanger 31 g (1 dosette rase) dans 200 à 250 ml d\'eau fraîche ou de lait écrémé. À consommer 30 à 60 minutes après votre entraînement.',
    allergens: 'Contient du lait.'
  },
  {
    slug: 'ashwagandha-60-caps',
    nutrition: {
      servingSize: '1 comprimé',
      servingsPerContainer: 60,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Extrait sec d\'Ashwagandha (Withania somnifera 2.5% withanolides)', amount: '500 mg' }
      ]
    },
    ingredients: 'Extrait sec de racine d\'ashwagandha (Withania somnifera Dunal, 2.5% withanolides), agents de charge (cellulose microcristalline, phosphate dicalcique), antiagglomérants (stéarate de magnésium végétal, dioxyde de silicium).',
    usage_instructions: 'Prendre 1 comprimé par jour avec un grand verre d\'eau, de préférence le soir ou avant une période de charge mentale ou physique.',
    allergens: 'Sans allergènes majeurs. 100% végétal.'
  },
  {
    slug: 'berberina-60-tabs',
    nutrition: {
      servingSize: '2 comprimés',
      servingsPerContainer: 30,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Extrait sec de Berberis aristata', amount: '1250 mg' },
        { name: 'dont Berbérine pure', amount: '812.5 mg' },
        { name: 'Extrait sec de Chardon-Marie (Silybum marianum)', amount: '100 mg' },
        { name: 'dont Silymarine', amount: '80 mg' }
      ]
    },
    ingredients: 'Extrait sec d\'écorce de Berberis aristata titré à 65% en berbérine, extrait sec de fruits de chardon-marie (Silybum marianum) titré à 80% de silymarine, agents de charge (cellulose microcristalline, phosphate tricalcique), antiagglomérants (sels de magnésium d\'acides gras, silice).',
    usage_instructions: 'Prendre 1 à 2 comprimés par jour 15 minutes avant les repas principaux riches en glucides avec un grand verre d\'eau.',
    allergens: 'Sans allergènes majeurs. 100% Vegan.'
  },
  {
    slug: 'bromelaine-60-tabs-1000mg',
    nutrition: {
      servingSize: '1 comprimé',
      servingsPerContainer: 60,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Bromélaïne pure haute activité 2500 GDU/g', amount: '1000 mg' }
      ]
    },
    ingredients: 'Bromélaïne gastro-protégée 2500 GDU/g extraite de tige d\'ananas (Ananas comosus), agents de charge (cellulose microcristalline, phosphate dicalcique), antiagglomérant (stéarate de magnésium végétal).',
    usage_instructions: 'Prendre 1 comprimé par jour en dehors des repas (à jeun) pour l\'action anti-inflammatoire et drainante, ou pendant les repas pour le confort digestif.',
    allergens: 'Sans allergènes majeurs. 100% végétal.'
  },
  {
    slug: 'caffeine-200mg-60-tabs',
    nutrition: {
      servingSize: '1 comprimé',
      servingsPerContainer: 60,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Caféine anhydre pure', amount: '200 mg' }
      ]
    },
    ingredients: 'Caféine anhydre de haute pureté, agents de charge (cellulose microcristalline, phosphate de calcium), antiagglomérant (sels de magnésium d\'acides gras végétaux).',
    usage_instructions: 'Prendre 1 comprimé par jour 30 minutes avant l\'effort physique ou intellectuel avec un grand verre d\'eau. Ne pas dépasser 1 comprimé par prise.',
    allergens: 'Teneur élevée en caféine (200 mg). Déconseillé aux enfants et aux femmes enceintes.'
  },
  {
    slug: 'creatine-poudre-90g',
    nutrition: {
      servingSize: '1 dosette (3 g)',
      servingsPerContainer: 30,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Créatine Monohydrate pure micronisée 200 mesh', amount: '3000 mg' }
      ]
    },
    ingredients: '100% Monohydrate de créatine pure micronisée de grade pharmaceutique sans additifs.',
    usage_instructions: 'Prendre 1 dosette (3 g) par jour dissoute dans 250 ml d\'eau tiède ou dans votre shake après l\'entraînement.',
    allergens: 'Peut contenir des traces de lait, soja et gluten.'
  },
  {
    slug: 'fer-liposomale-90-tabs',
    nutrition: {
      servingSize: '1 gélule',
      servingsPerContainer: 90,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Fer liposomal (Lipofer®)', amount: '150 mg (dont 30 mg fer élémentaire)', nrv: '214%' },
        { name: 'Vitamine B9 liposomale (Acide folique)', amount: '400 µg', nrv: '200%' },
        { name: 'Vitamine B12 liposomale', amount: '2.5 µg', nrv: '100%' },
        { name: 'Vitamine C', amount: '80 mg', nrv: '100%' }
      ]
    },
    ingredients: 'Pyrophosphate ferrique microencapsulé dans des phospholipides de tournesol (technologie Lipofer®), acide L-ascorbique (vitamine C), acide folique liposomal (vitamine B9), méthylcobalamine liposomale (vitamine B12), gélule végétale (HPMC).',
    usage_instructions: 'Prendre 1 gélule par jour avec un verre d\'eau au cours d\'un repas. Sans goût métallique ni irritation gastrique.',
    allergens: 'Sans allergènes majeurs. 100% Vegan.'
  },
  {
    slug: 'frutilu-hydration-sachet',
    nutrition: {
      servingSize: '1 sachet (pour 500 ml)',
      servingsPerContainer: 1,
      energyKcal: 1.82,
      energyKj: 7.62,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0.15,
      activeIngredients: [
        { name: 'Vitamine C', amount: '12 mg', nrv: '15%' },
        { name: 'Potassium', amount: '50 mg' },
        { name: 'Magnésium', amount: '20 mg' },
        { name: 'Sodium', amount: '60 mg' }
      ]
    },
    ingredients: 'Complexe minéral d\'électrolytes (citrate de sodium, citrate de potassium, bisglycinate de magnésium, chlorure de sodium), acidifiant (acide citrique), arôme naturel de fruits, acide L-ascorbique (vitamine C), édulcorants (sucralose, glycosides de stéviol).',
    usage_instructions: 'Dissoudre 1 sachet dans 500 à 750 ml d\'eau fraîche. À boire pendant ou après un entraînement intense ou en période estivale.',
    allergens: 'Sans allergènes majeurs. 100% Vegan.'
  },
  {
    slug: 'glucoart-poudre-200g',
    nutrition: {
      servingSize: '1 dosette (10 g)',
      servingsPerContainer: 20,
      energyKcal: 25,
      energyKj: 105,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0.5,
      sugarsG: 0,
      proteinG: 5.5,
      saltG: 0.05,
      activeIngredients: [
        { name: 'Peptides de collagène bio-actif hydrolysé', amount: '5000 mg' },
        { name: 'Sulfate de Glucosamine 2KCl', amount: '500 mg' },
        { name: 'Sulfate de Chondroïtine sodique', amount: '250 mg' },
        { name: 'Extrait de Griffe du Diable (Harpagophytum)', amount: '250 mg' },
        { name: 'Extrait de Boswellia serrata', amount: '150 mg' },
        { name: 'Vitamine C', amount: '80 mg', nrv: '100%' },
        { name: 'Niacine (B3)', amount: '16 mg', nrv: '100%' },
        { name: 'Vitamine B6', amount: '1.4 mg', nrv: '100%' },
        { name: 'Cuivre', amount: '0.3 mg', nrv: '30%' }
      ]
    },
    ingredients: 'Peptides de collagène bovin hydrolysé bio-actif, sulfate de glucosamine 2KCl, sulfate de chondroïtine sodique, extrait de griffe du diable (Harpagophytum procumbens), extrait de boswellia (Boswellia serrata), acide L-ascorbique, nicotinamide, chlorhydrate de pyridoxine, gluconate de cuivre, arôme naturel, acidifiant (acide citrique), édulcorant (sucralose).',
    usage_instructions: 'Dissoudre 10 g (1 dosette) dans 200 ml d\'eau une fois par jour au cours d\'un repas.',
    allergens: 'Contient des dérivés de crustacés (glucosamine).'
  },
  {
    slug: 'glutathion-liposomale-30-caps',
    nutrition: {
      servingSize: '1 gélule (710 mg)',
      servingsPerContainer: 30,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'L-Glutathion réduit liposomal (Setria®)', amount: '250 mg' },
        { name: 'Coenzyme Q10 (Ubiquinone)', amount: '25 mg' },
        { name: 'Vitamine E', amount: '10 mg', nrv: '83%' }
      ]
    },
    ingredients: 'L-Glutathion réduit encapsulé dans un complexe phospholipidique de tournesol (liposomal), coenzyme Q10, acétate de D-alpha-tocophéryle (vitamine E), gélule végétale (hydroxypropylméthylcellulose), antiagglomérants (sels de magnésium d\'acides gras, silice).',
    usage_instructions: 'Prendre 1 gélule par jour le matin à jeun avec un grand verre d\'eau.',
    allergens: 'Sans allergènes majeurs. 100% Vegan.'
  },
  {
    slug: 'picolinate-de-chrome-100-caps',
    nutrition: {
      servingSize: '1 gélule',
      servingsPerContainer: 100,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Chrome (Picolinate de chrome pur)', amount: '200 µg', nrv: '500%' }
      ]
    },
    ingredients: 'Picolinate de chrome, agent de charge (cellulose microcristalline), gélule végétale (HPMC), antiagglomérant (stéarate de magnésium végétal).',
    usage_instructions: 'Prendre 1 gélule par jour avec un verre d\'eau au cours du repas principal contenant des glucides.',
    allergens: 'Sans allergènes majeurs. 100% végétal.'
  },
  {
    slug: 'puree-d-amande-650g',
    nutrition: {
      servingSize: '100 g',
      servingsPerContainer: 6.5,
      energyKcal: 612,
      energyKj: 2560,
      fatG: 52,
      saturatedFatG: 4.5,
      carbsG: 6.5,
      sugarsG: 4.2,
      fiberG: 11.5,
      proteinG: 25,
      saltG: 0.01
    },
    ingredients: '100% Amandes entières naturelles grillées issues de l\'agriculture biologique. Zéro huile ajoutée, sans huile de palme, sans sucre ajouté, sans sel.',
    usage_instructions: 'Mélanger avant utilisation car l\'huile naturelle peut remonter en surface. Délicieuse sur des tartines, dans des porridges, smoothies ou en cuisine saine.',
    allergens: 'Contient des amandes (fruits à coque). Peut contenir des traces d\'autres fruits à coque et d\'arachides.'
  },
  {
    slug: 'vitamine-c-liposomale-60-caps',
    nutrition: {
      servingSize: '2 gélules',
      servingsPerContainer: 30,
      energyKcal: 0,
      energyKj: 0,
      fatG: 0,
      saturatedFatG: 0,
      carbsG: 0,
      sugarsG: 0,
      proteinG: 0,
      saltG: 0,
      activeIngredients: [
        { name: 'Vitamine C liposomale pure (Liposhell®)', amount: '1000 mg', nrv: '1250%' }
      ]
    },
    ingredients: 'Acide L-ascorbique micro-encapsulé dans des phospholipides de tournesol (technologie liposomale Liposhell®), gélule végétale gastro-résistante (hydroxypropylméthylcellulose), antiagglomérant (stéarate de magnésium végétal).',
    usage_instructions: 'Prendre 1 à 2 gélules par jour avec un verre d\'eau le matin au réveil ou au cours d\'un repas.',
    allergens: 'Sans allergènes majeurs. 100% Vegan.'
  }
];

async function updateDatabase() {
  console.log(`Starting update for ${VERIFIED_PRODUCTS.length} verified products...`);
  let successCount = 0;
  let failCount = 0;

  for (const item of VERIFIED_PRODUCTS) {
    const { slug, nutrition, ingredients, usage_instructions, allergens } = item;

    // Fetch existing product
    const { data: prod, error: fetchErr } = await supabase
      .from('products')
      .select('id, name, slug')
      .eq('slug', slug)
      .maybeSingle();

    if (fetchErr || !prod) {
      console.warn(`[SKIP] Could not find product with slug: "${slug}"`);
      failCount++;
      continue;
    }

    const { error: updateErr } = await supabase
      .from('products')
      .update({
        nutrition,
        ingredients,
        usage_instructions,
        allergens,
        updated_at: new Date().toISOString()
      })
      .eq('id', prod.id);

    if (updateErr) {
      console.error(`[ERROR] Failed to update "${slug}" (${prod.id}):`, updateErr.message);
      failCount++;
    } else {
      console.log(`✓ Updated: [${slug}] ${prod.name}`);
      successCount++;
    }
  }

  console.log('\n========================================');
  console.log(`Batch Update Complete: ${successCount} updated successfully, ${failCount} skipped/failed.`);
}

updateDatabase();
