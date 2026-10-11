import React from 'react';
import type { Metadata } from 'next';
import BoutiqueClient from './BoutiqueClient';
import { formatMetaTitle, formatMetaDescription } from '@/lib/seo';

const title = formatMetaTitle('Boutique Nutrition Sportive & Protéines Suisse | NutriFitness.ch');
const description = formatMetaDescription('Tous nos compléments alimentaires et protéines en stock en Suisse. Whey isolate, créatine, pré-workouts. Livraison 24h ou retrait Genève.');

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: 'https://nutrifitness.ch/boutique/',
  },
  openGraph: {
    title,
    description,
    url: 'https://nutrifitness.ch/boutique/',
    siteName: 'NutriFitness.ch',
    locale: 'fr_CH',
    type: 'website',
    images: ['https://nutrifitness.ch/images/brand/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['https://nutrifitness.ch/images/brand/logo.png'],
  },
};

export default function BoutiquePage() {
  return <BoutiqueClient />;
}
