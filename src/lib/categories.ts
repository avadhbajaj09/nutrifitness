export interface CategoryFaq {
  question: string;
  answer: string;
}

export interface BuyingGuideSection {
  title: string;
  paragraphs?: string[];
  bulletPoints?: { label: string; text: string }[];
  steps?: { title: string; description: string }[];
}

export interface InternalLinkItem {
  title: string;
  href: string;
}

export interface CategoryData {
  id: string;
  slug: string;
  name: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  targetKeywords: string[];
  subcategories: string[];
  intro: string[];
  buyingGuide: BuyingGuideSection[];
  faqs: CategoryFaq[];
  internalLinks: InternalLinkItem[];
  featuredProductNames: string[];
  externalSources: { title: string; url: string }[];
}

export const CATEGORIES_DATA: CategoryData[] = [
  {
    id: 'proteines',
    slug: 'proteines',
    name: 'Protéines & Whey',
    h1: 'Protéines : whey, isolate et protéines végétales',
    metaTitle: 'Protéines en poudre : whey, isolate, végétales | Nutrifitness Suisse',
    metaDescription: 'Whey, isolate, protéines végétales et clear : comparez les protéines en poudre et trouvez celle qui convient. Boutique à Genève, livraison 24h en Suisse.',
    targetKeywords: ['whey protéine Suisse', 'whey isolate Genève', 'protéine végétale', 'protéine en poudre Genève', 'meilleure whey'],
    subcategories: ['Whey concentrée', 'Whey isolate', 'Protéines végétales', 'Protéines clear', 'Autres sources (œuf, bœuf)'],
    intro: [
      "Les protéines en poudre sont des compléments alimentaires qui permettent d'augmenter facilement l'apport en protéines de la journée. Elles s'ajoutent à l'alimentation : elles ne la remplacent pas. Chez NutriFitness Genève, vous trouvez des whey concentrées et isolates, des protéines végétales et d'autres sources comme les protéines clear, à comparer selon votre objectif, votre budget et votre confort digestif.",
      "Pour bien choisir, analysez trois critères majeurs : la teneur en protéines pour 100 g, la taille de la portion et le prix par portion réelle. Une whey isolate contient généralement plus de 85-90% de protéines pures et quasiment aucun lactose ; une protéine végétale convient parfaitement aux régimes végans ou intolérants au lait. Notre équipe vous accueille et vous oriente également au magasin du 34 Rue des Pâquis à Genève."
    ],
    buyingGuide: [
      {
        title: 'Les grandes familles de protéines',
        bulletPoints: [
          { label: 'Whey concentrée', text: 'Issue du lactosérum de lait, teneur en protéines généralement de 70 à 80 %, goût onctueux et tarif très accessible. Elle contient une légère part naturelle de lactose.' },
          { label: 'Whey isolate (CFM)', text: 'Microfiltrée à flux croisé, 85 à 92 % de protéines, teneur infime en glucides et lipides. Idéale en période de sèche et pour les personnes sensibles au lactose.' },
          { label: 'Protéines végétales', text: 'Pois, riz brun, soja ou mélanges synergiques. Conviennent aux régimes vegans et personnes évitant les produits laitiers.' },
          { label: 'Protéines Clear', text: 'Boissons fruitées et limpides à la texture de jus. Légères et rafraîchissantes, idéales pour ceux qui n\'aiment pas les milk-shakes crémeux.' },
          { label: 'Blanc d\'œuf et bœuf', text: 'Alternatives de haute digestibilité pour diversifier les profils d\'acides aminés sans lactose.' }
        ]
      },
      {
        title: 'Comment bien choisir sa protéine',
        steps: [
          { title: 'Évaluez votre apport alimentaire', description: 'Si vos repas couvrent déjà 1.6 à 2 g/kg de poids de corps, le complément reste facultatif.' },
          { title: 'Contrôlez votre tolérance digestive', description: 'En cas de ballonnements avec le lait, orientez-vous vers une isolate CFM ou une source végétale.' },
          { title: 'Calculez le prix au kilo de protéine pure', description: 'Divisez le prix du pot par la quantité totale de protéines nettes pour une comparaison impartiale.' },
          { title: 'Vérifiez la pureté des ingrédients', description: 'Privilégiez les formulations sans sucres ajoutés, enrichies en enzymes digestives (DigeZyme®).' }
        ]
      },
      {
        title: 'Conseils d\'utilisation & Posologie',
        paragraphs: [
          'Mélangez une dosette (environ 25 à 30 g) dans 200 à 300 ml d\'eau fraîche ou de lait végétal. La prise post-entraînement ou au petit-déjeuner est très populaire, mais c\'est l\'apport protidique régulier sur 24 heures qui stimule l\'anabolisme musculaire.',
          'Précautions : En cas de pathologie rénale préexistante, demandez l\'avis d\'un médecin avant toute augmentation marquée de vos apports protidiques.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Quelle est la différence entre whey concentrée et whey isolate ?',
        answer: 'La concentrée titre entre 70 et 80 % de protéines avec un peu de lactose. L\'isolate est microfiltrée pour atteindre 85 à 90 %+ de protéines avec un taux de lactose quasi-nul, offrant une digestion plus rapide et plus légère.'
      },
      {
        question: 'Combien de protéines par jour faut-il pour un sportif en Suisse ?',
        answer: 'Les consensus de l\'ISSN et de la Société Suisse de Nutrition recommandent entre 1.4 et 2.0 g de protéines par kilo de poids corporel par jour chez les pratiquants de musculation ou sports d\'endurance soutenus.'
      },
      {
        question: 'Quand faut-il prendre son shaker de whey ?',
        answer: 'Le moment précis importe moins que le total journalier. Les moments les plus pratiques sont en collation matinale, après l\'entraînement pour optimiser la synthèse protéique, ou au réveil.'
      },
      {
        question: 'Les protéines végétales sont-elles aussi efficaces que la whey ?',
        answer: 'Oui, à condition de choisir un mélange complémentaire (par exemple pois et riz brun) qui apporte l\'intégralité des 9 acides aminés essentiels avec une richesse suffisante en leucine.'
      },
      {
        question: 'Je suis intolérant au lactose : quelle protéine choisir ?',
        answer: 'Optez pour une whey isolate ultra-filtrée (comme Iso Whey Zero ou Iso 90X CFM) ou une protéine végétale garantie sans lactose.'
      },
      {
        question: 'Les protéines en poudre fatiguent-elles les reins ?',
        answer: 'Chez les individus en bonne santé, aucune étude clinique n\'a démontré de nocivité rénale aux dosages sportifs usuels. Consultez votre médecin en cas d\'insuffisance rénale avérée.'
      }
    ],
    internalLinks: [
      { title: 'Créatine Monohydrate', href: '/categorie/creatine/' },
      { title: 'Gainers & Prise de Masse', href: '/categorie/gainers-prise-de-masse/' },
      { title: 'Acides Aminés & BCAA', href: '/categorie/acides-amines-recuperation/' },
      { title: 'Guide : Choisir sa Whey', href: '/blog/whey-isolate-ou-concentree/' }
    ],
    featuredProductNames: [
      'Ultimate Whey Protein 2kg BigMan',
      'Iso Whey Zero 907g BigMan',
      'Iso 90X CFM 1kg Dirty Squads',
      'Iso 80X Grass Fed 2kg Dirty Squads'
    ],
    externalSources: [
      { title: 'ISSN Position Stand: Protein and exercise', url: 'https://pubmed.ncbi.nlm.nih.gov/28642676/' },
      { title: 'Société Suisse de Nutrition (SSN)', url: 'https://www.sge-ssn.ch/fr/' }
    ]
  },
  {
    id: 'gainers-prise-de-masse',
    slug: 'gainers-prise-de-masse',
    name: 'Gainers & Masse',
    h1: 'Gainers et prise de masse musculaire',
    metaTitle: 'Gainers et prise de masse : poudres hypercaloriques | Nutrifitness',
    metaDescription: 'Gainers, poudres hypercaloriques et conseils pour construire de la masse musculaire progressivement en Suisse. Livraison 24h & retrait Genève.',
    targetKeywords: ['gainer prise de masse', 'meilleur mass gainer Suisse', 'gainer musculation Genève', 'shake prise de masse'],
    subcategories: ['Hard Gainers (Riches en Glucides)', 'Lean Gainers (Équilibrés 50/50)', 'Farines d\'avoine & Glucides complexes', 'Beurres de cacahuète'],
    intro: [
      "Un gainer est une formule hypercalorique combinant glucides complexes et protéines de haute valeur biologique, formulée pour faciliter l'augmentation de l'apport énergétique quotidien en un seul shake savoureux. Il s'adresse aux profils ayant un métabolisme rapide (« ectomorphes »), aux personnes manquant d'appétit ou aux athlètes aux dépenses énergétiques considérables.",
      "Chez NutriFitness Genève, nos spécialistes sélectionnent des gainers aux sources d'avoine, d'orge et de whey isolate, évitant les surcharges de sucres rapides bon marché. Vous trouvez aussi des farines d'avoine pures et beurres de cacahuète artisanaux pour élaborer vos propres gainers faits maison."
    ],
    buyingGuide: [
      {
        title: 'Hard Gainer vs Lean Gainer',
        bulletPoints: [
          { label: 'Hard Gainer (ratio 70/30 ou 80/20)', text: 'Très riche en glucides (700 à 1200 kcal par portion). Indispensable pour les personnes qui peinent à prendre le moindre gramme.' },
          { label: 'Lean Gainer (ratio 50/50)', text: 'Équilibre parfait entre protéines et glucides à index glycémique modéré. Privilégie le muscle sec sans accumulation graisseuse excessive.' },
          { label: 'Gainer maison à base de farine d\'avoine', text: 'Mélange personnalisé de whey pure, farine d\'avoine micro-moulue et beurre d\'oléagineux pour un contrôle total des calories.' }
        ]
      },
      {
        title: 'Conseils pour réussir sa prise de masse',
        steps: [
          { title: 'Créez un surplus calorique modéré', description: 'Visitez +300 à +500 kcal au-dessus de vos dépenses de maintien pour maximiser le tissu musculaire.' },
          { title: 'Commencez par une demi-portion', description: 'Laissez le temps à votre système digestif de s\'adapter au volume calorique supplémentaire.' },
          { title: 'Placez la prise entre les repas', description: 'Consommez votre gainer en collation à 10h ou 16h, ou immédiatement après une séance éprouvante.' }
        ]
      }
    ],
    faqs: [
      {
        question: 'Qu\'est-ce qu\'un gainer exactement ?',
        answer: 'Un gainer est une préparation en poudre enrichie en glucides et en protéines qui permet de consommer 500 à 1000 kcal sous forme liquide sans saturer l\'estomac.'
      },
      {
        question: 'Un gainer fait-il prendre du gras ?',
        answer: 'Si le surplus calorique total de la journée est excessif, l\'organisme stockera une partie sous forme de graisse. Un surplus modéré combiné à un entraînement de force régulier optimise le gain musculaire sec.'
      },
      {
        question: 'Quand faut-il consommer son gainer ?',
        answer: 'Idéalement en collation dans l\'après-midi ou après votre entraînement. Évitez de le consommer juste avant un repas principal pour ne pas couper l\'appétit des aliments solides.'
      },
      {
        question: 'Combien de temps faut-il pour voir des résultats ?',
        answer: 'Avec un excédent contrôlé, un gain de 1 à 1.5 kg par mois chez un débutant ou intermédiaire représente une excellente progression durable.'
      }
    ],
    internalLinks: [
      { title: 'Protéines & Whey', href: '/categorie/proteines/' },
      { title: 'Créatine Monohydrate', href: '/categorie/creatine/' },
      { title: 'Guide : Choisir son Gainer', href: '/blog/gainer-pour-qui-comment-choisir/' }
    ],
    featuredProductNames: [
      'Mega Mass 4000 3kg Dymatize',
      'Furiux Gainer 3kg Bigman',
      'Big Lean Mass Gainer Marvelous',
      'Farine d\'avoine 1kg Pronutrition'
    ],
    externalSources: [
      { title: 'Société Suisse de Nutrition – Besoins énergétiques', url: 'https://www.sge-ssn.ch/fr/' }
    ]
  },
  {
    id: 'creatine',
    slug: 'creatine',
    name: 'Créatine Monohydrate',
    h1: 'Créatine : monohydrate pure et label Creapure®',
    metaTitle: 'Créatine monohydrate et Creapure® Suisse | Nutrifitness Genève',
    metaDescription: 'Créatine monohydrate, label Creapure® et poudre micronisée 200 mesh. Maximisez votre force et puissance. Stock en Suisse, livraison 24h.',
    targetKeywords: ['créatine Suisse', 'créatine monohydrate Genève', 'créatine Creapure achat', 'créatine musculation force'],
    subcategories: ['Créatine Monohydrate 100%', 'Label Creapure® Allemand', 'Poudres Micronisées 200 Mesh', 'Gélules & Tablettes'],
    intro: [
      "La créatine est la molécule ergogène la plus rigoureusement documentée au monde dans le domaine de la science sportive (+ de 500 études cliniques). Elle optimise la resynthèse de l'adénosine triphosphate (ATP) lors des efforts anaérobies explosifs, décuplant la force maximale, le nombre de répétitions et la volumisation cellulaire intramusculaire.",
      "NutriFitness Genève propose exclusivement des créatines certifiées pures : créatine monohydrate micronisée 200 mesh pour une dissolution parfaite sans résidus, et créatines brevetées sous le prestigieux label allemand Creapure® (pureté garantie à 99.99%). Aucun déchet de synthèse (dicyandiamide ou dihydrotriazine)."
    ],
    buyingGuide: [
      {
        title: 'Monohydrate standard vs Creapure®',
        bulletPoints: [
          { label: 'Créatine Monohydrate', text: 'La référence absolue des études scientifiques. Rapport efficacité/prix imbattable pour tous les sportifs.' },
          { label: 'Label Creapure®', text: 'Fabriquée en Allemagne (Alzchem Trostberg) selon les normes pharmaceutiques strictes GMP. Contrôles rigoureux de pureté.' },
          { label: 'Poudre micronisée 200 Mesh', text: 'Broyée en micro-particules ultra-fines qui se suspendent immédiatement dans l\'eau sans goutter au fond du shaker.' }
        ]
      },
      {
        title: 'Protocole de prise recommandé',
        steps: [
          { title: 'Dose quotidienne', description: '3 à 5 g par jour en continu, sans interruption obligatoire.' },
          { title: 'Phase de charge facultative', description: 'Une dose constante de 3-5 g sature pleinement les stocks musculaires en 3 à 4 semaines sans inconfort digestif.' },
          { title: 'Prise avec des glucides/protéines', description: 'L\'élévation conjointe d\'insuline optimise le transport de la créatine vers les myocytes.' },
          { title: 'Jours de repos', description: 'Maintenez impérativement la prise quotidienne le matin pour conserver la saturation.' }
        ]
      }
    ],
    faqs: [
      {
        question: 'Quelle est la différence entre créatine monohydrate et Creapure® ?',
        answer: 'Creapure® est une marque brevetée de créatine monohydrate synthétisée en Allemagne avec une pureté certifiée de 99.99 %, garantissant l\'absence totale de métaux lourds et sous-produits toxiques.'
      },
      {
        question: 'Faut-il faire une phase de charge ?',
        answer: 'Non, les études récentes démontrent qu\'une dose stable de 3 à 5 g par jour atteint les mêmes niveaux de saturation intramusculaire en 3 à 4 semaines, évitant tout désagrément intestinal.'
      },
      {
        question: 'La créatine provoque-t-elle de la rétention d\'eau sous-cutanée ?',
        answer: 'Non, la rétention est strictement intracellulaire : l\'eau est attirée à l\'intérieur de la fibre musculaire, favorisant l\'hydratation cellulaire et un aspect musculaire plus dense et volumineux.'
      },
      {
        question: 'Peut-on mélanger la créatine dans son shaker de protéines ?',
        answer: 'Absolument. La créatine est stable et s\'associe idéalement aux protéines et glucides après l\'entraînement pour une assimilation accrue.'
      }
    ],
    internalLinks: [
      { title: 'Protéines & Whey', href: '/categorie/proteines/' },
      { title: 'Acides Aminés & BCAA', href: '/categorie/acides-amines-recuperation/' },
      { title: 'Guide : Quand et comment prendre la créatine', href: '/blog/creatine-quand-comment-la-prendre/' },
      { title: 'Comparatif Creapure® vs Standard', href: '/blog/creatine-monohydrate-ou-creapure/' }
    ],
    featuredProductNames: [
      'Applied Nutrition Créatine Monohydrate Pure 250g',
      'BigMan Créatine Creapure® 300g',
      'Marvelous Créatine 200 Mesh 300g'
    ],
    externalSources: [
      { title: 'ISSN Position Stand: Safety and efficacy of creatine supplementation', url: 'https://pubmed.ncbi.nlm.nih.gov/28615996/' },
      { title: 'Office fédéral de la sécurité alimentaire et des affaires vétérinaires (OSAV)', url: 'https://www.blv.admin.ch/blv/fr/home.html' }
    ]
  },
  {
    id: 'acides-amines-recuperation',
    slug: 'acides-amines-recuperation',
    name: 'Acides Aminés & BCAA',
    h1: 'Acides aminés et récupération : BCAA, EAA, glutamine',
    metaTitle: 'Acides aminés BCAA, EAA, glutamine, citrulline | Nutrifitness',
    metaDescription: 'BCAA 2:1:1, EAA complets, L-glutamine Kyowa, bêta-alanine et citrulline. Préservez votre masse musculaire et accélérez votre récupération en Suisse.',
    targetKeywords: ['BCAA musculation Suisse', 'EAA acides aminés', 'L-glutamine Kyowa Genève', 'bêta-alanine récupération'],
    subcategories: ['EAA (9 Acides Aminés Essentiels)', 'BCAA (Ratio 2:1:1 et 4:1:1)', 'L-Glutamine Pure', 'Bêta-Alanine & Citrulline', 'Formules Récupération Post-Workout'],
    intro: [
      "Les acides aminés constituent les briques fondamentales des fibres musculaires. Lors d'entraînements intenses ou à jeun, l'organisme peut dégrader le tissu musculaire pour produire de l'énergie. L'apport ciblé d'acides aminés branchés (BCAA) ou de l'ensemble des 9 acides aminés essentiels (EAA) bloque le catabolisme et enclenche immédiatement la synthèse des protéines.",
      "Dans cette sélection, NutriFitness rassemble les meilleures formules d'EAA fermentés d'origine végétale, des BCAA au ratio scientifique 2:1:1, de la L-Glutamine au label de pureté Kyowa Quality®, ainsi que de la bêta-alanine pour tamponner l'acide lactique."
    ],
    buyingGuide: [
      {
        title: 'BCAA ou EAA : comment choisir ?',
        bulletPoints: [
          { label: 'EAA (Essential Amino Acids)', text: 'Apportent les 9 acides aminés essentiels que le corps ne peut synthétiser. Recommandés pendant l\'entraînement ou pour les séances longues.' },
          { label: 'BCAA (Leucine, Isoleucine, Valine)', text: 'Ciblent spécifiquement l\'activation de la voie anabolique mTOR via une forte concentration en leucine.' },
          { label: 'L-Glutamine Kyowa Quality®', text: 'L\'acide aminé le plus abondant dans le muscle et l\'intestin. Soutient l\'intégrité de la barrière digestive et la recharge glycogénique.' }
        ]
      }
    ],
    faqs: [
      {
        question: 'Quelle est la différence entre BCAA et EAA ?',
        answer: 'Les BCAA ne contiennent que 3 acides aminés ramifiés, tandis que les EAA regroupent les 9 acides aminés essentiels. Les EAA offrent un profil plus complet pour bâtir du tissu musculaire.'
      },
      {
        question: 'Les acides aminés remplacent-ils la whey ?',
        answer: 'Non. Une whey apporte des protéines entières avec l\'ensemble des 20 acides aminés. Les EAA ou BCAA sont utilisés en boisson intra-entraînement pour une digestion immédiate sans effort gastrique.'
      },
      {
        question: 'La bêta-alanine donne des picotements : est-ce dangereux ?',
        answer: 'Ces picotements passagers (paresthésie) sont une réaction physiologique bénigne liée à l\'excitation des récepteurs nerveux périphériques. Ils disparaissent en 30 à 60 minutes.'
      }
    ],
    internalLinks: [
      { title: 'Protéines & Whey', href: '/categorie/proteines/' },
      { title: 'Pré-Workout & Énergie', href: '/categorie/pre-workout-energie/' },
      { title: 'Guide : BCAA vs EAA', href: '/blog/bcaa-ou-eaa-difference/' }
    ],
    featuredProductNames: [
      'BM EAA 300g Bigman',
      'Hype Amino 270g Marvelous',
      'Glutamine Kyowa 300g Bigman',
      'Bêta-alanine 250g Marvelous'
    ],
    externalSources: [
      { title: 'Journal of the International Society of Sports Nutrition (JISSN)', url: 'https://jissn.biomedcentral.com/' }
    ]
  },
  {
    id: 'pre-workout-energie',
    slug: 'pre-workout-energie',
    name: 'Pré-Workout & Énergie',
    h1: 'Pré-workout et boosters d\'énergie : avec ou sans stimulants',
    metaTitle: 'Pré-workout et boosters d\'énergie en Suisse | Nutrifitness',
    metaDescription: 'Boosters pré-entraînement avec caféine ou sans stimulants (pump), gélules de caféine pure. Énergie, focus et congestion musculaire à Genève.',
    targetKeywords: ['pré-workout Suisse', 'booster musculation Genève', 'pre workout sans stimulants', 'caféine gélules sport'],
    subcategories: ['Pré-Workouts Stimulants (Caféine + Nootropiques)', 'Boosters Pump Sans Caféine', 'Caféine Pure en Gélules & Comprimés', 'Boissons Énergisantes RTD'],
    intro: [
      "Un pré-workout est un complexe conçu pour maximiser l'intensité de vos entraînements : vigilance nerveuse, focus mental, résistance à l'effort et vasodilatation musculaire (« congestion »). Il s'ingère généralement 20 à 30 minutes avant de débuter l'échauffement.",
      "NutriFitness propose une gamme rigoureuse adaptée à vos habitudes : des boosters puissants pour les séances matinales et de mi-journée, et des formules 100% sans stimulants (sans caféine) enrichies en L-citrulline et nitrates pour les entraînements en soirée afin de respecter votre sommeil."
    ],
    buyingGuide: [
      {
        title: 'Avec ou sans caféine ?',
        bulletPoints: [
          { label: 'Avec stimulants', text: 'Caféine anhydre (150 à 300 mg), théacrine et tyrosine. Idéal pour repousser la fatigue mentale et augmenter la puissance.' },
          { label: 'Sans stimulants (Pump & Focus)', text: 'Citrulline malate, arginine AAKG et nootropiques. Amplifie l\'afflux sanguin et les nutriments aux muscles sans exciter le cœur.' },
          { label: 'Caféine isolée', text: 'Gélules précises de 100 à 200 mg pour moduler votre apport sans autres additifs.' }
        ]
      }
    ],
    faqs: [
      {
        question: 'Combien de caféine contient un booster pré-workout ?',
        answer: 'Généralement entre 150 et 300 mg par dosette (l\'équivalent de 2 à 3 espressos). Veillez à comptabiliser vos autres prises de café de la journée pour rester sous le seuil EFSA de 400 mg.'
      },
      {
        question: 'Quel pré-workout privilégier pour s\'entraîner le soir ?',
        answer: 'Privilégiez impérativement une formule « Pump » sans caféine pour ne pas perturber la production de mélatonine ni la qualité du sommeil profond réparateur.'
      },
      {
        question: 'Faut-il en prendre à chaque séance ?',
        answer: 'Nous recommandons d\'alterner ou de réserver le booster stimulant aux séances les plus exigeantes (jambes, dos) pour éviter l\'accoutumance des récepteurs adénosines.'
      }
    ],
    internalLinks: [
      { title: 'Acides Aminés & Récupération', href: '/categorie/acides-amines-recuperation/' },
      { title: 'Hydratation & Électrolytes', href: '/categorie/pendant-effort-hydratation/' },
      { title: 'Guide : Choisir son Pré-Workout', href: '/blog/pre-workout-comment-choisir/' }
    ],
    featuredProductNames: [
      'ABE Ultimate Pre-Workout 315g Applied Nutrition',
      'Aukan Pre-Workout 300g Bigman',
      'Infected Pre-Workout Pump Marvelous',
      'Caféine 200mg Pronutrition'
    ],
    externalSources: [
      { title: 'EFSA – Scientific Opinion on the safety of caffeine', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4102' }
    ]
  },
  {
    id: 'pendant-effort-hydratation',
    slug: 'pendant-effort-hydratation',
    name: 'Pendant l\'Effort & Hydratation',
    h1: 'Hydratation, électrolytes et glucides pendant l\'effort',
    metaTitle: 'Électrolytes, boissons d\'effort et glucides | Nutrifitness Suisse',
    metaDescription: 'Électrolytes complets, boissons isotoniques et glucides en poudre (maltodextrine, cluster dextrin). Prévenez les crampes et tenez la distance.',
    targetKeywords: ['électrolytes sport Suisse', 'boisson isotonique Genève', 'cluster dextrin', 'sels minéraux crampes'],
    subcategories: ['Électrolytes en Poudre & Sachets', 'Boissons Isotoniques d\'Endurance', 'Glucides Rapides & Dextrine Cyclique', 'Gourdes & Shakers Haute Contenance'],
    intro: [
      "Lors d'un entraînement excédant 60 minutes ou en période de forte chaleur, l'eau pure ne suffit plus : la transpiration évacue massivement des sels minéraux indispensables à la contraction musculaire et à l'équilibre hydrique (sodium, potassium, magnésium). Une déshydratation de seulement 2% peut réduire vos performances physiques de 10 à 20%.",
      "NutriFitness met à disposition des athlètes de crossfit, course à pied, cyclisme et musculation des formules d'électrolytes sans sucres ainsi que des glucides techniques ultra-digestes (Cluster Dextrin®) assurant une vidange gastrique fulgurante sans lourdeur d'estomac."
    ],
    buyingGuide: [
      {
        title: 'Électrolytes purs ou boisson glucidique ?',
        bulletPoints: [
          { label: 'Électrolytes sans glucides', text: 'Parfaits pour les séances de musculation en salle climatisée ou les régimes pauvres en glucides (low carb/keto).' },
          { label: 'Glucides en poudre (Cluster Dextrin®, Maltodextrine)', text: 'Fournissent une énergie continue sur les efforts prolongés de plus de 1h30.' }
        ]
      }
    ],
    faqs: [
      {
        question: 'Pourquoi l\'eau seule est-elle insuffisante lors d\'efforts longs ?',
        answer: 'Boire trop d\'eau pure sans sodium lors d\'efforts prolongés dilue la concentration saline du sang (hyponatrémie) et aggrave les crampes et la fatigue.'
      },
      {
        question: 'Quels sont les principaux électrolytes à rechercher ?',
        answer: 'Le sodium (le plus perdu par la sueur), le potassium, le magnésium et le chlorure sous des formes chélatées bien absorbées.'
      }
    ],
    internalLinks: [
      { title: 'Pré-Workout & Énergie', href: '/categorie/pre-workout-energie/' },
      { title: 'Vitamines & Minéraux', href: '/categorie/vitamines-mineraux/' },
      { title: 'Guide : Électrolytes et boissons isotoniques', href: '/blog/electrolytes-boisson-isotonique/' }
    ],
    featuredProductNames: [
      'Hydra Électrolytes 210g Per4m',
      'Dirty Cluster Dex 1kg Dirty Squads',
      'Frutilu Hydratation Sachets Pronutrition'
    ],
    externalSources: [
      { title: 'Société Suisse de Nutrition Sportive (SSNS)', url: 'https://www.ssns.ch/' }
    ]
  },
  {
    id: 'vitamines-mineraux',
    slug: 'vitamines-mineraux',
    name: 'Vitamines & Minéraux',
    h1: 'Vitamines et minéraux : magnésium, zinc, vitamines C & D3',
    metaTitle: 'Vitamines, minéraux et oméga-3 en Suisse | Nutrifitness Genève',
    metaDescription: 'Magnésium bisglycinate haute absorption, zinc, multivitamines, oméga-3 EPA/DHA et vitamine D3 K2. Soutenez votre immunité et vitalité.',
    targetKeywords: ['magnésium bisglycinate Suisse', 'zinc bisglycinate Genève', 'vitamine D3 K2', 'oméga 3 sauvage Suisse'],
    subcategories: ['Magnésium Bisglycinate Chélaté', 'Zinc & Formules ZMA', 'Vitamine D3 + K2 MK7', 'Vitamine C & Antioxydants', 'Oméga 3 Haute Concentration', 'Collagène Peptides'],
    intro: [
      "Les micronutriments orchestrent des milliers de cascades enzymatiques quotidiennes : contraction musculaire, synthèse hormonale, métabolisme énergétique et défense immunitaire. Les entraînements répétés augmentent significativement les déperditions et les besoins.",
      "NutriFitness privilégie rigoureusement les formes chélatées haute biodisponibilité (comme le magnésium et le zinc bisglycinates) qui garantissent une tolérance digestive parfaite sans effet laxatif, ainsi que des oméga-3 certifiés pour leur indice d'oxydation TOTOX très bas."
    ],
    buyingGuide: [
      {
        title: 'Les indispensables de l\'athlète',
        bulletPoints: [
          { label: 'Magnésium bisglycinate', text: 'Calme le système nerveux, prévient les spasmes musculaires et améliore la profondeur du sommeil.' },
          { label: 'Zinc bisglycinate', text: 'Contribue au maintien d\'un taux normal de testostérone et soutient la synthèse des protéines.' },
          { label: 'Vitamine D3 + K2', text: 'Cruciale sous les latitudes suisses en hiver pour l\'ossature et l\'immunité.' },
          { label: 'Oméga-3 EPA / DHA', text: 'Acides gras essentiels anti-inflammatoires pour le système cardiovasculaire et les articulations.' }
        ]
      }
    ],
    faqs: [
      {
        question: 'Pourquoi choisir le magnésium bisglycinate plutôt que l\'oxyde ?',
        answer: 'Le magnésium bisglycinate est lié à deux molécules de glycine, assurant une absorption intestinale optimale sans attirer d\'eau dans le côlon, évitant ainsi tout inconfort intestinal.'
      },
      {
        question: 'Peut-on combiner magnésium et zinc ?',
        answer: 'Oui, c\'est l\'association classique du ZMA (zinc, magnésium, vitamine B6), idéale à prendre 30 minutes avant le coucher.'
      }
    ],
    internalLinks: [
      { title: 'Bien-être, Sommeil & Digestion', href: '/categorie/bien-etre-sommeil-digestion/' },
      { title: 'Protéines & Whey', href: '/categorie/proteines/' },
      { title: 'Guide : Magnésium Bisglycinate', href: '/blog/magnesium-bisglycinate-comment-choisir/' },
      { title: 'Guide : Oméga 3 et Sport', href: '/blog/omega-3-comment-choisir/' }
    ],
    featuredProductNames: [
      'Magnésium Bisglycinate 90 gélules Marvelous',
      'Zinc Bisglycinate 90 gélules Applied Nutrition',
      'MK7 Vitamine D3 K2 90 gélules Marvelous',
      'Oméga 3 120 softgels Marvelous',
      'Peptan Collagène Citron 300g Bigman'
    ],
    externalSources: [
      { title: 'NIH Office of Dietary Supplements – Magnesium', url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/' },
      { title: 'NIH – Omega-3 Fatty Acids', url: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/' }
    ]
  },
  {
    id: 'bien-etre-sommeil-digestion',
    slug: 'bien-etre-sommeil-digestion',
    name: 'Bien-Être & Sommeil',
    h1: 'Bien-être, sommeil réparateur et confort digestif',
    metaTitle: 'Compléments sommeil, ashwagandha et digestion | Nutrifitness',
    metaDescription: 'Ashwagandha KSM-66, shilajit pur, mélatonine, enzymes digestives et compléments bien-être. Équilibre nerveux et régénération en Suisse.',
    targetKeywords: ['ashwagandha Suisse', 'compléments sommeil Genève', 'enzymes digestives sport', 'shilajit pur'],
    subcategories: ['Adaptogènes & Gestion du Stress (Ashwagandha KSM-66)', 'Sommeil & Relaxation', 'Enzymes Digestives & Confort Gastrique', 'Vitalité Naturelle & Shilajit'],
    intro: [
      "Le muscle ne se construit pas pendant l'effort, mais pendant la phase de repos et de sommeil profond. Le stress chronique élève le cortisol, freinant la récupération et dégradant la qualité du sommeil. De même, une assimilation digestive imparfaite empêche l'exploitation optimale de vos repas.",
      "NutriFitness a réuni des extraits standardisés de référence comme l'Ashwagandha KSM-66® (cliniquement validé pour moduler le stress et l'anxiété), du shilajit pur titré en acide fulvique, et des complexes enzymatiques facilitant la digestion des shakers hyperprotéinés."
    ],
    buyingGuide: [
      {
        title: 'Choisir ses adaptogènes',
        bulletPoints: [
          { label: 'Ashwagandha KSM-66®', text: 'Extrait breveté à spectre complet standardisé à 5% de withanolides. Aide à réduire le stress et soutient la vigueur physique.' },
          { label: 'Complexes digestifs enzymatiques', text: 'Amylase, protéase, lipase pour décomposer efficacement macronutriments et soulager les ballonnements.' }
        ]
      }
    ],
    faqs: [
      {
        question: 'Comment agit l\'Ashwagandha KSM-66® ?',
        answer: 'En tant que plante adaptogène, l\'ashwagandha régule l\'axe hypothalamo-hypophyso-surrénalien, aidant l\'organisme à s\'adapter aux stresseurs physiques et émotionnels.'
      },
      {
        question: 'Quand prendre des enzymes digestives ?',
        answer: 'Prenez 1 gélule au tout début de vos repas les plus copieux ou avec votre shake hypercalorique/protéiné.'
      }
    ],
    internalLinks: [
      { title: 'Vitamines & Minéraux', href: '/categorie/vitamines-mineraux/' },
      { title: 'Protéines & Whey', href: '/categorie/proteines/' },
      { title: 'Bilan Coaching Sommeil', href: '/coaching-nutritionnel-personnalise/' }
    ],
    featuredProductNames: [
      'Ashwagandha KSM-66® 600mg Bigman',
      'Shilajit Résine Pure',
      'Super Digestive Enzymes Marvelous'
    ],
    externalSources: [
      { title: 'Office fédéral de la sécurité alimentaire (OSAV)', url: 'https://www.blv.admin.ch/blv/fr/home.html' }
    ]
  },
  {
    id: 'perte-de-poids',
    slug: 'perte-de-poids',
    name: 'Perte de Poids & Définition',
    h1: 'Perte de poids : compléments et principes pour la sèche',
    metaTitle: 'Compléments perte de poids et sèche musculaire | Nutrifitness',
    metaDescription: 'L-carnitine, protéines pour la sèche, coupe-faims naturels et conseils scientifiques pour un déficit calorique réussi à Genève et en Suisse.',
    targetKeywords: ['compléments perte de poids Suisse', 'brûleur de graisse Genève', 'L-carnitine liquide', 'sèche musculaire compléments'],
    subcategories: ['L-Carnitine Pure (Liquide & Gélules)', 'Protéines Isolates Haute Satiété', 'Formules Thermogéniques Contrôlées', 'Sprays de Cuisson Sans Calories'],
    intro: [
      "Aucune pilule ne remplace les lois de la thermodynamique : la perte de masse grasse découle obligatoirement d'un déficit calorique régulier et maîtrisé. Cependant, certains compléments apportent une aide précieuse pour préserver la masse musculaire maigre, optimiser le transport des acides gras et tempérer les fringales.",
      "NutriFitness s'engage pour une approche scientifique et honnête : nous récusons les promesses miraculeuses et sélectionnons des outils fonctionnels comme la L-Carnitine Carnipure®, la whey isolate très faible en calories, et des sprays de cuisson permettant de cuisiner sans surplus d'huile."
    ],
    buyingGuide: [
      {
        title: 'Les 4 piliers d\'une sèche durable',
        steps: [
          { title: 'Déficit calorique modéré', description: 'Visez -15 à -20 % sous votre maintien pour perdre du gras sans détruire votre métabolisme.' },
          { title: 'Apport élevé en protéines', description: '2.0 à 2.4 g/kg pour préserver le muscle et maximiser la satiété entre les repas.' },
          { title: 'Maintien de l\'intensité en salle', description: 'Continuez à vous entraîner lourd pour donner au corps le signal de conserver ses fibres.' },
          { title: 'Hydratation et NEAT', description: 'Marchez 8000 à 10000 pas par jour pour accroître vos dépenses sans générer de fatigue excessive.' }
        ]
      }
    ],
    faqs: [
      {
        question: 'Comment la L-Carnitine aide-t-elle à la gestion du poids ?',
        answer: 'La L-carnitine transporte les acides gras à longue chaîne dans les mitochondries des cellules, où ils sont oxydés (« brûlés ») pour produire de l\'énergie pendant l\'exercice aérobie.'
      },
      {
        question: 'Quelle protéine choisir pendant une période de régime ?',
        answer: 'La whey isolate (comme Iso Whey Zero) offre le ratio protéique le plus pur (25 g de protéines pour moins de 110 kcal), idéale pour combler la faim sans dépasser vos macros.'
      }
    ],
    internalLinks: [
      { title: 'Protéines & Whey', href: '/categorie/proteines/' },
      { title: 'Snacks & Healthy Food', href: '/categorie/snacks-healthy-food/' },
      { title: 'Dossier : Ce que disent les preuves sur la perte de poids', href: '/blog/perte-de-poids-complements-ce-que-disent-les-preuves/' }
    ],
    featuredProductNames: [
      'Carnitine Shot Citron 20 fioles Bigman',
      'Iso Whey Zero 907g Bigman',
      'Spray de Cuisson 200ml More',
      'Blanc d\'œuf liquide 1L Eurovo'
    ],
    externalSources: [
      { title: 'Société Suisse de Nutrition – Contrôle du poids', url: 'https://www.sge-ssn.ch/fr/' }
    ]
  },
  {
    id: 'snacks-healthy-food',
    slug: 'snacks-healthy-food',
    name: 'Snacks & Diététique',
    h1: 'Snacks et nutrition saine : barres, farines et petits-déjeuners',
    metaTitle: 'Barres protéinées, snacks keto et alimentation saine | Nutrifitness',
    metaDescription: 'Barres protéinées gourmandes, cookies, préparations pour pancakes, farines d\'avoine et crèmes de riz à Genève. Stock suisse, expédition 24h.',
    targetKeywords: ['barre protéinée Suisse', 'snacks keto Genève', 'farine d\'avoine bio', 'crème de riz musculation'],
    subcategories: ['Barres & Cookies Protéinés', 'Gamme Keto Sans Sucres (Croissants, Piadina)', 'Farines d\'Avoine & Crèmes de Riz', 'Beurres de Cacahuète & Purées d\'Oléagineux', 'Préparations pour Pancakes & Sauces Zéro'],
    intro: [
      "Suivre une alimentation sportive ne signifie pas renoncer au plaisir gourmand. Les collations intelligentes permettent d'atteindre vos quotas de macronutriments en déplacement, au bureau ou après l'entraînement, tout en évitant les fringales impulsives vers des aliments ultra-transformés.",
      "NutriFitness Genève rassemble une variété inégalée en Suisse : barres protéinées croustillantes sans sucres ajoutés, gamme exclusive keto (croissants et pains pauvres en glucides), farines d'avoine aromatisées aux goûts savoureux, et crèmes de riz d'une digestibilité incomparable pour les repas pré-effort."
    ],
    buyingGuide: [
      {
        title: 'Les basiques du garde-manger sportif',
        bulletPoints: [
          { label: 'Barres protéinées', text: '15 à 20 g de protéines par barre avec moins de 2 g de sucres simples. Pratiques dans le sac de sport.' },
          { label: 'Crème de riz', text: 'Glucide pré-entraînement par excellence : se prépare en 30 secondes à l\'eau chaude, sans gluten et ultra-digeste.' },
          { label: 'Beurres de cacahuète 100% purs', text: 'Sans huile de palme ni sucres ajoutés. Riche en acides gras insaturés et en magnésium.' }
        ]
      }
    ],
    faqs: [
      {
        question: 'Une barre protéinée peut-elle remplacer un vrai repas ?',
        answer: 'Non, c\'est une collation pratique pour dépanner. Les repas principaux doivent être constitués d\'aliments bruts et variés (légumes, féculents, sources de protéines complètes).'
      },
      {
        question: 'Comment préparer la crème de riz ?',
        answer: 'Versez 50 g de crème de riz dans un bol, ajoutez 150 ml d\'eau chaude ou de lait végétal, mélangez au fouet puis incorporez une dosette de whey pour un porridge crémeux.'
      }
    ],
    internalLinks: [
      { title: 'Protéines & Whey', href: '/categorie/proteines/' },
      { title: 'Gainers & Prise de Masse', href: '/categorie/gainers-prise-de-masse/' },
      { title: 'Idées Petits-Déjeuners Riches en Protéines', href: '/blog/petit-dejeuner-collation-riche-en-proteines/' }
    ],
    featuredProductNames: [
      'Sandwich Keto Bar Pronutrition',
      'Max Protein Cookie Bigs',
      'Farine d\'avoine 1kg Pronutrition',
      'Crème de riz 1.4kg Marvelous',
      'Beurre de cacahuète 1kg Bodyattack'
    ],
    externalSources: [
      { title: 'Base de données suisse des valeurs nutritives', url: 'https://naehrwertdaten.ch/fr/' }
    ]
  },
  {
    id: 'accessoires',
    slug: 'accessoires',
    name: 'Accessoires & Shakers',
    h1: 'Accessoires de sport : shakers antifuites et gourdes grand format',
    metaTitle: 'Shakers et gourdes de sport à Genève | Nutrifitness Suisse',
    metaDescription: 'Shakers 600 ml antifuites sans BPA, gourdes grand format 2.2L gallon. Équipez-vous pour vos entraînements avec Nutrifitness.',
    targetKeywords: ['shaker protéines Suisse', 'gourde sport 2.2 litres', 'shaker sans bpa Genève'],
    subcategories: ['Shakers Classiques 600 ml', 'Gourdes Gallon 2.2 Litres', 'Piluliers & Boîtes à Dosettes'],
    intro: [
      "Un shaker étanche et robuste fait toute la différence pour mélanger votre whey sans grumeaux et emporter votre boisson d'effort sans risque de fuite dans votre sac d'entraînement. De même, une gourde de grande contenance (gallon 2.2 L) facilite le suivi rigoureux de votre hydratation quotidienne.",
      "Découvrez notre collection d'accessoires estampillés NutriFitness : matériaux certifiés sans BPA, grilles de mélange intégrées et bouchons vissés sécurisés."
    ],
    buyingGuide: [
      {
        title: 'Conseils d\'entretien',
        bulletPoints: [
          { label: 'Rinçage immédiat', text: 'Rincez systématiquement votre shaker à l\'eau tiède juste après consommation pour éviter le développement d\'odeurs persistantes de protéines.' },
          { label: 'Séchage ouvert', text: 'Laissez sécher votre shaker avec le bouchon ouvert pour préserver la fraîcheur du plastique.' }
        ]
      }
    ],
    faqs: [
      {
        question: 'Comment éviter les grumeaux dans son shaker ?',
        answer: 'Versez TOUJOURS le liquide en premier, puis ajoutez la dosette de poudre par-dessus avant de secouer énergiquement avec la grille de mélange.'
      },
      {
        question: 'Les shakers passent-ils au lave-vaisselle ?',
        answer: 'Oui, dans le panier supérieur à température modérée (programme éco à 50°C recommandé pour préserver les joints en silicone).'
      }
    ],
    internalLinks: [
      { title: 'Protéines & Whey', href: '/categorie/proteines/' },
      { title: 'Hydratation & Électrolytes', href: '/categorie/pendant-effort-hydratation/' }
    ],
    featuredProductNames: [
      'Shaker NF 600ml Nutrifit',
      'Gourde Gallon 2.2L Nutrifit'
    ],
    externalSources: [
      { title: 'Office fédéral de la sécurité alimentaire (OSAV)', url: 'https://www.blv.admin.ch/blv/fr/home.html' }
    ]
  },
  {
    id: 'guides-ebooks',
    slug: 'guides-ebooks',
    name: 'Guides & Ebooks',
    h1: 'Guides d\'experts et ebooks de nutrition sportive',
    metaTitle: 'Guides et ebooks de nutrition sportive | Nutrifitness Suisse',
    metaDescription: 'Le Guide Ultime des Compléments Alimentaires : ebook PDF complet de plus de 20 ans d\'expertise nutritionnelle en Suisse. Téléchargement immédiat.',
    targetKeywords: ['guide compléments alimentaires Suisse', 'ebook nutrition sportive', 'manuel protéines créatine'],
    subcategories: ['Ebook Le Guide Ultime', 'Guides Débutants Gratuits', 'Programmes Diététiques'],
    intro: [
      "Acquérir les bons compléments est une première étape ; savoir exactement comment les combiner, les doser selon votre morphologie et les synchroniser avec vos séances décuple vos résultats. Fort de 20 ans d'accompagnement terrain à Genève, NutriFitness synthétise son savoir-faire dans des supports pédagogiques clairs et sans jargon.",
      "Retrouvez notre ouvrage de référence « Le Guide Ultime des Compléments Alimentaires », disponible en téléchargement immédiat avec accès à vie et mises à jour régulières."
    ],
    buyingGuide: [
      {
        title: 'Ce que contient Le Guide Ultime',
        bulletPoints: [
          { label: 'Comprendre chaque ingrédient', text: 'Analyses factuelles des molécules qui fonctionnent et de celles à éviter.' },
          { label: 'Plans de supplémentation par objectif', text: 'Protocoles clés en main pour la prise de masse, la sèche, la force ou la santé globale.' },
          { label: 'Fiches pratiques de lecture d\'étiquettes', text: 'Déjouez les pièges des fabricants et optimisez chaque franc suisse investi.' }
        ]
      }
    ],
    faqs: [
      {
        question: 'Comment reçois-je mon ebook après la commande ?',
        answer: 'Le lien de téléchargement PDF sécurisé vous est transmis instantanément par e-mail et reste accessible en permanence dans votre espace client.'
      },
      {
        question: 'Puis-je le consulter sur mon smartphone ou tablette ?',
        answer: 'Oui, le format PDF haute définition est universel et s\'adapte parfaitement à l\'écran de votre iPhone, Android, iPad ou ordinateur.'
      }
    ],
    internalLinks: [
      { title: 'Page Officielle de l\'Ebook', href: '/guide-des-complements-alimentaires/' },
      { title: 'Coaching Personnalisé à Genève', href: '/coaching-nutritionnel-personnalise/' },
      { title: 'Tous nos articles de Blog', href: '/blog/' }
    ],
    featuredProductNames: [
      'Le Guide Ultime des Compléments Alimentaires (Ebook)'
    ],
    externalSources: [
      { title: 'NutriFitness – Centre d\'Expertise Genève', url: 'https://nutrifitness.ch' }
    ]
  }
];

export function getAllCategories(): CategoryData[] {
  return CATEGORIES_DATA;
}

export function getCategoryBySlug(slug: string): CategoryData | undefined {
  const cleanSlug = slug.toLowerCase().replace(/^\/categorie\//, '').replace(/\/$/, '');
  return CATEGORIES_DATA.find(c => c.slug === cleanSlug || c.id === cleanSlug);
}

/**
 * Maps any legacy or specific product categorySlug to one of the 12 canonical category slugs.
 */
export function getCanonicalCategorySlug(slug?: string, productName?: string): string {
  const pName = (productName || '').toLowerCase();
  
  // Specific keyword overrides based on product identity
  if (pName.includes('creatine') || pName.includes('créatine') || pName.includes('creapure')) {
    return 'creatine';
  }

  if (!slug) return 'proteines';
  const s = slug.toLowerCase();

  if (s === 'proteines' || s === 'proteines-gainers') return 'proteines';
  if (s === 'prise-de-masse' || s.includes('gainer')) return 'gainers-prise-de-masse';
  if (s.includes('creatine')) return 'creatine';
  if (s === 'bcaa' || s === 'apres-sport' || s === 'recuperation-acides-amines') return 'acides-amines-recuperation';
  if (s.includes('pre-workout') || s.includes('avant-sport') || s.includes('performance')) return 'pre-workout-energie';
  if (s.includes('pendant') || s === 'glucides') return 'pendant-effort-hydratation';
  if (s.includes('vitamines') || s.includes('antioxydants') || s.includes('peau-et-articulations')) return 'vitamines-mineraux';
  if (s.includes('sommeil') || s.includes('sante-bien-etre') || s.includes('energie-et-recuperation') || s.includes('digestion')) return 'bien-etre-sommeil-digestion';
  if (s.includes('perte-de-poids') || s.includes('minceur')) return 'perte-de-poids';
  if (s.includes('snack') || s.includes('beurre') || s.includes('healthy-food')) return 'snacks-healthy-food';
  if (s.includes('accessoire') || s.includes('shaker')) return 'accessoires';
  if (s.includes('guide') || s.includes('ebook')) return 'guides-ebooks';

  return 'proteines';
}
