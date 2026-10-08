import React from 'react';
import type { Metadata } from 'next';
import ProductLocationManagerClient from './ProductLocationManagerClient';

export const metadata: Metadata = {
  title: 'Gestion des Emplacements Produits | NutriFitness Admin',
  description: 'Gestion multi-origine des stocks (Genève & Portugal) et emplacements catalogue.',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminProductsPage() {
  return <ProductLocationManagerClient />;
}
