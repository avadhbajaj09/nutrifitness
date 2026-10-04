import React from 'react';
import type { Metadata } from 'next';
import ContactPage from '../contact/page';

export const metadata: Metadata = {
  title: 'Contactez NutriFitness Genève | Protéines Premium & Boutique',
  description: 'Contactez notre boutique de nutrition sportive à Genève. Formulaire, téléphone et accès rue des Pâquis 34.',
  alternates: {
    canonical: 'https://nutrifitness.ch/contact-us-nutrifit-geneve-proteines-premium/',
  }
};

export default function ContactUsNutrifitPage() {
  return <ContactPage />;
}
