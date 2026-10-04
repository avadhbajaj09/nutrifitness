/**
 * Comprehensive SEO, AEO, and GEO enrichment script for NutriFitness Switzerland.
 * Overhauls all 97 products in src/lib/catalog.ts with:
 * - SEO Formula: [Brand] [Nom du Produit] [Format] – [Bénéfice Clé]
 * - Short Description: 2-3 complete, authoritative sentences with bio-mechanisms + Swiss trust anchor.
 * - AEO Direct Answer: 45-60 words factual direct answer for Google AI Overviews, Perplexity & ChatGPT Search.
 * - Long Description: Semantic HTML with 4 distinct H2 sections (Pourquoi choisir, Analyse des Ingrédients, Posologie DFI, Engagement NutriFitness Genève).
 */

import fs from 'fs';
import path from 'path';
import { PRODUCTS, CATEGORIES, CategoryItem } from '../src/lib/catalog';
import { ProductItem } from '../src/lib/types';

interface ProductEnrichmentData {
  nameFr: string;
  nameDe?: string;
  nameIt?: string;
  nameEn?: string;
  keyActives: string;
  benefitFr: string;
  targetAudience: string;
  posologyFr: string;
  features: string[];
}

export const PRODUCT_ENRICHMENTS: Record<string, ProductEnrichmentData> = {
  // 0: Sandwich Keto Bar
  'prod-25678': {
    nameFr: "Pronutrition Sandwich Keto Bar 55g – Biscuit Protéiné Faible en Glucides",
    keyActives: "16 g de protéines de lait et de pois, 10.3 g de fibres prébiotiques, moins de 1.7 g de sucres",
    benefitFr: "En-cas cétogène gourmand au cœur fondant de cacahuètes, formulé pour caler l'appétit sans impacter la glycémie.",
    targetAudience: "Sportifs en sèche, adeptes de la diète cétogène (keto) ou low carb et amateurs de collations saines.",
    posologyFr: "Consommer 1 barre par jour en collation matinale ou au goûter pour combler une fringale saine.",
    features: [
      "16 g de protéines multi-sources contribuant au maintien de la masse musculaire",
      "10.3 g de fibres alimentaires issues d'inuline pour le confort intestinal",
      "Seulement 1.7 g de sucres rapides : idéal pour éviter le coup de barre glycémique",
      "Sans huile de palme, sans aspartame, élaboré avec du beurre de cacahuète pur"
    ]
  },

  // 1: Applied Creatine Monohydrate 250g
  'prod-25611': {
    nameFr: "Applied Nutrition Créatine Monohydrate Pure 250g – Force & Puissance Musculaire",
    keyActives: "100% créatine monohydrate micronisée pure testée HPLC sans aucun agent de charge",
    benefitFr: "Augmente la force explosive, la puissance anaérobie et l'endurance sur les séries courtes et intenses.",
    targetAudience: "Pratiquants de musculation, cross-training, sports de combat et sprinteurs en quête de gains musculaires.",
    posologyFr: "Mélanger 3 g (environ 1 dosette) par jour dans 200 ml d'eau fraîche ou dans votre shaker post-entraînement.",
    features: [
      "Créatine monohydrate ultra-micronisée assurant une dissolution rapide et complète",
      "Optimise la recharge en phosphocréatine pour resynthétiser l'ATP cellulaire",
      "Certifiée Informed-Sport et testée pour les athlètes de compétition",
      "Zéro calorie, sans arôme artificiel, se mélange facilement à votre whey"
    ]
  },

  // 2: Marvelous Glutamine Kyowa 300g
  'prod-25535': {
    nameFr: "Marvelous L-Glutamine Kyowa Quality® 300g – Récupération & Intégrité Intestinale",
    keyActives: "100% L-Glutamine d'origine végétale Kyowa Quality® issue de fermentation naturelle brevetée",
    benefitFr: "Accélère la régénération musculaire post-effort et renforce la perméabilité de la muqueuse intestinale.",
    targetAudience: "Athlètes soumis à des charges d'entraînement lourdes, sportifs d'endurance et personnes sensibles au niveau digestif.",
    posologyFr: "Prendre 5 g (1 cuillère rase) immédiatement après l'entraînement ou le soir au coucher avec de l'eau tiède ou fraîche.",
    features: [
      "Label d'excellence mondiale Kyowa Quality® garantissant une pureté pharmaceutique à 99.9%",
      "Préserve le système immunitaire en reconstituant les réserves de glutamine plasmatique",
      "Soutient le microbiote et protège les jonctions serrées de l'intestin grêle",
      "Poudre 100% végétalienne sans allergène et sans arrière-goût"
    ]
  },

  // 3: Le Guide Ultime des Compléments
  'prod-25430': {
    nameFr: "NutriFitness Le Guide Ultime des Compléments Alimentaires – Ebook Expert PDF",
    keyActives: "Plus de 120 pages de protocoles scientifiques, analyses d'ingrédients et plans de supplémentation personnalisés",
    benefitFr: "Guide pratique et indépendant pour rentabiliser vos investissements en compléments et maximiser vos résultats physiques.",
    targetAudience: "Passionnés de fitness, sportifs de tous niveaux et coachs voulant maîtriser la science de la nutrition sportive.",
    posologyFr: "Téléchargement immédiat au format PDF haute résolution, consultable à vie sur smartphone, tablette et ordinateur.",
    features: [
      "11 années d'expertise condensées par l'équipe de préparateurs NutriFitness Genève",
      "Fiches concrètes par objectif : prise de masse propre, sèche extrême, endurance, longévité",
      "Analyses sans filtre des dosages réels, des synergies gagnantes et des pièges marketing",
      "Guide complet des labels de qualité (Creapure, Kyowa, KSM-66, CFM)"
    ]
  },

  // 4: Farine D’avoine 1kg
  'prod-25175': {
    nameFr: "Pronutrition Farine d'Avoine Micronisée 1kg – Glucides Complexes & Énergie Durable",
    keyActives: "100% farine d'avoine complète micronisée à froid, riche en bêta-glucanes et fibres solubles",
    benefitFr: "Fournit une source d'énergie progressive à index glycémique modéré sans provoquer de lourdeur gastrique.",
    targetAudience: "Sportifs recherchant un petit-déjeuner équilibré, une collation saine ou un apport glucidique propre en prise de masse.",
    posologyFr: "Mélanger 50 à 100 g dans du lait végétal ou de l'eau, ou incorporer dans vos pâtes à pancakes, gaufres et smoothies.",
    features: [
      "Mouture ultra-fine permettant un mélange instantané sans grumeaux dans le shaker",
      "Riche en fibres alimentaires favorisant la satiété durable et le transit intestinal",
      "Source naturelle de minéraux (magnésium, fer, zinc) pour le métabolisme énergétique",
      "Disponible en saveurs gourmandes ou neutre sans ajout de sucre"
    ]
  },

  // 5: Glycine 300g
  'prod-25041': {
    nameFr: "Bigman Pure Glycine Poudre 300g – Sommeil Réparateur & Synthèse de Collagène",
    keyActives: "100% L-Glycine pure cristallisée de qualité supérieure au goût naturellement doux",
    benefitFr: "Favorise l'endormissement rapide, abaisse la température corporelle nocturne et optimise la synthèse de collagène.",
    targetAudience: "Sportifs subissant des courbatures articulaires, personnes stressées ayant un sommeil agité ou en quête de longévité.",
    posologyFr: "Dissoudre 3 à 5 g dans un verre d'eau ou une tisane tiède 30 à 45 minutes avant le coucher.",
    features: [
      "Acide aminé essentiel précurseur direct du collagène, du glutathion et de la créatine",
      "Améliore la profondeur des phases de sommeil réparateur sans somnolence diurne",
      "Goût naturellement sucré permettant d'édulcorer vos boissons sans calorie néfaste",
      "Conditionné en poudre pure sans liant, colorant ni additif"
    ]
  },

  // 6: Magnésium Bisglycinate 60 TABS
  'prod-25033': {
    nameFr: "NutriFitness Magnésium Bisglycinate Chélaté 60 Comprimés – Haute Biodisponibilité & Système Nerveux",
    keyActives: "Magnésium chélaté à deux molécules de glycine pour une assimilation digestive optimale",
    benefitFr: "Réduit significativement la fatigue physique et nerveuse, prévient les crampes et favorise la décontraction musculaire.",
    targetAudience: "Athlètes soumis à des séances intenses, personnes actives sujettes au stress, aux tensions musculaires et aux spasmes.",
    posologyFr: "Prendre 2 comprimés par jour avec un grand verre d'eau, de préférence le soir au dîner ou avant le coucher.",
    features: [
      "Forme chélatée bisglycinate offrant la plus haute tolérance intestinale sans effet laxatif",
      "Participe à plus de 300 réactions enzymatiques dont la synthèse protéique normale",
      "Contribue à l'équilibre électrolytique et au fonctionnement normal du système nerveux",
      "Formule exclusive NutriFitness développée selon les standards suisses de qualité"
    ]
  },

  // 7: Zinc Bisglycinate 160 CAPS
  'prod-25024': {
    nameFr: "Body Attack Zinc Bisglycinate Chélaté 160 Gélules – Immunité & Taux de Testostérone",
    keyActives: "25 mg de zinc élément hautement biodisponible chélaté au bisglycinate par gélule végétale",
    benefitFr: "Maintient un taux normal de testostérone dans le sang, renforce les défenses immunitaires et assainit la peau.",
    targetAudience: "Sportifs de force cherchant à soutenir leur profil hormonal naturel, athlètes en surentraînement et peaux à imperfections.",
    posologyFr: "Prendre 1 gélule par jour avec un repas contenant des protéines, idéalement le soir.",
    features: [
      "Chélation organique assurant une absorption digestive jusqu'à 43% supérieure aux oxydes",
      "Contribue à la synthèse normale de l'ADN et à la protection cellulaire contre le stress oxydatif",
      "Format économique de 160 gélules pour plus de 5 mois de cure continue",
      "Capsules végétales certifiées sans gluten, sans lactose et sans OGM"
    ]
  },

  // 8: Fat Burn 60 CAPS
  'prod-24668': {
    nameFr: "Dirty Squads Fat Burn Thermo 60 Gélules – Brûleur Thermogénique & Déstockage Adipeux",
    keyActives: "Extrait de thé vert titré en EGCG, caféine anhydre, l-carnitine, synéphrine et poivre noir Bioperine®",
    benefitFr: "Active la dépense calorique de repos, stimule la lipolyse et coupe les fringales intempestives en période de sèche.",
    targetAudience: "Hommes et femmes engagés dans une perte de poids ou une sèche musculaire avant compétition.",
    posologyFr: "Prendre 1 gélule le matin au petit-déjeuner et 1 gélule 30 minutes avant l'entraînement l'après-midi. Éviter en soirée.",
    features: [
      "Action thermogénique puissante accélérant l'oxydation des réserves de graisse tenaces",
      "Apport d'énergie propre pour maintenir l'intensité des séances d'entraînement en déficit calorique",
      "Complexe d'extraits botaniques standardisés pour une efficacité constante",
      "Synergie renforcée avec la Bioperine® pour décupler l'assimilation des actifs"
    ]
  },

  // 9: Bromélaïne 60 TABS 1000mg
  'prod-24655': {
    nameFr: "Pronutrition Bromélaïne Pure 1000mg 60 Comprimés – Confort Digestif & Action Anti-Inflammatoire",
    keyActives: "1000 mg de bromélaïne pure extraite de la tige d'ananas titrée à haute activité enzymatique (2500 GDU/g)",
    benefitFr: "Optimise la décomposition et l'assimilation des protéines alimentaires tout en réduisant les œdèmes et courbatures.",
    targetAudience: "Consommateurs de régimes hyper-protéinés, sportifs sujets aux douleurs articulaires et aux gonflements après l'effort.",
    posologyFr: "Prendre 1 comprimé au cours des repas principaux pour la digestion, ou à jeun pour l'action anti-inflammatoire tissulaire.",
    features: [
      "Enzyme protéolytique naturelle dégradant les protéines en acides aminés bio-disponibles",
      "Favorise la résorption des hématomes et des microlésions musculaires induites par l'exercice",
      "Soulage les lourdeurs d'estomac consécutives aux repas denses en viande ou en shakers",
      "Comprimés sécables fabriqués selon les normes européennes les plus rigoureuses"
    ]
  },

  // 10: Berberina 60 TABS
  'prod-23519': {
    nameFr: "Pronutrition Berbérine Pure 60 Comprimés – Contrôle de la Glycémie & Sensibilité à l'Insuline",
    keyActives: "500 mg d'extrait sec de racine de Berberis aristata titré à 97% de berbérine pure par comprimé",
    benefitFr: "Régule la glycémie sanguine, favorise le captage musculaire du glucose et limite le stockage adipeux.",
    targetAudience: "Personnes cherchant à stabiliser leur taux de sucre, sportifs en phase de recomposition corporelle ou en sèche.",
    posologyFr: "Prendre 1 comprimé 15 minutes avant le déjeuner et 1 comprimé avant le dîner avec un grand verre d'eau.",
    features: [
      "Active la voie métabolique de l'AMPK, véritable thermostat énergétique cellulaire",
      "Aide à prévenir les pics d'insuline responsables du stockage des graisses viscérales",
      "Soutient l'équilibre du profil lipidique et le bon fonctionnement cardiovasculaire",
      "Formulation concentrée hautement purifiée sans résidu de solvant chimique"
    ]
  },

  // 11: Frutilu Hydration Sachet
  'prod-23499': {
    nameFr: "Pronutrition Frutilù Boisson Hydratation Sans Sucre Sachet – Électrolytes & Vitamines",
    keyActives: "Mélange équilibré de potassium, sodium, magnésium et vitamines C, B6 et B12, zéro sucre",
    benefitFr: "Aromatise délicieusement l'eau tout en reconstituant les minéraux perdus par la sudation sans calorie.",
    targetAudience: "Sportifs en séance d'endurance, personnes buvant peu d'eau au cours de la journée ou en diète cétogène.",
    posologyFr: "Diluer 1 sachet dans 1.5 à 2 litres d'eau fraîche selon l'intensité gustative souhaitée et boire tout au long de la journée.",
    features: [
      "Zéro sucre ajouté, zéro calorie, compatible avec toutes les diètes restrictives",
      "Évite les sensations de fatigue et les baisses de pression liées à la déshydratation",
      "Goût fruité naturel intense et rafraîchissant sans arrière-goût chimique",
      "Format sachet nomade ultra-pratique à emporter à la salle ou en voyage"
    ]
  },

  // 12: Purée D’amande 650g
  'prod-22738': {
    nameFr: "Bio Pour Tous Purée d'Amandes Complètes Bio 650g – 100% Amandes Biologiques Sans Sucre",
    keyActives: "100% amandes complètes biologiques légèrement toastées et broyées sur meule sans aucun additif",
    benefitFr: "Source naturelle exceptionnelle d'acides gras mono-insaturés, de vitamine E antioxydante et de magnésium.",
    targetAudience: "Sportifs à la recherche d'une source saine de bons lipides pour leurs collations, petits-déjeuners et encas d'énergie.",
    posologyFr: "Consommer 1 à 2 cuillères à soupe (20-30 g) tartiné sur du pain complet, mélangé à vos flocons d'avoine ou dans un smoothie.",
    features: [
      "Certifié 100% issu de l'agriculture biologique, sans sel ajouté ni huile de palme",
      "Riche en protéines végétales (environ 21 g pour 100 g) et en fibres rassasiantes",
      "Densité énergétique propre pour soutenir les dépenses caloriques des athlètes",
      "Texture onctueuse idéale pour les recettes de pâtisseries sportives saines"
    ]
  },

  // 13: Abe Drink
  'prod-22614': {
    nameFr: "Applied Nutrition ABE Energy Drink Canette 330ml – Boisson Énergétique Pré-Workout Zéro Sucre",
    keyActives: "200 mg de caféine anhydre, 2 g de bêta-alanine, taurine, citrulline et vitamines du groupe B",
    benefitFr: "Délivre un boost d'énergie explosif immédiat, amplifie la concentration mentale et repousse la congestion musculaire.",
    targetAudience: "Pratiquants de musculation, crossfit, sports collectifs et étudiants nécessitant un pic de vigilance immédiat.",
    posologyFr: "Boire 1 canette bien fraîche environ 20 à 30 minutes avant la séance d'entraînement. Ne pas dépasser 1 canette par jour.",
    features: [
      "Formule de pré-entraînement All Black Everything réputée dans le monde entier",
      "Zéro calorie, zéro sucre, gazéification fine et saveurs fruitées sensationnelles",
      "Enrichi en vitamines B3 et B12 pour soutenir le métabolisme énergétique normal",
      "Prêt à boire instantanément sans shaker ni préparation préalable"
    ]
  },

  // 14: Ashwagandha Ksm-66® 600mg
  'prod-22608': {
    nameFr: "Bigman Ashwagandha KSM-66® Pure 600mg 60 Gélules – Gestion du Stress & Équilibre Hormonal",
    keyActives: "600 mg d'extrait de racine d'Ashwagandha KSM-66® biologique titré à 5% de withanolides par gélule",
    benefitFr: "Plante adaptogène reine pour réduire le taux de cortisol, améliorer la résistance au stress et optimiser la force.",
    targetAudience: "Personnes surmenées, athlètes en période de charge d'entraînement maximale et personnes ayant du mal à récupérer.",
    posologyFr: "Prendre 1 gélule par jour avec un repas, de préférence le soir ou le matin selon votre sensibilité.",
    features: [
      "Label d'Ashwagandha le plus réputé et documenté cliniquement au monde (KSM-66®)",
      "Extrait 'full-spectrum' respectant l'équilibre naturel des principes actifs de la racine",
      "Améliore la qualité du sommeil et soutient la production naturelle de testostérone",
      "Gélules végétales pures sans solvant résiduel ni additif artificiel"
    ]
  },

  // 15: Anabolic Mass 2.5kg
  'prod-22386': {
    nameFr: "Dirty Squads Anabolic Mass Gainer 2.5kg – Prise de Masse Musculaire Haute Densité",
    keyActives: "Complexe de glucides complexes (avoine, maltodextrine), concentré de whey, monohydrate de créatine et BCAA",
    benefitFr: "Fournit un apport calorique massif et équilibré pour enclencher une prise de muscle rapide chez les métabolismes rapides.",
    targetAudience: "Ectomorphes, pratiquants de musculation débutants ou confirmés peinant à prendre du poids corporel.",
    posologyFr: "Mélanger 100 à 150 g de poudre dans 400 ml d'eau ou de lait, à consommer en collation l'après-midi ou après la séance.",
    features: [
      "Ratio glucides/protéines calibré pour nourrir les muscles sans stockage adipeux excessif",
      "Enrichi en créatine pour booster simultanément les gains de force et la volumisation cellulaire",
      "Miscibilité facile au shaker et texture ultra-crémeuse au goût chocolat ou vanille",
      "Élaboré selon les normes de pureté de l'Union Européenne et contrôlé en laboratoire"
    ]
  },

  // 16: Dirty Cluster Dex 1kg
  'prod-22011': {
    nameFr: "Dirty Squads Cluster Dextrin® Pure 1kg – Dextrine Cyclique Hautement Ramifiée Intra-Workout",
    keyActives: "100% dextrine cyclique hautement ramifiée Cluster Dextrin® brevetée d'origine japonaise",
    benefitFr: "Garantit une vidange gastrique ultra-rapide et fournit un flux constant de glucose aux muscles sans lourdeur digestive.",
    targetAudience: "Athlètes d'endurance, pratiquants de musculation de haut niveau et compétiteurs pendant des entraînements intenses.",
    posologyFr: "Mélanger 25 à 50 g de poudre dans 500 à 750 ml d'eau avec vos acides aminés (EAA/BCAA) et boire par petites gorgées pendant l'effort.",
    features: [
      "Poids moléculaire très élevé assurant une osmolarité extrêmement basse en solution",
      "Aucun trouble gastro-intestinal ni gonflement, même lors d'efforts cardiovasculaires intenses",
      "Maintient un taux de glycémie parfaitement stable et prévient les baisses d'énergie brutales",
      "Solubilité exceptionnelle dans l'eau froide sans laisser de résidus"
    ]
  },

  // 17: Dirty Amino X9 300g
  'prod-21979': {
    nameFr: "Dirty Squads Amino X9 EAA + BCAA 300g – Matrice Complète 9 Acides Aminés Essentiels",
    keyActives: "Spectre complet des 9 acides aminés essentiels (EAA) enrichi en BCAA au ratio anabolique 2:1:1",
    benefitFr: "Stoppe immédiatement le catabolisme musculaire et déclenche la synthèse des protéines pendant et après l'exercice.",
    targetAudience: "Pratiquants de musculation s'entraînant à jeun, sportifs d'endurance et toute personne cherchant une régénération musculaire rapide.",
    posologyFr: "Mélanger 10 g (1 dosette) dans 400 ml d'eau fraîche à consommer pendant ou juste après l'entraînement.",
    features: [
      "Fournit les 9 briques indispensables que l'organisme humain ne peut pas synthétiser seul",
      "Stimule directement la cascade anabolique mTOR grâce à un apport ciblé en L-Leucine",
      "Zéro sucre, zéro graisse, absorption digestive instantanée sans effort stomacal",
      "Arômes rafraîchissants parfaits pour vous hydrater durant les séances intensives"
    ]
  },

  // 18: ISO 90x Cfm 1kg
  'prod-21965': {
    nameFr: "Dirty Squads ISO 90X CFM Isolat de Whey 1kg – 90% Protéine Microfiltrée à Froid Sans Lactose",
    keyActives: "Isolat de lactosérum natif pur à 90% obtenu par microfiltration à flux croisé (CFM à basse température)",
    benefitFr: "Apporte une concentration protéique maximale avec moins de 0.5% de matières grasses et sans lactose résiduel.",
    targetAudience: "Compétiteurs de fitness, sportifs en phase de définition musculaire stricte et personnes intolérantes au lactose.",
    posologyFr: "Mélanger 30 g de poudre (1 dosette) dans 250 ml d'eau fraîche immédiatement après la séance ou au réveil.",
    features: [
      "Procédé CFM doux préservant les fractions peptidiques bioactives (immunoglobulines, lactoferrine)",
      "Absorption ultra-rapide en 20 minutes pour nourrir les fibres musculaires en phase post-effort",
      "Teneur en BCAA naturels supérieure à 6.8 g par shaker sans aucun acide aminé de remplissage",
      "Solubilité instantanée à la cuillère, texture fluide et légère sans arrière-goût"
    ]
  },

  // 19: ISO 80x Grass Fed 2kg
  'prod-21951': {
    nameFr: "Dirty Squads ISO 80X Whey Concentrée Grass-Fed 2kg – Protéine de Lactosérum de Pâturage",
    keyActives: "Concentré de whey issu à 100% de vaches élevées au pâturage (Grass-Fed), 80% de protéines pures",
    benefitFr: "Soutient la croissance et le maintien de la masse musculaire avec un profil naturel d'acides aminés non dénaturés.",
    targetAudience: "Sportifs au quotidien recherchant une protéine complète, crémeuse, saine et d'origine contrôlée.",
    posologyFr: "Mélanger 30 g dans 250 ml d'eau ou de lait d'amande au petit-déjeuner ou directement après l'effort physique.",
    features: [
      "Lait de vaches nourries à l'herbe garantissant une teneur supérieure en CLA et oméga-3 naturels",
      "Texture onctueuse ultra-gourmande qui s'intègre parfaitement aux porridges et shakers",
      "Riche en acides aminés essentiels pour optimiser la synthèse protéique musculaire",
      "Édulcorée avec parcimonie sans aspartame ni colorant artificiel"
    ]
  },

  // 20: Creatine Poudre 90g
  'prod-21877': {
    nameFr: "Bigman Créatine Monohydrate Micronisée 90g – Pureté Maximale Force & Récupération",
    keyActives: "100% créatine monohydrate micronisée pure de haute qualité sans aucun excipient",
    benefitFr: "Format compact idéal pour une cure d'un mois afin d'augmenter la force sur les séries courtes et lourdes.",
    targetAudience: "Débutants en musculation souhaitant tester la créatine, ou athlètes en déplacement nécessitant un format voyage.",
    posologyFr: "Prendre 3 g par jour dilués dans un verre d'eau ou de jus de fruits, de préférence après votre entraînement.",
    features: [
      "Micro-granulométrie assurant une suspension homogène dans l'eau sans résidu au fond",
      "Reconstitue les stocks de créatine phosphate musculaire pour une puissance accrue",
      "Conditionnement nomade pratique de 90 g pour une cure d'initiation de 30 jours",
      "Zéro arôme, zéro sucre, se combine facilement avec n'importe quelle boisson sportive"
    ]
  },

  // 21: Piadina Keto 120g
  'prod-21850': {
    nameFr: "Pronutrition Piadina Keto Wrap Protéiné 120g – Pain Plat Low Carb Riche en Fibres",
    keyActives: "Farine d'amande, protéines de blé, farine de lin, graines de tournesol, fibres végétales",
    benefitFr: "Wrap traditionnel italien revisité en version cétogène : très riche en protéines et faible en glucides assimilables.",
    targetAudience: "Personnes suivant une alimentation cétogène, low-carb ou diabétique souhaitant se préparer des wraps salés sains.",
    posologyFr: "Réchauffer 1 à 2 minutes à la poêle chaude sans matière grasse, puis garnir de légumes frais et protéines maigres.",
    features: [
      "Moins de 4 g de glucides nets par galette pour respecter l'état de cétose métabolique",
      "Excellente teneur en fibres et protéines pour procurer une sensation de satiété durable",
      "Texture souple et moelleuse qui ne se casse pas lors du roulage",
      "Idéal pour confectionner des sandwichs diététiques au bureau ou à emporter à la salle"
    ]
  },

  // 22: Big Flapjack 100g
  'prod-21744': {
    nameFr: "Moose Muscle Flapjack Énergétique à l'Avoine 100g – Collation Complète & Énergie Durable",
    keyActives: "Flocons d'avoine complets toastés au four, sirop de sucre de canne non raffiné, fruits à coque",
    benefitFr: "Apporte une réserve massive d'énergie saine à libération progressive pour soutenir les efforts physiques prolongés.",
    targetAudience: "Randonneurs en montagne suisse, cyclistes, pratiquants de musculation en prise de masse et personnes très actives.",
    posologyFr: "Consommer 1 barre 45 minutes avant une longue séance ou en collation dense entre deux repas d'entraînement.",
    features: [
      "Énergie glucidique complexe de haute qualité issue de l'avoine complète traditionnelle",
      "Riche en fibres solubles facilitant une diffusion glycémique stable sans coup de fatigue",
      "Texture fondante et consistante qui résiste parfaitement au transport dans le sac de sport",
      "Goût authentique de flapjack britannique traditionnel"
    ]
  },

  // 23: Super Digestive 60 CAPS
  'prod-21727': {
    nameFr: "Marvelous Super Digestive Complexe Multi-Enzymatique 60 Gélules – Confort Digestif & Assimilation",
    keyActives: "Complexe de 5 enzymes digestives majeures (amylase, protéase, lactase, lipase, cellulase) + bétaïne HCl",
    benefitFr: "Décompose efficacement les protéines, glucides, graisses et produits laitiers pour éliminer gaz et lourdeurs d'estomac.",
    targetAudience: "Athlètes ingérant de fortes quantités de nourriture, adeptes de régimes hyper-protéinés et personnes intolérantes.",
    posologyFr: "Prendre 1 à 2 gélules juste au début des repas volumineux ou riches en protéines avec une gorgée d'eau.",
    features: [
      "Améliore significativement la biodisponibilité des nutriments en fragmentant les macronutriments",
      "Contient de la lactase pour digérer sans inconfort le lactose des shakers de whey",
      "Soulage l'estomac et prévient les fermentations intestinales post-prandiales",
      "Gélules végétales gastro-résistantes protégeant les enzymes de l'acide gastrique"
    ]
  },

  // 24: Hbvc Cholesterol Support 90 CAPS
  'prod-21724': {
    nameFr: "Marvelous HBVC Cholesterol Support 90 Gélules – Protection Cardiovasculaire & Métabolisme Lipidique",
    keyActives: "Monacoline K de levure de riz rouge, Coenzyme Q10, extrait d'artichaut et phytostérols végétaux",
    benefitFr: "Maintient un taux normal de cholestérol sanguin et protège les parois vasculaires contre le stress oxydatif.",
    targetAudience: "Sportifs et personnes attentives à leur santé cardiaque, surveillant leurs bilans sanguins lipidiques.",
    posologyFr: "Prendre 1 gélule par jour le soir au cours du dîner avec un grand verre d'eau.",
    features: [
      "Action ciblée sur l'inhibition de la synthèse hépatique du mauvais cholestérol LDL",
      "Enrichi en Coenzyme Q10 pour compenser toute baisse mitochondriale liée aux régulateurs lipidiques",
      "Extrait d'artichaut favorisant le métabolisme hépatobiliaire des graisses",
      "Formule naturelle standardisée conforme aux strictes recommandations suisses DFI"
    ]
  },

  // 25: Testoman 120 CAPS
  'prod-21650': {
    nameFr: "Marvelous TestoMan Booster Vitalité Masculine 120 Gélules – Optimisation Hormonale & Vigueur",
    keyActives: "Tribulus terrestris titré à 90% de saponines, acide D-aspartique (DAA), fenugrec, zinc bisglycinate et bore",
    benefitFr: "Optimise naturellement la synthèse endogène de testostérone, amplifie la force à la salle et réactive la vitalité masculine.",
    targetAudience: "Hommes de plus de 25 ans, sportifs constatant une baisse de tonus ou de libido lors d'entraînements intenses.",
    posologyFr: "Prendre 2 gélules le matin et 2 gélules 30 minutes avant l'entraînement ou le soir avec un grand verre d'eau.",
    features: [
      "Association synergique de précurseurs naturels scientifiquement étudiés",
      "Le zinc contribue au maintien d'un taux normal de testostérone dans le sang",
      "Soutient la spermatogenèse normale et renforce la motivation mentale sous la barre",
      "100% légal, sans hormone synthétique ni substance interdite par l'antidopage"
    ]
  },

  // 26: NAC Pharma Grade 60 CAPS
  'prod-21419': {
    nameFr: "Marvelous N-Acétyl-Cystéine NAC Grade Pharma 600mg 60 Gélules – Précurseur de Glutathion & Détox",
    keyActives: "600 mg de N-Acétyl-L-Cystéine pure de grade pharmaceutique par gélule végétale",
    benefitFr: "Stimule la synthèse du maître antioxydant cellulaire (glutathion), purifie le foie et dégage les voies respiratoires.",
    targetAudience: "Sportifs subissant un stress oxydatif élevé, personnes exposées à la pollution ou effectuant une détoxification hépatique.",
    posologyFr: "Prendre 1 gélule par jour le matin à jeun ou avec un repas léger.",
    features: [
      "Précurseur le plus biodisponible pour relancer les réserves intracellulaires de glutathion",
      "Soutient activement la fonction hépatique dans l'élimination des toxines et métabolites",
      "Propriétés mucolytiques reconnues pour améliorer l'oxygénation pulmonaire des sportifs",
      "Conditionné en gélules étanches préservant l'intégrité de la molécule soufrée"
    ]
  },

  // 27: Peanut Butter Cremeux 500g
  'prod-21373': {
    nameFr: "Pronutrition Beurre de Cacahuètes Crémeux 100% Arachides 500g – Sans Huile de Palme Sans Sel",
    keyActives: "100% cacahuètes d'Argentine lentement torréfiées et finement broyées",
    benefitFr: "Tartinade crémeuse d'exception apportant 28% de protéines végétales et des graisses saines insaturées.",
    targetAudience: "Tous les sportifs et gourmands à la recherche d'une source saine de calories pour leurs petits-déjeuners et encas.",
    posologyFr: "Tartiner 20 à 30 g sur des galettes de riz, du pain complet, ou incorporer dans un shaker de protéines.",
    features: [
      "Zéro huile de palme, zéro sucre raffiné ajouté, sans sel ni conservateur",
      "Texture onctueuse facile à étaler sans déphasage huileux excessif",
      "Source généreuse de magnésium, zinc et vitamine E pour le système immunitaire",
      "Produit dans le respect des normes d'hygiène alimentaire les plus sévères"
    ]
  },

  // 28: Caffeine 200mg 60 TABS
  'prod-21360': {
    nameFr: "Pronutrition Caféine Anhydre Pure 200mg 60 Comprimés – Énergie Immédiate & Focus Mental",
    keyActives: "200 mg de caféine anhydre ultra-pure de qualité pharmaceutique par comprimé",
    benefitFr: "Accroît la vigilance, retarde la perception de la fatigue physique et stimule le métabolisme de base.",
    targetAudience: "Athlètes avant un entraînement exigeant, travailleurs de nuit ou étudiants nécessitant une concentration maximale.",
    posologyFr: "Prendre 1 comprimé 30 à 45 minutes avant l'effort avec un grand verre d'eau. Ne pas consommer dans les 6h précédant le sommeil.",
    features: [
      "Équivalent à environ deux expressos corsés sous forme de comprimé à libération directe",
      "Aide à augmenter les performances d'endurance et la vigilance cognitive",
      "Comprimé sécable permettant d'ajuster le dosage à 100 mg selon la tolérance individuelle",
      "Zéro calorie, formule pure sans additif stimulant suspect"
    ]
  },

  // 29: Nutry Nuts Cups
  'prod-21282': {
    nameFr: "Nutry Nuts Peanut Butter Cups Protéinées – Coupelles Chocolat & Beurre de Cacahuètes",
    keyActives: "Beurre de cacahuète pur crémeux, enrobage au chocolat au lait belge, isolat de protéines de lactosérum",
    benefitFr: "La version saine et riche en protéines des célèbres coupelles au beurre de cacahuète, avec 70% de sucre en moins.",
    targetAudience: "Les sportifs gourmands qui ne veulent plus choisir entre plaisir gustatif et respect de leurs macros nutritionnels.",
    posologyFr: "Déguster 1 pack de deux coupelles lors de votre pause café ou en collation gourmande de l'après-midi.",
    features: [
      "12 g de protéines de haute qualité par paquet pour nourrir vos muscles avec délice",
      "Véritable chocolat belge au fondant incomparable sans huile de palme",
      "Teneur en sucres considérablement réduite par rapport aux confiseries classiques",
      "Format individuel en sachet fraîcheur prêt à emporter"
    ]
  },

  // 30: Max Protéines Cookie
  'prod-21257': {
    nameFr: "Big Supplements Max Protein Cookie Gourmand – Biscuit Moelleux Riche en Protéines & Fibres",
    keyActives: "Farine d'avoine, protéines de lait et de soja, pépites de chocolat noir sans sucre, huile de tournesol",
    benefitFr: "Cookie crousti-moelleux cuit au four délivrant plus de 20 g de protéines pures pour combler toutes vos envies de douceur.",
    targetAudience: "Sportifs en déplacement, amateurs de snacks riches en protéines et personnes en quête d'une collation rassasiante.",
    posologyFr: "Consommer 1 cookie en milieu de matinée ou après l'entraînement pour recharger vos réserves d'énergie.",
    features: [
      "22 g de protéines complètes contribuant directement à l'hypertrophie musculaire",
      "Riche en fibres alimentaires pour réguler l'appétit et favoriser un transit harmonieux",
      "Texture authentique de bakery américaine cuite lentement à cœur",
      "Sans OGM, sans aspartame, élaboré avec des ingrédients soigneusement tracés"
    ]
  },

  // 31: More Spray Cooker 200ml
  'prod-21181': {
    nameFr: "More Nutrition Spray Cuisson Huile de Colza 200ml – Antiadhésif Zéro Calories Superflues",
    keyActives: "100% huile de colza pure désodorisée et raffinée pour une haute résistance à la chaleur",
    benefitFr: "Permet de lubrifier vos poêles et moules avec une précision millimétrique en apportant moins de 2 calories par pulvérisation.",
    targetAudience: "Toutes les personnes en sèche ou en rééquilibrage alimentaire qui souhaitent cuisiner sans rajouter de gras invisible.",
    posologyFr: "Secouer avant emploi et pulvériser à 20 cm de distance sur la poêle froide pendant environ 1/3 de seconde avant cuisson.",
    features: [
      "Système de micro-diffusion révolutionnaire évitant les surdoses d'huile liquide",
      "Point de fumée élevé idéal pour saisir viandes, œufs, poissons et pancakes sportifs",
      "Jusqu'à 95% de matières grasses en moins dans vos assiettes au quotidien",
      "Flacon pressurisé à l'air comprimé sans gaz propulseur nocif ni résidu chimique"
    ]
  },

  // 32: L-citrulline 100% Pure 250g
  'prod-21032': {
    nameFr: "Marvelous L-Citrulline Malate 100% Pure 250g – Vasodilatation Oxygénation & Congestion Musculaire",
    keyActives: "100% L-Citrulline Malate au ratio optimal 2:1 issue de fermentation végétale pure",
    benefitFr: "Augmente massivement la production d'oxyde nitrique (NO), favorise une congestion musculaire extrême et retarde l'épuisement.",
    targetAudience: "Pratiquants de musculation, bodybuilders et athlètes de crossfit cherchant un pump dantesque et une meilleure oxygénation.",
    posologyFr: "Mélanger 6 à 8 g de poudre dans 250 ml d'eau 30 minutes avant votre séance d'entraînement.",
    features: [
      "Efficacité supérieure à l'arginine classique pour élever les taux sanguins d'oxyde nitrique",
      "Améliore l'apport en oxygène et en nutriments anaboliques vers les tissus musculaires actifs",
      "Facilite l'évacuation de l'ammoniaque et de l'acide lactique pour enchaîner plus de répétitions",
      "Poudre 100% pure sans colorant, sans édulcorant et au goût acidulé naturel"
    ]
  },

  // 33: Mega Mass 4000 3kg
  'prod-20929': {
    nameFr: "Dymatize Super Mega Mass 4000 3kg – Hard Gainer Calibré Prise de Masse & Énergie",
    keyActives: "Matrice glucidique dense, isolat et concentré de lactosérum, créatine monohydrate, complexe de 12 vitamines et minéraux",
    benefitFr: "Le gainer historique des légendes du bodybuilding conçu pour franchir les paliers de stagnation pondérale.",
    targetAudience: "Athlètes très minces, ectomorphes et sportifs ayant des dépenses caloriques colossales impossibles à couvrir par l'alimentation seule.",
    posologyFr: "Mélanger 150 g de poudre dans 500 ml d'eau ou de lait entier et consommer entre les repas ou après votre entraînement.",
    features: [
      "Apporte plus de 800 kcal de haute qualité nutritive par portion complète",
      "Mélange de protéines à digestion rapide et lente pour nourrir les muscles sur plusieurs heures",
      "Enrichi en vitamines du groupe B et zinc pour un métabolisme énergétique optimal",
      "Goût légendaire et onctuosité reconnue dans le monde de la musculation depuis des décennies"
    ]
  },

  // 34: Muscles WHEY 2kg
  'prod-20727': {
    nameFr: "Marvelous Muscles Whey Concentrée Ultra-Filtrée 2kg – Haute Teneur en BCAA & Goût Gourmand",
    keyActives: "Concentré de protéine de lactosérum ultra-filtré à 78% de protéines, riche en acides aminés ramifiés",
    benefitFr: "Soutient activement le développement de masse musculaire sèche et procure une récupération musculaire rapide après l'effort.",
    targetAudience: "Sportifs de tous niveaux à la recherche d'une protéine polyvalente au rapport qualité/prix imbattable.",
    posologyFr: "Mélanger 30 g de poudre (1 dosette) dans 250 ml d'eau fraîche ou de lait végétal après l'entraînement ou en collation.",
    features: [
      "Concentration naturelle de 5.4 g de BCAA et plus de 4 g de glutamine par shaker",
      "Microfiltration douce préservant toutes les qualités nutritionnelles du lactosérum",
      "Solubilité parfaite sans mousse excessive ni grumeaux gênants",
      "Saveurs italiennes ultra-gourmandes élaborées avec des arômes naturels d'excellence"
    ]
  },

  // 35: Marvelous Crème De Riz 1.4kg
  'prod-20531': {
    nameFr: "Marvelous Crème de Riz Précuite 1.4kg – Glucides Digestes & Assimilation Rapide Pré/Post-Workout",
    keyActives: "100% farine de riz blanc hydrolysée et précuite à la vapeur, sans gluten",
    benefitFr: "La source de glucides préférée des athlètes professionnels pour une recharge rapide du glycogène sans aucune lourdeur gastrique.",
    targetAudience: "Culturistes, sportifs d'endurance et toute personne cherchant un apport d'énergie propre facile à digérer.",
    posologyFr: "Mélanger 50 g de crème de riz dans 150 à 200 ml d'eau tiède ou froide jusqu'à obtention d'une crème onctueuse, ou ajouter à votre whey.",
    features: [
      "Digestion quasi instantanée permettant une consommation seulement 45 minutes avant l'effort",
      "Index glycémique élevé idéal pour la fenêtre anabolique post-entraînement",
      "Naturellement exempte de gluten, de lactose et d'allergènes courants",
      "Disponible en saveurs dessert exquises ou version neutre pour vos préparations salées"
    ]
  },

  // 36: Calibration Organe Support 120 CAPS
  'prod-20464': {
    nameFr: "Marvelous Calibration Organ Support 120 Gélules – Détox Hépatique & Protection Organique Complète",
    keyActives: "Chardon-Marie (80% silymarine), N-Acétyl-Cystéine (NAC), extrait de baie de palmier nain (Saw Palmetto), aubépine et CoQ10",
    benefitFr: "Formule tout-en-un ultra-complète développée pour protéger le foie, le système cardiovasculaire, la prostate et les reins.",
    targetAudience: "Athlètes de force de niveau avancé, bodybuilders soumis à des entraînements extrêmes ou des cycles nutritionnels intenses.",
    posologyFr: "Prendre 2 gélules le matin et 2 gélules le soir avec un grand verre d'eau au cours des repas.",
    features: [
      "Complexe hépato-protecteur puissant favorisant la régénération des hépatocytes",
      "Extrait d'aubépine et CoQ10 pour soutenir la pression artérielle et le myocarde",
      "Le palmier nain protège la santé de la prostate contre l'excès de DHT",
      "Gélules végétales haute concentration testées pour une pureté absolue"
    ]
  },

  // 37: Pancake Protéinés 800g
  'prod-20440': {
    nameFr: "Pronutrition Préparation Pancakes Protéinés 800g – Petit-Déjeuner Sportif Équilibré Sans Sucre",
    keyActives: "Farine d'avoine complète, concentré de protéines de lactosérum, albumine d'œuf frais, fibres végétales",
    benefitFr: "Préparez en 3 minutes des pancakes moelleux, savoureux et hyper-protéinés sans avoir besoin de peser les ingrédients.",
    targetAudience: "Familles sportives, adeptes de petits-déjeuners gourmands et athlètes surveillant strictement leurs apports protéiques.",
    posologyFr: "Mélanger 50 g de préparation dans 100 ml d'eau ou de lait, puis verser dans une poêle antiadhésive chaude 1 à 2 minutes par face.",
    features: [
      "Plus de 35% de protéines complètes à haute valeur biologique par portion",
      "Riche en glucides lents pour une satiété garantie tout au long de la matinée",
      "Zéro sucre ajouté, sans huile de palme et sans aspartame",
      "Texture aérée et goût digne des meilleurs brunchs américains"
    ]
  },

  // 38: Recharge 90 CAPS
  'prod-20370': {
    nameFr: "Marvelous Recharge Post-Workout 90 Gélules – Régénération Énergétique & Réduction de la Fatigue",
    keyActives: "Complexe de vitamines B bioactives, magnésium bisglycinate, acide alpha-lipoïque, taurine et potassium",
    benefitFr: "Réactive les cycles cellulaires de récupération, rééquilibre la balance électrolytique et combat la fatigue nerveuse post-effort.",
    targetAudience: "Athlètes s'entraînant quotidiennement, pratiquants de sports intenses ressentant une baisse d'énergie résiduelle.",
    posologyFr: "Prendre 3 gélules immédiatement après la fin de la séance d'entraînement avec une boisson hydratante.",
    features: [
      "Restaure les coenzymes essentiels épuisés lors des efforts anaérobies intenses",
      "Réduit le temps de récupération neuromusculaire entre deux séances consécutives",
      "L'acide alpha-lipoïque optimise la sensibilité cellulaire à l'insuline pour stocker le glycogène",
      "Sans aucun excipient de synthèse, conforme aux normes antidopage en vigueur"
    ]
  },

  // 39: Stage Diuretique 45 CAPS
  'prod-20358': {
    nameFr: "Marvelous Stage Diurétique Naturel 45 Gélules – Définition Musculaire & Élimination de l'Eau Sous-Cutanée",
    keyActives: "Extraits botaniques concentrés de pissenlit (Taraxacum), busserole (Uva Ursi), queue de cerise, thé vert et potassium",
    benefitFr: "Chasse l'eau sous-cutanée pour révéler des stries musculaires nettes et une peau fine sans provoquer de crampes.",
    targetAudience: "Compétiteurs de bodybuilding en fin de préparation, athlètes au shooting photo ou personnes sujettes à la rétention d'eau.",
    posologyFr: "Prendre 3 gélules par jour réparties sur les repas principaux avec un grand verre d'eau pendant une cure de 10 à 15 jours maximum.",
    features: [
      "Diurétiques végétaux doux qui préservent le potassium intramusculaire indispensable au volume des muscles",
      "Affine spectaculairement la silhouette en drainant l'eau interstitielle superflue",
      "Enrichi en potassium pour garantir une sécurité cardiovasculaire et éviter les spasmes",
      "Formule 100% naturelle sans molécule de synthèse asséchante dangereuse"
    ]
  },

  // 40: Mk7 Vitamine D3 K2 90 CAPS
  'prod-20353': {
    nameFr: "Marvelous Vitamine D3 + K2 MK7 90 Gélules – Fixation du Calcium Santé Osseuse & Immunité",
    keyActives: "3000 UI de vitamine D3 naturelle (cholécalciférol) + 100 mcg de vitamine K2 sous forme ménaquinone MK-7 microencapsulée",
    benefitFr: "Synergie vitale garantissant que le calcium absorbé se fixe dans le tissu osseux sans calcifier les artères coronaires.",
    targetAudience: "Toutes les personnes vivant sous le climat suisse, sportifs intensifs et personnes soucieuses de leur longévité osseuse.",
    posologyFr: "Prendre 1 gélule par jour le matin ou au déjeuner au cours d'un repas contenant des matières grasses saines.",
    features: [
      "La forme MK-7 possède une demi-vie prolongée dans l'organisme pour une protection 24h sur 24",
      "Renforce les défenses naturelles de l'organisme tout au long des mois d'automne et d'hiver",
      "Soutient la fonction musculaire et la régulation de la contraction des fibres",
      "Fabriqué sur support d'huile végétale pour une biodisponibilité liposoluble maximale"
    ]
  },

  // 41: Fer Liposomale 90 TABS
  'prod-20183': {
    nameFr: "Pronutrition Fer Liposomal Micro-Encapsulé 90 Comprimés – Assimilation Maximale Sans Troubles Digestifs",
    keyActives: "30 mg de fer pyrophosphate micro-encapsulé dans des liposomes protecteurs + vitamine C et acide folique",
    benefitFr: "Remonte rapidement le taux de ferritine et combat l'anémie du sportif sans nausée, sans goût métallique ni constipation.",
    targetAudience: "Coureurs à pied, triathlètes, femmes sportives et végétariens sujets aux baisses d'hémoglobine.",
    posologyFr: "Prendre 1 comprimé par jour le matin avec un verre d'eau ou un jus de fruits. Peut se prendre indifféremment à jeun ou au repas.",
    features: [
      "Technologie liposomale permettant au fer de franchir l'estomac sans irriter la muqueuse gastrique",
      "Absorption intestinale directe multipliée par rapport aux sulfates de fer classiques",
      "La vitamine C adjointe booste encore le passage transmembranaire du fer",
      "Contribue à la formation normale des globules rouges et au transport de l'oxygène"
    ]
  },

  // 42: Shilajit Pure Resine
  'prod-20150': {
    nameFr: "Pure Résine de Shilajit Purifiée des Hautes Montagnes 30g – Acide Fulvique & 84 Minéraux Trace",
    keyActives: "100% résine de Shilajit brute authentique d'altitude purifiée traditionnellement, titrée à plus de 50% d'acide fulvique",
    benefitFr: "Véritable or noir de l'Himalaya revitalisant la production d'ATP mitochondriale, renforçant la testostérone et l'immunité.",
    targetAudience: "Sportifs en recherche de performances naturelles d'endurance, personnes épuisées et adeptes de biohacking de santé.",
    posologyFr: "Dissoudre une dose de la taille d'un grain de riz (environ 250 à 500 mg) dans de l'eau tiède, du thé ou du lait le matin à jeun.",
    features: [
      "Concentration phénoménale en plus de 84 oligo-éléments sous forme ionique directement assimilable",
      "L'acide fulvique agit comme un transporteur cellulaire profond pour optimiser l'entrée des nutriments",
      "Purifié selon les procédés ancestraux sans solvant chimique, testé sans métaux lourds",
      "Fourni avec une spatule doseuse de précision en acier inoxydable"
    ]
  },

  // 43: Glucoart Poudre 200g
  'prod-20145': {
    nameFr: "Pronutrition GlucoArt Poudre 200g – Métabolisme des Glucides & Sensibilité à l'Insuline",
    keyActives: "Berbérine pure, acide alpha-lipoïque (ALA), extrait de cannelle de Ceylan, fenugrec et picolinate de chrome",
    benefitFr: "Formule innovante en poudre pour orienter les glucides vers les cellules musculaires plutôt que vers les adipocytes.",
    targetAudience: "Bodybuilders en prise de masse propre, athlètes consommant de gros repas glucidiques et personnes en sèche.",
    posologyFr: "Mélanger 5 g dans un verre d'eau 15 minutes avant votre repas le plus riche en glucides de la journée.",
    features: [
      "Optimise la partition des nutriments (nutrient partitioning) pour maximiser les stocks de glycogène",
      "Le chrome contribue au maintien d'une glycémie normale et limite les fringales de sucre",
      "Format poudre pratique à doser précisément selon la charge glucidique du repas",
      "Formulation synergique associant les agents sensibilisateurs à l'insuline les plus reconnus"
    ]
  },

  // 44: Glucoart 90 TABS
  'prod-20141': {
    nameFr: "Pronutrition GlucoArt 90 Comprimés – Régulation de la Glycémie & Complexe Berbérine-Chrome",
    keyActives: "Berbérine titrée à haute concentration, acide alpha-lipoïque, cannelle et picolinate de chrome en comprimés",
    benefitFr: "Régulateur de glucose en comprimés nomades pour stabiliser la glycémie lors des repas d'affaires ou des sorties au restaurant.",
    targetAudience: "Personnes surveillant leur taux de sucre sanguin et sportifs voulant éviter le stockage de graisses après un repas plaisir (cheat meal).",
    posologyFr: "Prendre 2 comprimés 15 à 20 minutes avant un repas copieux avec un grand verre d'eau.",
    features: [
      "Comprimés faciles à transporter et à avaler discrètement avant de passer à table",
      "Diminue la somnolence post-prandiale causée par les chutes de glycémie réactionnelles",
      "Améliore la réceptivité des récepteurs GLUT-4 des fibres musculaires",
      "Certifié conforme aux exigences sanitaires suisses et européennes"
    ]
  },

  // 45: Ozer Vegan Post Workout
  'prod-19220': {
    nameFr: "Ozer Vegan Post-Workout Récupération 900g – Protéines Végétales & Acides Aminés Fermentés",
    keyActives: "Isolat de protéines de pois biologiques, riz brun germé, graines de courge, glutamine et BCAA d'origine végétale",
    benefitFr: "Shake post-workout végétalien complet à haute valeur biologique garantissant une reconstruction musculaire totale sans produit laitier.",
    targetAudience: "Athlètes végans, végétariens et toute personne intolérante aux protéines laitières recherchant une digestibilité parfaite.",
    posologyFr: "Mélanger 35 g de poudre dans 300 ml d'eau ou de lait végétal (avoine, amande) dans les 30 minutes suivant l'effort physique.",
    features: [
      "Profil d'acides aminés complet équivalent à celui d'une whey grâce à la complémentarité pois/riz",
      "Sans gluten, sans soja, sans lactose et certifié sans aucun composant d'origine animale",
      "Enrichi en enzymes végétales pour éliminer tout risque de ballonnements intestinaux",
      "Texture onctueuse travaillée sans l'amertume typique des poudres végétales classiques"
    ]
  },

  // 46: One Piece WHEY 1kg Chocolat
  'prod-19180': {
    nameFr: "Big Supplements One Piece Whey Concentrée 1kg Chocolat – Concentré de Whey Édition Limitée",
    keyActives: "Concentré de lactosérum ultra-filtré à 75% de protéines, poudre de cacao hollandais pur, complexe DigeZyme®",
    benefitFr: "Édition collector au goût de chocolat fondant sensationnel formulée pour construire du muscle avec un maximum de plaisir.",
    targetAudience: "Fans de mangas, pratiquants de musculation réguliers et sportifs recherchant un shaker savoureux et efficace.",
    posologyFr: "Mélanger 30 g de poudre dans 250 ml d'eau ou de lait écrémé après l'entraînement ou en collation gourmande.",
    features: [
      "Design collector officiel One Piece pour égayer vos placards de suppléments",
      "Enzymes digestives DigeZyme® assurant une assimilation parfaite sans aucune lourdeur",
      "Goût riche et onctueux rappelant les meilleures boissons chocolatées de notre enfance",
      "Excellente concentration naturelle en BCAA pour déclencher l'anabolisme"
    ]
  },

  // 47: NAC + Vitamine C-d 60 TABS
  'prod-19174': {
    nameFr: "Pronutrition Complexe NAC + Vitamine C & D 60 Comprimés – Bouclier Immunitaire & Détoxification",
    keyActives: "N-Acétyl-Cystéine (600 mg), Vitamine C (500 mg) et Vitamine D3 (2000 UI) par comprimé",
    benefitFr: "Trithérapie antioxydante et immunitaire de pointe pour protéger les cellules contre les infections et le surmenage physique.",
    targetAudience: "Sportifs exposés aux intempéries, personnes en convalescence ou préparant l'hiver contre les refroidissements.",
    posologyFr: "Prendre 1 comprimé par jour le matin au petit-déjeuner avec un verre d'eau.",
    features: [
      "Synergie tri-active agissant simultanément sur le foie, les globules blancs et les poumons",
      "La NAC fluidifie les voies respiratoires tandis que la vitamine C et D arment le système immunitaire",
      "Aide l'organisme à neutraliser les radicaux libres générés par le sport de haute intensité",
      "Comprimés pelliculés faciles à ingérer sans odeur soufrée prononcée"
    ]
  },

  // 48: Carnitine Shot Lemon 20 Fiolles
  'prod-19143': {
    nameFr: "Bigman L-Carnitine 3000mg Shot Citron 20 Fiolles – Déstockage Lipidique & Énergie Immédiate",
    keyActives: "3000 mg de L-Carnitine base liquide ultra-pure par fiole individuelle nomade, arôme citron",
    benefitFr: "Transporte les acides gras vers les mitochondries pour les consumer sous forme d'énergie pendant vos séances cardio.",
    targetAudience: "Sportifs effectuant des entraînements de cardio-training, circuit training ou HIIT dans le but de fondre rapidement.",
    posologyFr: "Boire 1 fiole directement 20 à 30 minutes avant votre séance d'entraînement cardio ou à jeun le matin.",
    features: [
      "Méga-dosage de 3 g de L-Carnitine sous forme liquide pour une absorption instantanée",
      "Augmente l'endurance aérobie en préservant les réserves intramusculaires de glycogène",
      "Format fiole incassable prêt à l'emploi qui se glisse dans n'importe quelle poche de sport",
      "Goût citron acidulé très désaltérant sans aucune trace de sucre ni de calorie"
    ]
  },

  // 49: Testo Anabol 90 Comprimés
  'prod-18720': {
    nameFr: "Pronutrition Testo Anabol Complexe 90 Comprimés – Tribulus Zinc & Soutien de la Libido et Force",
    keyActives: "Extrait de Tribulus terrestris titré à 90% saponines, extrait de Maca péruvienne, zinc, vitamine B6 et magnésium",
    benefitFr: "Booster de testostérone naturelle stimulant la synthèse hormonale, la résistance à l'effort lourd et la vitalité générale.",
    targetAudience: "Hommes sportifs ressentant un ralentissement de leur progression ou des coups de fatigue chroniques à la salle.",
    posologyFr: "Prendre 3 comprimés par jour : 2 le matin avec le petit-déjeuner et 1 environ 30 minutes avant l'entraînement.",
    features: [
      "Concentration extrême en saponines stéroïdiennes végétales issues de tribulus rigoureusement sélectionné",
      "La racine de Maca agit comme adaptogène pour équilibrer la libido et le système endocrinien",
      "Le zinc et la vitamine B6 interviennent dans le maintien d'une synthèse protéique normale",
      "Entièrement naturel, formulé sans aucune pro-hormone ni dérivé synthétique illicite"
    ]
  },

  // 50: NOX Burn 90 CAPS
  'prod-18598': {
    nameFr: "Bigman NOX Burn Thermogénique 90 Gélules – Combustion des Graisses & Définition Sèche",
    keyActives: "Complexe thermogène réunissant caféine anhydre, extrait de thé vert, poivre de Cayenne, synéphrine et saule blanc",
    benefitFr: "Accélère l'oxydation des calories, intensifie la sudation à l'entraînement et réprime l'appétit au cours des diètes de sèche.",
    targetAudience: "Pratiquants de musculation en phase de découpe finale et personnes ayant du mal à éliminer les derniers capitons adipeux.",
    posologyFr: "Prendre 2 gélules le matin au réveil et 1 gélule 30 minutes avant l'effort physique l'après-midi.",
    features: [
      "Élève la thermogenèse corporelle pour brûler des calories supplémentaires même au repos",
      "Action coupe-faim efficace limitant les envies de grignotage émotionnel entre les repas",
      "Procure un coup de boost énergétique net pour surmonter les séances avec peu de calories",
      "Gélules végétales à dissolution rapide garantissant un effet perceptible dès la première prise"
    ]
  },

  // 51: Magnésium Bisglycinate 90 CAPS
  'prod-18593': {
    nameFr: "Marvelous Magnésium Bisglycinate 90 Gélules – Chélation Supérieure Décontraction & Sommeil",
    keyActives: "Magnésium lié à deux molécules de glycine (bisglycinate chélaté 100%), 100 mg de magnésium élément par gélule",
    benefitFr: "Détend le système neuromusculaire, stoppe les fasciculations de paupière et induit un sommeil profond et réparateur.",
    targetAudience: "Personnes fatiguées, stressées ou souffrant de crampes nocturnes, sportifs intensifs exigeant une récupération optimale.",
    posologyFr: "Prendre 2 à 3 gélules par jour avec un grand verre d'eau, de préférence au dîner ou 1 heure avant de dormir.",
    features: [
      "Biodisponibilité supérieure à 80% comparée à seulement 4% pour l'oxyde de magnésium bon marché",
      "Franchit la barrière intestinale via les voies d'absorption des peptides sans provoquer de diarrhées",
      "La glycine liée apporte un effet relaxant complémentaire sur le système nerveux central",
      "Capsules végétales hautement purifiées sans stéarate de magnésium controversé"
    ]
  },

  // 52: Ignite Burn 210g Orange Mangue
  'prod-18240': {
    nameFr: "NutriFitness Ignite Burn Thermogenic Pre-Workout 210g Orange Mangue – Énergie Focus & Brûleur",
    keyActives: "Bêta-alanine, L-Tyrosine, caféine anhydre naturelle, L-Carnitine tartrate, extrait de thé vert et piment de Cayenne",
    benefitFr: "Formule signature NutriFitness Genève combinant l'effet booster d'un pré-workout et l'action lipolytique d'un brûleur d'élite.",
    targetAudience: "Athlètes exigeants voulant transpirer, brûler un maximum de graisses et avoir un focus absolu lors de leurs séances.",
    posologyFr: "Mélanger 7 g (1 dosette) dans 250 ml d'eau bien fraîche 20 minutes avant le début de l'entraînement.",
    features: [
      "Délivre une concentration mentale laser sans nervosité excessive ni crash en fin de séance",
      "La bêta-alanine retarde l'accumulation d'acide lactique pour prolonger l'effort",
      "Saveur exotique orange-mangue explosive sans sucre ajouté élaborée pour NutriFitness Suisse",
      "Stock direct dédouané à Genève avec livraison garantie le lendemain matin par La Poste"
    ]
  },

  // 53: Alive Systeme Immunitaire 120 CAPS
  'prod-15582': {
    nameFr: "Marvelous Alive Complexe Immunitaire 120 Gélules – Multivitamines Antioxydants & Défenses Naturelles",
    keyActives: "24 vitamines et minéraux sous formes bioactives, extrait d'échinacée, sureau noir, quercétine et CoQ10",
    benefitFr: "Renforce les barrières de défense de l'organisme, comble les déficits micronutritionnels et protège du surmenage.",
    targetAudience: "Sportifs subissant des charges d'entraînement intenses et personnes actives exposées aux virus saisonniers.",
    posologyFr: "Prendre 2 gélules par jour le matin au cours du petit-déjeuner avec un grand verre d'eau.",
    features: [
      "Spectre complet couvrant 100% à 200% des apports journaliers recommandés en micronutriments clés",
      "Extraits botaniques standardisés renforçant l'activité des lymphocytes et des macrophages",
      "La quercétine et la vitamine C agissent en synergie contre les radicaux libres oxydatifs",
      "Gélules végétales faciles à avaler sans colorant dioxyde de titane"
    ]
  },

  // 54: Cornetto Croissant Keto 50g
  'prod-15512': {
    nameFr: "Pronutrition Croissant Cornetto Keto 50g – Viennoiserie Protéinée Ultra Faible en Glucides",
    keyActives: "Protéines de blé, protéines de soja isolées, beurre frais, fibres d'acacia, édulcoré aux polyols naturels",
    benefitFr: "Retrouvez le plaisir d'un authentique croissant feuilleté au petit-déjeuner avec seulement 1.5 g de glucides nets.",
    targetAudience: "Amateurs de viennoiseries suivant un régime keto, personnes diabétiques ou sportifs en période de sèche drastique.",
    posologyFr: "Déguster nature ou tiédi 20 secondes au four pour retrouver le croustillant du feuilletage d'un croissant tout juste sorti du fournil.",
    features: [
      "12 g de protéines pures par croissant pour débuter la journée en maintenant l'anabolisme",
      "Moins de 2 g de glucides : n'interrompt pas la cétose nutritionnelle",
      "Riche en fibres alimentaires prébiotiques garantissant une excellente sensation de satiété",
      "Emballage individuel hermétique garantissant une fraîcheur et un moelleux parfaits"
    ]
  },

  // 55: Beebad 250ml
  'prod-15357': {
    nameFr: "BeeBad Boisson Énergétique Naturelle au Miel 250ml – Caféine Naturelle Maca & Gelée Royale",
    keyActives: "100% miel d'abeille biologique (sans sucre raffiné), extrait de guarana, gelée royale, propolis et racine de maca",
    benefitFr: "Boisson énergisante premium italienne 100% naturelle offrant un coup de fouet propre sans taurine synthétique ni colorant.",
    targetAudience: "Sportifs soucieux de leur santé, professionnels en quête d'énergie saine et amateurs de boissons rafraîchissantes bio.",
    posologyFr: "Boire 1 canette bien fraîche avant l'effort, pendant une longue route en voiture ou lors d'une baisse de concentration.",
    features: [
      "Sucrée exclusivement avec le miel biologique le plus pur pour une énergie douce et durable",
      "Enrichie des trésors de la ruche (gelée royale et propolis) aux vertus tonifiantes légendaires",
      "Caféine d'origine végétale issue du guarana pour éviter les palpitations cardiaques",
      "Certifiée sans gluten, sans taurine et sans aucun ingrédient artificiel"
    ]
  },

  // 56: El Toro 100% Clear Beef Protéine 1.8kg
  'prod-15217': {
    nameFr: "Marvelous El Toro 100% Isolat de Protéine de Bœuf Hydrolysée 1.8kg – 0 Lactose 0 Graisse",
    keyActives: "100% peptides d'isolat de viande de bœuf hydrolysés par voie enzymatique, naturellement riche en créatine",
    benefitFr: "L'alternative numéro un pour tous ceux qui ne supportent pas les produits laitiers : anabolisme massif sans aucun ballonnement.",
    targetAudience: "Sportifs intolérants au lactose, athlètes en prise de muscle sec et culturistes souhaitant varier leurs sources protéiques.",
    posologyFr: "Mélanger 30 g de poudre dans 300 ml d'eau fraîche immédiatement après l'entraînement. Ne pas mélanger avec du lait.",
    features: [
      "Zéro gramme de lactose, zéro sucre, zéro matière grasse et zéro cholestérol",
      "Hydrolysat peptidique ultra-rapide absorbé plus promptement que n'importe quelle whey classique",
      "Naturellement concentré en créatine et acides aminés précurseurs de collagène",
      "Arômes fruités rafraîchissants masquant totalement le goût de viande d'origine"
    ]
  },

  // 57: Peptan Collagen Lemon 300g
  'prod-14597': {
    nameFr: "Bigman Peptan® Collagène Peptides Hydrolysés Citron 300g – Confort Articulaire & Élasticité Peau",
    keyActives: "10 g de peptides de collagène bovin hydrolysé Peptan® de type I et III, enrichi en vitamine C et acide hyaluronique",
    benefitFr: "Régénère le cartilage articulaire, consolide les tendons soumis aux charges lourdes et redonne souplesse à la peau.",
    targetAudience: "Haltérophiles, coureurs, athlètes de cross-training ayant des douleurs de genoux ou d'épaules et personnes de plus de 30 ans.",
    posologyFr: "Dissoudre 1 dosette (environ 11 g) dans un grand verre d'eau fraîche chaque matin au petit-déjeuner pendant 3 mois.",
    features: [
      "Label mondial de référence Peptan® validé par de multiples études cliniques humaines",
      "Peptides de bas poids moléculaire (2000 Daltons) garantissant une biodisponibilité digestive à 90%",
      "La vitamine C adjointe stimule directement les fibroblastes pour synthétiser du collagène neuf",
      "Saveur citron désaltérante sans arrière-goût de gélatine"
    ]
  },

  // 58: On WHEY Gold Protéine 768g
  'prod-14500': {
    nameFr: "Optimum Nutrition Gold Standard 100% Whey 768g – La Référence Mondiale des Protéines de Lactosérum",
    keyActives: "Matrice d'isolats de protéines de lactosérum (WPI) prédominante + concentré ultrafiltré, 24 g de protéine par portion",
    benefitFr: "La protéine de lactosérum la plus vendue au monde pour sa pureté indiscutable, sa digestibilité parfaite et son goût d'excellence.",
    targetAudience: "Tous les pratiquants de fitness, de la salle de sport amateur au compétiteur international exigeant.",
    posologyFr: "Mélanger 1 dosette bombée (environ 30.4 g) dans 200 à 250 ml d'eau ou de lait dans un shaker après votre séance.",
    features: [
      "5.5 g de BCAA naturels et plus de 4 g de glutamine et d'acide glutamique par dosette",
      "Protéine instantanéifiée se mélangeant parfaitement à la cuillère sans aucun grumeau",
      "Standard international de qualité testé pour les substances interdites par Informed-Choice",
      "Moins de 2 g de glucides et 1.5 g de lipides par portion pour une maîtrise calorique totale"
    ]
  },

  // 59: Ghost WHEY 918g
  'prod-14486': {
    nameFr: "Ghost 100% Whey Protein Cereal Milk 918g – Isolat & Concentré aux Saveurs Légendaires",
    keyActives: "Isolat de lactosérum à 90% (WPI), concentré de lactosérum à 80% (WPC) et isolat hydrolysé, enrichi en enzymes digestives",
    benefitFr: "Une formule 100% transparente dévoilant le grammage exact de chaque fraction de protéine, alliée aux meilleures saveurs du marché.",
    targetAudience: "Sportifs à la recherche d'une expérience gustative hors du commun sans sacrifier la qualité technique de leur diète.",
    posologyFr: "Mélanger 1 dosette dans 250 à 300 ml d'eau ou de lait végétal après l'entraînement ou pour agrémenter vos céréales du matin.",
    features: [
      "Label 100% transparent : aucun ingrédient masqué sous un mélange propriétaire secret",
      "Enzymes digestives brevetées facilitant la digestion et empêchant les gaz",
      "Goût authentique inimitable rappelant le lait sucré au fond d'un bol de céréales",
      "Exempte de soja et certifiée sans gluten"
    ]
  },

  // 60: Beurre De Cacahuete 1kg
  'prod-14371': {
    nameFr: "Body Attack Peanut Butter 100% Pur 1kg – Beurre de Cacahuète Naturel Riche en Protéines Végétales",
    keyActives: "100% cacahuètes entières torréfiées issues de cultures sélectionnées, broyées jusqu'à consistance idéale",
    benefitFr: "Le pot grand format 1kg économique par excellence pour combler vos besoins caloriques quotidiens avec des acides gras sains.",
    targetAudience: "Sportifs en prise de masse, coureurs de fond, végétariens et amateurs de cuisine diététique saine.",
    posologyFr: "Consommer 1 à 2 cuillères à soupe (30 g) tartiné au petit-déjeuner, sur des tranches de banane ou mélangé dans vos flocons d'avoine.",
    features: [
      "30 g de protéines d'origine végétale pour 100 g de produit fini",
      "Zéro sel, zéro sucre ajouté, zéro huile végétale hydrogénée ou huile de palme",
      "Texture onctueuse facile à tartiner et à incorporer dans les sauces salées ou sucrées",
      "Pot hermétique 1 kg pour une conservation optimale et un rapport quantité/prix idéal"
    ]
  },

  // 61: ISO Bulk WHEY Biologique
  'prod-14341': {
    nameFr: "Marvelous ISO Bulk Whey Biologique 2kg – Protéine de Lactosérum Bio Microfiltrée Sans Arôme Artificiel",
    keyActives: "100% concentré de lactosérum biologique issu de vaches de pâturage nourries sans pesticides ni hormones",
    benefitFr: "Une pureté écologique absolue pour les sportifs qui refusent les édulcorants de synthèse et exigent une alimentation propre.",
    targetAudience: "Consommateurs bio, athlètes soucieux de l'environnement et personnes intolérantes aux additifs chimiques artificiels.",
    posologyFr: "Mélanger 30 g dans 250 ml d'eau pure ou de lait d'avoine biologique après votre entraînement.",
    features: [
      "Certifié conforme au cahier des charges de l'agriculture biologique européenne",
      "Lait de vaches vivant en plein air la majeure partie de l'année, riche en antioxydants naturels",
      "Zéro édulcorant chimique : saveur douce et authentique du lactosérum originel",
      "Conditionnement économique de 2 kg pour une utilisation quotidienne sereine"
    ]
  },

  // 62: Ultimate WHEY Bigman 2kg
  'prod-14309': {
    nameFr: "Bigman Ultimate Whey Protein 2kg – Concentré de Whey Crémeux Riche en Acides Aminés",
    keyActives: "Concentré de protéine de lactosérum microfiltré à flux croisé, enrichi en taurine, glycine et complexe d'acides aminés",
    benefitFr: "Le concentré de whey ultra-populaire garantissant un goût onctueux de milkshake et un soutien musculaire immédiat.",
    targetAudience: "Pratiquants réguliers de fitness et de musculation cherchant une excellente protéine quotidienne à prix doux.",
    posologyFr: "Mélanger 30 g de poudre dans 300 ml d'eau ou de lait écrémé au réveil ou après votre séance de musculation.",
    features: [
      "75% de protéines d'assimilation rapide pour stopper le catabolisme après l'exercice",
      "Très haute solubilité au shaker avec une texture veloutée très gourmande",
      "Enrichi en acides aminés pour maximiser la rétention azotée musculaire",
      "Vaste choix de saveurs gourmandes élaborées par des aromaticiens spécialisés"
    ]
  },

  // 63: Bm EAA 300g
  'prod-14215': {
    nameFr: "Bigman Essential Amino Acids EAA 300g – Spectre Complet des 9 Acides Aminés Essentiels",
    keyActives: "Matrice complète des 9 acides aminés essentiels purs (L-Leucine, L-Isoleucine, L-Valine, L-Lysine, L-Thréonine, etc.)",
    benefitFr: "Fournit les acides aminés indispensables à la reconstruction musculaire sans passer par la digestion lente d'une protéine entière.",
    targetAudience: "Sportifs s'entraînant l'estomac vide, compétiteurs en sèche cherchant à préserver leur masse musculaire.",
    posologyFr: "Mélanger 1 dosette (10 g) dans 400 ml d'eau bien fraîche à siroter tout au long de la séance d'entraînement.",
    features: [
      "Permet de stimuler la synthèse protéique musculaire même en période de restriction calorique sévère",
      "Absorption digestive ultra-rapide sans aucune fatigue pour les organes digestifs",
      "Zéro glucide, zéro calorie superflue, idéal pour s'hydrater intelligemment à la salle",
      "Poudre micronisée instantanée sans amertume résiduelle"
    ]
  },

  // 64: Furiux Gainer 3kg
  'prod-13985': {
    nameFr: "Bigman Furiux Mass Gainer 3kg – Ratio Protéines Glucides Idéal pour Prise de Poids Rapide",
    keyActives: "Hydrates de carbone complexes à libération étagée, concentré de lactosérum, monohydrate de créatine, taurine et vitamines",
    benefitFr: "Débloque la croissance pondérale des athlètes très fins grâce à un afflux continu de calories et de nutriments anabolisants.",
    targetAudience: "Personnes maigres ayant un métabolisme très rapide (ectomorphes) qui n'arrivent pas à grossir avec des repas normaux.",
    posologyFr: "Prendre 100 g de poudre mélangés à 400 ml d'eau ou de lait deux fois par jour (en milieu d'après-midi et après la séance).",
    features: [
      "Complexe glucidique évitant les crashs d'énergie tout en chargeant les muscles en glycogène",
      "Enrichi en créatine pour décupler rapidement les performances sous les barres lourdes",
      "Apport de taurine et vitamines pour soutenir le système nerveux lors des entraînements volumineux",
      "Format généreux de 3 kg offrant une autonomie durable pour vos cycles de prise de masse"
    ]
  },

  // 65: 20 Sachets Enerdyn Orange
  'prod-13972': {
    nameFr: "Pronutrition Enerdyn Isotonique 20 Sachets Orange – Réhydratation Rapide & Recharge Minérale",
    keyActives: "Mélange isotonique de maltodextrine, dextrose, sodium, potassium, chlorure, magnésium et vitamine C",
    benefitFr: "Maintient l'hydratation optimale et fournit un flux énergétique continu pendant les efforts de longue durée au soleil.",
    targetAudience: "Cyclistes, marathoniens, trailers dans les Alpes suisses et joueurs de football ou tennis.",
    posologyFr: "Diluer 1 sachet dans 500 ml d'eau dans votre bidon et boire une gorgée toutes les 10 à 15 minutes d'exercice continu.",
    features: [
      "Osmolarité isotonique rigoureusement calibrée pour une absorption hydrique plus rapide que l'eau pure",
      "Compense immédiatement les électrolytes perdus dans la sueur pour prévenir les crampes musculaires",
      "La vitamine C protège les cellules contre le stress oxydatif causé par l'endurance extrême",
      "Sachets étanches prédosés ultra-faciles à emporter dans les poches de maillot de vélo"
    ]
  },

  // 66: CREAPURE Bigman 300g
  'prod-13873': {
    nameFr: "Bigman Creapure® Monohydrate 300g – Label Allemand de Référence Pureté 99.9%",
    keyActives: "100% créatine monohydrate certifiée Creapure® produite en Allemagne par Alzchem Trostberg GmbH",
    benefitFr: "La créatine monohydrate la plus pure, sûre et efficace de la planète pour décupler la force et l'explosivité athlétique.",
    targetAudience: "Athlètes professionnels, compétiteurs exigeant une traçabilité sans faille et pratiquants réguliers de musculation.",
    posologyFr: "Prendre 3 g (environ 1 dosette rase) par jour dissous dans votre boisson post-entraînement ou dans un verre d'eau tempérée.",
    features: [
      "Fabriquée selon des standards pharmaceutiques drastiques garantissant l'absence de DCD et DHT toxiques",
      "Des centaines d'études cliniques attestant son efficacité sur le gain de force et la masse maigre",
      "Poudre ultra-pure de couleur blanche immaculée sans aucune odeur ni goût",
      "Conditionnement scellé avec opercule d'inviolabilité garantissant l'authenticité du lot"
    ]
  },

  // 67: Glutamine Bigman Kyowa 300g
  'prod-13868': {
    nameFr: "Bigman L-Glutamine Kyowa Quality® 300g – Fermentation Végétale Pureté Maximale",
    keyActives: "100% L-Glutamine d'origine végétale Kyowa Quality® de renommée internationale",
    benefitFr: "Restaure les défenses immunitaires et préserve l'intégrité de la barrière intestinale mise à rude épreuve par le sport.",
    targetAudience: "Sportifs d'endurance, pratiquants de musculation en période de sèche et personnes souffrant de troubles de perméabilité intestinale.",
    posologyFr: "Prendre 5 g dilués dans un liquide frais juste après l'entraînement et 5 g au coucher les jours de repos.",
    features: [
      "Processus de bio-fermentation exclusif à partir de matières végétales sélectionnées",
      "Limite le surentraînement et accélère la reconstitution des stocks de glycogène musculaire",
      "Acide aminé carburant préférentiel des cellules de la muqueuse intestinale et des entérocytes",
      "Miscibilité totale instantanée sans aucun résidu granuleux"
    ]
  },

  // 68: Calcium 120 TABS
  'prod-13708': {
    nameFr: "Pronutrition Calcium + Vitamine D3 120 Comprimés – Densité Minérale Osseuse & Fonction Musculaire",
    keyActives: "Calcium hautement biodisponible renforcé par de la vitamine D3 pour une fixation optimale sur la matrice osseuse",
    benefitFr: "Maintient une ossature robuste, prévient les fractures de fatigue et intervient directement dans la contraction des fibres musculaires.",
    targetAudience: "Coureurs d'endurance, femmes actives, seniors sportifs et personnes consommant peu ou pas de produits laitiers.",
    posologyFr: "Prendre 2 comprimés par jour au cours d'un repas principal avec un grand verre d'eau.",
    features: [
      "Le calcium est indispensable à la transmission nerveuse et à la coagulation sanguine normale",
      "La vitamine D3 favorise l'absorption intestinale du calcium et son intégration dans le squelette",
      "Prévient la déminéralisation osseuse liée à la pratique de sports à fort impact articulaire",
      "Comprimés sans lactose, sans gluten et conformes aux exigences fédérales suisses"
    ]
  },

  // 69: Magnésium Bisglycinate 180g Lemon
  'prod-13035': {
    nameFr: "Pronutrition Magnésium Bisglycinate Chélaté en Poudre 180g Citron – Solubilité Parfaite & Anti-Crampes",
    keyActives: "Poudre soluble de magnésium bisglycinate pur chélaté aromatisé au citron naturel avec une touche de stévia",
    benefitFr: "La forme de magnésium la plus assimilable déclinée en boisson rafraîchissante pour détendre les muscles le soir.",
    targetAudience: "Personnes n'aimant pas avaler des comprimés, sportifs sujets aux tensions musculaires et crampes dans les mollets.",
    posologyFr: "Dissoudre 3 g de poudre (1 dosette) dans 200 ml d'eau fraîche le soir après le dîner.",
    features: [
      "Dissolution instantanée et goût citron très agréable sans amertume métallique",
      "Forme bisglycinate hautement tolérée par le tube digestif même chez les intestins sensibles",
      "Contribue à réduire la sensation de fatigue et soutient l'équilibre électrolytique",
      "Zéro sucre ajouté, convient parfaitement aux sportifs en diète stricte"
    ]
  },

  // 70: Hydra – Electrolytes 210g
  'prod-13016': {
    nameFr: "Per4m Hydra Advanced Electrolytes 210g – Hydratation Cellulaire & Équilibre Minéral Intra-Entraînement",
    keyActives: "Poudre d'eau de coco Cocomineral®, potassium, sodium rose de l'Himalaya, magnésium chélaté et taurine",
    benefitFr: "Maximise la volémie intracellulaire, prévient les baisses de tension à la salle et garantit une congestion phénoménale.",
    targetAudience: "Athlètes transpirant abondamment, pratiquants de fitness en salle climatisée et sportifs d'endurance estivale.",
    posologyFr: "Mélanger 1 dosette (7 g) dans 500 à 750 ml d'eau bien fraîche à consommer tout au long de la séance d'entraînement.",
    features: [
      "Extrait d'eau de coco Cocomineral® fournissant des électrolytes naturels hautement bio-disponibles",
      "Le sel rose d'Himalaya apporte des oligo-éléments rares indispensables au système neuromusculaire",
      "Maintient l'hydratation des fascias musculaires pour prévenir déchirures et élongations",
      "Saveurs désaltérantes ultra-fruitées sans aucune calorie superflue"
    ]
  },

  // 71: ZMA 90 CAPS
  'prod-12992': {
    nameFr: "Marvelous ZMA Advanced Formule Nuit 90 Gélules – Zinc Magnésium B6 Récupération Nocturne Profonde",
    keyActives: "Zinc L-monométhionine, magnésium aspartate et vitamine B6 pyridoxine aux ratios anaboliques scientifiquement validés",
    benefitFr: "Amplifie la phase de sommeil profond à ondes lentes, soutient la production naturelle d'hormones anabolisantes et détend le système nerveux.",
    targetAudience: "Pratiquants de musculation cherchant à maximiser leur récupération nocturne et sportifs soumis à un stress physique intense.",
    posologyFr: "Prendre 3 gélules (pour les hommes) ou 2 gélules (pour les femmes) environ 30 à 60 minutes avant le coucher, de préférence l'estomac vide.",
    features: [
      "Formulation originale respectant l'affinité synergique du zinc, du magnésium et de la B6",
      "Favorise un réveil frais et dispos sans la sensation de tête lourde des somnifères chimiques",
      "Le zinc intervient dans la synthèse normale des protéines et le maintien d'une bonne testostéronémie",
      "Gélules végétales pures sans excipient de synthèse inutile"
    ]
  },

  // 72: Farine De Patate Douce
  'prod-12913': {
    nameFr: "Ingredients Farine de Patate Douce 1kg – Glucides Sains à Index Glycémique Modéré Sans Gluten",
    keyActives: "100% patates douces entières fraîches sélectionnées, séchées à basse température et micronisées en farine fine",
    benefitFr: "La source de glucides idéale pour les repas sportifs : riche en potassium, en antioxydants et très douce pour le système digestif.",
    targetAudience: "Pratiquants de musculation, sportifs intolérants au gluten ou aux céréales et adeptes de l'alimentation paléo/naturelle.",
    posologyFr: "Utiliser pour réaliser des pancakes, gâteaux sportifs, crêpes diététiques ou mélanger à un shaker de protéines.",
    features: [
      "Index glycémique modéré fournissant un flux constant de glucose sans provoquer de pic d'insuline",
      "Riche en bêta-carotène (provitamine A) et en minéraux essentiels protecteurs",
      "Sans aucun gluten, sans conservateur ni agent de blanchiment artificiel",
      "Texture fine qui se délaye aisément dans les shakers ou préparations culinaires"
    ]
  },

  // 73: Glutathion Liposomale 30 CAPS
  'prod-12902': {
    nameFr: "Pronutrition Glutathion Liposomal 30 Gélules – Maître Antioxydant Détox Cellulaire & Teint Radieux",
    keyActives: "250 mg de L-Glutathion réduit (GSH) encapsulé dans des liposomes de phospholipides de tournesol",
    benefitFr: "Le plus puissant antioxydant du corps humain enfin assimilable par voie orale grâce à la technologie d'encapsulation liposomale.",
    targetAudience: "Sportifs soumis à une oxydation cellulaire intense, personnes cherchant une détox hépatique profonde et éclat cutané.",
    posologyFr: "Prendre 1 gélule par jour le matin à jeun avec un verre d'eau pure au moins 15 minutes avant le petit-déjeuner.",
    features: [
      "La barrière liposomale empêche la dégradation du glutathion par les enzymes gastriques acides",
      "Délivre le glutathion directement au cœur des cellules pour régénérer les mitochondries",
      "Purifie le foie des métabolites toxiques et soutient le système immunitaire",
      "Apporte un éclat visible à la peau en régulant la production de mélanine"
    ]
  },

  // 74: Crème À Tartiner 350g
  'prod-12882': {
    nameFr: "Pronutrition Crème Protéinée à Tartiner 350g – 28% de Protéines Zéro Sucre Ajouté Sans Huile de Palme",
    keyActives: "Pâte de noisettes sélectionnées, concentré de protéines de lactosérum, cacao maigre, édulcoré au maltitol",
    benefitFr: "Une pâte à tartiner chocolat-noisette d'un fondant divin apportant 28% de protéines de whey sans aucun sucre raffiné ajouté.",
    targetAudience: "Tous les passionnés de fitness et sportifs gourmands voulant se faire plaisir au petit-déjeuner sans briser leur diète.",
    posologyFr: "Tartiner sur vos crêpes protéinées, galettes d'avoine, tranches de pain complet ou déguster directement à la cuillère.",
    features: [
      "28 g de protéines pures pour 100 g de pâte à tartiner pour soutenir l'anabolisme",
      "Sans huile de palme, sans conservateur, élaborée avec des graisses végétales nobles",
      "Teneur en sucres quasi nulle (moins de 2 g pour 100 g) évitant les fringales sucrées",
      "Texture crémeuse parfaite même conservée à température ambiante"
    ]
  },

  // 75: Farine De Riz 1.5kg
  'prod-12867': {
    nameFr: "Bigman Farine de Riz Précuite 1.5kg – Digestion Ultra-Rapide et Glucides Purs pour Sportifs",
    keyActives: "100% farine de riz blanc finement moulue et précuite pour une assimilation digestive optimale, sans gluten",
    benefitFr: "Rechargez vos réserves musculaires en glycogène en un temps record sans aucun ballonnement ni gonflement abdominal.",
    targetAudience: "Bodybuilders en préparation de compétition, sportifs en prise de masse et personnes ayant des intestins irritables.",
    posologyFr: "Mélanger 50 à 80 g de farine de riz dans votre shaker de whey avec de l'eau tiède ou du lait végétal en pré ou post-workout.",
    features: [
      "Précuite à la vapeur pour casser les chaînes d'amidon et garantir une digestibilité hors pair",
      "Exempte de gluten et hypoallergénique, idéale pour les personnes intolérantes",
      "Apporte une énergie immédiate disponible pour les muscles en pleine contraction",
      "Format économique de 1.5 kg idéal pour les utilisateurs quotidiens"
    ]
  },

  // 76: L-acetil Carnitine 60 CAPS
  'prod-12855': {
    nameFr: "Pronutrition L-Acétyl Carnitine ALCAR 60 Gélules – Franchissement de la Barrière Cérébrale & Brûleur",
    keyActives: "500 mg d'Acétyl-L-Carnitine pure (ALCAR) hautement biodisponible par gélule végétale",
    benefitFr: "Forme estérifiée de carnitine capable de franchir la barrière hémato-encéphalique pour stimuler la concentration et brûler les graisses.",
    targetAudience: "Sportifs en période de sèche stricte, athlètes ayant besoin d'une concentration mentale aiguë et adeptes de longévité cérébrale.",
    posologyFr: "Prendre 1 à 2 gélules par jour le matin au petit-déjeuner et éventuellement 1 gélule 30 minutes avant l'effort mental ou physique.",
    features: [
      "Favorise la production d'acétylcholine, neurotransmetteur essentiel de la mémoire et de la coordination motrice",
      "Achemine les acides gras dans les mitochondries des neurones et des cellules musculaires pour produire de l'énergie",
      "Procure une sensation de clarté mentale sans les effets secondaires des excitants classiques",
      "Gélules végétales scellées sans agent conservateur chimique"
    ]
  },

  // 77: ISO WHEY Zero 907g
  'prod-12650': {
    nameFr: "Bigman ISO Whey Zero 907g – Isolat de Whey Microfiltrée Sans Sucre Sans Graisse",
    keyActives: "Isolat de protéines de lactosérum microfiltré par flux croisé (CFM), 88% de protéines pures, 0 g de sucre",
    benefitFr: "Protéine d'une pureté chirurgicale assurant une absorption instantanée pour nourrir le muscle sec sans un gramme de gras.",
    targetAudience: "Compétiteurs de bodybuilding en phase de sèche extrême, athlètes au régime strict et personnes intolérantes au lactose.",
    posologyFr: "Mélanger 30 g de poudre dans 250 ml d'eau fraîche immédiatement après la séance d'entraînement.",
    features: [
      "Quasi zéro gramme de graisses, sucres et glucides résiduels par shaker",
      "Riche en fractions peptidiques anaboliques et en acides aminés à chaîne ramifiée (BCAA)",
      "Digestibilité totale en moins de 30 minutes sans aucune sensation de lourdeur",
      "Arômes raffinés et dissolution instantanée à la cuillère"
    ]
  },

  // 78: Omega 3 – 120 Softgels
  'prod-11806': {
    nameFr: "Marvelous Omega 3 Haute Concentration EPA/DHA 120 Capsules – Santé Cardiovasculaire & Anti-Inflammatoire",
    keyActives: "Huile de poissons sauvages de haute mer purifiée par distillation moléculaire, titrée à 350 mg d'EPA et 250 mg de DHA par capsule",
    benefitFr: "Apaise les inflammations articulaires chroniques, protège la fonction cardiaque et optimise la sensibilité des récepteurs à l'insuline.",
    targetAudience: "Tous les sportifs intensifs, personnes soucieuses de leur équilibre cardiovasculaire et intellectuel.",
    posologyFr: "Prendre 2 à 3 capsules molles (softgels) par jour au cours des repas avec un verre d'eau.",
    features: [
      "Distillation moléculaire avancée garantissant une huile exempte de métaux lourds, PCB et toxines marines",
      "Ratio concentré EPA/DHA optimal pour combattre l'inflammation musculaire et articulaire induite par le sport",
      "Capsules molles hermétiques sans arrière-goût ni reflux désagréable de poisson",
      "Flacon de 120 softgels pour 2 mois complets de cure protectrice"
    ]
  },

  // 79: Glicerol 300g
  'prod-11389': {
    nameFr: "Marvelous Glycérol HydroMax® 300g – Volumisation Musculaire Hyper-Hydratation & Congestion Énorme",
    keyActives: "Poudre de glycérol standardisée à 65% sous label breveté HydroMax® à haute stabilité",
    benefitFr: "Attire et retient l'eau à l'intérieur des cellules musculaires pour provoquer des congestions démesurées et repousser la déshydratation.",
    targetAudience: "Pratiquants de musculation cherchant une plénitude musculaire maximale et sportifs d'endurance s'entraînant sous forte chaleur.",
    posologyFr: "Mélanger 5 à 10 g dans 500 à 750 ml d'eau 45 minutes avant votre séance d'entraînement. Bien s'hydrater pendant la séance.",
    features: [
      "Concentration en glycérol pur jusqu'à 10 fois supérieure au monostéarate de glycérol ordinaire",
      "Crée un état d'hyper-hydratation intracellulaire pour un volume musculaire et une endurance décuplés",
      "Non stimulant pour le cœur : peut se combiner avec n'importe quel pré-workout ou se prendre le soir",
      "Poudre fine se dissolvant aisément dans une grande quantité d'eau"
    ]
  },

  // 80: Vitamine C 1000mg 90 CAPS
  'prod-11379': {
    nameFr: "Marvelous Vitamine C Pure 1000mg 90 Gélules – Défenses Immunitaires & Réduction de la Fatigue Oxydative",
    keyActives: "1000 mg d'acide L-ascorbique pur renforcé par des bioflavonoïdes d'agrumes et de l'extrait de cynorrhodon",
    benefitFr: "Stimule le système immunitaire, accélère la cicatrisation tissulaire et participe à la synthèse endogène de collagène.",
    targetAudience: "Sportifs s'entraînant lourdement, personnes stressées, fumeurs et personnes voulant se prémunir des coups de froid.",
    posologyFr: "Prendre 1 gélule par jour le matin au petit-déjeuner avec un verre d'eau.",
    features: [
      "Haut dosage de 1000 mg pour couvrir largement les besoins accrus des sportifs assidus",
      "Les bioflavonoïdes d'agrumes protègent la molécule et optimisent son assimilation intestinale",
      "Puissant piégeur de radicaux libres générés lors des exercices musculaires exhaustifs",
      "Gélules végétales garanties sans allergène, sans colorant ni liant chimique"
    ]
  },

  // 81: Poudre De Collagene Mix Goût Mangue 300g
  'prod-11328': {
    nameFr: "Marvelous Collagène Peptides Hydrolysés Mangue 300g – Beauté de la Peau & Renfort Articulaire",
    keyActives: "Peptides de collagène pur hydrolysé de type 1 et 3 (10 g par dose), acide hyaluronique, vitamine C et arôme mangue naturel",
    benefitFr: "Nourrit les tendons en profondeur, préserve la jeunesse des cartilages et améliore l'élasticité et l'hydratation de la peau.",
    targetAudience: "Sportifs souffrant de tendinopathies chroniques, personnes actives de plus de 30 ans et passionnés de bien-être physique.",
    posologyFr: "Mélanger 1 dosette (10 g) dans un grand verre d'eau fraîche chaque matin au réveil pendant une cure de 3 mois.",
    features: [
      "Peptides de très petite taille moléculaire hautement digestibles et absorbés en quelques minutes",
      "L'acide hyaluronique retient l'eau dans le liquide synovial des articulations pour une lubrification parfaite",
      "Goût fruité mangue exotique absolument délicieux qui se boit comme un jus frais",
      "Sans sucre ajouté, édulcoré avec modération sans arrière-goût désagréable"
    ]
  },

  // 82: Hype Amino 270g
  'prod-11296': {
    nameFr: "Marvelous Hype Amino EAA + Électrolytes 270g – Prévention du Catabolisme & Endurance Musculaire",
    keyActives: "Matrice d'acides aminés essentiels fermentés purs (EAA) combinée à un complexe d'électrolytes hydratants",
    benefitFr: "Boisson intra-entraînement rafraîchissante qui protège le tissu musculaire contre le catabolisme et maintient l'endurance.",
    targetAudience: "Athlètes de fitness, crossfit et sports collectifs effectuant des séances d'entraînement longues et intenses.",
    posologyFr: "Mélanger 9 g (1 dosette) dans 500 ml d'eau bien fraîche et boire par petites gorgées tout au long de la séance.",
    features: [
      "Stoppe la dégradation des fibres musculaires en fournissant les 9 acides aminés indispensables",
      "Les électrolytes préviennent les baisses d'énergie dues à la sudation et favorisent la contraction",
      "Zéro sucre, zéro calorie, parfait pour s'entraîner dur sans impacter ses macros de sèche",
      "Saveurs désaltérantes fruitées qui donnent envie de boire davantage à la salle"
    ]
  },

  // 83: Big Lean Mass Gainer
  'prod-11269': {
    nameFr: "Marvelous Big Lean Mass Gainer 3kg – Prise de Muscle Sec Riche en Isolat & Flocons d'Avoine",
    keyActives: "Ratio équilibré 50/50 protéines nobles (isolat de lactosérum WPI) et glucides complexes à IG bas (avoine micronisée)",
    benefitFr: "Le gainer de précision pour prendre de la masse musculaire pure et dense sans emmagasiner de graisse autour de la taille.",
    targetAudience: "Sportifs intermédiaires et confirmés voulant progresser sur la balance sans dégrader leur définition musculaire.",
    posologyFr: "Mélanger 80 g de poudre dans 350 ml d'eau ou de lait d'amande deux fois par jour en collation entre les repas principaux.",
    features: [
      "Aucun sucre rapide de remplissage : uniquement des glucides complexes à diffusion progressive",
      "Source exclusive de protéines haut de gamme pour favoriser l'anabolisme sans rétention d'eau",
      "Enrichi en BCAA et glutamine pour soutenir le volume d'entraînement intensif",
      "Texture agréable qui rassasie sans peser lourd sur l'estomac"
    ]
  },

  // 84: Protéine Vegan Riz Brun Bio 500g
  'prod-11236': {
    nameFr: "Bioyos Protéine Végétale de Riz Brun Biologique 500g – 82% de Protéines Hypoallergéniques",
    keyActives: "100% isolat de protéines de riz brun germé biologique extrait par procédé enzymatique doux sans solvant chimique",
    benefitFr: "La protéine végétale la plus digeste et hypoallergénique du marché, idéale pour les estomacs hypersensibles.",
    targetAudience: "Végétaliens, sportifs souffrant d'allergies multiples (lactose, gluten, soja, œufs) et amateurs de produits 100% bio.",
    posologyFr: "Mélanger 30 g de poudre dans 250 à 300 ml d'eau ou de lait d'amande biologique après l'effort ou au petit-déjeuner.",
    features: [
      "82% de teneur protéique pure avec une concentration remarquable en acides aminés essentiels",
      "Procédé de germination à froid préservant les vitamines, minéraux et enzymes naturelles",
      "Zéro arôme artificiel, sans additif chimique, goût végétal doux et authentique",
      "Certifié biologique et garanti sans aucune trace d'allergène majeur"
    ]
  },

  // 85: Nf Gourde 600ml
  'prod-10083': {
    nameFr: "NutriFitness Gourde Sport Ergonomique 600ml avec Paille – Sans BPA Hermétique & Design Genève",
    keyActives: "Plastique Tritan de qualité alimentaire ultra-résistant sans BPA, mécanisme de clapet étanche d'une main et paille silicone",
    benefitFr: "Votre compagnon d'hydratation quotidien stylé et robuste pour boire sans renverser d'eau pendant vos entraînements.",
    targetAudience: "Tous les sportifs, adeptes de fitness en salle, coureurs et personnes actives soucieuses de s'hydrater régulièrement.",
    posologyFr: "Remplir d'eau fraîche ou de votre boisson isotonique préférée, refermer le clapet hermétique et emporter partout.",
    features: [
      "Conçue en Tritan écologique certifié sans bisphénol A (BPA) ni phtalates toxiques",
      "Ouverture instantanée 'One-Click' utilisable à une main même en plein effort cardio",
      "Paille en silicone souple permettant de boire sans avoir à renverser la tête en arrière",
      "Estampillée du logo officiel NutriFitness Genève avec jauge de niveau graduée"
    ]
  },

  // 86: Zinc Bisglicinate 90 Cap
  'prod-10022': {
    nameFr: "Applied Nutrition Zinc Bisglycinate Chélaté 90 Gélules – Soutien Testostérone & Synthèse Protéique",
    keyActives: "15 mg de zinc sous forme chélatée bisglycinate de haute pureté renforcé par de la vitamine C",
    benefitFr: "Assure un apport optimal en zinc pour soutenir la production hormonale, l'immunité et la qualité des phanères (cheveux, ongles).",
    targetAudience: "Sportifs assidus, hommes surveillant leur taux de testostérone et personnes en convalescence immunitaire.",
    posologyFr: "Prendre 1 gélule par jour avec un verre d'eau au cours du dîner.",
    features: [
      "Chélation organique prévenant les compétitions d'absorption avec les autres minéraux dans l'intestin",
      "Le zinc contribue à un métabolisme glucidique et lipidique normal",
      "La vitamine C adjointe renforce le bouclier antioxydant et l'efficacité des défenses",
      "Flacon de 90 gélules pour une cure complète de 3 mois de supplémentation continue"
    ]
  },

  // 87: Nf Shaker 600ml
  'prod-9616': {
    nameFr: "NutriFitness Shaker Anti-Grumeaux 600ml avec Compartiments – 100% Étanche Sans BPA",
    keyActives: "Polypropylène de haute densité sans BPA, grille brise-grumeaux incurvée, deux compartiments vissables pour poudres et gélules",
    benefitFr: "Le shaker tout-en-un indispensable pour emporter votre whey, votre créatine et vos vitamines dans un seul contenant hermétique.",
    targetAudience: "Tous les pratiquants de musculation et sportifs consommant des poudres nutritionnelles en déplacement.",
    posologyFr: "Verser d'abord le liquide, ajouter la poudre, visser fermement le bouchon et secouer énergiquement 10 secondes.",
    features: [
      "Fermeture à clapet sécurisée 'zéro fuite' testée sous haute pression pour ne jamais tacher votre sac",
      "Compartiments amovibles vissés sous la base pour stocker vos doses de compléments de la journée",
      "Grille conique brevetée pulvérisant instantanément les poudres les plus denses sans grumeau",
      "Nettoyage facile au lave-vaisselle, garanti sans odeur plastique résiduelle"
    ]
  },

  // 88: Creatine En Poudre 300g
  'prod-9526': {
    nameFr: "Marvelous Créatine Monohydrate Ultra Micronisée 200 Mesh 300g – Puissance ATP & Force Musculaire",
    keyActives: "100% créatine monohydrate micronisée à un maillage record de 200 Mesh pour une dissolution aqueuse totale",
    benefitFr: "Augmente la force explosive, permet d'arracher des répétitions supplémentaires et accélère la prise de volume musculaire sec.",
    targetAudience: "Powerlifters, bodybuilders, sprinteurs et sportifs de contact recherchant une efficacité maximale dès la première semaine.",
    posologyFr: "Prendre 3.4 g (1 dosette rase) par jour mélangés dans 200 ml d'eau ou de boisson glucidique, idéalement après l'entraînement.",
    features: [
      "Granulométrie extra-fine 200 Mesh qui ne tombe pas au fond du shaker et ne crisse pas sous la dent",
      "Optimise la resynthèse de l'adénosine triphosphate (ATP) lors des contractions musculaires maximales",
      "Favorise l'hydratation intracellulaire pour un aspect musculaire plein et rebondi",
      "Format généreux de 300 g assurant près de 100 jours d'utilisation continue"
    ]
  },

  // 89: Savior Recuperation 950g
  'prod-9378': {
    nameFr: "Marvelous Savior Post-Workout All-In-One 950g – Matrice Récupération Complète Whey Glucides BCAA",
    keyActives: "Isolat et concentré de lactosérum (30g), Cluster Dextrin®, 5g de Créatine Creapure®, 5g de Glutamine Kyowa® et électrolytes",
    benefitFr: "La solution tout-en-un ultime post-entraînement réunissant tous les nutriments critiques pour stopper la fatigue et amorcer l'anabolisme.",
    targetAudience: "Sportifs exigeants ne voulant plus multiplier les pots de compléments après chaque séance d'entraînement intense.",
    posologyFr: "Mélanger 50 g de poudre dans 350 ml d'eau fraîche et boire dans les 20 minutes qui suivent la fin de la séance.",
    features: [
      "Réunit les labels les plus prestigieux au monde (Creapure®, Kyowa Quality®, Cluster Dextrin®)",
      "Recharge simultanément les acides aminés, les réserves de glycogène et les minéraux perdus",
      "Élimine les courbatures sévères du lendemain et permet d'augmenter la fréquence des séances",
      "Goût fruité désaltérant très agréable même après un effort cardio intense"
    ]
  },

  // 90: Blanc D’oeuf Liquide Pasteurisé 1l
  'prod-8942': {
    nameFr: "Eurovo Blanc d'Œuf Liquide 100% Pasteurisé 1L – Protéine Naturelle Pure Prête à Cuire",
    keyActives: "100% blancs d'œufs de poules élevées au sol pasteurisés, environ 32 blancs d'œufs frais par bouteille d'un litre",
    benefitFr: "Source de protéine entière pure sans gras, sans cholestérol et prête à l'emploi sans aucun gaspillage de jaune.",
    targetAudience: "Sportifs en sèche, adeptes de petits-déjeuners hyper-protéinés et cuisiniers fitness préparant des pancakes sains.",
    posologyFr: "Secouer la bouteille et verser la quantité désirée directement dans la poêle chaude (100 ml équivalent à 3 blancs d'œufs).",
    features: [
      "10 g de protéines complètes à haute digestibilité pour seulement 48 kcal par 100 ml",
      "Pasteurisation thermique garantissant une sécurité sanitaire absolue et une conservation longue durée",
      "Zéro matière grasse, zéro sucre, idéal pour des omelettes légères et rassasiantes",
      "Bouteille ergonomique avec bouchon verseur refermable hermétiquement"
    ]
  },

  // 91: Ashwagandha 60 CAPS
  'prod-8867': {
    nameFr: "Pronutrition Ashwagandha Extrait Standardisé 60 Gélules – Résistance au Cortisol & Vitalité Naturelle",
    keyActives: "500 mg d'extrait sec de racine d'Withania somnifera titré en withanolides actifs par gélule végétale",
    benefitFr: "Plante adaptogène ayurvédique par excellence qui régule les pics de stress nerveux, apaise l'esprit et améliore l'endurance.",
    targetAudience: "Personnes anxieuses, sportifs subissant des charges mentales élevées et personnes ayant des difficultés d'endormissement.",
    posologyFr: "Prendre 1 à 2 gélules par jour avec un verre d'eau, de préférence le soir au cours du repas.",
    features: [
      "Régule naturellement l'axe hypothalamo-hypophyso-surrénalien pour faire baisser le cortisol excessif",
      "Favorise une décontraction nerveuse propice à des nuits de sommeil plus calmes et réparatrices",
      "Soutient les capacités cognitives et la concentration sans induire de dépendance",
      "Gélules végétales standardisées garantissant un taux constant de molécules actives"
    ]
  },

  // 92: Caffeine 90 CAPS 100mg
  'prod-8857': {
    nameFr: "Bigman Caféine Pure 100mg 90 Gélules – Stimulation Modérée & Concentration Entraînement",
    keyActives: "100 mg de caféine anhydre pure par gélule végétale à libération rapide",
    benefitFr: "Un dosage modéré et polyvalent permettant d'adapter précisément son niveau d'énergie sans risque de tremblements ni de palpitations.",
    targetAudience: "Personnes sensibles aux excitants, sportifs en fin d'après-midi ou athlètes voulant micro-doser leur stimulation.",
    posologyFr: "Prendre 1 gélule 30 minutes avant l'entraînement ou lors d'un coup de pompe au travail. Peut se renouveler 4 heures plus tard.",
    features: [
      "Dosage précis de 100 mg correspondant à un espresso traditionnel pour un coup de fouet propre",
      "Améliore les réflexes, la vivacité d'esprit et l'endurance à l'effort sans effet d'accoutumance brutale",
      "Gélules végétales sans goût amer faciles à consommer n'importe où",
      "Format économique de 90 gélules pour plusieurs mois d'énergie sur mesure"
    ]
  },

  // 93: Picolinate De Chrome 100 CAPS
  'prod-7901': {
    nameFr: "Pronutrition Picolinate de Chrome 100 Gélules – Régulation Naturelle des Poussées d'Insuline & Envie de Sucre",
    keyActives: "200 mcg de chrome sous forme de picolinate organique chélaté hautement absorbable",
    benefitFr: "Oligo-élément indispensable qui stabilise la glycémie sanguine et neutralise les pulsions irrépressibles de sucre en diète.",
    targetAudience: "Personnes qui grignotent des sucreries en fin de journée, sportifs en phase de restriction calorique et personnes prédiabétiques.",
    posologyFr: "Prendre 1 gélule par jour le matin ou au déjeuner avec un grand verre d'eau.",
    features: [
      "Le sel de picolinate offre une assimilation intestinale très supérieure aux formes inorganiques",
      "Contribue au métabolisme normal des macronutriments (glucides, lipides et protéines)",
      "Aide à réguler les fringales nerveuses entre les repas pour réussir sa perte de graisse",
      "Flacon de 100 gélules assurant plus de 3 mois de traitement continu"
    ]
  },

  // 94: Vitamine C Liposomale 60 CAPS
  'prod-7890': {
    nameFr: "Pronutrition Vitamine C Liposomale 60 Gélules – Absorption Cellulaire Optimale & Bouclier Antioxydant",
    keyActives: "500 mg de vitamine C pure encapsulée dans des liposomes de phosphatidylcholine",
    benefitFr: "Délivre la vitamine C directement à l'intérieur des cellules avec une tolérance gastrique totale, même à dose élevée.",
    targetAudience: "Personnes aux intestins fragiles ne supportant pas l'acidité de la vitamine C classique et sportifs en surcharge.",
    posologyFr: "Prendre 1 à 2 gélules par jour le matin avec un verre d'eau tempérée.",
    features: [
      "Protection liposomale évitant toute acidité stomacale ou accélération du transit intestinal",
      "Reste présente dans la circulation sanguine deux fois plus longtemps que l'ascorbate conventionnel",
      "Action antioxydante profonde renforçant les défenses immunitaires et la vitalité générale",
      "Capsules scellées d'origine végétale conformes aux plus hauts critères suisses"
    ]
  },

  // 95: Gallon Nf 2.2l
  'prod-7870': {
    nameFr: "NutriFitness Gallon d'Hydratation Sport 2.2L – Bidon Sans BPA avec Poignée Ergonomique pour la Salle",
    keyActives: "Plastique PETG haute résistance garanti sans BPA ni substances nocives, bouchon inox solidaire avec lanière",
    benefitFr: "Contient exactement la quantité d'eau quotidienne recommandée (2.2 litres) pour ne plus jamais manquer d'hydratation à la salle.",
    targetAudience: "Culturistes, sportifs passant de longues heures à l'entraînement et adeptes de suivi précis de leur consommation d'eau.",
    posologyFr: "Remplir d'eau le matin, ajouter éventuellement des BCAA ou une rondelle de citron, et vider le bidon au cours de la journée.",
    features: [
      "Capacité géante de 2.2 litres éliminant les allers-retours incessants au robinet de la salle de sport",
      "Poignée ergonomique intégrée assurant une prise en main ferme et confortable",
      "Bouchon en acier inoxydable fixé par une sangle en nylon pour ne jamais le perdre",
      "Design noir translucide signature NutriFitness Genève avec graduation en millilitres"
    ]
  },

  // 96: Pw CREAPURE Premium 250g
  'prod-7854': {
    nameFr: "Powerfood CREAPURE® Monohydrate Premium 250g – Pureté Maximale Fabriqué en Allemagne",
    keyActives: "100% créatine monohydrate Creapure® fabriquée en Allemagne sous licence brevetée certifiée",
    benefitFr: "L'étalon-or des créatines en Suisse pour développer une force musculaire phénoménale et une densité sans faille.",
    targetAudience: "Athlètes professionnels suisses, compétiteurs de force et culturistes exigeant la pureté chimique la plus stricte.",
    posologyFr: "Prendre 3 g par jour dilués dans un grand verre d'eau ou dans votre shaker post-séance de façon continue toute l'année.",
    features: [
      "Pureté certifiée à 99.99% testée sans sous-produits toxiques (dicyandiamide, dihydrotriazine)",
      "Fabriquée dans une usine dédiée en Bavière soumise aux normes pharmaceutiques les plus rigoureuses",
      "Améliore les performances lors des séries successives d'exercices très intenses et de courte durée",
      "Poudre micronisée ultra-fine neutre en goût convenant aux régimes végans et certifiée Kasher et Halal"
    ]
  }
};

