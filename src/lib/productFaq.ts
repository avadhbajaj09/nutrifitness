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
  return faqs;
}
