import React from 'react';
import type { Metadata } from 'next';
import CoachingClient from './CoachingClient';

export const metadata: Metadata = {
  title: 'Coaching Nutritionnel Personnalisé en Suisse & En Ligne | NutriFitness.ch',
  description: 'Plus de 20 ans d\'expertise en nutrition sportive et transformation physique. Plan alimentaire sur-mesure, entraînement et suivi régulier en Suisse ou à distance. Réservez votre bilan gratuit.',
  alternates: {
    canonical: 'https://nutrifitness.ch/coaching-nutritionnel-personnalise/',
  },
  openGraph: {
    title: 'Coaching Nutritionnel Personnalisé | NutriFitness Suisse',
    description: 'Bilan gratuit, diète sur-mesure et suivi humain continu avec nos experts en nutrition en Suisse.',
  }
};

export default function CoachingPage() {
  return <CoachingClient />;
}