/**
 * Helper to build the 40-60 words AEO Direct Answer paragraph for Swiss search engines & AI overviews
 */
function buildAeoAnswer(p: ProductItem, data: ProductEnrichmentData): { fr: string; de: string; it: string; en: string } {
  const shortName = data.nameFr.split(' – ')[0];

  if (p.id === 'prod-25430') {
    return {
      fr: "Le Guide Ultime des Compléments Alimentaires par NutriFitness Genève est un livre numérique expert de plus de 120 pages dédié à la nutrition sportive rationnelle. Il détaille les protocoles validés scientifiquement, les labels d'excellence (Creapure, Kyowa, CFM) et les pièges marketing à éviter. Disponible en téléchargement immédiat au format PDF haute résolution.",
      de: "Der Ultimative Leitfaden für Nahrungsergänzungsmittel von NutriFitness Genf ist ein 120-seitiges Experten-E-Book über wissenschaftlich fundierte Sporternährung. Es analysiert Inhaltsstoffe, Dosierungen und Qualitätslabels. Sofortiger Download im hochauflösenden PDF-Format.",
      it: "La Guida Definitiva agli Integratori Alimentari di NutriFitness Ginevra è un ebook di oltre 120 pagine dedicato alla nutrizione sportiva scientifica. Spiega dosaggi efficaci, sinergie e trappole commerciali. Disponibile in download immediato in formato PDF ad alta risoluzione.",
      en: "The Ultimate Guide to Dietary Supplements by NutriFitness Geneva is an expert 120+ page ebook dedicated to evidence-based sports nutrition. It details proven dosages, quality labels (Creapure, Kyowa, CFM), and marketing traps to avoid. Available for instant high-resolution PDF download."
    };
  }

  if (p.categorySlug === 'accessoires') {
    return {
      fr: `${shortName} est un accessoire officiel NutriFitness Suisse conçu en matériaux haute résistance certifiés sans BPA et 100% hermétique. Conçu pour faciliter l'hydratation quotidienne et la préparation des shakers sportifs sans grumeaux. Disponible immédiatement en stock à Genève avec expédition 24h par PostPac Priority ou retrait immédiat au 34 Rue des Pâquis.`,
      de: `${shortName} ist offizielles NutriFitness Schweiz Zubehör aus BPA-freiem, langlebigem Material mit 100% Auslaufschutz. Entwickelt für einfache Flüssigkeitszufuhr und klumpenfreie Protein-Shakes. 100% Schweizer Lagerware in Genf mit 24h-Versand per PostPac Priority.`,
      it: `${shortName} è un accessorio ufficiale NutriFitness Svizzera realizzato in materiali resistenti senza BPA e 100% ermetico. Ideale per l'idratazione quotidiana e la preparazione di shaker senza grumi. Disponibile con spedizione rapida 24h PostPac Priority o ritiro a Ginevra.`,
      en: `${shortName} is an official NutriFitness Switzerland accessory crafted from durable, BPA-free materials with a 100% leak-proof seal. Designed for effortless hydration and lump-free protein shakes. In stock in Geneva with 24h PostPac Priority dispatch.`
    };
  }

  const benefitPhrase = data.benefitFr.trim().replace(/\.$/, '');
  const lowerBenefit = benefitPhrase.charAt(0).toLowerCase() + benefitPhrase.slice(1);
  const actionPhrase = lowerBenefit.startsWith('en-cas') || lowerBenefit.startsWith('wrap') || lowerBenefit.startsWith('cookie') || lowerBenefit.startsWith('la version') || lowerBenefit.startsWith('le pot') || lowerBenefit.startsWith('le concentré') || lowerBenefit.startsWith('le gainer') || lowerBenefit.startsWith('le plus') || lowerBenefit.startsWith('la source') || lowerBenefit.startsWith('la protéine') || lowerBenefit.startsWith('la solution') || lowerBenefit.startsWith('tartinade') || lowerBenefit.startsWith('source') || lowerBenefit.startsWith('édition')
    ? `constitue un ${lowerBenefit}`
    : `permet de : ${lowerBenefit}`;

  const fr = `${shortName} est un complément de nutrition sportive de haute qualité élaboré avec ${data.keyActives.toLowerCase()}. Développé pour les ${data.targetAudience.toLowerCase()}, il ${actionPhrase}. Posologie recommandée : ${data.posologyFr.toLowerCase()} Conforme aux normes suisses DFI/LGV, en stock direct à Genève au 34 Rue des Pâquis avec livraison PostPac Priority en 24h.`;

  const de = `${shortName} von ${p.brand} ist hochwertige Schweizer Sportnahrung mit ${data.keyActives}. Entwickelt für ${data.targetAudience}, unterstützt das Produkt ${data.benefitFr} 100% Schweizer Lagerware mit 24h PostPac Priority Versand und Abholung im NutriFitness Store Genf (Rue des Pâquis 34).`;

  const it = `${shortName} di ${p.brand} è un integratore formulato con ${data.keyActives}. Ideale per ${data.targetAudience}, favorisce ${data.benefitFr} Conforme alle norme DFI/LGV svizzere, disponibile con spedizione prioritaria 24h o ritiro nel negozio di Ginevra.`;

  const en = `${shortName} by ${p.brand} is a premium sports nutrition supplement formulated with ${data.keyActives}. Designed for ${data.targetAudience}, it delivers ${data.benefitFr} Compliant with Swiss DFI/FSVO standards, in stock in Geneva with 24h PostPac Priority delivery across Switzerland.`;

  return { fr, de, it, en };
}

