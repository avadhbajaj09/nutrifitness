import React from 'react';
import type { Metadata } from 'next';
import BoutiqueClient from './BoutiqueClient';
import { formatMetaTitle, formatMetaDescription } from '@/lib/seo';
import { ALL_BRANDS } from '@/lib/brands';

export const revalidate = 60;

interface BoutiquePageProps {
  searchParams?: {
    brand?: string;
    q?: string;
    orderby?: string;
    page?: string;
  };
}

export async function generateMetadata({ searchParams }: BoutiquePageProps): Promise<Metadata> {
  const brandQuery = (searchParams?.brand || '').trim().toLowerCase();
  const matchedBrand = brandQuery
    ? ALL_BRANDS.find(
        (b) =>
          b.slug.toLowerCase() === brandQuery ||
          b.name.toLowerCase() === brandQuery ||
          b.displayName.toLowerCase() === brandQuery
      )
    : undefined;

  const canonical = matchedBrand
    ? `https://nutrifitness.ch/marque/${matchedBrand.slug}/`
    : 'https://nutrifitness.ch/boutique/';

  const title = formatMetaTitle(
    matchedBrand
      ? `${matchedBrand.displayName} Suisse | NutriFitness.ch`
      : 'Boutique Nutrition Sportive & Protéines Suisse | NutriFitness.ch'
  );
  const description = formatMetaDescription(
    matchedBrand
      ? `Tous les produits ${matchedBrand.displayName} en stock en Suisse chez NutriFitness Genève. Livraison 1-2 jours ou retrait Rue des Pâquis.`
      : 'Tous nos compléments alimentaires et protéines en stock en Suisse. Whey isolate, créatine, pré-workouts. Livraison 1-2 jours ou retrait Genève.'
  );

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'NutriFitness.ch',
      locale: 'fr_CH',
      type: 'website',
      images: [matchedBrand?.logo || 'https://nutrifitness.ch/images/brand/logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [matchedBrand?.logo || 'https://nutrifitness.ch/images/brand/logo.png'],
    },
  };
}

export default function BoutiquePage() {
  return <BoutiqueClient />;
}
