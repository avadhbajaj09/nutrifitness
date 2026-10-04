export interface BlogFaq {
  question: string;
  answer: string;
}

export interface SuggestedProduct {
  name: string;
  href: string;
  brand: string;
  badge?: string;
  priceEstimate?: string;
}

export interface ExternalSource {
  title: string;
  url: string;
  authority: string;
}

export interface BlogSection {
  title?: string;
  content: string[];
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  metaTitle: string;
  metaDescription: string;
  targetKeyword: string;
  readingTime: string;
  publishedAt: string;
  author: string;
  authorRole: string;
  image: string;
  shortAnswer: string;
  sections: BlogSection[];
  suggestedProducts: SuggestedProduct[];
  faqs: BlogFaq[];
  externalSources: ExternalSource[];
  readNextSlugs: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    slug: 'creatine-quand-comment-la-prendre',
    title: 'Créatine : quand et comment la prendre ?',
    category: 'Créatine',
    categorySlug: 'creatine',
    metaTitle: 'Créatine : quand et comment la prendre ? | Guide NutriFitness Suisse',
    metaDescription: 'Dose, moment idéal, mélange et prise les jours de repos : le guide scientifique et pratique pour votre créatine monohydrate à Genève et en Suisse.',
    targetKeyword: 'créatine comment la prendre',
    readingTime: '5 min',
    publishedAt: '2026-03-28',
    author: 'Marco Scarpantoni',
    authorRole: 'Coach Certifié & Préparateur Physique NutriFitness Genève',
    image: '/images/blog/nutriftiness-images14.png',
    shortAnswer: 'La créatine monohydrate se prend tous les jours, à raison de 3 à 5 g, dans une boisson tempérée (eau, jus de raisin ou shaker de protéines). Le moment de la prise compte moins que la régularité quotidienne, y compris lors des jours de repos pour maintenir la saturation musculaire.',
    sections: [
      {
        title: 'La dose quotidienne recommandée',
        content: [
          'Selon les consensus de la Société Internationale de Nutrition Sportive (ISSN), une dose d\'entretien de 3 à 5 g par jour suffit pour maximiser les stocks intramusculaires de phosphocréatine.',
          'Pour un sportif moyen en Suisse, un pot standard de 250 g ou 300 g correspond ainsi à 50 à 60 jours d\'utilisation continue.'
        ]
      },
      {
        title: 'Quel est le meilleur moment de la journée ?',
        content: [
          'Le paramètre primordial n\'est pas l\'heure exacte, mais la consistance au quotidien. Beaucoup d\'athlètes choisissent de l\'incorporer à leur shaker post-entraînement.',
          'En effet, la présence d\'insuline consécutive à l\'ingestion conjointe de glucides et de protéines favorise le transport de la créatine vers les cellules musculaires.'
        ]
      },
      {
        title: 'Comment la mélanger efficacement ?',
        content: [
          'La créatine monohydrate se dilue parfaitement dans de l\'eau tiède, un jus de fruits ou directement mélangée à votre whey isolate.',
          'Les versions micronisées (label 200 mesh) offrent une granulométrie extrêmement fine évitant tout dépôt au fond du shaker.'
        ]
      },
      {
        title: 'Pour quels profils d\'athlètes ?',
        content: [
          'Elle s\'adresse aux pratiquants de musculation, crossfit, sports de combat, sprint et tous les efforts sollicitant la filière anaérobie alactique.',
          'En cas de pathologie rénale préexistante, demandez systématiquement l\'avis d\'un médecin avant d\'entamer une supplémentation.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Applied Nutrition Créatine Monohydrate Pure 250g', href: '/produit/applied-creatine-monohydrate-250g/', brand: 'Applied Nutrition', badge: 'Top Vente Suisse' },
      { name: 'Bigman Creapure® Monohydrate 300g', href: '/produit/creapure-bigman-300g/', brand: 'Bigman', badge: 'Label Creapure®' },
      { name: 'Marvelous Créatine Monohydrate 200 Mesh 300g', href: '/produit/creatine-en-poudre-300g/', brand: 'Marvelous', badge: 'Ultra-Micronisée' }
    ],
    faqs: [
      { question: 'Faut-il prendre la créatine les jours de repos ?', answer: 'Oui absolument. La créatine fonctionne par accumulation cellulaire. La prise de 3 à 5 g les jours sans entraînement permet de maintenir les réserves musculaires saturées.' },
      { question: 'Peut-on la mélanger directement avec sa whey ?', answer: 'Tout à fait. La créatine n\'altère en rien les protéines et bénéficie même de la hausse d\'insuline générée par le shaker pour être absorbée plus rapidement.' },
      { question: 'Combien de temps dure un pot de 250 g ?', answer: 'À raison d\'une dosette de 5 g par jour, un pot de 250 g vous assure exactement 50 jours de cure continue.' }
    ],
    externalSources: [
      { title: 'ISSN – Safety and efficacy of creatine supplementation in exercise', url: 'https://pubmed.ncbi.nlm.nih.gov/28615996/', authority: 'PubMed / ISSN' },
      { title: 'Office fédéral de la sécurité alimentaire et des affaires vétérinaires (OSAV)', url: 'https://www.blv.admin.ch/blv/fr/home.html', authority: 'Confédération Suisse' }
    ],
    readNextSlugs: ['creatine-monohydrate-ou-creapure', 'creatine-phase-de-charge', 'whey-isolate-ou-concentree']
  },
  {
    id: 2,
    slug: 'creatine-monohydrate-ou-creapure',
    title: 'Créatine monohydrate ou Creapure® : quelle différence ?',
    category: 'Créatine',
    categorySlug: 'creatine',
    metaTitle: 'Créatine monohydrate vs Creapure® : le comparatif | NutriFitness',
    metaDescription: 'Creapure® est-elle supérieure à une monohydrate standard ? Pureté à 99.99%, fabrication allemande, prix et études : analyse sans compromis.',
    targetKeyword: 'creapure créatine différence',
    readingTime: '4 min',
    publishedAt: '2026-03-25',
    author: 'Marco Scarpantoni',
    authorRole: 'Coach Certifié & Préparateur Physique NutriFitness Genève',
    image: '/images/blog/nutriftiness-images3.jpg',
    shortAnswer: 'Creapure® n\'est pas une molécule différente, mais la marque déposée de créatine monohydrate la plus pure au monde, synthétisée en Allemagne par Alzchem Trostberg GmbH avec une pureté garantie à 99.99% sans traces de métaux lourds ni dérivés toxiques.',
    sections: [
      {
        title: 'Ce que dit la littérature scientifique',
        content: [
          'La créatine monohydrate est la forme la plus documentée scientifiquement au monde, avec des centaines d\'études cliniques validant ses gains de force et d\'hypertrophie.',
          'Les formes alternatives (créatine HCl, ester, nitrate) n\'ont jamais démontré de supériorité physiologique significative dans des essais indépendants en double aveugle.'
        ]
      },
      {
        title: 'Pourquoi privilégier le label Creapure® ?',
        content: [
          'Pureté analytique contrôlée par chromatographie en phase liquide (HPLC).',
          'Absence stricte de sous-produits indésirables comme la dicyandiamide (DCD) et la dihydrotriazine (DHT).',
          'Traçabilité totale d\'origine européenne, plébiscitée par les athlètes d\'élite suisses soumis aux contrôles antidopage.'
        ]
      },
      {
        title: 'Pourquoi choisir une monohydrate classique de qualité ?',
        content: [
          'Une monohydrate micronisée 200 mesh offre la même efficacité métabolique à dose identique (3 à 5 g).',
          'Son prix par portion est généralement de 20 à 30% plus abordable pour les sportifs attentifs à leur budget.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Bigman Creapure® Monohydrate 300g', href: '/produit/creapure-bigman-300g/', brand: 'Bigman', badge: 'Creapure® 99.9%' },
      { name: 'Applied Nutrition Créatine Monohydrate Pure 250g', href: '/produit/applied-creatine-monohydrate-250g/', brand: 'Applied Nutrition', badge: 'Monohydrate Pure' },
      { name: 'Marvelous Créatine Monohydrate 200 Mesh 300g', href: '/produit/creatine-en-poudre-300g/', brand: 'Marvelous', badge: 'Micronisée 200 Mesh' }
    ],
    faqs: [
      { question: 'Creapure® donne-t-elle de meilleurs résultats musculaires ?', answer: 'À dosage égal, l\'action métabolique est identique. Le label Creapure® certifie une pureté exemplaire et une garantie d\'absence de contaminants industriels.' },
      { question: 'Que signifie la mention 200 mesh ?', answer: 'Elle indique que la poudre a été broyée à une échelle micrométrique permettant une dissolution quasi totale dans l\'eau sans résidus grenus.' }
    ],
    externalSources: [
      { title: 'Alzchem Creapure® Official Quality & Purity Standards', url: 'https://www.creapure.com/', authority: 'Alzchem Group' },
      { title: 'ISSN Position Stand on Creatine', url: 'https://pubmed.ncbi.nlm.nih.gov/28615996/', authority: 'PubMed' }
    ],
    readNextSlugs: ['creatine-quand-comment-la-prendre', 'creatine-phase-de-charge', 'premiers-complements-guide-debutant-suisse']
  },
  {
    id: 3,
    slug: 'creatine-phase-de-charge',
    title: 'Créatine : faut-il faire une phase de charge ?',
    category: 'Créatine',
    categorySlug: 'creatine',
    metaTitle: 'Phase de charge en créatine : obligatoire ou inutile ? | NutriFitness',
    metaDescription: '20g pendant 5 jours ou 3 à 5g en continu : découvrez ce que dit la science et quelle méthode privilégier pour éviter les troubles digestifs.',
    targetKeyword: 'créatine phase de charge',
    readingTime: '4 min',
    publishedAt: '2026-03-22',
    author: 'Marco Scarpantoni',
    authorRole: 'Coach Certifié NutriFitness Genève',
    image: '/images/blog/nutriftiness-images4.jpg',
    shortAnswer: 'Non, la phase de charge n\'est absolument pas obligatoire. Une dose régulière de 3 à 5 g par jour atteint le même niveau de saturation musculaire en 21 à 28 jours, tout en évitant les risques de crampes abdominales.',
    sections: [
      {
        title: 'Comparatif des deux protocoles',
        content: [
          'Protocole avec charge : 20 g par jour répartis en 4 prises de 5 g pendant 5 à 7 jours, puis 3 à 5 g en entretien.',
          'Protocole continu (recommandé) : 3 à 5 g par jour dès le début. Les réserves se remplissent de façon fluide et constante sans inconfort digestif.'
        ]
      },
      {
        title: 'Quel protocole choisir ?',
        content: [
          'Si vous avez une compétition imminente dans moins de 10 jours, la charge peut avoir un intérêt tactique ponctuel.',
          'Dans tous les autres cas, la prise continue est plus économique, plus douce pour l\'estomac et tout aussi efficace sur le moyen et long terme.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Applied Nutrition Créatine Monohydrate Pure 250g', href: '/produit/applied-creatine-monohydrate-250g/', brand: 'Applied Nutrition', badge: 'Prise Continue 3-5g' },
      { name: 'Bigman Creapure® Monohydrate 300g', href: '/produit/creapure-bigman-300g/', brand: 'Bigman', badge: 'Sans Trouble Digestif' },
      { name: 'Marvelous Créatine Monohydrate 200 Mesh 300g', href: '/produit/creatine-en-poudre-300g/', brand: 'Marvelous', badge: 'Solubilité Maximale' }
    ],
    faqs: [
      { question: 'La phase de charge présente-t-elle des risques ?', answer: 'Chez les individus sains, elle n\'est pas dangereuse mais engendre fréquemment des ballonnements ou selles molles dues à l\'appel d\'eau osmotique dans le tractus digestif.' },
      { question: 'Faut-il faire des pauses et des cures ?', answer: 'Non. Aucune désensibilisation des transporteurs de créatine n\'a été observée lors des études longitudinales sur plusieurs années.' }
    ],
    externalSources: [
      { title: 'PubMed: Clinical studies on creatine loading protocols', url: 'https://pubmed.ncbi.nlm.nih.gov/28615996/', authority: 'ISSN / NLM' }
    ],
    readNextSlugs: ['creatine-quand-comment-la-prendre', 'creatine-monohydrate-ou-creapure']
  },
  {
    id: 4,
    slug: 'whey-isolate-ou-concentree',
    title: 'Whey isolate ou concentrée : laquelle choisir ?',
    category: 'Protéines',
    categorySlug: 'proteines',
    metaTitle: 'Whey Isolate vs Concentrée : le comparatif d\'expert | NutriFitness',
    metaDescription: 'Filtration CFM, teneur en lactose, vitesse d\'assimilation et budget : découvrez quelle protéine correspond le mieux à vos objectifs sportifs.',
    targetKeyword: 'whey isolate vs concentrée',
    readingTime: '5 min',
    publishedAt: '2026-03-20',
    author: 'Marco Scarpantoni',
    authorRole: 'Coach Certifié & Nutritionniste Sportif',
    image: '/images/blog/nutriftiness-images52.png',
    shortAnswer: 'La Whey Isolate subit une microfiltration à flux croisé (CFM) lui conférant 88 à 93% de protéines pures avec moins de 1% de lactose et quasiment 0 g de lipides. La Whey Concentrée (75-80% de protéines) offre un rapport qualité/prix idéal si vous digérez bien les produits laitiers.',
    sections: [
      {
        title: 'Whey Concentrée : le choix polyvalent',
        content: [
          'Texture onctueuse et saveurs gourmandes.',
          'Conserve des fractions laitières bénéfiques (lactoferrine, immunoglobulines).',
          'Tarif économique pour les entraînements réguliers et la prise de masse.'
        ]
      },
      {
        title: 'Whey Isolate : la pureté maximale',
        content: [
          'Idéale en période de sèche stricte avec un apport calorique minimal.',
          'Indispensable si vous souffrez d\'intolérance ou de sensibilité au lactose.',
          'Absorption ultra-rapide idéale dès la fin de votre entraînement.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Bigman ISO Whey Zero 907g', href: '/produit/iso-whey-zero-907g/', brand: 'Bigman', badge: 'Isolat CFM Sans Sucre' },
      { name: 'Bigman Ultimate Whey Protein 2kg', href: '/produit/ultimate-whey-bigman-2kg/', brand: 'Bigman', badge: 'Concentrée Bestseller' },
      { name: 'Marvelous Muscles Whey Concentrée 2kg', href: '/produit/muscles-whey-2kg/', brand: 'Marvelous', badge: 'Ultra-Filtrée 2kg' }
    ],
    faqs: [
      { question: 'L\'Isolate convient-elle aux personnes intolérantes au lactose ?', answer: 'Oui. Le procédé de filtration mécanique élimine quasiment la totalité du sucre du lait, la rendant parfaitement tolérée sans ballonnement.' },
      { question: 'Laquelle est la plus efficace pour construire du muscle ?', answer: 'À apport total en acides aminés égal, la différence est minime. Ce qui compte le plus est votre apport quotidien global de 1.6 à 2.0 g/kg.' }
    ],
    externalSources: [
      { title: 'ISSN Position Stand: Protein and exercise', url: 'https://pubmed.ncbi.nlm.nih.gov/28642676/', authority: 'ISSN' }
    ],
    readNextSlugs: ['combien-de-proteines-par-jour-sportif', 'whey-ou-proteine-vegetale', 'comment-choisir-sa-whey-etiquette-prix']
  },
  {
    id: 5,
    slug: 'whey-ou-proteine-vegetale',
    title: 'Whey ou protéine végétale : que choisir ?',
    category: 'Protéines',
    categorySlug: 'proteines',
    metaTitle: 'Whey vs Protéine Végétale : guide et comparatif nutritionnel | NutriFitness',
    metaDescription: 'Aminogramme, digestion, impact écologique et intolérances : comparez les protéines de lactosérum et les mélanges végétaux (pois, riz, chanvre).',
    targetKeyword: 'whey vs protéine végétale',
    readingTime: '5 min',
    publishedAt: '2026-03-18',
    author: 'Marco Scarpantoni',
    authorRole: 'Préparateur Physique NutriFitness',
    image: '/images/blog/nutriftiness-images5.jpg',
    shortAnswer: 'La whey possède une concentration exceptionnelle en leucine stimulant directement l\'anabolisme (voie mTOR). Les poudres végétales combinant légumineuses et céréales (pois + riz) rivalisent désormais en qualité tout en étant 100% sans lactose, véganes et hypoallergéniques.',
    sections: [
      {
        title: 'L\'importance de l\'aminogramme',
        content: [
          'Une source végétale unique (par exemple uniquement du riz) peut manquer d\'un acide aminé essentiel comme la lysine.',
          'En combinant pois et riz brun, les profils se complètent parfaitement pour offrir un aminogramme complet et équilibré.'
        ]
      },
      {
        title: 'Digestibilité et tolérance',
        content: [
          'Pour les sportifs sujets à des réactions inflammatoires avec les protéines de lait ou recherchant une approche éthique végane, le végétal est la solution idéale.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Bioyos Protéine Vegan Riz Brun Bio 500g', href: '/produit/proteine-vegan-riz-brun-bio-500g/', brand: 'Bioyos', badge: '100% Vegan & Bio' },
      { name: 'Bigman Ultimate Whey Protein 2kg', href: '/produit/ultimate-whey-bigman-2kg/', brand: 'Bigman', badge: 'Lactosérum Pur' },
      { name: 'Marvelous El Toro Clear Beef Isolat 1.8kg', href: '/produit/el-toro-100-clear-beef-proteine-18kg/', brand: 'Marvelous', badge: '0 Lactose Alternative' }
    ],
    faqs: [
      { question: 'Les protéines végétales permettent-elles de prendre autant de muscle ?', answer: 'Oui. Des études récentes confirment qu\'à dose équivalente de leucine (environ 2.7 à 3 g par prise), la synthèse protéique musculaire est identique.' },
      { question: 'Comment adoucir la texture parfois farineuse du végétal ?', answer: 'Mélangez la poudre dans un shaker avec du lait d\'amande ou d\'avoine et laissez reposer 2 à 3 minutes pour une onctuosité optimale.' }
    ],
    externalSources: [
      { title: 'Comparative analysis of plant vs animal proteins in athletic performance', url: 'https://pubmed.ncbi.nlm.nih.gov/28642676/', authority: 'PubMed' }
    ],
    readNextSlugs: ['whey-isolate-ou-concentree', 'combien-de-proteines-par-jour-sportif']
  },
  {
    id: 6,
    slug: 'combien-de-proteines-par-jour-sportif',
    title: 'Combien de protéines par jour pour un sportif ?',
    category: 'Protéines',
    categorySlug: 'proteines',
    metaTitle: 'Combien de protéines par jour en musculation et sport ? | NutriFitness Suisse',
    metaDescription: 'Calculateur simple, répartition par repas et recommandations officielles de l\'ISSN pour optimiser votre récupération et masse musculaire.',
    targetKeyword: 'combien de protéines par jour musculation',
    readingTime: '6 min',
    publishedAt: '2026-03-15',
    author: 'Marco Scarpantoni',
    authorRole: 'Coach Certifié NutriFitness',
    image: '/images/blog/nutriftiness-images20.jpg',
    shortAnswer: 'Pour un sportif pratiquant la musculation ou un entraînement régulier, visez entre 1.6 et 2.2 g de protéines par kilogramme de poids corporel et par jour. Pour un athlète de 75 kg, cela correspond à environ 120 à 165 g de protéines totales réparties sur la journée.',
    sections: [
      {
        title: 'Formule de calcul rapide',
        content: [
          'Multipliez votre poids en kg par 1.6 (maintien ou endurance) à 2.0 (prise de masse ou sèche musculaire).',
          'Exemple : 80 kg × 1.8 g = 144 g de protéines par jour.'
        ]
      },
      {
        title: 'La répartition optimale des prises',
        content: [
          'Répartir vos apports en 3 à 5 prises contenant chacune 25 à 40 g de protéines optimise le déclenchement régulier de la synthèse protéique.',
          'Priorisez les aliments complets (œufs suisses, poisson, volaille, légumineuses) et complétez avec un shaker de whey pour la commodité.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Bigman Ultimate Whey Protein 2kg', href: '/produit/ultimate-whey-bigman-2kg/', brand: 'Bigman', badge: '76% Protéines' },
      { name: 'Marvelous Muscles Whey Concentrée 2kg', href: '/produit/muscles-whey-2kg/', brand: 'Marvelous', badge: 'Riche en BCAA' },
      { name: 'Bigman ISO Whey Zero 907g', href: '/produit/iso-whey-zero-907g/', brand: 'Bigman', badge: 'Haute Pureté' }
    ],
    faqs: [
      { question: 'Est-il dangereux pour les reins de consommer 2 g/kg de protéines ?', answer: 'Non. Chez des individus aux fonctions rénales saines, les études scientifiques confirment l\'absence de toxicité rénale jusqu\'à 2.8 g/kg/jour.' },
      { question: 'Les protéines des féculents et légumes comptent-elles ?', answer: 'Oui. Toutes les protéines consommées au cours des repas s\'additionnent au total quotidien.' }
    ],
    externalSources: [
      { title: 'ISSN position stand: protein and exercise', url: 'https://pubmed.ncbi.nlm.nih.gov/28642676/', authority: 'ISSN' },
      { title: 'Société Suisse de Nutrition (SSN)', url: 'https://www.sge-ssn.ch/fr/', authority: 'SSN Berne' }
    ],
    readNextSlugs: ['whey-isolate-ou-concentree', 'petit-dejeuner-collation-riche-en-proteines']
  },
  {
    id: 7,
    slug: 'comment-choisir-sa-whey-etiquette-prix',
    title: 'Comment bien choisir sa whey : étiquette et prix par portion',
    category: 'Protéines',
    categorySlug: 'proteines',
    metaTitle: 'Bien choisir sa whey : lire l\'étiquette et le prix par dose | NutriFitness',
    metaDescription: 'Taux de protéines réels, aminospiking, labels CFM et coût par portion : les 5 critères indispensables pour ne plus se faire piéger en magasin.',
    targetKeyword: 'comment choisir sa whey',
    readingTime: '5 min',
    publishedAt: '2026-03-12',
    author: 'Marco Scarpantoni',
    authorRole: 'Conseiller Technique NutriFitness Genève',
    image: '/images/blog/nutriftiness-images13.png',
    shortAnswer: 'Ne jugez jamais une whey à son prix au kilo affiché : divisez le prix du pot par le nombre réel de portions de 25 g de protéines pures. Vérifiez ensuite le tableau nutritionnel pour 100 g et assurez-vous de l\'absence d\'aminospiking (acides aminés ajoutés artificiellement).',
    sections: [
      {
        title: '1. Le pourcentage effectif de protéines',
        content: [
          'Vérifiez la ligne Protéines pour 100 g : une bonne whey concentrée doit dépasser 75%, et un isolat doit avoisiner les 88-92%.'
        ]
      },
      {
        title: '2. Détecter l\'aminospiking',
        content: [
          'Méfiez-vous si la liste des ingrédients mentionne de la glycine, de la taurine ou de la créatine parmi les premiers ingrédients sans justificatif : cela gonfle artificiellement le taux de protéines aux dépens de la vraie protéine de lactosérum.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Bigman Ultimate Whey Protein 2kg', href: '/produit/ultimate-whey-bigman-2kg/', brand: 'Bigman', badge: 'Rapport Qualité/Prix' },
      { name: 'Bigman ISO Whey Zero 907g', href: '/produit/iso-whey-zero-907g/', brand: 'Bigman', badge: 'Zéro Aminospiking' },
      { name: 'Marvelous Muscles Whey Concentrée 2kg', href: '/produit/muscles-whey-2kg/', brand: 'Marvelous', badge: 'Microfiltration CFM' }
    ],
    faqs: [
      { question: 'Pourquoi les prix varient-ils autant entre les marques ?', answer: 'La qualité du lait d\'origine, la méthode de filtration (séchage thermique agressif vs microfiltration à froid CFM) et les contrôles de pureté justifient les écarts.' }
    ],
    externalSources: [
      { title: 'Base de données suisse des valeurs nutritives', url: 'https://naehrwertdaten.ch/fr/', authority: 'OSAV Suisse' }
    ],
    readNextSlugs: ['whey-isolate-ou-concentree', 'combien-de-proteines-par-jour-sportif']
  },
  {
    id: 8,
    slug: 'gainer-pour-qui-comment-choisir',
    title: 'Gainer : pour qui et comment bien le choisir ?',
    category: 'Prise de masse',
    categorySlug: 'prise-de-masse',
    metaTitle: 'Gainer prise de masse : pour qui et comment le choisir ? | NutriFitness',
    metaDescription: 'Hard gainer vs Lean gainer : ratio glucides/protéines, sources de glucides (avoine, maltodextrine) et conseils pour prendre du muscle sans gras.',
    targetKeyword: 'gainer prise de masse',
    readingTime: '5 min',
    publishedAt: '2026-03-10',
    author: 'Marco Scarpantoni',
    authorRole: 'Coach Prise de Masse NutriFitness',
    image: '/images/blog/nutriftiness-images16.png',
    shortAnswer: 'Un gainer combine protéines et glucides pour créer un surplus calorique facile à boire. Il est particulièrement recommandé aux personnes à métabolisme très rapide ou en manque d\'appétit qui peinent à prendre du poids avec leurs repas ordinaires.',
    sections: [
      {
        title: 'Hard Gainer vs Lean Gainer',
        content: [
          'Hard Gainer (70% glucides / 20% protéines) : idéal pour les profils ectomorphes très minces.',
          'Lean Gainer (50% glucides / 40% protéines) : formulé pour bâtir du muscle propre en minimisant la rétention de graisse.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Marvelous Big Lean Mass Gainer 3kg', href: '/produit/big-lean-mass-gainer/', brand: 'Marvelous', badge: 'Prise de Muscle Sec' },
      { name: 'Bigman Furiux Mass Gainer 3kg', href: '/produit/furiux-gainer-3kg/', brand: 'Bigman', badge: 'Hard Gainer' },
      { name: 'Marvelous Crème de Riz Précuite 1.4kg', href: '/produit/marvelous-creme-de-riz-14kg/', brand: 'Marvelous', badge: 'Glucides Propres' }
    ],
    faqs: [
      { question: 'Quand boire son gainer ?', answer: 'En collation entre les deux repas principaux ou immédiatement après l\'entraînement pour reconstituer le glycogène musculaire.' }
    ],
    externalSources: [
      { title: 'Nutritional strategies for body recomposition', url: 'https://pubmed.ncbi.nlm.nih.gov/28642676/', authority: 'PubMed' }
    ],
    readNextSlugs: ['combien-de-proteines-par-jour-sportif', 'petit-dejeuner-collation-riche-en-proteines']
  },
  {
    id: 9,
    slug: 'bcaa-ou-eaa-difference',
    title: 'BCAA ou EAA : quelle différence et que choisir ?',
    category: 'Acides aminés',
    categorySlug: 'acides-amines',
    metaTitle: 'BCAA vs EAA : quelle différence et quel complément choisir ? | NutriFitness',
    metaDescription: '3 acides aminés ramifiés ou les 9 acides aminés essentiels ? Tout comprendre sur la synthèse protéique, l\'entraînement à jeun et l\'anabolisme.',
    targetKeyword: 'bcaa ou eaa',
    readingTime: '4 min',
    publishedAt: '2026-03-08',
    author: 'Marco Scarpantoni',
    authorRole: 'Conseiller Technique NutriFitness Genève',
    image: '/images/blog/nutriftiness-images9.jpg',
    shortAnswer: 'Les BCAA n\'apportent que 3 acides aminés (Leucine, Isoleucine, Valine). Les EAA apportent les 9 acides aminés essentiels dont le muscle a besoin pour synthétiser de nouvelles fibres. En l\'absence des 6 autres EAA, la synthèse musculaire est rapidement limitée.',
    sections: [
      {
        title: 'Le rôle de la leucine',
        content: [
          'La leucine est l\'interrupteur de l\'anabolisme musculaire (voie mTOR). Cependant, une fois le signal activé, le corps a besoin de l\'ensemble des 9 acides aminés essentiels pour fabriquer du muscle.'
        ]
      },
      {
        title: 'Quand sont-ils utiles ?',
        content: [
          'Durant les séances longues en période de déficit calorique (sèche) ou lors d\'entraînements à jeun le matin pour limiter la dégradation protéique.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Marvelous Hype Amino EAA + Électrolytes 270g', href: '/produit/hype-amino-270g/', brand: 'Marvelous', badge: '9 EAA Essentiels' },
      { name: 'Bigman BM EAA 300g', href: '/produit/bm-eaa-300g/', brand: 'Bigman', badge: 'Spectre Complet' },
      { name: 'Marvelous L-Glutamine Kyowa Quality® 300g', href: '/produit/marvelous-glutamine-kyowa-300g/', brand: 'Marvelous', badge: 'Anti-Catabolisme' }
    ],
    faqs: [
      { question: 'Peut-on remplacer un shaker de whey par des EAA ?', answer: 'Les EAA sont une excellente alternative pendant l\'entraînement ou pour les personnes ne tolérant aucun produit laitier, mais ils n\'apportent pas les peptides et calories de la whey.' }
    ],
    externalSources: [
      { title: 'Essential amino acids vs branched-chain amino acids in resistance training', url: 'https://pubmed.ncbi.nlm.nih.gov/28642676/', authority: 'NLM' }
    ],
    readNextSlugs: ['glutamine-beta-alanine-citrulline', 'combien-de-proteines-par-jour-sportif']
  },
  {
    id: 10,
    slug: 'glutamine-beta-alanine-citrulline',
    title: 'Glutamine, bêta-alanine, citrulline : à quoi servent-elles ?',
    category: 'Acides aminés',
    categorySlug: 'acides-amines',
    metaTitle: 'Glutamine, Bêta-Alanine, Citrulline : le guide complet | NutriFitness',
    metaDescription: 'Congestion, réduction des courbatures et endurance lactique : rôle, synergies et dosages efficaces pour ces 3 acides aminés incontournables.',
    targetKeyword: 'glutamine bêta-alanine citrulline',
    readingTime: '5 min',
    publishedAt: '2026-03-05',
    author: 'Marco Scarpantoni',
    authorRole: 'Préparateur Physique NutriFitness Genève',
    image: '/images/blog/nutriftiness-images19.png',
    shortAnswer: 'La Citrulline booste l\'oxyde nitrique (NO) et la congestion musculaire. La Bêta-Alanine augmente les stocks de carnosine pour retarder la brûlure lactique lors des efforts intenses. La L-Glutamine soutient la récupération de la muqueuse intestinale et du système immunitaire.',
    sections: [
      {
        title: 'L-Citrulline Malate',
        content: [
          'Dose efficace : 6 à 8 g avant l\'entraînement. Elle améliore le flux sanguin, l\'oxygénation musculaire et l\'élimination de l\'ammoniac.'
        ]
      },
      {
        title: 'Bêta-Alanine',
        content: [
          'Dose efficace : 3.2 à 6.4 g par jour. Elle tamponne l\'acidité musculaire lors des séries longues de 8 à 15 répétitions.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Marvelous L-Glutamine Kyowa Quality® 300g', href: '/produit/marvelous-glutamine-kyowa-300g/', brand: 'Marvelous', badge: 'Label Kyowa®' },
      { name: 'Marvelous L-Citrulline Malate 100% Pure 250g', href: '/produit/l-citrulline-100-pure-250g/', brand: 'Marvelous', badge: 'Vasodilatation & NO' },
      { name: 'Marvelous Hype Amino EAA + Électrolytes 270g', href: '/produit/hype-amino-270g/', brand: 'Marvelous', badge: 'Récupération' }
    ],
    faqs: [
      { question: 'Peut-on les consommer dans la même boisson ?', answer: 'Absolument. La combinaison de Citrulline et Bêta-Alanine constitue la base des meilleurs pré-workouts du marché.' }
    ],
    externalSources: [
      { title: 'Journal of the International Society of Sports Nutrition (JISSN)', url: 'https://jissn.biomedcentral.com/', authority: 'BioMed Central' }
    ],
    readNextSlugs: ['pre-workout-comment-choisir', 'bcaa-ou-eaa-difference']
  },
  {
    id: 11,
    slug: 'pre-workout-comment-choisir',
    title: 'Pré-workout : comment bien le choisir ?',
    category: 'Pré-workout & énergie',
    categorySlug: 'pre-workout',
    metaTitle: 'Pré-workout : comment choisir son booster d\'entraînement | NutriFitness',
    metaDescription: 'Avec ou sans caféine, vasodilatateurs, nootropiques et horaires d\'entraînement : trouvez le booster adapté à votre tolérance et rythme.',
    targetKeyword: 'pré-workout comment choisir',
    readingTime: '5 min',
    publishedAt: '2026-03-02',
    author: 'Marco Scarpantoni',
    authorRole: 'Coach & Conseiller NutriFitness',
    image: '/images/blog/nutriftiness-images61.jpg',
    shortAnswer: 'Vérifiez systématiquement la teneur en caféine par dose (entre 150 et 300 mg) et privilégiez les formules aux dosages transparents (sans mélanges propriétaires cachés). Si vous vous entraînez après 17h, optez pour un booster sans stimulants (Pump non-stim).',
    sections: [
      {
        title: 'Avec ou sans stimulants ?',
        content: [
          'Avec caféine : idéal pour les entraînements matinaux ou en début d\'après-midi.',
          'Sans stimulants (Pump) : axé uniquement sur la citrulline, l\'arginine et la vasodilatation pour préserver votre sommeil profond la nuit.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'NutriFitness Ignite Burn Pre-Workout 210g', href: '/produit/ignite-burn-210g-orange-mangue/', brand: 'NutriFitness', badge: 'Booster Explosif' },
      { name: 'Marvelous L-Citrulline Malate 100% Pure 250g', href: '/produit/l-citrulline-100-pure-250g/', brand: 'Marvelous', badge: 'Pump Non-Stim' },
      { name: 'Bigman Caféine Pure 100mg 90 Gélules', href: '/produit/caffeine-90-caps-100mg/', brand: 'Bigman', badge: 'Énergie Pure' }
    ],
    faqs: [
      { question: 'Combien de temps avant la séance le prendre ?', answer: 'Buvez votre pré-workout 20 à 30 minutes avant le début de votre séance d\'échauffement.' }
    ],
    externalSources: [
      { title: 'EFSA Panel on Dietetic Products: Safety of caffeine', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4102', authority: 'EFSA' }
    ],
    readNextSlugs: ['cafeine-gelules-dose-precautions', 'glutamine-beta-alanine-citrulline']
  },
  {
    id: 12,
    slug: 'cafeine-gelules-dose-precautions',
    title: 'Caféine en gélules : dose et précautions',
    category: 'Pré-workout & énergie',
    categorySlug: 'pre-workout',
    metaTitle: 'Caféine en gélules : dosages sûrs et recommandations EFSA | NutriFitness',
    metaDescription: 'Combien de caféine par jour ? Repères de l\'EFSA (400 mg), impact sur l\'endurance, le sommeil et précautions pour les sportifs.',
    targetKeyword: 'caféine gélules dose',
    readingTime: '4 min',
    publishedAt: '2026-02-28',
    author: 'Marco Scarpantoni',
    authorRole: 'Coach NutriFitness Genève',
    image: '/images/blog/nutriftiness-images22.png',
    shortAnswer: 'Pour un adulte en bonne santé, l\'EFSA juge sûre une dose quotidienne allant jusqu\'à 400 mg de caféine toutes sources confondues, et 200 mg par prise unitaire (environ 3 mg par kg de poids pour un effet ergogène sur la séance).',
    sections: [
      {
        title: 'Calculer ses apports cumulés',
        content: [
          'Un expresso suisse apporte 60 à 90 mg de caféine.',
          'Pensez à additionner le thé vert, les sodas et votre pré-workout pour ne pas saturer vos récepteurs.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Bigman Caféine Pure 100mg 90 Gélules', href: '/produit/caffeine-90-caps-100mg/', brand: 'Bigman', badge: '100mg par Gélule' },
      { name: 'NutriFitness Ignite Burn Pre-Workout 210g', href: '/produit/ignite-burn-210g-orange-mangue/', brand: 'NutriFitness', badge: 'Formule Complète' },
      { name: 'Marvelous Magnésium Bisglycinate 90 Gélules', href: '/produit/magnesium-bisglycinate-90-caps/', brand: 'Marvelous', badge: 'Détente Post-Effort' }
    ],
    faqs: [
      { question: 'La gélule est-elle meilleure que le café ?', answer: 'La molécule est rigoureusement identique, mais la gélule évite l\'acidité gastrique et garantit un dosage constant au milligramme près.' }
    ],
    externalSources: [
      { title: 'Scientific Opinion on the safety of caffeine – EFSA Journal', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4102', authority: 'EFSA' }
    ],
    readNextSlugs: ['pre-workout-comment-choisir', 'electrolytes-hydratation-effort']
  },
  {
    id: 13,
    slug: 'magnesium-bisglycinate-comment-choisir',
    title: 'Magnésium bisglycinate ou autres formes : comment choisir ?',
    category: 'Vitamines & minéraux',
    categorySlug: 'vitamines-mineraux',
    metaTitle: 'Magnésium Bisglycinate vs Citrate vs Oxyde : lequel choisir ? | NutriFitness',
    metaDescription: 'Absorption digestive, biodisponibilité et teneur en magnésium élémentaire : pourquoi le bisglycinate est plébiscité par les athlètes suisses.',
    targetKeyword: 'magnésium bisglycinate',
    readingTime: '5 min',
    publishedAt: '2026-02-24',
    author: 'Marco Scarpantoni',
    authorRole: 'Conseiller Technique NutriFitness Genève',
    image: '/images/blog/nutriftiness-images8.jpg',
    shortAnswer: 'Le magnésium bisglycinate est chélaté à deux molécules d\'acide aminé glycine. Cette liaison organique protège le minéral contre l\'acidité gastrique et assure une biodisponibilité optimale sans le moindre effet laxatif.',
    sections: [
      {
        title: 'Pourquoi éviter l\'oxyde de magnésium bon marché ?',
        content: [
          'L\'oxyde a une absorption intestinale inférieure à 5%. Il reste dans le côlon et provoque fréquemment des troubles digestifs.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Marvelous Magnésium Bisglycinate 90 Gélules', href: '/produit/magnesium-bisglycinate-90-caps/', brand: 'Marvelous', badge: 'Chélation Supérieure' },
      { name: 'Pronutrition Magnésium Bisglycinate 180g Poudre Citron', href: '/produit/magnesium-bisglycinate-180g-lemon/', brand: 'Pronutrition.it', badge: 'Solubilité Parfaite' },
      { name: 'Marvelous ZMA Advanced Formule Nuit 90 Gélules', href: '/produit/zma-90-caps/', brand: 'Marvelous', badge: 'Synergie Nuit' }
    ],
    faqs: [
      { question: 'Quel est le meilleur moment pour prendre son magnésium ?', answer: 'Le soir au dîner ou 45 minutes avant le coucher pour accompagner la décontraction musculaire et la qualité du sommeil.' }
    ],
    externalSources: [
      { title: 'NIH Office of Dietary Supplements: Magnesium Fact Sheet', url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/', authority: 'NIH' }
    ],
    readNextSlugs: ['zinc-magnesium-zma-comprendre', 'omega-3-comment-choisir']
  },
  {
    id: 14,
    slug: 'zinc-magnesium-zma-comprendre',
    title: 'Zinc, magnésium, ZMA : comprendre avant d\'acheter',
    category: 'Vitamines & minéraux',
    categorySlug: 'vitamines-mineraux',
    metaTitle: 'Zinc, Magnésium, ZMA : le point complet sur la formule | NutriFitness',
    metaDescription: 'Rôle du zinc bisglycinate, régulation hormonale, récupération nerveuse et posologie : tout savoir sur le complément star des sportifs de force.',
    targetKeyword: 'zma zinc magnésium',
    readingTime: '4 min',
    publishedAt: '2026-02-20',
    author: 'Marco Scarpantoni',
    authorRole: 'Coach NutriFitness Genève',
    image: '/images/blog/nutriftiness-images7.png',
    shortAnswer: 'Le ZMA associe Zinc, Magnésium et Vitamine B6 sous des formes hautement biodisponibles. Il est conçu pour pallier les pertes minérales induites par la sudation abondante et soutenir les taux normaux de testostérone et la synthèse des protéines.',
    sections: [
      {
        title: 'Précautions de prise',
        content: [
          'Évitez de consommer votre ZMA simultanément avec des produits laitiers car le calcium entre en compétition d\'absorption avec le zinc au niveau intestinal.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Marvelous ZMA Advanced Formule Nuit 90 Gélules', href: '/produit/zma-90-caps/', brand: 'Marvelous', badge: 'Formule Nuit ZMA' },
      { name: 'Applied Nutrition Zinc Bisglycinate 90 Gélules', href: '/produit/zinc-bisglicinate-90-cap/', brand: 'Applied Nutrition', badge: 'Zinc Chélaté' },
      { name: 'Marvelous Magnésium Bisglycinate 90 Gélules', href: '/produit/magnesium-bisglycinate-90-caps/', brand: 'Marvelous', badge: 'Sommeil Profond' }
    ],
    faqs: [
      { question: 'Le ZMA augmente-t-il la testostérone ?', answer: 'Il maintient les taux physiologiques optimaux chez les athlètes intensifs qui ont tendance à éliminer beaucoup de zinc dans la sueur.' }
    ],
    externalSources: [
      { title: 'NIH: Zinc Fact Sheet for Health Professionals', url: 'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/', authority: 'NIH' }
    ],
    readNextSlugs: ['magnesium-bisglycinate-comment-choisir', 'omega-3-comment-choisir']
  },
  {
    id: 15,
    slug: 'omega-3-comment-choisir',
    title: 'Oméga 3 : comment bien choisir son complément ?',
    category: 'Vitamines & minéraux',
    categorySlug: 'vitamines-mineraux',
    metaTitle: 'Bien choisir ses Oméga 3 : ratios EPA, DHA et pureté | NutriFitness Suisse',
    metaDescription: 'Indice TOTOX, forme triglycérides, teneur réelle en EPA/DHA : le guide indispensable pour acheter une huile de poisson saine et efficace.',
    targetKeyword: 'oméga 3 comment choisir',
    readingTime: '5 min',
    publishedAt: '2026-02-16',
    author: 'Marco Scarpantoni',
    authorRole: 'Conseiller Technique NutriFitness Genève',
    image: '/images/blog/nutriftiness-images59.jpg',
    shortAnswer: 'Ne regardez pas la quantité d\'huile de poisson totale, mais la teneur spécifique en acides gras essentiels EPA et DHA. Visez au minimum 500 à 800 mg d\'EPA/DHA combinés par dose journalière sous forme naturelle de triglycérides.',
    sections: [
      {
        title: 'Indice TOTOX : la garantie de fraîcheur',
        content: [
          'L\'indice TOTOX mesure le degré d\'oxydation des lipides. Un bon produit affiche un indice inférieur à 10, garantissant une absence d\'odeur de rance et un profil anti-inflammatoire préservé.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Marvelous Omega 3 Haute Concentration 120 Capsules', href: '/produit/omega-3-120-softgels/', brand: 'Marvelous', badge: 'EPA/DHA Purifié' },
      { name: 'Marvelous Vitamine D3 + K2 MK7 90 Gélules', href: '/produit/mk7-vitamine-d3-k2-90-caps/', brand: 'Marvelous', badge: 'Synergie Santé' },
      { name: 'Marvelous Magnésium Bisglycinate 90 Gélules', href: '/produit/magnesium-bisglycinate-90-caps/', brand: 'Marvelous', badge: 'Équilibre Global' }
    ],
    faqs: [
      { question: 'Quand prendre ses gélules d\'oméga 3 ?', answer: 'Toujours au cours d\'un repas contenant des matières grasses saines (avocat, huile d\'olive, œufs) pour optimiser l\'action des lipases digestives.' }
    ],
    externalSources: [
      { title: 'NIH Office of Dietary Supplements: Omega-3 Fatty Acids', url: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/', authority: 'NIH' }
    ],
    readNextSlugs: ['magnesium-bisglycinate-comment-choisir', 'electrolytes-hydratation-effort']
  },
  {
    id: 16,
    slug: 'electrolytes-hydratation-effort',
    title: 'Électrolytes et hydratation pendant l\'effort : ce qu\'il faut savoir',
    category: 'Récupération & hydratation',
    categorySlug: 'recuperation-hydratation',
    metaTitle: 'Électrolytes et hydratation sportive : le guide expert | NutriFitness Suisse',
    metaDescription: 'Sodium, potassium, magnésium : pourquoi l\'eau seule ne suffit pas sur les efforts intenses et comment prévenir les crampes et la baisse de performance.',
    targetKeyword: 'électrolytes sport hydratation',
    readingTime: '5 min',
    publishedAt: '2026-02-12',
    author: 'Marco Scarpantoni',
    authorRole: 'Coach & Préparateur Physique NutriFitness Genève',
    image: '/images/blog/nutriftiness-images36.jpg',
    shortAnswer: 'Lors d\'entraînements dépassant 60 minutes ou par temps chaud, l\'eau pure bue en grande quantité peut diluer le sodium sanguin (hyponatrémie). L\'apport conjoint d\'électrolytes permet de retenir l\'eau dans les cellules et d\'éviter les crampes musculaires.',
    sections: [
      {
        title: 'Le rôle clé du sodium',
        content: [
          'Le sodium est le principal minéral éliminé dans la sueur (environ 900 à 1200 mg par litre de sueur). Sa réplétion permet de stabiliser le volume plasmatique et de maintenir l\'endurance.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Per4m Hydra Advanced Electrolytes 210g', href: '/produit/hydra-electrolytes-210g/', brand: 'Per4m', badge: 'Anti-Crampes' },
      { name: 'Pronutrition Enerdyn Isotonique 20 Sachets', href: '/produit/20-sachets-enerdyn-orange/', brand: 'Pronutrition.it', badge: 'Recharge Rapide' },
      { name: 'NutriFitness Shaker Anti-Grumeaux 600ml', href: '/produit/nf-shaker-600ml/', brand: 'NutriFitness', badge: '100% Étanche' }
    ],
    faqs: [
      { question: 'Faut-il des électrolytes pour une séance de musculation de 45 minutes ?', answer: 'De l\'eau fraîche suffit dans la plupart des cas, sauf si la température ambiante est très élevée ou si vous transpirez excessivement.' }
    ],
    externalSources: [
      { title: 'Société Suisse de Nutrition: Recommandations pour sportifs', url: 'https://www.sge-ssn.ch/fr/', authority: 'SSN Berne' }
    ],
    readNextSlugs: ['magnesium-bisglycinate-comment-choisir', 'omega-3-comment-choisir']
  },
  {
    id: 17,
    slug: 'perte-de-poids-complements-ce-que-disent-les-preuves',
    title: 'Perdre du poids : que peuvent (vraiment) faire les compléments ?',
    category: 'Perte de poids',
    categorySlug: 'perte-de-poids',
    metaTitle: 'Perte de poids et compléments : ce que disent les preuves scientifiques',
    metaDescription: 'Brûleurs de graisse, coupe-faims, caféine et whey en sèche : découvrez ce qui fonctionne réellement et les mythes à oublier sans tarder.',
    targetKeyword: 'perte de poids compléments efficaces',
    readingTime: '6 min',
    publishedAt: '2026-02-08',
    author: 'Marco Scarpantoni',
    authorRole: 'Nutritionniste & Fondateur NutriFitness',
    image: '/images/blog/nutriftiness-images18.png',
    shortAnswer: 'Aucun complément alimentaire ne fait perdre du poids à lui seul sans déficit calorique modéré et régulier. Les protéines en poudre et la caféine sont les aides les plus efficaces pour préserver la masse musculaire et soutenir la satiété au cours d\'une sèche.',
    sections: [
      {
        title: 'La hiérarchie de la perte de gras',
        content: [
          '1. Déficit calorique modéré (300 à 500 kcal/jour sous le maintien).',
          '2. Apport protéique élevé (2.0 à 2.4 g/kg) pour épargner le muscle.',
          '3. Entraînement de musculation lourd pour stimuler la rétention de tissu contractile.',
          '4. Les compléments : un levier d\'appoint représentant 5% du résultat global.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Bigman L-Carnitine 3000mg Shot Citron 20 Fiolles', href: '/produit/carnitine-shot-lemon-20-fiolles/', brand: 'Bigman', badge: 'L-Carnitine 3000mg' },
      { name: 'Bigman NOX Burn Thermogénique 90 Gélules', href: '/produit/nox-burn-90-caps/', brand: 'Bigman', badge: 'Thermogénique Actif' },
      { name: 'Pronutrition Sandwich Keto Bar 55g', href: '/produit/sandwich-keto-bar/', brand: 'Pronutrition.it', badge: 'Coupe-Faim Protéiné' }
    ],
    faqs: [
      { question: 'Les brûleurs thermogéniques sont-ils utiles ?', answer: 'Leur impact métabolique direct est modeste (environ 50 à 100 kcal par jour via la thermogenèse de la caféine). Ils aident surtout à diminuer la sensation de léthargie liée au déficit calorique.' }
    ],
    externalSources: [
      { title: 'Office fédéral de la sécurité alimentaire et des affaires vétérinaires (OSAV)', url: 'https://www.blv.admin.ch/blv/fr/home.html', authority: 'OSAV Suisse' }
    ],
    readNextSlugs: ['combien-de-proteines-par-jour-sportif', 'barres-snacks-proteines-comment-choisir']
  },
  {
    id: 18,
    slug: 'petit-dejeuner-collation-riche-en-proteines',
    title: 'Petit-déjeuner et collations riches en protéines : 4 idées simples',
    category: 'Snacks & nutrition',
    categorySlug: 'snacks-food',
    metaTitle: 'Petit-déjeuner riche en protéines : 4 idées rapides et gourmandes | NutriFitness',
    metaDescription: 'Overnight oats, pancakes protéinés, bol de crème de riz et smoothie : commencez la journée avec 30g+ de protéines de qualité supérieure.',
    targetKeyword: 'petit déjeuner riche en protéines',
    readingTime: '4 min',
    publishedAt: '2026-02-04',
    author: 'Marco Scarpantoni',
    authorRole: 'Coach NutriFitness Genève',
    image: '/images/blog/nutriftiness-images17.png',
    shortAnswer: 'Pour démarrer la journée avec 30 g de protéines sans perdre de temps : 1) Overnight oats à la whey et graines de chia préparés la veille, 2) Pancakes protéinés express, 3) Crème de riz tiède et isolate chocolat, 4) Smoothie banane-beurre de cacahuète.',
    sections: [
      {
        title: 'Recette : Overnight Oats Protéinés (35g protéines)',
        content: [
          '50 g de flocons d\'avoine complets, 1 dose (30 g) de Whey Chocolat Suisse NutriFitness, 150 ml de lait végétal, 1 cuillère à café de graines de chia. Mélangez dans un bocal et laissez gonfler une nuit au réfrigérateur.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Marvelous Crème de Riz Précuite 1.4kg', href: '/produit/marvelous-creme-de-riz-14kg/', brand: 'Marvelous', badge: 'Glucides Ultra Digestes' },
      { name: 'Body Attack Peanut Butter 100% Pur 1kg', href: '/produit/beurre-de-cacahuete-1kg/', brand: 'Body Attack', badge: '100% Pur Cacahuète' },
      { name: 'Bigman Ultimate Whey Protein 2kg', href: '/produit/ultimate-whey-bigman-2kg/', brand: 'Bigman', badge: 'Protéines du Matin' }
    ],
    faqs: [
      { question: 'La cuisson de la whey détruit-elle les acides aminés ?', answer: 'Non. La chaleur modifie la conformation spatiale de la protéine (dénaturation), mais les acides aminés essentiels demeurent totalement absorbables par l\'organisme.' }
    ],
    externalSources: [
      { title: 'Base de données suisse des valeurs nutritives', url: 'https://naehrwertdaten.ch/fr/', authority: 'OSAV' }
    ],
    readNextSlugs: ['barres-snacks-proteines-comment-choisir', 'combien-de-proteines-par-jour-sportif']
  },
  {
    id: 19,
    slug: 'barres-snacks-proteines-comment-choisir',
    title: 'Barres et snacks protéinés : comment bien choisir ?',
    category: 'Snacks & nutrition',
    categorySlug: 'snacks-food',
    metaTitle: 'Bien choisir sa barre protéinée : sucres, polyols et protéines | NutriFitness',
    metaDescription: 'Comment repérer les vraies barres protéinées face aux barres chocolatées déguisées ? Taux de sucres, fibres prébiotiques et ingrédients analysés.',
    targetKeyword: 'barre protéinée comment choisir',
    readingTime: '5 min',
    publishedAt: '2026-02-01',
    author: 'Marco Scarpantoni',
    authorRole: 'Conseiller Technique NutriFitness Genève',
    image: '/images/blog/nutriftiness-images24.png',
    shortAnswer: 'Une excellente barre protéinée doit apporter au minimum 18 à 22 g de protéines de qualité pour moins de 2 à 3 g de sucres rapides. Évitez les produits où les sirops de glucose ou de fructose figurent en tête de la liste des ingrédients.',
    sections: [
      {
        title: 'Attention aux glucides cachés',
        content: [
          'De nombreuses barres du commerce traditionnel affichent 20 g de protéines mais contiennent également 25 g de sucres simples, les rapprochant d\'une confiserie ordinaire.'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Pronutrition Sandwich Keto Bar 55g', href: '/produit/sandwich-keto-bar/', brand: 'Pronutrition.it', badge: '< 1.7g Sucre' },
      { name: 'Pronutrition Croissant Cornetto Keto 50g', href: '/produit/cornetto-croissant-keto-50g/', brand: 'Pronutrition.it', badge: 'Croissant Gourmand Keto' },
      { name: 'Body Attack Peanut Butter 100% Pur 1kg', href: '/produit/beurre-de-cacahuete-1kg/', brand: 'Body Attack', badge: 'Gras Sains 0 Sucre' }
    ],
    faqs: [
      { question: 'Les polyols font-ils grossir ?', answer: 'Les polyols (maltitol, érythritol) ont une valeur calorique très inférieure au sucre (environ 2.4 kcal/g pour le maltitol, 0.2 kcal/g pour l\'érythritol) et ne provoquent pas de pic d\'insuline brutal.' }
    ],
    externalSources: [
      { title: 'Société Suisse de Nutrition: Alimentation du sportif', url: 'https://www.sge-ssn.ch/fr/', authority: 'SSN' }
    ],
    readNextSlugs: ['petit-dejeuner-collation-riche-en-proteines', 'perte-de-poids-complements-ce-que-disent-les-preuves']
  },
  {
    id: 20,
    slug: 'premiers-complements-guide-debutant-suisse',
    title: 'Premiers compléments : le guide du débutant en Suisse',
    category: 'Guide débutant',
    categorySlug: 'guide-debutant',
    metaTitle: 'Compléments alimentaires pour débuter en musculation en Suisse | NutriFitness',
    metaDescription: 'Par quoi commencer sans gaspiller son argent ? Protéines, créatine monohydrate, caféine : l\'ordre de priorité validé par notre boutique de Genève.',
    targetKeyword: 'compléments alimentaires sport débutant',
    readingTime: '6 min',
    publishedAt: '2026-01-28',
    author: 'Marco Scarpantoni',
    authorRole: 'Fondateur NutriFitness Genève (20+ ans d\'expérience)',
    image: '/images/blog/nutriftiness-images33.jpg',
    shortAnswer: 'Ne commencez pas par acheter 10 compléments différents. La trilogie de base d\'une efficacité incontestable repose sur : 1) une bonne Whey pour sécuriser votre quota de protéines, 2) de la Créatine Monohydrate (Creapure®) pour la force, 3) des Oméga 3 et Magnésium pour la santé et le sommeil.',
    sections: [
      {
        title: 'Étape 1 : Consolider les fondations',
        content: [
          'Entraînement régulier et progressif, alimentation équilibrée et sommeil de qualité (7 à 8 heures). Aucun complément ne compensera un manque d\'assiduité à la salle ou des nuits courtes.'
        ]
      },
      {
        title: 'Étape 2 : L\'ordre de priorité rationnel',
        content: [
          '1. Whey Protein : la commodité pour atteindre 1.6 à 2.0 g/kg.',
          '2. Créatine Monohydrate : 3 à 5 g/jour pour la force explosive.',
          '3. Électrolytes ou Booster : uniquement si vous ressentez une baisse de régime ciblée.'
        ]
      },
      {
        title: 'Pourquoi commander en Suisse chez NutriFitness ?',
        content: [
          'Stock 100% physique dans notre entrepôt et boutique de Genève (34 Rue des Pâquis).',
          'Aucun frais de douane sorpresa ni blocage aux frontières (TVA suisse 2.6% incluse).',
          'Expédition prioritaire 24h par La Poste Suisse (PostPac Priority).'
        ]
      }
    ],
    suggestedProducts: [
      { name: 'Bigman Ultimate Whey Protein 2kg', href: '/produit/ultimate-whey-bigman-2kg/', brand: 'Bigman', badge: 'Pilier 1 : Protéines' },
      { name: 'Bigman Creapure® Monohydrate 300g', href: '/produit/creapure-bigman-300g/', brand: 'Bigman', badge: 'Pilier 2 : Créatine' },
      { name: 'Marvelous Omega 3 Haute Concentration 120 Capsules', href: '/produit/omega-3-120-softgels/', brand: 'Marvelous', badge: 'Pilier 3 : Oméga 3' }
    ],
    faqs: [
      { question: 'Les compléments sont-ils obligatoires pour progresser ?', answer: 'Non, ils ne sont pas obligatoires mais facilitent grandement l\'atteinte des besoins nutritionnels des sportifs sans surcharger le budget ni le temps de préparation.' },
      { question: 'Puis-je venir demander conseil directement à la boutique de Genève ?', answer: 'Avec plaisir ! Notre équipe vous accueille du lundi au samedi au 34 Rue des Pâquis, 1201 Genève, pour un conseil personnalisé sans engagement.' }
    ],
    externalSources: [
      { title: 'ISSN position stand: Safety and efficacy of creatine', url: 'https://pubmed.ncbi.nlm.nih.gov/28615996/', authority: 'ISSN' },
      { title: 'Office fédéral de la sécurité alimentaire (OSAV)', url: 'https://www.blv.admin.ch/blv/fr/home.html', authority: 'Confédération Suisse' }
    ],
    readNextSlugs: ['creatine-quand-comment-la-prendre', 'whey-isolate-ou-concentree', 'combien-de-proteines-par-jour-sportif']
  }
];

export function getAllBlogPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug || p.slug === slug.replace(/^\/blog\//, '').replace(/\/$/, ''));
}

export function getBlogPostsByCategory(catSlug: string): BlogPost[] {
  return BLOG_POSTS.filter(p => p.categorySlug === catSlug);
}

export function getRecentBlogPosts(count = 3): BlogPost[] {
  return BLOG_POSTS.slice(0, count);
}

export const BLOG_CATEGORIES = [
  { slug: 'all', name: 'Tous les Dossiers', count: BLOG_POSTS.length },
  { slug: 'creatine', name: 'Créatine', count: BLOG_POSTS.filter(p => p.categorySlug === 'creatine').length },
  { slug: 'proteines', name: 'Protéines & Whey', count: BLOG_POSTS.filter(p => p.categorySlug === 'proteines').length },
  { slug: 'acides-amines', name: 'Acides Aminés', count: BLOG_POSTS.filter(p => p.categorySlug === 'acides-amines').length },
  { slug: 'pre-workout', name: 'Pré-Workout & Énergie', count: BLOG_POSTS.filter(p => p.categorySlug === 'pre-workout').length },
  { slug: 'vitamines-mineraux', name: 'Vitamines & Minéraux', count: BLOG_POSTS.filter(p => p.categorySlug === 'vitamines-mineraux').length },
  { slug: 'recuperation-hydratation', name: 'Récupération & Hydratation', count: BLOG_POSTS.filter(p => p.categorySlug === 'recuperation-hydratation').length },
  { slug: 'perte-de-poids', name: 'Perte de Poids', count: BLOG_POSTS.filter(p => p.categorySlug === 'perte-de-poids').length },
  { slug: 'snacks-food', name: 'Snacks & Nutrition', count: BLOG_POSTS.filter(p => p.categorySlug === 'snacks-food').length },
  { slug: 'guide-debutant', name: 'Guides Débutants', count: BLOG_POSTS.filter(p => p.categorySlug === 'guide-debutant').length },
];