/**
 * Helper to build rich semantic HTML long description with 4 distinct H2 sections
 */
function buildLongDescription(p: ProductItem, data: ProductEnrichmentData): { fr: string; de: string; it: string; en: string } {
  const shortName = data.nameFr.split(' – ')[0];
  const featureListHtml = data.features.map(f => `  <li><strong>${f.split(' : ')[0]} :</strong> ${f.split(' : ')[1] || f}</li>`).join('\n');

  if (p.id === 'prod-25430') {
    return {
      fr: `<h2>Pourquoi acquérir Le Guide Ultime des Compléments Alimentaires ?</h2>
<p>${data.benefitFr} Après 11 années sur le terrain à conseiller des milliers de sportifs dans notre boutique de Genève, nous avons rassemblé toute la vérité scientifique sur les suppléments dans un guide sans complaisance.</p>
<p>${data.targetAudience}</p>

<h2>Ce que vous allez apprendre dans cet ouvrage</h2>
<p>Un contenu structuré, pragmatique et immédiatement applicable pour vos entraînements :</p>
<ul>
${featureListHtml}
</ul>

<h2>Format & Modalités d'Accès</h2>
<p><strong>Accès instantané :</strong> ${data.posologyFr}</p>
<p><em>Garantie d'actualisation :</em> Toutes les futures mises à jour du guide vous seront envoyées gratuitement par email.</p>

<h2>L'Engagement d'Indépendance NutriFitness Genève</h2>
<p>Contrairement aux articles sponsorisés du web, notre guide a été rédigé en toute indépendance par nos coachs et préparateurs physiques du <strong>34 Rue des Pâquis, 1201 Genève</strong>, avec pour seul objectif l'efficacité réelle et la santé de nos athlètes suisses.</p>`,
      de: `<h2>Warum den Ultimativen Leitfaden für Nahrungsergänzungsmittel wählen?</h2>
<p>${data.benefitFr} Nach 11 Jahren Erfahrung im NutriFitness Store Genf fassen wir die wissenschaftliche Wahrheit über Supplements in einem praxisnahen E-Book zusammen.</p>
<h2>Inhalte des Leitfadens</h2>
<ul>
${featureListHtml}
</ul>
<h2>Zugriff & Format</h2>
<p>${data.posologyFr}</p>`,
      it: `<h2>Perché scegliere la Guida Definitiva agli Integratori?</h2>
<p>${data.benefitFr} Oltre 11 anni di esperienza sul campo racchiusi in un manuale pratico e scientifico per ottimizzare la tua integrazione.</p>
<h2>Cosa scoprirai in questa guida</h2>
<ul>
${featureListHtml}
</ul>
<h2>Formato e Accesso</h2>
<p>${data.posologyFr}</p>`,
      en: `<h2>Why Read The Ultimate Guide to Dietary Supplements?</h2>
<p>${data.benefitFr} Over 11 years of hands-on coaching and retail expertise in Geneva condensed into one actionable, science-based handbook.</p>
<h2>What You Will Learn</h2>
<ul>
${featureListHtml}
</ul>
<h2>Format & Lifetime Access</h2>
<p>${data.posologyFr}</p>`
    };
  }

  const fr = `<h2>Pourquoi choisir ${shortName} chez NutriFitness Suisse ?</h2>
<p>${data.benefitFr} Élaboré avec des matières premières rigoureusement tracées, ce complément répond aux exigences élevées des sportifs suisses qui refusent les compromis entre pureté nutritionnelle et efficacité athlétique.</p>
<p>${data.targetAudience}</p>

<h2>Analyse de la Formule & Ingrédients Actifs</h2>
<p>Chaque portion a été minutieusement calibrée pour garantir une biodisponibilité maximale dans l'organisme :</p>
<ul>
${featureListHtml}
</ul>

<h2>Conseils d'Utilisation & Posologie DFI Suisse</h2>
<p><strong>Posologie recommandée :</strong> ${data.posologyFr}</p>
<p><em>Précautions d'emploi selon l'Ordonnance suisse sur les compléments alimentaires (DFI / OSAV) :</em> Ne pas dépasser la dose journalière expressément recommandée. Les compléments alimentaires ne doivent pas se substituer à une alimentation variée et équilibrée ni à un mode de vie sain. Conserver hors de portée des jeunes enfants, au sec et à l'abri de la lumière.</p>

<h2>L'Engagement Qualité NutriFitness Genève</h2>
<p>En commandant votre <strong>${shortName}</strong> chez NutriFitness, vous bénéficiez de garanties uniques sur le marché suisse :</p>
<ul>
  <li><strong>100% Stock Suisse à Genève :</strong> Tous nos produits sont dédouanés et stockés dans nos locaux au 34 Rue des Pâquis, 1201 Genève.</li>
  <li><strong>Expédition Express 24h :</strong> Commande expédiée via La Poste Suisse (PostPac Priority) – aucun frais de douane imprévu ni TVA d'importation supplémentaire.</li>
  <li><strong>Conseil Expert en Boutique :</strong> Rencontrez nos préparateurs physiques et experts en nutrition directement en showroom pour un accompagnement sur mesure.</li>
</ul>`;

  const de = `<h2>Warum ${shortName} bei NutriFitness Schweiz wählen?</h2>
<p>${data.benefitFr} Entwickelt mit hochwertigen Inhaltsstoffen für höchste Schweizer Qualitätsansprüche.</p>
<h2>Formel & Wichtige Wirkstoffe</h2>
<ul>
${featureListHtml}
</ul>
<h2>Einnahmeempfehlung & Schweizer Richtlinien</h2>
<p>${data.posologyFr}</p>
<h2>Ihr Vorteil bei NutriFitness Genf</h2>
<p>100% Schweizer Lagerware an der Rue des Pâquis 34, 1201 Genf. Schneller 24h-Versand mit der Schweizerischen Post (PostPac Priority) ohne Zollgebühren.</p>`;

  const it = `<h2>Perché scegliere ${shortName} su NutriFitness Svizzera?</h2>
<p>${data.benefitFr} Formulato secondo i più alti standard di qualità e purezza per gli atleti esigenti.</p>
<h2>Analisi della Formula & Principi Attivi</h2>
<ul>
${featureListHtml}
</ul>
<h2>Modalità d'uso e Dosaggio Svizzero</h2>
<p>${data.posologyFr}</p>
<h2>La Garanzia NutriFitness Ginevra</h2>
<p>Stock 100% svizzero a Ginevra con consegna rapida 24h PostPac Priority e ritiro diretto al negozio di Rue des Pâquis 34.</p>`;

  const en = `<h2>Why Choose ${shortName} at NutriFitness Switzerland?</h2>
<p>${data.benefitFr} Formulated with premium ingredients adhering to rigorous Swiss food safety and efficacy standards.</p>
<h2>Formula Breakdown & Active Nutrients</h2>
<ul>
${featureListHtml}
</ul>
<h2>Recommended Usage & Swiss Compliance</h2>
<p>${data.posologyFr}</p>
<h2>The NutriFitness Geneva Guarantee</h2>
<p>100% genuine Swiss stock located in Geneva (34 Rue des Pâquis). Dispatched within 24 hours via Swiss Post (PostPac Priority) with zero hidden customs fees.</p>`;

  return { fr, de, it, en };
}

