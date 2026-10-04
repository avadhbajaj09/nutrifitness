import React from 'react';
import type { Metadata } from 'next';
import ProtectionDonneesPage from '../protection-donnees/page';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | NutriFitness.ch Genève',
  description: 'Politique de confidentialité pour notre site de commerce électronique basé en Suisse. Protection de vos données personnelles sous la nDSG.',
  alternates: {
    canonical: 'https://nutrifitness.ch/privacy-policy/',
  }
};

export default function PrivacyPolicyPage() {
  return <ProtectionDonneesPage />;
}
