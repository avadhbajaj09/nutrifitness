import React from 'react';
import type { Metadata } from 'next';
import FAQView from '@/components/FAQView';

export const metadata: Metadata = {
  title: 'FAQ Nutrition Sportive & Protéines Genève | NutriFitness.ch',
  description: 'Foire aux questions sur les compléments alimentaires, whey protéines, créatine Creapure, livraison 24h en Suisse et boutique NutriFitness à Genève.',
  alternates: {
    canonical: 'https://nutrifitness.ch/faq-geneve-complements-alimentaires-proteines-en-poudre/',
  }
};

export default function FAQPage() {
  return <FAQView canonicalUrl="https://nutrifitness.ch/faq/" />;
}
