import React from 'react';
import type { Metadata } from 'next';
import BoutiqueGenevePage from '../boutique-geneve/page';

export const metadata: Metadata = {
  title: 'Magasin Nutrition Sportive en Suisse | NutriFitness.ch',
  description: 'Boutique physique NutriFitness en Suisse. Protéines, créatine, vitamines et conseils personnalisés par notre équipe d\'experts.',
  alternates: {
    canonical: 'https://nutrifitness.ch/boutique-geneve/',
  }
};

export default function MagasinGenevePage() {
  return <BoutiqueGenevePage />;
}
