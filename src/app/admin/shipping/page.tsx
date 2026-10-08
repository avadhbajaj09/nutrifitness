import React from 'react';
import type { Metadata } from 'next';
import AdminShippingClient from './AdminShippingClient';

export const metadata: Metadata = {
  title: 'Moteur de Livraison & Délais Dynamiques | NutriFitness Admin',
  description: 'Configuration des règles de livraison, calendrier des jours fériés, simulateur de délais et suivi.',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminShippingPage() {
  return <AdminShippingClient />;
}