/**
 * Helper to build short description (2-3 complete sentences with Swiss trust anchor)
 */
function buildShortDescription(p: ProductItem, data: ProductEnrichmentData): { fr: string; de: string; it: string; en: string } {
  if (p.id === 'prod-25430') {
    return {
      fr: "Guide pratique et indépendant de 120+ pages rédigé par l'équipe d'experts NutriFitness Genève pour rentabiliser votre supplémentation sportive. Découvrez les dosages réels, les synergies validées et les pièges marketing à éviter. Téléchargement immédiat au format PDF haute résolution.",
      de: "120-seitiges Experten-E-Book für wissenschaftlich fundierte Sporternährung von NutriFitness Genf. Analysiert Inhaltsstoffe, Dosierungen und Qualitätslabels. Sofortiger Download im hochauflösenden PDF-Format.",
      it: "Guida pratica e indipendente di oltre 120 pagine redatta dagli esperti di NutriFitness Ginevra per ottimizzare la tua integrazione sportiva. Download immediato in formato PDF ad alta risoluzione.",
      en: "Comprehensive 120+ page evidence-based sports supplement handbook written by NutriFitness Geneva coaches. Discover clinical dosages, ingredient synergies, and marketing traps to avoid. Instant PDF download."
    };
  }

  if (p.categorySlug === 'accessoires') {
    return {
      fr: `${data.benefitFr} Conçu en matériaux certifiés sans BPA et 100% hermétique pour accompagner tous vos entraînements. Stock direct 100% en Suisse, expédié sous 24h par PostPac Priority ou disponible en retrait immédiat au showroom NutriFitness Genève (34 Rue des Pâquis).`,
      de: `${data.benefitFr} Aus BPA-freiem, langlebigem Material mit zuverlässigem Auslaufschutz. 100% Schweizer Lagerware, versandfertig in 24 Stunden per PostPac Priority oder direkt abholbar im Store Genf.`,
      it: `${data.benefitFr} Realizzato in materiali resistenti senza BPA e 100% a tenuta stagna. Stock 100% svizzero con spedizione rapida 24h PostPac Priority o ritiro a Ginevra.`,
      en: `${data.benefitFr} Engineered from durable BPA-free materials with a 100% leak-proof seal. 100% Swiss stock, dispatched within 24 hours via PostPac Priority or available for pickup at our Geneva showroom.`
    };
  }

  const fr = `${data.benefitFr} Cette formule intègre ${data.keyActives.toLowerCase()} pour des résultats visibles et durables. Stock direct 100% en Suisse, expédié sous 24h par PostPac Priority ou disponible en retrait immédiat à notre boutique NutriFitness Genève (34 Rue des Pâquis).`;

  const de = `${data.benefitFr} Hochwertige Formel mit ${data.keyActives}. 100% Schweizer Lagerware, versandfertig in 24 Stunden per PostPac Priority oder direkt abholbar im Store Genf.`;

  const it = `${data.benefitFr} Formula avanzata con ${data.keyActives}. Stock 100% svizzero con spedizione rapida 24h PostPac Priority o ritiro immediato nel negozio di Ginevra.`;

  const en = `${data.benefitFr} Advanced formula containing ${data.keyActives}. 100% Swiss stock, dispatched within 24 hours via PostPac Priority or available for immediate pickup at our Geneva store.`;

  return { fr, de, it, en };
}

