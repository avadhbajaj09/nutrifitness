import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  CATEGORIES_DATA, 
  getCategoryBySlug, 
  getCanonicalCategorySlug,
  type CategoryData 
} from '@/lib/categories';
import { PRODUCTS } from '@/lib/catalog';
import CategoryProductsClient from './CategoryProductsClient';
import BlogFaqAccordion from '@/components/BlogFaqAccordion';
import { 
  ChevronRight, 
  Home, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  ArrowRight, 
  MapPin, 
  ExternalLink,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return CATEGORIES_DATA.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.slug);
  if (!category) {
    return {
      title: 'Catégorie introuvable | NutriFitness.ch',
    };
  }

  return {
    title: category.metaTitle,
    description: category.metaDescription,
    keywords: category.targetKeywords,
    alternates: {
      canonical: `https://nutrifitness.ch/categorie/${category.slug}/`,
    },
    openGraph: {
      title: category.metaTitle,
      description: category.metaDescription,
      url: `https://nutrifitness.ch/categorie/${category.slug}/`,
      siteName: 'NutriFitness.ch',
      locale: 'fr_CH',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: category.metaTitle,
      description: category.metaDescription,
    },
  };
}

export default function CategoryDetailPage({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  // Filter products belonging to this category
  const categoryProducts = PRODUCTS.filter((p) => {
    // Ebook has its own dedicated flow, only include in guides-ebooks
    if (category.slug !== 'guides-ebooks' && (p.categorySlug === 'guides-ebooks' || p.id === 'prod-25430')) {
      return false;
    }
    const mapped = getCanonicalCategorySlug(p.categorySlug, p.name?.fr);
    return mapped === category.slug;
  });

  // Schema.org CollectionPage + ItemList
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    headline: category.h1,
    description: category.metaDescription,
    url: `https://nutrifitness.ch/categorie/${category.slug}/`,
    publisher: {
      '@type': 'Organization',
      name: 'NutriFitness Genève',
      url: 'https://nutrifitness.ch',
      logo: 'https://nutrifitness.ch/images/brand/logo.png',
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: categoryProducts.length,
      itemListElement: categoryProducts.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `https://nutrifitness.ch/produit/${p.slug.fr}/`,
        name: p.name.fr,
      })),
    },
  };

  // Schema.org FAQPage (identical to displayed text for SEO/AEO compliance)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: category.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  // Schema.org BreadcrumbList
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
        name: 'Boutique',
        item: 'https://nutrifitness.ch/boutique/',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `https://nutrifitness.ch/categorie/${category.slug}/`,
      },
    ],
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white pt-6 pb-24">
      {/* Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
          <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Accueil</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-white/30" />
          <Link href="/boutique/" className="hover:text-white transition-colors">
            Boutique
          </Link>
          <ChevronRight className="w-3 h-3 text-white/30" />
          <span className="text-[#F80404] font-bold">{category.name}</span>
        </nav>

        {/* 1. Category Header & H1 */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full bg-[#F80404]/10 border border-[#F80404]/30 text-[#F80404] text-[10px] font-black uppercase tracking-wider font-heading">
              🇨🇭 Stock 100% Suisse · Expédié sous 24h
            </span>
            <span className="text-xs text-white/60 font-bold">
              {categoryProducts.length} produit{categoryProducts.length > 1 ? 's' : ''} disponibles
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-heading tracking-tight mb-4">
            {category.h1}
          </h1>

          {/* Subcategories Pills */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
              <span className="text-xs font-bold text-white/40 shrink-0 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Familles :
              </span>
              {category.subcategories.map((sub, sIdx) => (
                <span 
                  key={sIdx}
                  className="shrink-0 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/80"
                >
                  {sub}
                </span>
              ))}
            </div>
          )}

          {/* 2. Introduction (Displayed ABOVE the products, 150-250 words) with Product Packshot */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 shadow-xl flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-between">
            <div className="flex-1 space-y-3.5 text-sm sm:text-base text-white/80 leading-relaxed">
              {category.intro.map((p, pIdx) => (
                <p key={pIdx}>
                  {p}
                </p>
              ))}
              
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-white/60">
                <span className="flex items-center gap-1.5 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#95d600]" />
                  Conforme aux normes suisses OSAV & DFI
                </span>
                <span className="flex items-center gap-1.5 text-white">
                  <MapPin className="w-4 h-4 text-[#F80404]" />
                  Conseils & retrait immédiat : 34 Rue des Pâquis, 1201 Genève
                </span>
              </div>
            </div>

            {/* Representative Category Product Packshot */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0 rounded-2xl bg-black/40 border border-white/10 p-2 flex items-center justify-center shadow-inner">
              <Image 
                src={category.image} 
                alt={`${category.name} - Compléments Alimentaires NutriFitness Suisse`} 
                fill 
                priority
                className="object-contain p-2 filter drop-shadow-2xl" 
              />
            </div>
          </div>
        </header>

        {/* 3. Product Grid with Client-Side Filters & Sorting */}
        <section className="my-10" aria-label={`Produits de la catégorie ${category.name}`}>
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
            <h2 className="text-lg font-black uppercase text-white font-heading tracking-wide">
              Catalogue : {category.name}
            </h2>
            <span className="text-xs font-bold text-white/50">
              TVA suisse 2.6% incluse · Pas de frais de douane
            </span>
          </div>

          <CategoryProductsClient 
            products={categoryProducts} 
            categoryName={category.name} 
          />
        </section>

        {/* 4. Buying Guide (Guide d'achat sous la grille) */}
        {category.buyingGuide && category.buyingGuide.length > 0 && (
          <section className="my-14 p-6 sm:p-10 rounded-3xl bg-[#111111] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-[#F80404]/10 border border-[#F80404]/20 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-[#F80404]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#F80404] font-heading">
                  Conseils d&apos;Experts NutriFitness Genève
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-heading">
                  Guide d&apos;achat & Recommandations : {category.name}
                </h2>
              </div>
            </div>

            <div className="space-y-8">
              {category.buyingGuide.map((guide, gIdx) => (
                <div key={gIdx} className="space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                    {guide.title}
                  </h3>

                  {guide.bulletPoints && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {guide.bulletPoints.map((bp, bpIdx) => (
                        <div key={bpIdx} className="p-4 rounded-2xl bg-black/40 border border-white/5">
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#F80404] mb-1">
                            {bp.label}
                          </h4>
                          <p className="text-xs text-white/70 leading-relaxed">
                            {bp.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {guide.steps && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {guide.steps.map((st, stIdx) => (
                        <div key={stIdx} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                          <div>
                            <span className="w-6 h-6 rounded-full bg-[#F80404] text-black text-xs font-black flex items-center justify-center mb-2">
                              {stIdx + 1}
                            </span>
                            <h4 className="text-xs font-bold text-white mb-1.5">
                              {st.title}
                            </h4>
                            <p className="text-[11px] text-white/60 leading-relaxed">
                              {st.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {guide.paragraphs && (
                    <div className="space-y-2 text-xs sm:text-sm text-white/80 leading-relaxed">
                      {guide.paragraphs.map((para, paraIdx) => (
                        <p key={paraIdx}>{para}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Complete Interactive FAQ (Visible + FAQPage schema) */}
        <div className="my-10">
          <BlogFaqAccordion faqs={category.faqs} title={`FAQ : ${category.name}`} />
        </div>

        {/* 6. Internal Cross-Linking & Featured Guides */}
        {category.internalLinks && category.internalLinks.length > 0 && (
          <section className="my-10 p-6 rounded-2xl bg-[#141414] border border-white/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#F80404] font-heading mb-4">
              Explorer les catégories complémentaires & guides
            </h3>
            <div className="flex flex-wrap gap-3">
              {category.internalLinks.map((link, lIdx) => (
                <Link
                  key={lIdx}
                  href={link.href}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-[#F80404] hover:text-black text-white text-xs font-bold transition-all border border-white/10"
                >
                  <span>{link.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 7. External Scientific Sources */}
        {category.externalSources && category.externalSources.length > 0 && (
          <div className="my-8 p-5 rounded-2xl bg-black/40 border border-white/10 text-xs">
            <span className="font-bold text-white/70 block mb-2">
              Références & Autorités de Santé Consultées :
            </span>
            <div className="flex flex-wrap gap-4">
              {category.externalSources.map((source, sIdx) => (
                <a
                  key={sIdx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-[#F80404] underline flex items-center gap-1 transition-colors"
                >
                  <span>{source.title}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 8. Geneva Store & Coaching Banner */}
        <div className="my-12 p-8 rounded-3xl bg-gradient-to-r from-[#171717] via-[#1A0A0A] to-[#171717] border border-white/15 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-[#F80404] font-heading">
              <MapPin className="w-3.5 h-3.5" />
              <span>Boutique Physique à Genève & Click & Collect 2h</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-heading">
              Besoin d&apos;aide pour choisir vos {category.name} ?
            </h3>
            <p className="text-xs text-white/60 max-w-lg">
              Venez tester les saveurs et demander conseil à nos préparateurs physiques au 34 Rue des Pâquis, 1201 Genève (5 min de Cornavin).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link 
              href="/coaching-nutritionnel-personnalise/"
              className="px-5 py-3 rounded-xl bg-[#F80404] hover:bg-[#FF3D00] text-black font-black text-xs uppercase tracking-wider transition-all"
            >
              Bilan Coaching Gratuit
            </Link>
            <Link 
              href="/boutique-geneve/"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10"
            >
              Voir la Boutique
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
