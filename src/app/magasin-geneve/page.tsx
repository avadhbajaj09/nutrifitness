import React from 'react';
import type { Metadata } from 'next';
import BoutiqueGenevePage from '../boutique-geneve/page';

export const metadata: Metadata = {
  title: 'Magasin Nutrition Sportive Genève | NutriFitness.ch',
  description: 'Boutique physique NutriFitness au 34 Rue des Pâquis, 1201 Genève. Protéines, créatine, vitamines et conseils personnalisés par Marco Scarpantoni.',
  alternates: {
    canonical: 'https://nutrifitness.ch/boutique-geneve/',
  }
};

export default function MagasinGenevePage() {
  return <BoutiqueGenevePage />;
}
