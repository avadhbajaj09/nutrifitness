/**
 * Realistic, deterministic Swiss customer reviews & rating system.
 * Generates unique ratings, review counts, and category-tailored verified reviews
 * for every product in the catalog (Proteins, Creatine, Pre-workout, Ebooks, Shakers, etc.).
 */

export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  verified: boolean;
  title: string;
  comment: string;
}

export interface ProductReviewStats {
  rating: number; // e.g. 4.8 or 4.9 or 5.0
  count: number;  // e.g. 38 or 64
  stars: string;  // e.g. '★★★★★'
  reviews: CustomerReview[];
}

// Simple deterministic hash to get consistent number from string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Category-specific review pools
const REVIEWS_BY_CATEGORY: Record<string, CustomerReview[]> = {
  'guides-ebooks': [
    {
      id: 'rev-eb-1',
      author: 'Marc B.',
      location: 'Genève',
      rating: 5,
      date: 'Il y a 2 jours',
      verified: true,
      title: 'Le meilleur investissement de mon année',
      comment: 'Ce guide m\'a ouvert les yeux. Fini de jeter mon argent dans des poudres inutiles. Le chapitre sur la créatine et les vrais dosages de whey vaut à lui seul 10 fois le prix de l\'ebook. Téléchargement PDF reçu en 10 secondes.'
    },
    {
      id: 'rev-eb-2',
      author: 'Cédric V.',
      location: 'Lausanne',
      rating: 5,
      date: 'Il y a 6 jours',
      verified: true,
      title: 'Clair, sans blabla marketing',
      comment: 'Guide ultra clair, direct et sans langue de bois. Les explications sur la biodisponibilité et les pièges des mélanges propriétaires sur les étiquettes sont limpides. Indispensable pour tout pratiquant en Suisse.'
    },
    {
      id: 'rev-eb-3',
      author: 'Thomas M.',
      location: 'Nyon',
      rating: 5,
      date: 'Il y a 2 semaines',
      verified: true,
      title: 'L\'expérience de Marco se ressent à chaque page',
      comment: 'Lecture rapide et passionnante. On sent les 11 ans d\'expérience terrain en boutique à Genève. J\'ai réajusté mes prises de compléments dès le lendemain avec de super sensations.'
    },
    {
      id: 'rev-eb-4',
      author: 'Julie F.',
      location: 'Fribourg',
      rating: 5,
      date: 'Il y a 3 semaines',
      verified: true,
      title: 'Très bien structuré',
      comment: 'Format PDF très soigné, va droit au but sans jargon incompréhensible. Les protocoles selon les objectifs (sèche vs masse) sont parfaits.'
    }
  ],
  'accessoires': [
    {
      id: 'rev-acc-1',
      author: 'Damien R.',
      location: 'Genève',
      rating: 5,
      date: 'Il y a 3 jours',
      verified: true,
      title: '100% étanche et robuste',
      comment: 'Zéro fuite même secoué vigoureusement avec de la whey et des flocons d\'avoine. Plastique épais sans BPA, se lave parfaitement au lave-vaisselle sans retenir les odeurs.'
    },
    {
      id: 'rev-acc-2',
      author: 'Alexandre S.',
      location: 'Carouge',
      rating: 5,
      date: 'Il y a 1 semaine',
      verified: true,
      title: 'Grille anti-grumeaux parfaite',
      comment: 'Grille anti-grumeaux très efficace, pas un seul dépôt au fond. Bouchon vissé solide qui ne risque pas de s\'ouvrir dans le sac de sport.'
    },
    {
      id: 'rev-acc-3',
      author: 'Laurent M.',
      location: 'Lausanne',
      rating: 5,
      date: 'Il y a 2 semaines',
      verified: true,
      title: 'Design sobre et pratique',
      comment: 'Design noir mat sobre et graduations bien lisibles en ml. Acheté avec le Click & Collect en 2h aux Pâquis, accueil au top.'
    }
  ],
  'proteines': [
    {
      id: 'rev-prot-1',
      author: 'Nicolas G.',
      location: 'Genève',
      rating: 5,
      date: 'Il y a 4 jours',
      verified: true,
      title: 'Goût excellent et digestion très légère',
      comment: 'Goût chocolat savoureux sans être écoeurant, texture très fluide dans de l\'eau fraîche. Zéro lourdeur digestive grâce à la filtration CFM. Reçu le lendemain par PostPac Priority.'
    },
    {
      id: 'rev-prot-2',
      author: 'Maxime K.',
      location: 'Morges',
      rating: 5,
      date: 'Il y a 1 semaine',
      verified: true,
      title: 'Haute teneur en protéines réelles',
      comment: 'Très bonne pureté par portion. Se dissout instantanément au shaker sans le moindre grumeau. Un des meilleurs isolats du marché suisse.'
    },
    {
      id: 'rev-prot-3',
      author: 'Sarah P.',
      location: 'Lausanne',
      rating: 5,
      date: 'Il y a 2 semaines',
      verified: true,
      title: 'Parfaite en post-training',
      comment: 'Excellente récupération après mes séances intenses de crossfit. Digestion impeccable même pour moi qui suis sensible au lactose.'
    }
  ],
  'creatine': [
    {
      id: 'rev-crea-1',
      author: 'Anthony T.',
      location: 'Genève',
      rating: 5,
      date: 'Il y a 2 jours',
      verified: true,
      title: 'Pureté exceptionnelle Creapure®',
      comment: 'Creapure® d\'une pureté irréprochable. La poudre est ultra fine (200 mesh) et se dilue parfaitement dans mon jus ou mon shaker. Gain de force ressenti dès la 2ème semaine.'
    },
    {
      id: 'rev-crea-2',
      author: 'Florian B.',
      location: 'Sion',
      rating: 5,
      date: 'Il y a 1 semaine',
      verified: true,
      title: 'Zéro rétention d\'eau sous-cutanée',
      comment: 'Produit conforme aux normes suisses et pharmaceutiques. Aucune rétention d\'eau gênante, juste de la plénitude musculaire et un vrai boost d\'explosivité.'
    },
    {
      id: 'rev-crea-3',
      author: 'Lucas D.',
      location: 'Neuchâtel',
      rating: 5,
      date: 'Il y a 3 semaines',
      verified: true,
      title: 'Créatine de référence en Suisse',
      comment: 'Aucun problème d\'estomac en prenant 3 à 5 g quotidiens comme conseillé par l\'équipe NutriFitness. Super rapport qualité-prix.'
    }
  ],
  'pre-workout': [
    {
      id: 'rev-pre-1',
      author: 'Kevin R.',
      location: 'Genève',
      rating: 5,
      date: 'Il y a 3 jours',
      verified: true,
      title: 'Énergie propre, zéro crash',
      comment: 'Énergie propre et concentration chirurgicale sans palpitations ni coup de fatigue 2h après. Congestion musculaire impressionnante grâce au bon dosage en citrulline.'
    },
    {
      id: 'rev-pre-2',
      author: 'Romain C.',
      location: 'Yverdon',
      rating: 5,
      date: 'Il y a 10 jours',
      verified: true,
      title: 'Goût frais et efficacité au rendez-vous',
      comment: 'Le goût citron est très rafraîchissant. Pris 20 min avant ma séance de jambes, l\'intensité était au rendez-vous jusqu\'à la dernière série.'
    },
    {
      id: 'rev-pre-3',
      author: 'Yannick M.',
      location: 'Genève',
      rating: 5,
      date: 'Il y a 2 semaines',
      verified: true,
      title: 'Formule transparente sans mélange masqué',
      comment: 'Très bon booster bien dosé. Étiquette 100% transparente sans mélanges propriétaires cachés. Expédition en 24h par la Poste Suisse.'
    }
  ],
  'acides-amines': [
    {
      id: 'rev-aa-1',
      author: 'Sébastien V.',
      location: 'Genève',
      rating: 5,
      date: 'Il y a 5 jours',
      verified: true,
      title: 'Excellents EAA en intra-séance',
      comment: 'Consommés pendant les entraînements lourds. Récupération musculaire nettement accélérée et courbatures beaucoup moins intenses le lendemain.'
    },
    {
      id: 'rev-aa-2',
      author: 'David H.',
      location: 'Montreux',
      rating: 5,
      date: 'Il y a 2 semaines',
      verified: true,
      title: 'Bonne solubilité et arôme naturel',
      comment: 'Ratio optimal et goût fruits rouges très agréable pendant l\'effort. Permet de maintenir l\'hydratation et le rythme sans baisse d\'énergie.'
    }
  ],
  'gainers-prise-de-masse': [
    {
      id: 'rev-gainer-1',
      author: 'Adrien L.',
      location: 'Lausanne',
      rating: 5,
      date: 'Il y a 4 jours',
      verified: true,
      title: '+3 kg propres en 6 semaines',
      comment: 'Prise de 3 kg de poids de corps propre en 6 semaines en complément de mon alimentation. Digestion étonnamment légère pour un gainer riche en glucides complexes.'
    },
    {
      id: 'rev-gainer-2',
      author: 'Matteo G.',
      location: 'Genève',
      rating: 5,
      date: 'Il y a 1 semaine',
      verified: true,
      title: 'Pas d\'excès de sucre',
      comment: 'Très bon équilibre protéines/glucides sans excès de sucres simples. Idéal pour les séances intenses de prise de volume sans stocker de gras.'
    }
  ],
  'perte-de-poids': [
    {
      id: 'rev-perte-1',
      author: 'Sophie M.',
      location: 'Genève',
      rating: 5,
      date: 'Il y a 3 jours',
      verified: true,
      title: 'Super soutien en période de sèche',
      comment: 'Excellent soutien pendant ma phase de sèche. Bon effet coupe-faim naturel et énergie constante pour mes séances de cardio matinales.'
    },
    {
      id: 'rev-perte-2',
      author: 'Julien T.',
      location: 'Vevey',
      rating: 5,
      date: 'Il y a 2 semaines',
      verified: true,
      title: 'Thermogénique efficace sans nervosité',
      comment: 'Formule thermogénique efficace sans nervosité excessive. Résultats visibles sur la balance dès les premières semaines en respectant mon déficit.'
    }
  ],
  'vitamines-mineraux': [
    {
      id: 'rev-vit-1',
      author: 'Pascal D.',
      location: 'Genève',
      rating: 5,
      date: 'Il y a 5 jours',
      verified: true,
      title: 'Haute biodisponibilité et sommeil réparateur',
      comment: 'Forme chélatée de très haute assimilation. Fini les crampes nocturnes et sommeil beaucoup plus profond dès la première semaine.'
    },
    {
      id: 'rev-vit-2',
      author: 'Éric B.',
      location: 'Lausanne',
      rating: 5,
      date: 'Il y a 2 semaines',
      verified: true,
      title: 'Pureté remarquable sans arrière-goût',
      comment: 'Complément d\'une pureté remarquable sans aucun arrière-goût désagréable. Analyses qualité certifiées et traçabilité rassurante.'
    }
  ],
  'snacks-healthy-food': [
    {
      id: 'rev-snack-1',
      author: 'Jessica L.',
      location: 'Genève',
      rating: 5,
      date: 'Il y a 3 jours',
      verified: true,
      title: 'Délicieux et très peu de sucre',
      comment: 'Texture moelleuse et croustillante, bien meilleure que la majorité des barres industrielles. Moins de 2g de sucre et 20g de protéines, parfait pour le goûter de 16h.'
    },
    {
      id: 'rev-snack-2',
      author: 'Christophe B.',
      location: 'Nyon',
      rating: 5,
      date: 'Il y a 10 jours',
      verified: true,
      title: 'Coupe-faim sain et gourmand',
      comment: 'Le goût est bluffant. Ne colle pas aux dents et cale parfaitement entre deux réunions ou avant une séance de sport.'
    }
  ]
};

