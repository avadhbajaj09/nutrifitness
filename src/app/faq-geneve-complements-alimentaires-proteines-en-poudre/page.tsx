import React from 'react';
import type { Metadata } from 'next';
import FAQView from '@/components/FAQView';

export const metadata: Metadata = {
  title: 'FAQ Genève Compléments Alimentaires & Protéines en Poudre | NutriFitness.ch',
  description: 'Découvrez notre sélection de protéines, créatine, vitamines et produits de nutrition sportive. Retrouvez-nous à la rue des Pâquis 34 à Genève, ou commandez en ligne avec livraison en Suisse.',
  alternates: {
    canonical: 'https://nutrifitness.ch/faq-geneve-complements-alimentaires-proteines-en-poudre/',
  }
};

export default function FAQGenevePage() {
  return <FAQView canonicalUrl="https://nutrifitness.ch/faq-geneve-complements-alimentaires-proteines-en-poudre/" />;
}
