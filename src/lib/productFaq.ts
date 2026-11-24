import { ProductItem, FaqItem } from './types';
import { getLocalized } from './types';

export function getProductFaqs(product: ProductItem): FaqItem[] {
  const name = getLocalized(product.name, 'fr');
  const ingredients = product.ingredients?.fr?.trim();
  const allergens = product.allergens?.fr?.trim();
  const usage = product.usageInstructions?.fr?.trim();
  const faqs: FaqItem[] = [
    {
      question: `Quelle est la marque de ${name} ?`,
      answer: product.brand || 'Consultez la fiche et l’emballage du produit.'
    },
    {
      question: `Quelle est la composition de ${name} ?`,
      answer: ingredients || 'Consultez la liste des ingrédients sur l’emballage du produit.'
    },
    {
      question: `Quels allergènes faut-il vérifier pour ${name} ?`,
      answer: allergens || 'Les informations sur les allergènes doivent être vérifiées sur l’emballage avant utilisation.'
    },
    {
      question: `Comment utiliser ${name} ?`,
      answer: usage || 'Suivez les instructions et avertissements figurant sur l’emballage.'
    },
    {
      question: `Puis-je commander ${name} en Suisse ?`,
      answer: 'Consultez la disponibilité, les variantes et les options de livraison affichées sur cette fiche et au moment de la commande.'
    }
  ];
  const formats = Array.from(new Set((product.variants || []).map(v => v.format).filter(v => v && v !== '1 unité')));
  const flavors = Array.from(new Set((product.variants || []).map(v => getLocalized(v.flavorName, 'fr')).filter(v => v && v !== 'Standard')));
  if (formats.length) faqs.push({ question: `Quels formats sont proposés pour ${name} ?`, answer: formats.join(', ') + '. La disponibilité dépend de la variante.' });
  if (flavors.length) faqs.push({ question: `Quels goûts sont proposés pour ${name} ?`, answer: flavors.join(', ') + '. Consultez les variantes disponibles.' });
  faqs.push(
    { question: `Quel est le prix de ${name} en Suisse ?`, answer: 'Le prix en CHF est affiché sur cette fiche et dépend du format sélectionné.' },
    { question: `Où trouver ${name} à Genève ?`, answer: 'NutriFitness dispose d’une boutique à Genève. Vérifiez la disponibilité du retrait avant de vous déplacer.' },
    { question: `Comment vérifier les valeurs nutritionnelles de ${name} ?`, answer: 'Consultez le tableau nutritionnel de la fiche et vérifiez les données sur l’emballage de la variante choisie.' }
  );
  return faqs;
}
