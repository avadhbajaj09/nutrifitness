import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ALL_BRANDS, getBrandBySlug } from '@/lib/brands';
import { PRODUCTS } from '@/lib/catalog';
import { getHiddenProductSlugs } from '@/lib/hiddenProducts';
import { formatMetaTitle, formatMetaDescription } from '@/lib/seo';
import BrandProductsClient from './BrandProductsClient';
import {
  Award,
  ShieldCheck,
  Truck,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  FolderOpen
} from 'lucide-react';

interface BrandPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return ALL_BRANDS.map((brand) => ({
    slug: brand.slug,
  }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const brand = getBrandBySlug(params.slug);
  if (!brand) {
    return {
      title: 'Marque introuvable | NutriFitness.ch',
    };
  }

  const title = formatMetaTitle(brand.metaTitle);
  const description = formatMetaDescription(brand.metaDescription);

  return {
    title,
    description,
    alternates: {
      canonical: `https://nutrifitness.ch/marque/${brand.slug}/`,
    },
    robots: brand.indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `https://nutrifitness.ch/marque/${brand.slug}/`,
      siteName: 'NutriFitness.ch',
      locale: 'fr_CH',
      type: 'website',
      images: [
        {
          url: brand.logo,
          alt: `Logo officiel marque ${brand.displayName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [brand.logo],
    },
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const brand = getBrandBySlug(params.slug);
  if (!brand) {
    notFound();
  }

  const hiddenSlugs = await getHiddenProductSlugs();
  const brandProducts = PRODUCTS.filter((p) => {
    const slug = (p.slug?.fr || '').toLowerCase().trim();
    const id = p.id || '';
    if (hiddenSlugs.has(slug) || hiddenSlugs.has(id)) return false;
    if (brand.slug === 'nutrifitness') return p.brand === 'NutriFitness' || p.brand === 'Nutrifit';
    if (brand.slug === 'bigs') return p.brand === 'Bigs Supplements' || p.brand === 'Big';
    return p.brand === brand.name || p.brand.toLowerCase() === brand.name.toLowerCase();
  });

  // Schema: Brand
  const brandSchema = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brand.displayName,
    logo: `https://nutrifitness.ch${brand.logo}`,
    url: `https://nutrifitness.ch/marque/${brand.slug}/`,
  };

  // Schema: CollectionPage with ItemList
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: brand.h1,
    headline: brand.h1,
    description: brand.metaDescription,
    url: `https://nutrifitness.ch/marque/${brand.slug}/`,
    publisher: {
      '@type': 'Organization',
      name: 'NutriFitness Genève',
      url: 'https://nutrifitness.ch',
      logo: 'https://nutrifitness.ch/images/brand/logo.png',
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: brandProducts.length,
      itemListElement: brandProducts.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `https://nutrifitness.ch/produit/${p.slug.fr}/`,
        name: p.name.fr,
      })),
    },
  };

  // Schema: BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://nutrifitness.ch/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Marques',
        item: 'https://nutrifitness.ch/marques/',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: brand.displayName,
        item: `https://nutrifitness.ch/marque/${brand.slug}/`,
      },
    ],
  };

  // Schema: FAQPage
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: brand.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">
          Accueil
        </Link>
        <ChevronRight className="w-3 h-3 text-white/30" />
        <Link href="/marques/" className="hover:text-white transition-colors">
          Marques
        </Link>
        <ChevronRight className="w-3 h-3 text-white/30" />
        <span className="text-[#F80404] font-bold">{brand.displayName}</span>
      </nav>

      {/* Hero Header */}
      <header className="mb-12 p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-black via-[#141414] to-black border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-10">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-black/60 rounded-3xl p-4 border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
            <Image
              src={brand.logo}
              alt={`Logo officiel marque ${brand.displayName}`}
              fill
              className="object-contain p-3 filter brightness-110"
              priority
            />
          </div>

          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-[11px] font-black uppercase tracking-wider font-heading">
                <Award className="w-3.5 h-3.5" />
                Distributeur Officiel en Suisse
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#95d600]/10 border border-[#95d600]/25 text-[#95d600] text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Normes OSAV / DFI
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px]">
                <Truck className="w-3.5 h-3.5" />
                Stock à Genève · 24h
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black uppercase text-white font-heading tracking-tight leading-tight">
              {brand.h1}
            </h1>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-3xl">
              {brand.intro}
            </p>
          </div>
        </div>
      </header>

      {/* Product Grid Section */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F80404] font-heading block">
              Catalogue Disponible
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-heading">
              Produits {brand.displayName}
            </h2>
          </div>
          <span className="text-xs text-white/50 hidden sm:inline">
            TVA suisse 2.6% incluse · Zéro frais de douane
          </span>
        </div>

        <BrandProductsClient products={brandProducts} brandName={brand.displayName} />
      </section>

      {/* Relevant Categories and Guides */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
        {/* Categories */}
        {brand.relevantCategories && brand.relevantCategories.length > 0 && (
          <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 shadow-lg">
            <div className="flex items-center gap-2.5 mb-4 text-[#F80404]">
              <FolderOpen className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white font-heading">
                Catégories Associées
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {brand.relevantCategories.map((cat, i) => (
                <Link
                  key={i}
                  href={cat.href}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#F80404] hover:text-black border border-white/10 text-xs font-bold text-white transition-all"
                >
                  {cat.name} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Guides */}
        {brand.relevantGuides && brand.relevantGuides.length > 0 && (
          <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 shadow-lg">
            <div className="flex items-center gap-2.5 mb-4 text-[#F80404]">
              <BookOpen className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white font-heading">
                Guides & Dossiers Nutrition
              </h3>
            </div>
            <div className="space-y-2">
              {brand.relevantGuides.map((guide, i) => (
                <Link
                  key={i}
                  href={guide.href}
                  className="block p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/80 hover:text-white transition-colors"
                >
                  📖 {guide.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Brand FAQ */}
      {brand.faqs && brand.faqs.length > 0 && (
        <section className="mb-14 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
              FAQ {brand.displayName}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
              Questions Fréquentes sur {brand.displayName}
            </h2>
          </div>

          <div className="space-y-3">
            {brand.faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-[#141414] rounded-2xl border border-white/10 p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer"
              >
                <summary className="flex justify-between items-center text-xs sm:text-sm font-bold text-white group-open:text-[#F80404] transition-colors">
                  <span>{faq.q}</span>
                  <span className="text-lg transition-transform group-open:rotate-45 shrink-0 ml-3">+</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-4 text-xs font-bold">
        <Link
          href="/marques/"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Toutes les marques</span>
        </Link>
        <Link href="/boutique/" className="text-[#F80404] hover:underline">
          Parcourir toute la boutique →
        </Link>
      </div>
    </div>
  );
}
