import { ProductItem, FaqItem, getLocalized } from './types';

// Only use product-specific data that is actually present in the catalogue.
// These answers are shared by the visible FAQ and the FAQPage JSON-LD.
function clean(value: string | undefined | null): string {
  return (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function isKnown(value: string): boolean {
  return Boolean(value) && !/à vérifier|non renseign|non précisé|inconnu|selon l'étiquette officielle|aucun allergène majeur signalé|^n\/?a$/i.test(value);
}

export function getProductFaqs(product: ProductItem): FaqItem[] {
  const name = getLocalized(product.name, 'fr');
  const category = (product.categorySlug || '').toLowerCase();
  const servingSize = clean(product.nutrition?.servingSize);
  const ingredients = clean(getLocalized(product.ingredients, 'fr'));
  const allergens = clean(getLocalized(product.allergens, 'fr'));
  const usage = clean(getLocalized(product.usageInstructions, 'fr'));
  const protein = product.nutrition?.proteinG;
  const calories = product.nutrition?.energyKcal;
  const faqs: FaqItem[] = [];
  const add = (question: string, answer: string) => faqs.push({ question, answer });

  const usageAnswer = isKnown(usage)
    ? `${usage} Respectez la quantité et les précautions indiquées sur l'emballage du produit.`
    : `Consultez la notice et l'étiquette de ${name} pour connaître les quantités et les précautions adaptées à ce produit.`;

  if (category.includes('creatine')) {
    add(`Comment utiliser ${name} ?`, usageAnswer);
    add(`Faut-il prendre ${name} uniquement les jours d'entraînement ?`,
      `Le mode d'utilisation dépend de la formule. Suivez les indications de ${name} sur son emballage et demandez conseil à un professionnel de santé en cas de situation médicale particulière.`);
  } else if (category.includes('proteine') || category.includes('whey') || category.includes('casein') || category.includes('isolat')) {
    add(`Combien de protéines apporte une portion de ${name} ?`,
      servingSize && typeof protein === 'number' && Number.isFinite(protein) && protein > 0
        ? `Selon la fiche nutritionnelle, une portion de ${servingSize} apporte ${protein} g de protéines. La valeur peut varier selon la version ou le parfum ; vérifiez l'étiquette de votre produit.`
        : `La quantité de protéines par portion n'est pas confirmée dans la fiche disponible. Consultez le tableau nutritionnel de ${name}, notamment pour le parfum ou le format choisi.`);
    add(`Comment préparer ${name} ?`, usageAnswer);
  } else if (category.includes('gainer') || category.includes('masse')) {
    add(`Combien de calories contient une portion de ${name} ?`,
      servingSize && typeof calories === 'number' && Number.isFinite(calories) && calories > 0
        ? `La fiche nutritionnelle indique ${calories} kcal pour une portion de ${servingSize}. Contrôlez l'étiquette du format choisi pour confirmer cette valeur.`
        : `La quantité de calories par portion n'est pas confirmée dans la fiche disponible. Vérifiez la déclaration nutritionnelle sur l'emballage de ${name}.`);
    add(`Comment préparer ${name} ?`, usageAnswer);
  } else if (category.includes('acide') || category.includes('bcaa') || category.includes('eaa') || category.includes('glutamine')) {
    add(`Quels acides aminés contient ${name} ?`,
      `Consultez la composition et les quantités d'acides aminés indiquées sur l'étiquette de ${name} : elles dépendent de la formule et de la portion.`);
    add(`Comment utiliser ${name} ?`, usageAnswer);
  } else if (category.includes('pre-workout') || category.includes('booster') || category.includes('energie')) {
    add(`Quelle est la quantité de caféine dans ${name} ?`,
      `La présence et la quantité de caféine dépendent de la formule. Vérifiez la liste des ingrédients et la dose par portion sur l'étiquette de ${name} avant toute utilisation.`);
    add(`Quelles précautions prendre avec ${name} ?`,
      `Vérifiez les avertissements du fabricant, notamment concernant les stimulants, les associations avec d'autres compléments et les populations auxquelles le produit ne convient pas. Demandez un avis médical en cas de doute.`);
  } else if (category.includes('vitamine') || category.includes('mineraux') || category.includes('sante')) {
    add(`Comment prendre ${name} ?`, usageAnswer);
    add(`Peut-on associer ${name} à d'autres compléments ?`,
      `Comparez les ingrédients et les quantités de nutriments pour éviter des apports cumulés non souhaités. En cas de traitement ou de doute, demandez conseil à un professionnel de santé.`);
  } else if (category.includes('collagene')) {
    add(`Quelle est la composition de ${name} ?`,
      isKnown(ingredients) ? `La fiche produit indique : ${ingredients}. Vérifiez les informations sur l'emballage du format choisi.`
        : `La composition détaillée n'est pas confirmée dans la fiche disponible. Consultez l'étiquette de ${name} avant l'achat.`);
    add(`Comment utiliser ${name} ?`, usageAnswer);
  } else if (category.includes('snack') || category.includes('barre') || category.includes('cookie')) {
    add(`Quelle quantité de protéines contient ${name} ?`,
      servingSize && typeof protein === 'number' && Number.isFinite(protein) && protein > 0
        ? `La fiche nutritionnelle indique ${protein} g de protéines pour une portion de ${servingSize}. Vérifiez l'emballage du parfum choisi.`
        : `Vérifiez la teneur en protéines et la taille de portion sur le tableau nutritionnel de ${name}.`);
  } else {
    add(`Comment utiliser ${name} ?`, usageAnswer);
  }

  add(`Quels sont les ingrédients de ${name} ?`,
    isKnown(ingredients)
      ? `La composition indiquée dans la fiche produit est : ${ingredients}. L'emballage reste la référence pour la formule du lot acheté.`
      : `La liste complète des ingrédients n'est pas confirmée dans la fiche disponible. Vérifiez l'étiquette de ${name} avant l'achat.`);

  add(`Quels allergènes faut-il vérifier pour ${name} ?`,
    isKnown(allergens)
      ? `Allergènes mentionnés dans la fiche produit : ${allergens}. En cas d'allergie ou d'intolérance, contrôlez toujours l'emballage du produit livré.`
      : `Les allergènes ne sont pas confirmés dans la fiche disponible. En cas d'allergie ou d'intolérance, vérifiez impérativement l'étiquette avant consommation.`);

  add(`Puis-je commander ${name} pour une livraison ou un retrait à Genève ?`,
    `Les options de livraison et de retrait dépendent du stock, de l'entrepôt d'expédition et de votre destination. Vérifiez les options et les délais proposés à la commande. Notre boutique se trouve Rue des Pâquis 34, 1201 Genève.`);

  return faqs;
}
