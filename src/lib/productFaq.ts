import { ProductItem, FaqItem } from './types';
import { getLocalized } from './types';

export function getProductFaqs(product: ProductItem): FaqItem[] {
  const name = getLocalized(product.name, 'fr');
  const brand = product.brand;
  const servingSize = product.nutrition.servingSize || '30 g';
  const servings = product.nutrition.servingsPerContainer || 30;
  const proteinPerServing = product.nutrition.proteinG || 0;
  const caloriesPerServing = product.nutrition.energyKcal || 0;
  const ingredients = product.ingredients.fr || 'Ingrédients de haute qualité selon l\'étiquette officielle.';
  const allergens = product.allergens.fr || 'Aucun allergène majeur signalé.';
  const usage = product.usageInstructions.fr || 'Prendre selon la dose indiquée sur le pot avec de l\'eau.';

  const category = product.categorySlug.toLowerCase();
  const faqs: FaqItem[] = [];

  // Model-specific FAQs
  if (category.includes('creatine')) {
    faqs.push({
      question: `Combien de temps dure un pot de ${name} ?`,
      answer: `À raison d'une dose quotidienne de 3 à 5 g, un pot de ${name} (${servings} portions) dure environ ${servings} jours (soit ${Math.round(servings / 30)} mois d'utilisation continue).`
    });
    faqs.push({
      question: `Comment et quand prendre ${name} ?`,
      answer: `${usage} Il est conseillé de la prendre quotidiennement avec de l'eau ou un jus de fruits, y compris les jours de repos, idéalement après l'entraînement pour maximiser la rétention intramusculaire.`
    });
    faqs.push({
      question: `${name} contient-il d'autres ingrédients ou additifs ?`,
      answer: `Composition officielle : ${ingredients}. Vérifiez toujours l'étiquette du produit pour les détails complets de pureté.`
    });
  } else if (category.includes('proteine') || category.includes('whey') || category.includes('casein') || category.includes('isolat')) {
    faqs.push({
      question: `Combien de protéines par portion apporte ${name} ?`,
      answer: `Une portion de ${servingSize} apporte exactement ${proteinPerServing} g de protéines pures de haute valeur biologique, avec seulement ${caloriesPerServing} kcal.`
    });
    faqs.push({
      question: `${name} contient-il du lactose ou des allergènes ?`,
      answer: `Allergènes déclarés : ${allergens}. Pour les isolats ultra-filtrés, la teneur en lactose est minimale (< 0.5 g par dose). En cas d'intolérance sévère, consultez la composition exacte.`
    });
    faqs.push({
      question: `Combien de portions contient ce pot de ${name} ?`,
      answer: `Ce pot contient ${servings} portions de ${servingSize}. Le tarif par portion est particulièrement compétitif pour le marché suisse.`
    });
  } else if (category.includes('gainer') || category.includes('masse')) {
    faqs.push({
      question: `Combien de calories par portion apporte ${name} ?`,
      answer: `Une portion de ${servingSize} apporte environ ${caloriesPerServing} kcal et ${proteinPerServing} g de protéines pour soutenir une prise de masse saine et constante.`
    });
    faqs.push({
      question: `Comment préparer et consommer ${name} ?`,
      answer: `${usage} Vous pouvez mélanger la dose dans 400 à 600 ml d'eau ou de lait d'avoine. Pour tester votre tolérance digestive, commencez par une demi-portion les premiers jours.`
    });
    faqs.push({
      question: `Peut-on combiner ${name} avec un shaker maison ?`,
      answer: `Oui, vous pouvez alterner ou enrichir votre shaker avec des flocons d'avoine bio, une banane et du beurre d'oléagineux selon vos besoins caloriques journaliers.`
    });
  } else if (category.includes('acide') || category.includes('bcaa') || category.includes('eaa') || category.includes('glutamine')) {
    faqs.push({
      question: `Quelle dose de nutriments actifs par portion dans ${name} ?`,
      answer: `Chaque portion de ${servingSize} fournit ${proteinPerServing > 0 ? `${proteinPerServing} g d'acides aminés` : 'la concentration optimale indiquée sur l\'étiquette'} pour protéger la masse musculaire et accélérer la régénération cellulaire.`
    });
    faqs.push({
      question: `Quand prendre ${name} par rapport à l'entraînement ?`,
      answer: `${usage} Il est généralement conseillé de diluer une portion dans votre gourde pendant l'effort ou immédiatement après la séance de sport.`
    });
    faqs.push({
      question: `Peut-on combiner ${name} avec de la whey ou de la créatine ?`,
      answer: `Oui, les acides aminés se combinent parfaitement avec la créatine et la whey protein. Assurez-vous simplement de bien vous hydrater tout au long de la journée.`
    });
  } else if (category.includes('pre-workout') || category.includes('booster') || category.includes('energie')) {
    faqs.push({
      question: `Quelle est la teneur en caféine et stimulants dans ${name} ?`,
      answer: `La formule contient des stimulants dosés avec précision (${usage}). Prenez en compte vos autres apports en caféine de la journée (cafés, thés, sodas) pour ne pas dépasser 400 mg par jour.`
    });
    faqs.push({
      question: `À qui ${name} est-il déconseillé ?`,
      answer: `Ce pré-workout est déconseillé aux mineurs, aux femmes enceintes ou allaitantes, ainsi qu'aux personnes sensibles à la caféine ou souffrant de troubles cardiovasculaires.`
    });
    faqs.push({
      question: `Quand consommer ${name} pour un effet optimal ?`,
      answer: `Consommez une portion mélangée à 250-300 ml d'eau fraîche 20 à 30 minutes avant l'entraînement. Évitez toute prise dans les 5 à 6 heures précédant le coucher pour préserver votre sommeil.`
    });
  } else if (category.includes('vitamine') || category.includes('mineraux') || category.includes('sante')) {
    faqs.push({
      question: `Quelle est la posologie recommandée pour ${name} ?`,
      answer: `La dose journalière recommandée est de ${servingSize}. Respectez rigoureusement cette dose pour couvrir vos apports de référence sans risque de surdosage.`
    });
    faqs.push({
      question: `Peut-on associer ${name} avec d'autres vitamines ?`,
      answer: `Vérifiez le cumul des nutriments si vous consommez déjà un complexe multivitaminé. En cas de doute ou de traitement médical en cours, demandez conseil à un médecin ou pharmacien.`
    });
  } else if (category.includes('collagene')) {
    faqs.push({
      question: `Que contient la formule de ${name} ?`,
      answer: `Composition : ${ingredients}. Une portion de ${servingSize} apporte des peptides de collagène hautement biodisponibles pour le soutien articulaire et tendineux.`
    });
    faqs.push({
      question: `Comment consommer ${name} ?`,
      answer: `${usage} Diluez la poudre dans un verre d'eau, un café tiède ou votre shaker protéiné habituel. La dissolution est instantanée.`
    });
    faqs.push({
      question: `${name} convient-il aux régimes végétariens ?`,
      answer: `Le collagène est naturellement issu d'origine bovine ou marine (poisson) et ne convient donc pas à un régime végétarien strict.`
    });
  } else if (category.includes('snack') || category.includes('barre') || category.includes('cookie')) {
    faqs.push({
      question: `Combien de protéines et de sucres par barre de ${name} ?`,
      answer: `Chaque portion de ${servingSize} apporte ${proteinPerServing} g de protéines de qualité supérieure pour seulement ${caloriesPerServing} kcal, avec un profil glucidique réduit.`
    });
    faqs.push({
      question: `Quels sont les allergènes présents dans ${name} ?`,
      answer: `Allergènes déclarés sur l'emballage : ${allergens}. Conservez dans un endroit frais et sec (15-22 °C), à l'abri de la chaleur directe.`
    });
  } else {
    // Accessories / General
    faqs.push({
      question: `Quelles sont les caractéristiques de ${name} (${brand}) ?`,
      answer: `${getLocalized(product.shortDescription, 'fr')}. Produit officiel certifié ${brand} disponible en stock chez NutriFitness Genève.`
    });
    faqs.push({
      question: `Quels sont les conseils d'entretien et d'utilisation ?`,
      answer: `${usage} Rincez soigneusement à l'eau claire après chaque séance.`
    });
  }

  // 2 universal product-specific questions (Authenticity & Geneva pick-up / delivery)
  faqs.push({
    question: `Est-ce que ${name} est garanti 100 % authentique ?`,
    answer: `Oui, NutriFitness est revendeur agréé direct de la marque ${brand}. Tous nos lots sont conformes aux ordonnances suisses (OSAV/DFI) et bénéficient d'une traçabilité totale.`
  });

  faqs.push({
    question: `Puis-je retirer ${name} directement en magasin à Genève ?`,
    answer: `Oui, le retrait Click & Collect est disponible gratuitement sous 2h à notre boutique officielle au 34 Rue des Pâquis, 1201 Genève. Vous pouvez aussi choisir la livraison La Poste Priority 24h partout en Suisse (offerte dès 75 CHF).`
  });

  return faqs;
}
