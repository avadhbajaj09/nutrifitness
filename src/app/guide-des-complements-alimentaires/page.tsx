import React from 'react';
import type { Metadata } from 'next';
import EbookClient from './EbookClient';

export const metadata: Metadata = {
  title: 'Le Guide Ultime des Compléments Alimentaires (Ebook PDF) | NutriFitness.ch',
  description: '11 ans d\'expérience condensés en 66 pages. Conseils honnêtes, dosages optimaux, compléments utiles vs arnaques marketing. Téléchargement immédiat en PDF.',
  openGraph: {
    title: 'Le Guide Ultime des Compléments Alimentaires',
    description: '11 ans d\'expertise. Ce qui marche vraiment, sans bla-bla. 66 pages en téléchargement PDF immédiat.',
    images: ['/images/banners/mobile/imgi_10_guidebook.jpg']
  }
};

export default function EbookPage() {
  return <EbookClient />;
}
