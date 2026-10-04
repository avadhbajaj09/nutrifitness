import React from 'react';
import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contactez NutriFitness Genève | Service Client & Boutique',
  description: 'Contactez l\'équipe NutriFitness à Genève par téléphone au +41 79 250 35 64 ou par e-mail. Conseils experts, suivi de commandes et adresse au 34 Rue des Pâquis.',
  alternates: {
    canonical: 'https://nutrifitness.ch/contact/',
  }
};

export default function ContactPage() {
  return <ContactClient />;
}
