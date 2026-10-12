import React from 'react';
import type { Metadata } from 'next';
import EbookClient from './EbookClient';
import { EBOOK_ITEM } from '@/lib/ebook';

export const metadata: Metadata = {
  title: 'Le Guide Ultime des Compléments Alimentaires (Ebook PDF) | NutriFitness.ch',
  description: '11 ans d\'expérience condensés en 66 pages. Conseils honnêtes, dosages optimaux, compléments utiles vs arnaques marketing. Téléchargement immédiat en PDF.',
  alternates: {
    canonical: 'https://nutrifitness.ch/guide-des-complements-alimentaires/',
  },
  openGraph: {
    title: 'Le Guide Ultime des Compléments Alimentaires',
    description: '11 ans d\'expertise. Ce qui marche vraiment, sans bla-bla. 66 pages en téléchargement PDF immédiat.',
    images: ['/images/banners/mobile/imgi_10_guidebook.jpg']
  }
};

export default function EbookPage() {
  const bookSchema = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': 'https://nutrifitness.ch/guide-des-complements-alimentaires/#ebook',
    name: 'Le Guide Ultime des Compléments Alimentaires',
    author: {
      '@type': 'Organization',
      name: 'Équipe NutriFitness Suisse',
    },
    numberOfPages: 66,
    bookFormat: 'https://schema.org/EBook',
    inLanguage: 'fr',
    image: 'https://nutrifitness.ch/images/store/e-book.webp',
    offers: {
      '@type': 'Offer',
      price: EBOOK_ITEM.priceChf.toFixed(2),
      priceCurrency: 'CHF',
      availability: 'https://schema.org/InStock',
      url: 'https://nutrifitness.ch/guide-des-complements-alimentaires/',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
      />
      <EbookClient />
    </>
  );
}
