import React from 'react';
import type { Metadata } from 'next';
import BoutiqueClient from './BoutiqueClient';

export const metadata: Metadata = {
  title: 'Boutique Nutrition Sportive & Protéines Suisse | NutriFitness.ch',
  description: 'Tous nos compléments alimentaires et protéines en stock en Suisse. Whey isolate, créatine, pré-workouts, acides aminés. Livraison 24h ou retrait Genève.',
  alternates: {
    canonical: 'https://nutrifitness.ch/boutique/',
  },
};

export default function BoutiquePage() {
  return <BoutiqueClient />;
}
