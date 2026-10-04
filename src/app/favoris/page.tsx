import React from 'react';
import type { Metadata } from 'next';
import WishlistClient from './WishlistClient';

export const metadata: Metadata = {
  title: 'Mes Favoris | NutriFitness.ch Genève',
  description: 'Retrouvez vos compléments alimentaires, protéines whey et pré-workouts préférés enregistrés dans votre liste de souhaits NutriFitness.',
};

export default function WishlistPage() {
  return <WishlistClient />;
}
