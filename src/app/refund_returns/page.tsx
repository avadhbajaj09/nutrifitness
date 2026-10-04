import React from 'react';
import type { Metadata } from 'next';
import RetoursPage from '../retours/page';

export const metadata: Metadata = {
  title: 'Politique de Remboursement & Retours | NutriFitness.ch',
  description: 'Notre politique de remboursement pour notre boutique en ligne située en Suisse : délai de 14 jours, retours produits non ouverts et service après-vente.',
  alternates: {
    canonical: 'https://nutrifitness.ch/refund_returns/',
  }
};

export default function RefundReturnsPage() {
  return <RetoursPage />;
}
