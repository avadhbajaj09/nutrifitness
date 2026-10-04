import React from 'react';
import type { Metadata } from 'next';
import CoachingClient from './CoachingClient';

export const metadata: Metadata = {
  title: 'Coaching Nutritionnel Personnalisé à Genève & En Ligne | NutriFitness.ch',
  description: 'Plus de 20 ans d\'expertise en nutrition sportive et transformation physique. Plan alimentaire sur-mesure, entraînement et suivi régulier à Genève ou à distance. Réservez votre bilan gratuit.',
  openGraph: {
    title: 'Coaching Nutritionnel Personnalisé | NutriFitness Genève',
    description: 'Bilan gratuit, diète sur-mesure et suivi humain continu avec nos experts en nutrition à Genève.',
  }
};

export default function CoachingPage() {
  return <CoachingClient />;
}
