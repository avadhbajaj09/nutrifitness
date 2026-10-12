import React from 'react';
import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contactez NutriFitness Suisse | Service Client & Boutique Officielle',
  description: 'Contactez l\'équipe NutriFitness en Suisse par téléphone au +41 79 250 35 64 ou par e-mail. Conseils experts et suivi de commandes.',
  alternates: {
    canonical: 'https://nutrifitness.ch/contact/',
  }
};

export default function ContactPage() {
  return <ContactClient />;
}