/**
 * Main enrichment execution
 */
export function runEnrichment() {
  console.log(`Starting catalog enrichment for ${PRODUCTS.length} products...`);

  let enrichedCount = 0;
  const enrichedProducts: ProductItem[] = PRODUCTS.map((prod) => {
    const data = PRODUCT_ENRICHMENTS[prod.id];
    if (!data) {
      console.warn(`[WARNING] No custom data defined for product ID ${prod.id} (${prod.name.fr})`);
      return prod;
    }

    enrichedCount++;
    const aeo = buildAeoAnswer(prod, data);
    const shortDesc = buildShortDescription(prod, data);
    const longDesc = buildLongDescription(prod, data);

    return {
      ...prod,
      name: {
        fr: data.nameFr,
        de: data.nameDe || data.nameFr,
        it: data.nameIt || data.nameFr,
        en: data.nameEn || data.nameFr,
      },
      shortDescription: shortDesc,
      directAnswerAeo: aeo,
      longDescription: longDesc,
    };
  });

  console.log(`Successfully enriched ${enrichedCount} / ${PRODUCTS.length} products with bespoke SEO/AEO/GEO content.`);

  // Write back to catalog.ts
  const catalogPath = path.join(__dirname, '../src/lib/catalog.ts');
  const fileContent = `import type { ProductItem, SupportedLocale } from './types';

export interface CategoryItem {
  id: string;
  slug: Record<SupportedLocale, string>;
  name: Record<SupportedLocale, string>;
  titleH1: Record<SupportedLocale, string>;
  metaTitle: Record<SupportedLocale, string>;
  metaDescription: Record<SupportedLocale, string>;
  directAnswerAeo: Record<SupportedLocale, string>;
  faqs: {
    question: Record<SupportedLocale, string>;
    answer: Record<SupportedLocale, string>;
  }[];
}

export const CATEGORIES: CategoryItem[] = ${JSON.stringify(CATEGORIES, null, 2)};

export const PRODUCTS: ProductItem[] = ${JSON.stringify(enrichedProducts, null, 2)};

export function getCategoryBySlug(slug: string, locale: SupportedLocale): CategoryItem | undefined {
  return CATEGORIES.find(c => c.slug[locale] === slug || c.id === slug);
}

export function getProductBySlug(slug: string, locale: SupportedLocale): ProductItem | undefined {
  return PRODUCTS.find(p => p.slug[locale] === slug || p.id === slug);
}

export function getProductsByCategory(categorySlug: string): ProductItem[] {
  return PRODUCTS.filter(p => p.categorySlug === categorySlug);
}
`;

  fs.writeFileSync(catalogPath, fileContent, 'utf8');
  console.log(`Successfully wrote updated catalog to ${catalogPath}`);
}

if (require.main === module) {
  runEnrichment();
}
