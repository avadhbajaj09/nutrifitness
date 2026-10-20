export interface BrandFaq {
  q: string;
  a: string;
}

export interface BrandInfo {
  name: string;
  displayName: string;
  slug: string;
  count: number;
  logo: string;
  featured?: boolean;
  indexable: boolean;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  relevantCategories: { name: string; href: string }[];
  relevantGuides: { title: string; href: string }[];
  faqs: BrandFaq[];
}

export const ALL_BRANDS: BrandInfo[] = [
  {
    name: 'Marvelous',
    displayName: 'Marvelous Nutrition',
    slug: 'marvelous',
    count: 25,
    logo: '/images/brands/logo-marvelous-nutrition.png',
    featured: true,
    indexable: true,
    h1: 'Marvelous Nutrition en Suisse | NutriFitness',
    metaTitle: 'Marvelous Nutrition Suisse : Protéines, Créatine & Pré-Workout',
    metaDescription: 'Achetez Marvelous Nutrition en Suisse chez NutriFitness Genève. Whey isolate, créatine 200 mesh, pré-workout et vitamines. Stock suisse, livraison 24h & Click & Collect.',
    intro: "Marvelous Nutrition est l'une des marques phares distribuées chez NutriFitness en Suisse, reconnue pour ses formulations pures destinées aux athlètes de force et de fitness. Dans notre boutique à Genève et sur notre catalogue en ligne, nous proposons un éventail complet de ses créations de haute technicité : protéines whey isolate, poudres de créatine micronisée 200 mesh, complexes pré-workout explosifs, acides aminés glutamine et citrulline, ainsi que des vitamines D3 K2 et minéraux bisglycinates de qualité pharmaceutique. Chaque produit répond strictement aux exigences sanitaires suisses de l'OSAV. Avec des dizaines de références disponibles, Marvelous incarne l'alliance de la traçabilité et de la performance. Tous les lots sont stockés directement dans nos locaux genevois au 34 Rue des Pâquis pour un retrait immédiat en Click & Collect ou une livraison express en 24 heures partout en Suisse.",
    relevantCategories: [
      { name: 'Protéines & Whey', href: '/categorie/proteines/' },
      { name: 'Créatine Monohydrate', href: '/categorie/creatine/' },
      { name: 'Pré-Workout & Énergie', href: '/categorie/pre-workout-energie/' },
      { name: 'Vitamines & Minéraux', href: '/categorie/vitamines-mineraux/' }
    ],
    relevantGuides: [
      { title: 'Whey isolate ou concentrée : laquelle choisir ?', href: '/blog/whey-isolate-ou-concentree/' },
      { title: 'Créatine : quand et comment la prendre ?', href: '/blog/creatine-quand-comment-la-prendre/' },
      { title: 'Pré-workout : comment bien le choisir ?', href: '/blog/pre-workout-comment-choisir/' }
    ],
    faqs: [
      {
        q: 'Où acheter les produits Marvelous Nutrition en Suisse ?',
        a: 'Vous pouvez acheter l\'ensemble de la gamme Marvelous Nutrition directement chez NutriFitness, soit dans notre magasin physique au 34 Rue des Pâquis à 1201 Genève, soit sur notre boutique en ligne avec livraison en 24h.'
      },
      {
        q: 'Les compléments Marvelous sont-ils conformes aux normes suisses ?',
        a: 'Oui, tous les lots importés et distribués par NutriFitness respectent rigoureusement les normes de l\'Office fédéral de la sécurité alimentaire et des affaires vétérinaires (OSAV) et du DFI.'
      },
      {
        q: 'Peut-on retirer les produits Marvelous en Click & Collect à Genève ?',
        a: 'Absolument. Le Click & Collect est 100% gratuit en boutique au 34 Rue des Pâquis à Genève et vos commandes sont préparées sous 2 heures ouvrées.'
      }
    ]
  },
  {
    name: 'Pronutrition.it',
    displayName: 'Pronutrition',
    slug: 'pronutrition',
    count: 24,
    logo: '/images/brands/logo-pronutrition.png',
    featured: true,
    indexable: true,
    h1: 'Pronutrition en Suisse | NutriFitness',
    metaTitle: 'Pronutrition Suisse : Farines d\'avoine, Snacks Keto & Diététique',
    metaDescription: 'Découvrez la gamme Pronutrition en Suisse chez NutriFitness Genève. Farines d\'avoine aromatisées, alimentation keto et snacks diététiques. Expédition 24h.',
    intro: "Pronutrition est la référence italienne de la nutrition sportive et de l'alimentation diététique fonctionnelle, distribuée à Genève par NutriFitness. Réputée pour ses farines d'avoine aromatisées aux saveurs authentiques, sa gamme exclusive de snacks keto faibles en glucides, ses crèmes de riz et ses stimulants précis comme la caféine pure, Pronutrition séduit les athlètes exigeants sur la composition nutritionnelle et le goût. Notre boutique référence plus de 20 produits de la marque, garantissant une alternative saine et gourmande pour vos collations et petits-déjeuners sportifs. Toutes les références importées sont vérifiées conformes aux réglementations suisses du DFI. Retrouvez la gamme Pronutrition dans notre magasin physique des Pâquis à Genève ou commandez en ligne avec une expédition prioritaire sous 24h ouvrées sur l'ensemble du territoire helvétique.",
    relevantCategories: [
      { name: 'Snacks & Diététique', href: '/categorie/snacks-healthy-food/' },
      { name: 'Gainers & Masse', href: '/categorie/gainers-prise-de-masse/' },
      { name: 'Pré-Workout & Énergie', href: '/categorie/pre-workout-energie/' }
    ],
    relevantGuides: [
      { title: 'Petit-déjeuner et collations riches en protéines', href: '/blog/petit-dejeuner-collation-riche-en-proteines/' },
      { title: 'Barres et snacks protéinés : comment bien choisir ?', href: '/blog/barres-snacks-proteines-comment-choisir/' },
      { title: 'Caféine en gélules : dose et précautions', href: '/blog/cafeine-gelules-dose-precautions/' }
    ],
    faqs: [
      {
        q: 'Pourquoi choisir les farines d\'avoine Pronutrition ?',
        a: 'Les farines d\'avoine Pronutrition sont finement micronisées pour une dissolution immédiate sans grumeaux, idéales pour préparer des pancakes protéinés ou des porridges sains riches en bêta-glucanes.'
      },
      {
        q: 'La gamme Pronutrition convient-elle au régime cétogène (keto) ?',
        a: 'Oui, Pronutrition propose une ligne spécifique de produits à très faible teneur en glucides (croissants keto, piadinas, barres faibles en sucres) adaptée aux régimes cétogènes et low carb.'
      },
      {
        q: 'Les produits Pronutrition sont-ils en stock à Genève ?',
        a: 'Oui, l\'intégralité des produits présentés sur le site est disponible dans notre boutique au 34 Rue des Pâquis à Genève ou livrable en 24h en Suisse.'
      }
    ]
  },
  {
    name: 'Bigman',
    displayName: 'BigMan Nutrition',
    slug: 'bigman',
    count: 14,
    logo: '/images/brands/logo-bigman-nutrition.png',
    featured: true,
    indexable: true,
    h1: 'BigMan Nutrition en Suisse | NutriFitness',
    metaTitle: 'BigMan Nutrition Suisse : Whey, Creapure® & Acides Aminés',
    metaDescription: 'Retrouvez BigMan Nutrition en Suisse chez NutriFitness Genève. Ultimate Whey, créatine Creapure, gainers et ashwagandha. Stock physique à Genève, livraison 24h.',
    intro: "BigMan Nutrition est une marque européenne de référence réputée pour ses formules accessibles et généreuses adaptées à la musculation et aux sports d'endurance, distribuée à Genève par NutriFitness. Notre boutique référence une sélection rigoureuse de ses meilleures créations : poudres de protéines Ultimate Whey, créatine sous label haute pureté Creapure®, acides aminés EAA et BCAA fermentés, ainsi que des extraits adaptogènes comme l'Ashwagandha KSM-66®. Ces compléments respectent scrupuleusement les ordonnances fédérales de l'OSAV et offrent une assimilation digestive optimale. Avec plus de 14 produits disponibles, BigMan Nutrition permet à chaque pratiquant de construire un protocole de supplémentation complet et cohérent. Disponibles immédiatement en Click & Collect gratuit au 34 Rue des Pâquis ou en expédition rapide en 24h par La Poste Suisse.",
    relevantCategories: [
      { name: 'Protéines & Whey', href: '/categorie/proteines/' },
      { name: 'Créatine Monohydrate', href: '/categorie/creatine/' },
      { name: 'Acides Aminés & BCAA', href: '/categorie/acides-amines-recuperation/' },
      { name: 'Bien-Être & Sommeil', href: '/categorie/bien-etre-sommeil-digestion/' }
    ],
    relevantGuides: [
      { title: 'Créatine monohydrate ou Creapure® : quelle différence ?', href: '/blog/creatine-monohydrate-ou-creapure/' },
      { title: 'BCAA ou EAA : quelle différence et que choisir ?', href: '/blog/bcaa-ou-eaa-difference/' },
      { title: 'Gainer : pour qui et comment bien le choisir ?', href: '/blog/gainer-pour-qui-comment-choisir/' }
    ],
    faqs: [
      {
        q: 'Quelle est la particularité de la créatine BigMan ?',
        a: 'BigMan utilise pour sa créatine phare le label allemand breveté Creapure®, garantissant une pureté exceptionnelle de 99.99% exempte de résidus de synthèse.'
      },
      {
        q: 'Quels types de protéines BigMan trouve-t-on chez NutriFitness ?',
        a: 'Nous stockons l\'Ultimate Whey (concentré de qualité supérieure) ainsi que l\'Iso Whey Zero, particulièrement appréciée en période de sèche pour son absence quasi totale de lactose et lipides.'
      },
      {
        q: 'Quel est le délai de livraison des compléments BigMan en Suisse ?',
        a: 'Les commandes validées avant 14h sont expédiées le jour même via La Poste Suisse (PostPac Priority) pour une livraison sous 24 heures sans frais de douane.'
      }
    ]
  },
  {
    name: 'Dirty Squads',
    displayName: 'Dirty Squads',
    slug: 'dirty-squads',
    count: 16,
    logo: '/images/brands/logo-dirty-squads.png',
    featured: true,
    indexable: true,
    h1: 'Dirty Squads en Suisse | NutriFitness',
    metaTitle: 'Dirty Squads Suisse : Iso 90X CFM, Cluster Dextrin & Force',
    metaDescription: 'Achetez Dirty Squads en Suisse chez NutriFitness Genève. Iso 90X CFM, Cluster Dex, Creapure et acides aminés pour athlètes. Retrait 2h ou livraison 24h.',
    intro: "Dirty Squads est une marque résolument tournée vers la nutrition sportive de haute intensité et le bodybuilding exigeant, distribuée à Genève par NutriFitness. Conçue pour répondre aux attentes des athlètes recherchant des concentrations maximales en principes actifs, elle se distingue notamment par son isolate de pointe Iso 90X CFM microfiltrée à froid, sa créatine Creapure®, ses glucides techniques en grappes hautement ramifiées Dirty Cluster Dex et ses complexes thermogéniques pour la sèche. Dans notre boutique des Pâquis et sur notre shop en ligne, nous stockons 16 références de la marque, toutes conformes aux normes suisses et exemptes de substances prohibées. Profitez de conseils personnalisés sur la gamme Dirty Squads directement à Genève ou commandez en ligne pour une livraison sécurisée en 24 heures sans frais de douane.",
    relevantCategories: [
      { name: 'Protéines & Whey', href: '/categorie/proteines/' },
      { name: 'Pendant l\'Effort & Hydratation', href: '/categorie/pendant-effort-hydratation/' },
      { name: 'Créatine Monohydrate', href: '/categorie/creatine/' }
    ],
    relevantGuides: [
      { title: 'Comment bien choisir sa whey : étiquette et prix', href: '/blog/comment-choisir-sa-whey-etiquette-prix/' },
      { title: 'Électrolytes et hydratation pendant l\'effort', href: '/blog/electrolytes-hydratation-effort/' },
      { title: 'Glutamine, bêta-alanine, citrulline : à quoi servent-elles ?', href: '/blog/glutamine-beta-alanine-citrulline/' }
    ],
    faqs: [
      {
        q: 'Qu\'est-ce que la technologie CFM utilisée dans l\'Iso 90X Dirty Squads ?',
        a: 'La microfiltration à flux croisé (CFM) est un procédé de filtration mécanique doux et à basse température qui préserve l\'intégralité des fractions protéiques bioactives sans dénaturation.'
      },
      {
        q: 'À quoi sert la Cluster Dextrin® de Dirty Squads ?',
        a: 'C\'est un glucide hautement ramifié à haute masse moléculaire et faible osmolarité, permettant une vidange gastrique ultra-rapide et un apport énergétique continu sans lourdeur digestive.'
      },
      {
        q: 'Où tester les produits Dirty Squads à Genève ?',
        a: 'Rendez-vous dans notre boutique au 34 Rue des Pâquis, 1201 Genève, pour découvrir les formats et bénéficier des conseils avisés de notre équipe.'
      }
    ]
  },
  {
    name: 'Applied Nutrition',
    displayName: 'Applied Nutrition',
    slug: 'applied-nutrition',
    count: 3,
    logo: '/images/brands/logo-applied-nutrition.png',
    featured: true,
    indexable: true,
    h1: 'Applied Nutrition en Suisse | NutriFitness',
    metaTitle: 'Applied Nutrition Suisse : ABE Pre-Workout & Créatine Pure',
    metaDescription: 'Applied Nutrition chez NutriFitness Genève. Booster ABE All Black Everything, créatine monohydrate micronisée et zinc chélaté. Stock suisse, envoi 24h.',
    intro: "Originaire du Royaume-Uni et adoptée par les athlètes d'élite à travers l'Europe, Applied Nutrition formule des compléments certifiés d'une rigueur exemplaire, distribués à Genève par NutriFitness. Dans notre magasin suisse, nous mettons à l'honneur leurs produits phares : le pré-workout mythique ABE (All Black Everything) reconnu pour son focus mental incomparable, leur créatine monohydrate micronisée pure et leur zinc bisglycinate hautement biodisponible. Chaque formule bénéficie de contrôles de fabrication rigoureux conformes aux standards de l'OSAV et du DFI en Suisse. Disponibles en retrait 2 heures à notre boutique physique de la Rue des Pâquis ou en expédition express dans toute la Suisse via PostPac Priority, les compléments Applied Nutrition garantissent une efficacité sans compromis pour vos entraînements les plus rudes.",
    relevantCategories: [
      { name: 'Pré-Workout & Énergie', href: '/categorie/pre-workout-energie/' },
      { name: 'Créatine Monohydrate', href: '/categorie/creatine/' },
      { name: 'Vitamines & Minéraux', href: '/categorie/vitamines-mineraux/' }
    ],
    relevantGuides: [
      { title: 'Pré-workout : comment bien le choisir ?', href: '/blog/pre-workout-comment-choisir/' },
      { title: 'Zinc, magnésium, ZMA : comprendre avant d\'acheter', href: '/blog/zinc-magnesium-zma-comprendre/' },
      { title: 'Créatine : faut-il faire une phase de charge ?', href: '/blog/creatine-phase-de-charge/' }
    ],
    faqs: [
      {
        q: 'Pourquoi le pré-workout ABE d\'Applied Nutrition est-il si réputé ?',
        a: 'ABE associe caféine, théacrine, bêta-alanine et citrulline malate dans des ratios scientifiquement validés pour booster la vigilance, l\'endurance musculaire et la congestion.'
      },
      {
        q: 'La créatine Applied Nutrition est-elle sans arôme ?',
        a: 'Oui, elle est 100% pure et sans arôme, ce qui permet de l\'intégrer facilement dans de l\'eau, un jus de fruits ou votre shaker de protéines sans en altérer le goût.'
      },
      {
        q: 'Les produits Applied Nutrition sont-ils dédouanés pour la Suisse ?',
        a: 'Oui, toutes nos références sont déjà physiquement en Suisse à Genève. Vous ne payez aucun frais de douane ni taxe supplémentaire lors de la livraison.'
      }
    ]
  },
  {
    name: 'NutriFitness',
    displayName: 'NutriFitness Lab',
    slug: 'nutrifitness',
    count: 2,
    logo: '/images/brands/logo-nutrifitness-lab.png',
    featured: true,
    indexable: true,
    h1: 'NutriFitness Lab en Suisse | NutriFitness',
    metaTitle: 'NutriFitness Lab Genève : Gallon 2.2L & Gourde Sport Officiels',
    metaDescription: 'Découvrez les accessoires officiels NutriFitness Lab : gourde sport ergonomique 600ml et gallon d\'hydratation 2.2L sans BPA. Retrait à Genève & envoi 24h.',
    intro: "NutriFitness Lab est notre propre marque officielle d'équipements sportifs, conçue à Genève pour accompagner au quotidien les passionnés de musculation et de fitness. Retrouvez notre gourde ergonomique 600 ml avec paille sans BPA et notre gallon d'hydratation grand format 2.2 litres directement au 34 Rue des Pâquis à Genève ou commandez-les en ligne avec livraison suisse express en 24 heures.",
    relevantCategories: [
      { name: 'Accessoires & Shakers', href: '/categorie/accessoires/' }
    ],
    relevantGuides: [
      { title: 'Premiers compléments : le guide du débutant en Suisse', href: '/blog/premiers-complements-guide-debutant-suisse/' },
      { title: 'Combien de protéines par jour pour un sportif ?', href: '/blog/combien-de-proteines-par-jour-sportif/' }
    ],
    faqs: [
      {
        q: 'Les shakers NutriFitness sont-ils garantis sans BPA ?',
        a: 'Oui, tous nos shakers et gourdes sont fabriqués avec des matériaux certifiés sans bisphénol A (BPA) ni phtalates pour préserver votre santé au quotidien.'
      },
      {
        q: 'Qu\'est-ce que « Le Guide Ultime des Compléments Alimentaires » ?',
        a: 'C\'est un manuel pratique de 66 pages rédigé par Marco Scarpantoni regroupant les protocoles de supplémentation scientifiquement validés selon vos objectifs réels.'
      },
      {
        q: 'Peut-on acheter les accessoires NutriFitness en boutique ?',
        a: 'Oui, tous nos accessoires sont disponibles immédiatement au magasin du 34 Rue des Pâquis à Genève.'
      }
    ]
  },
  {
    name: 'Bodyattack',
    displayName: 'Body Attack',
    slug: 'bodyattack',
    count: 2,
    logo: '/images/brands/logo-body-attack.png',
    featured: true,
    indexable: true,
    h1: 'Body Attack en Suisse | NutriFitness',
    metaTitle: 'Body Attack Suisse : Beurre de Cacahuète Pur & Nutrition Sportive',
    metaDescription: 'Achetez la marque allemande Body Attack en Suisse chez NutriFitness Genève. Beurre de cacahuète 100% pur, protéines et nutrition saine. Stock en Suisse.',
    intro: "Marque historique de la nutrition sportive allemande, Body Attack est reconnue pour sa maîtrise des procédés de fabrication et la qualité irréprochable de ses ingrédients, distribuée à Genève par NutriFitness. Nous avons sélectionné pour notre communauté helvétique ses références les plus plébiscitées, notamment son beurre de cacahuète 100% pur sans huile de palme ni sucres ajoutés, idéal pour enrichir les collations en bons lipides et protéines végétales. Répondant aux standards de pureté les plus stricts et conformes aux réglementations suisses de l'OSAV, les produits Body Attack allient plaisir gustatif et valeurs nutritionnelles optimales. Venez les découvrir au magasin physique de Genève ou commandez-les en ligne avec expédition 24h par La Poste Suisse.",
    relevantCategories: [
      { name: 'Snacks & Diététique', href: '/categorie/snacks-healthy-food/' },
      { name: 'Protéines & Whey', href: '/categorie/proteines/' }
    ],
    relevantGuides: [
      { title: 'Petit-déjeuner et collations riches en protéines', href: '/blog/petit-dejeuner-collation-riche-en-proteines/' },
      { title: 'Barres et snacks protéinés : comment bien choisir ?', href: '/blog/barres-snacks-proteines-comment-choisir/' }
    ],
    faqs: [
      {
        q: 'Le beurre de cacahuète Body Attack contient-il des additifs ?',
        a: 'Non, il est élaboré exclusivement à partir de cacahuètes 100% grillées, sans sel ajouté, sans sucre et sans huile de palme.'
      },
      {
        q: 'Quelle est la provenance des produits Body Attack ?',
        a: 'Body Attack est un fabricant allemand réputé appliquant les normes de fabrication ISO et IFS parmi les plus exigeantes d\'Europe.'
      },
      {
        q: 'Comment retirer Body Attack à Genève ?',
        a: 'Commandez sur nutrifitness.ch et optez pour le Click & Collect : votre produit est réservé sous 2h à la boutique de la Rue des Pâquis.'
      }
    ]
  },
  {
    name: 'Optimum Nutrition',
    displayName: 'Optimum Nutrition (ON)',
    slug: 'optimum-nutrition',
    count: 1,
    logo: '/images/brands/logo-optimum-nutrition.png',
    featured: true,
    indexable: true,
    h1: 'Optimum Nutrition en Suisse | NutriFitness',
    metaTitle: 'Optimum Nutrition Suisse : Gold Standard 100% Whey à Genève',
    metaDescription: 'Achetez Optimum Nutrition Gold Standard 100% Whey en Suisse chez NutriFitness Genève. Référence mondiale de la protéine. Stock à Genève, livraison 24h.',
    intro: "Véritable pionnier mondial de la nutrition pour sportifs, Optimum Nutrition (ON) est le créateur de la célèbre Gold Standard 100% Whey, la protéine la plus vendue et récompensée à l'international, distribuée à Genève par NutriFitness. Reconnue pour sa miscibilité instantanée, son profil en acides aminés exceptionnel riche en BCAA naturels et sa digestibilité sans faille, la formule Gold Standard constitue une référence absolue pour la récupération musculaire après l'effort. Chez NutriFitness, nous garantissons l'authenticité et la traçabilité suisse de ce classique incontournable, conforme aux ordonnances fédérales de l'OSAV. Disponible en stock physique dans notre boutique genevoise des Pâquis pour un retrait en Click & Collect en 2h ou en livraison 24h dans toute la Suisse.",
    relevantCategories: [
      { name: 'Protéines & Whey', href: '/categorie/proteines/' }
    ],
    relevantGuides: [
      { title: 'Whey isolate ou concentrée : laquelle choisir ?', href: '/blog/whey-isolate-ou-concentree/' },
      { title: 'Comment bien choisir sa whey : étiquette et prix', href: '/blog/comment-choisir-sa-whey-etiquette-prix/' }
    ],
    faqs: [
      {
        q: 'Pourquoi la Gold Standard 100% Whey est-elle une référence ?',
        a: 'Elle combine whey isolate comme ingrédient principal avec du concentré de whey ultrafiltré, offrant 24g de protéines et 5.5g de BCAA naturels par portion.'
      },
      {
        q: 'Le produit vendu est-il authentique ?',
        a: 'Oui, NutriFitness s\'approvisionne exclusivement auprès du réseau de distribution officiel officiel en Suisse avec scellé d\'origine intact.'
      },
      {
        q: 'Quel est le mode d\'emploi recommandé pour la whey ON ?',
        a: 'Mélangez une dosette rase (environ 30g) dans 200 à 250 ml d\'eau fraîche immédiatement après votre séance ou en collation matinale.'
      }
    ]
  },

  {
    name: 'Ghost',
    displayName: 'Ghost Lifestyle',
    slug: 'ghost',
    count: 1,
    logo: '/images/brands/logo-ghost-lifestyle.png',
    featured: true,
    indexable: true,
    h1: 'Ghost Lifestyle en Suisse | NutriFitness',
    metaTitle: 'Ghost Lifestyle Suisse : Whey & Nutrition Sportive Transparente',
    metaDescription: 'Achetez Ghost Lifestyle en Suisse chez NutriFitness Genève. Formules 100% transparentes, goût inimitable et qualité premium. Stock physique à Genève.',
    intro: "Ghost Lifestyle a révolutionné l'industrie de la nutrition sportive avec son engagement total de transparence (formules 100% ouvertes sans complexes propriétaires) et ses arômes légendaires, distribuée à Genève par NutriFitness. Réputée pour ses protéines whey combinant isolate et concentré de haute qualité ainsi que pour ses packagings modernes, Ghost s'adresse aux sportifs qui exigent à la fois le plaisir et des ingrédients documentés. Dans notre shop de Genève, nous sélectionnons leurs meilleures références certifiées conformes aux exigences sanitaires suisses. Venez échanger avec notre équipe au 34 Rue des Pâquis ou commandez directement sur nutrifitness.ch pour bénéficier de notre livraison express en 24h ouvrées partout en Suisse.",
    relevantCategories: [
      { name: 'Protéines & Whey', href: '/categorie/proteines/' },
      { name: 'Pré-Workout & Énergie', href: '/categorie/pre-workout-energie/' }
    ],
    relevantGuides: [
      { title: 'Comment bien choisir sa whey : étiquette et prix', href: '/blog/comment-choisir-sa-whey-etiquette-prix/' },
      { title: 'Whey isolate ou concentrée : laquelle choisir ?', href: '/blog/whey-isolate-ou-concentree/' }
    ],
    faqs: [
      {
        q: 'Que signifie « étiquette 100% transparente » chez Ghost ?',
        a: 'Ghost divulgue le dosage exact de chaque source de protéine et ingrédient actif sur son étiquette, sans cacher les proportions derrière un mélange exclusif.'
      },
      {
        q: 'Les enzymes digestives sont-elles incluses ?',
        a: 'Oui, Ghost incorpore des enzymes digestives spécifiques (DigeZyme®) pour optimiser l\'assimilation et le confort d\'absorption.'
      },
      {
        q: 'Comment commander Ghost Lifestyle en Suisse sans frais de douane ?',
        a: 'En commandant chez NutriFitness : nos stocks sont situés à Genève, ce qui élimine les frais d\'importation et taxes surprises.'
      }
    ]
  },
  // Single-product niche specialty brands (set to noindex per guidelines to prevent thin pages)
  {
    name: 'Bio Pour Tous',
    displayName: 'Bio Pour Tous',
    slug: 'bio-pour-tous',
    count: 1,
    logo: '/images/brands/logo-bio-pour-tous.png',
    indexable: false,
    h1: 'Bio Pour Tous en Suisse | NutriFitness',
    metaTitle: 'Bio Pour Tous en Suisse | NutriFitness Genève',
    metaDescription: 'Découvrez Bio Pour Tous chez NutriFitness Genève. Produits de nutrition biologique distribués à Genève.',
    intro: "Bio Pour Tous offre des produits d'alimentation saine et biologique de haute qualité, distribués à Genève par NutriFitness. Disponibles en boutique aux Pâquis ou livrés sous 24h en Suisse.",
    relevantCategories: [{ name: 'Snacks & Diététique', href: '/categorie/snacks-healthy-food/' }],
    relevantGuides: [{ title: 'Petit-déjeuner et collations riches en protéines', href: '/blog/petit-dejeuner-collation-riche-en-proteines/' }],
    faqs: [
      { q: 'Où acheter Bio Pour Tous en Suisse ?', a: 'Chez NutriFitness au 34 Rue des Pâquis à Genève.' }
    ]
  },
  {
    name: 'Powerfood',
    displayName: 'Powerfood One',
    slug: 'powerfood',
    count: 1,
    logo: '/images/brands/logo-powerfood-one.png',
    indexable: false,
    h1: 'Powerfood One en Suisse | NutriFitness',
    metaTitle: 'Powerfood One en Suisse | NutriFitness Genève',
    metaDescription: 'Powerfood One chez NutriFitness Genève. Nutrition sportive distribuée à Genève.',
    intro: "Powerfood One propose des compléments pour la nutrition sportive quotidienne, distribués à Genève par NutriFitness au 34 Rue des Pâquis.",
    relevantCategories: [{ name: 'Protéines & Whey', href: '/categorie/proteines/' }],
    relevantGuides: [{ title: 'Premiers compléments : le guide du débutant en Suisse', href: '/blog/premiers-complements-guide-debutant-suisse/' }],
    faqs: [
      { q: 'Où trouver Powerfood One à Genève ?', a: 'Directement dans notre magasin au 34 Rue des Pâquis.' }
    ]
  },
  {
    name: 'Shilajit',
    displayName: 'Shilajit Pur Himalaya',
    slug: 'shilajit',
    count: 1,
    logo: '/images/brands/logo-shilajit-pur.png',
    indexable: false,
    h1: 'Shilajit Pur Himalaya en Suisse | NutriFitness',
    metaTitle: 'Shilajit Pur Himalaya en Suisse | NutriFitness Genève',
    metaDescription: 'Résine pure de Shilajit de l\'Himalaya titrée en acide fulvique chez NutriFitness Genève.',
    intro: "Shilajit Pur Himalaya propose une résine naturelle de haute altitude riche en acide fulvique et en oligo-éléments, distribuée à Genève par NutriFitness selon les normes suisses en vigueur.",
    relevantCategories: [{ name: 'Bien-Être & Sommeil', href: '/categorie/bien-etre-sommeil-digestion/' }],
    relevantGuides: [{ title: 'Premiers compléments : le guide du débutant en Suisse', href: '/blog/premiers-complements-guide-debutant-suisse/' }],
    faqs: [
      { q: 'Comment consommer le Shilajit pur ?', a: 'Diluez une pointe de résine (taille d\'un grain de riz) dans de l\'eau tiède le matin.' }
    ]
  },
  {
    name: 'Beebad',
    displayName: 'Beebad Energy',
    slug: 'beebad',
    count: 1,
    logo: '/images/brands/logo-beebad.png',
    indexable: false,
    h1: 'Beebad Energy en Suisse | NutriFitness',
    metaTitle: 'Beebad Energy en Suisse | NutriFitness Genève',
    metaDescription: 'Boisson énergisante naturelle au miel Beebad chez NutriFitness Genève. Sans sucres raffinés.',
    intro: "Beebad conçoit des boissons énergisantes naturelles édulcorées au miel biologique et enrichies en gelée royale et propolis, distribuées à Genève par NutriFitness.",
    relevantCategories: [{ name: 'Pré-Workout & Énergie', href: '/categorie/pre-workout-energie/' }],
    relevantGuides: [{ title: 'Électrolytes et hydratation pendant l\'effort', href: '/blog/electrolytes-hydratation-effort/' }],
    faqs: [
      { q: 'Qu\'est-ce que Beebad ?', a: 'Une boisson énergisante naturelle sans sucres raffinés au miel et vitamines B.' }
    ]
  },
  {
    name: 'More',
    displayName: 'More Nutrition',
    slug: 'more',
    count: 1,
    logo: '/images/brands/logo-more-nutrition.png',
    indexable: false,
    h1: 'More Nutrition en Suisse | NutriFitness',
    metaTitle: 'More Nutrition en Suisse | NutriFitness Genève',
    metaDescription: 'More Nutrition chez NutriFitness Genève. Sprays de cuisson zéro calorie et compléments diététiques.',
    intro: "More Nutrition formule des produits innovants pour la gestion calorique quotidienne comme les sprays de cuisson sans calories, distribués à Genève par NutriFitness.",
    relevantCategories: [{ name: 'Perte de Poids & Définition', href: '/categorie/perte-de-poids/' }],
    relevantGuides: [{ title: 'Perdre du poids : que peuvent (vraiment) faire les compléments ?', href: '/blog/perte-de-poids-complements-ce-que-disent-les-preuves/' }],
    faqs: [
      { q: 'Comment utiliser le spray More Nutrition ?', a: 'Vaporisez une brève pression dans la poêle pour cuire vos aliments sans excédent de matière grasse.' }
    ]
  },
  {
    name: 'Bioyos',
    displayName: 'Bioyos',
    slug: 'bioyos',
    count: 1,
    logo: '/images/brands/logo-bioyos.png',
    indexable: false,
    h1: 'Bioyos en Suisse | NutriFitness',
    metaTitle: 'Bioyos en Suisse | NutriFitness Genève',
    metaDescription: 'Compléments Bioyos chez NutriFitness Genève. Vitalité et micronutrition à Genève.',
    intro: "Bioyos propose des solutions de micronutrition naturelle pour soutenir la vitalité quotidienne, distribuées à Genève par NutriFitness au 34 Rue des Pâquis.",
    relevantCategories: [{ name: 'Vitamines & Minéraux', href: '/categorie/vitamines-mineraux/' }],
    relevantGuides: [{ title: 'Premiers compléments : le guide du débutant en Suisse', href: '/blog/premiers-complements-guide-debutant-suisse/' }],
    faqs: [
      { q: 'Où trouver Bioyos à Genève ?', a: 'À la boutique NutriFitness au 34 Rue des Pâquis.' }
    ]
  },
  {
    name: 'Eurovo',
    displayName: 'Eurovo Pro',
    slug: 'eurovo',
    count: 1,
    logo: '/images/brands/logo-eurovo.png',
    indexable: false,
    h1: 'Eurovo Pro en Suisse | NutriFitness',
    metaTitle: 'Eurovo Pro en Suisse | NutriFitness Genève',
    metaDescription: 'Blanc d\'œuf liquide pasteurisé Eurovo Pro chez NutriFitness Genève. Protéines pures pour sportifs.',
    intro: "Eurovo Pro est le spécialiste du blanc d'œuf liquide pasteurisé 100% pur pour sportifs, distribué à Genève par NutriFitness pour des préparations hyperprotéinées sans graisses ni cholestérol.",
    relevantCategories: [{ name: 'Protéines & Whey', href: '/categorie/proteines/' }],
    relevantGuides: [{ title: 'Petit-déjeuner et collations riches en protéines', href: '/blog/petit-dejeuner-collation-riche-en-proteines/' }],
    faqs: [
      { q: 'Le blanc d\'œuf liquide Eurovo se conserve-t-il facilement ?', a: 'Oui, la bouteille se conserve à température ambiante avant ouverture et au frais après ouverture.' }
    ]
  }
];

export function getBrandBySlug(slug: string): BrandInfo | undefined {
  return ALL_BRANDS.find(b => b.slug === slug);
}

export function getIndexableBrands(): BrandInfo[] {
  return ALL_BRANDS.filter(b => b.indexable);
}