// Fallback pool for general products
const GENERAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-gen-1',
    author: 'Robin D.',
    location: 'Genève',
    rating: 5,
    date: 'Il y a 4 jours',
    verified: true,
    title: 'Produit de qualité irréprochable',
    comment: 'Matières premières de premier choix et excellente efficacité au quotidien. Expédition super rapide par la Poste Suisse sous 24h.'
  },
  {
    id: 'rev-gen-2',
    author: 'Stéphane L.',
    location: 'Lausanne',
    rating: 5,
    date: 'Il y a 1 semaine',
    verified: true,
    title: 'Service client et produit au top',
    comment: 'Commande reçue dès le lendemain sans frais de douane. Produit conforme aux normes suisses de sécurité alimentaire (OSAV).'
  },
  {
    id: 'rev-gen-3',
    author: 'Alain V.',
    location: 'Meyrin',
    rating: 5,
    date: 'Il y a 2 semaines',
    verified: true,
    title: 'Très satisfait de cet achat',
    comment: 'Conseillé directement à la boutique des Pâquis par l\'équipe NutriFitness. Répond exactement à mes attentes sportives.'
  }
];

/**
 * Returns deterministic rating, count, and category-tailored verified reviews
 * for any product ID and category slug.
 */
export function getProductReviewStats(productId: string | number, categorySlug?: string, slug?: string): ProductReviewStats {
  const idStr = String(productId || slug || 'prod-default');
  const cat = categorySlug || '';
  const isEbook = isEbookItem({ id: idStr, categorySlug: cat, slug });
  const isShaker = idStr === 'nf-shaker-600ml' || 
                   idStr.includes('shaker') || 
                   cat.includes('accessoire') ||
                   (slug && slug.includes('shaker'));

  // Ebooks have top rating (5.0 based on 68 reader reviews)
  if (isEbook) {
    return {
      rating: 5.0,
      count: 68,
      stars: '★★★★★',
      reviews: REVIEWS_BY_CATEGORY['guides-ebooks']
    };
  }

  // Shakers have consistent high rating (4.9 based on 94 reviews)
  if (isShaker) {
    return {
      rating: 4.9,
      count: 94,
      stars: '★★★★★',
      reviews: REVIEWS_BY_CATEGORY['accessoires']
    };
  }

  // Deterministic calculation for other products
  const hash = hashString(idStr);
  
  // Rating between 4.7 and 5.0:
  // hash % 4 gives: 0 -> 4.8, 1 -> 4.9, 2 -> 4.7, 3 -> 5.0
  const ratingVariations = [4.8, 4.9, 4.7, 5.0, 4.8, 4.9, 4.9, 4.8];
  const rating = ratingVariations[hash % ratingVariations.length];
  
  // Count between 18 and 84 reviews:
  const baseCount = 18 + (hash % 67);

  // Pick category reviews
  let categoryKey = cat;
  if (!REVIEWS_BY_CATEGORY[categoryKey]) {
    // try matching
    if (cat.includes('protein') || cat.includes('whey')) categoryKey = 'proteines';
    else if (cat.includes('creatine')) categoryKey = 'creatine';
    else if (cat.includes('workout') || cat.includes('energie')) categoryKey = 'pre-workout';
    else if (cat.includes('amine') || cat.includes('bcaa')) categoryKey = 'acides-amines';
    else if (cat.includes('gainer') || cat.includes('masse')) categoryKey = 'gainers-prise-de-masse';
    else if (cat.includes('poids') || cat.includes('seche')) categoryKey = 'perte-de-poids';
    else if (cat.includes('vitamine') || cat.includes('mineraux') || cat.includes('sante')) categoryKey = 'vitamines-mineraux';
    else if (cat.includes('snack') || cat.includes('food')) categoryKey = 'snacks-healthy-food';
  }

  const reviews = REVIEWS_BY_CATEGORY[categoryKey] || GENERAL_REVIEWS;

  return {
    rating,
    count: baseCount,
    stars: '★★★★★',
    reviews
  };
}

/**
 * Checks if a product or item is an Ebook (digital downloadable product).
 */
export function isEbookItem(productOrItem: any): boolean {
  if (!productOrItem) return false;
  const id = String(productOrItem.id || productOrItem.slug || '');
  const cat = String(productOrItem.categorySlug || '');
  const name = String(productOrItem.name?.fr || productOrItem.name || '').toLowerCase();
  const slug = String(productOrItem.slug?.fr || productOrItem.slug || '').toLowerCase();

  return (
    id === 'prod-25430' ||
    cat === 'guides-ebooks' ||
    productOrItem.isEbook === true ||
    slug === 'le-guide-ultime-des-complements' ||
    name.includes('guide ultime') ||
    name.includes('ebook') ||
    slug.includes('guide-ultime')
  );
}
