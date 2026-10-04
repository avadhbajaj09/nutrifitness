import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog';
import BlogListClient from './BlogListClient';
import { ChevronRight, Home, Sparkles, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog Nutrition Sportive & Guides d\'Experts | NutriFitness Genève',
  description: 'Guides d\'experts, analyses Creapure, posologies whey, BCAA et récupération sportive. Tous nos conseils nutrition validés scientifiquement à Genève et en Suisse.',
  alternates: {
    canonical: 'https://nutrifitness.ch/blog/',
  },
  openGraph: {
    title: 'Blog Nutrition Sportive & Guides d\'Experts | NutriFitness Genève',
    description: 'Guides complets, méta-analyses ISSN et conseils pratiques rédigés par les coachs NutriFitness Genève.',
    url: 'https://nutrifitness.ch/blog/',
    siteName: 'NutriFitness.ch',
    locale: 'fr_CH',
    type: 'website',
  },
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  // Schema.org CollectionPage & ItemList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Dossiers & Guides de Nutrition Sportive NutriFitness',
    description: 'Guides d\'experts, analyses Creapure, posologies whey, BCAA et récupération sportive en Suisse.',
    url: 'https://nutrifitness.ch/blog/',
    publisher: {
      '@type': 'Organization',
      name: 'NutriFitness Genève',
      url: 'https://nutrifitness.ch',
      logo: 'https://nutrifitness.ch/images/brand/logo.png',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `https://nutrifitness.ch/blog/${post.slug}/`,
        name: post.title,
      })),
    },
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white pt-6 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-8">
          <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Accueil</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          <span className="text-white font-bold">Blog & Guides</span>
        </nav>

        {/* Hero Header */}
        <div className="relative mb-12 py-10 px-6 sm:px-10 rounded-3xl bg-gradient-to-br from-[#171717] via-[#111111] to-[#0A0A0A] border border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#F80404]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F80404]/10 border border-[#F80404]/30 text-[#F80404] text-[11px] font-black uppercase tracking-wider mb-4 font-heading">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dossiers d&apos;Experts & Analyses Scientifiques</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-heading leading-tight mb-4">
              Guides & Conseils en Nutrition Sportive
            </h1>

            <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl">
              Retrouvez nos 20 dossiers complets rédigés par nos préparateurs physiques à Genève. Posologies optimales, méta-analyses ISSN, choix des matières premières et conformité aux normes suisses (OSAV).
            </p>
          </div>
        </div>

        {/* Client-side search, categories, and articles */}
        <BlogListClient posts={posts} />
      </div>
    </div>
  );
}
