import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CATEGORIES_DATA } from '@/lib/categories';
import { PRODUCTS } from '@/lib/catalog';
import { getCanonicalCategorySlug } from '@/lib/categories';
import { ChevronRight, Home, Sparkles, ArrowRight, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Toutes les Catégories de Nutrition Sportive | NutriFitness Suisse',
  description: 'Découvrez les 12 catégories de compléments alimentaires NutriFitness Genève : protéines, créatine, BCAA, gainers, vitamines, snacks et électrolytes.',
  alternates: {
    canonical: 'https://nutrifitness.ch/categorie/',
  },
};

export default function CategoryIndexPage() {
  // Compute product counts for each category
  const categoriesWithCounts = CATEGORIES_DATA.map(cat => {
    const count = PRODUCTS.filter(p => {
      if (cat.slug !== 'guides-ebooks' && (p.categorySlug === 'guides-ebooks' || p.id === 'prod-25430')) return false;
      return getCanonicalCategorySlug(p.categorySlug, p.name?.fr) === cat.slug;
    }).length;
    return { ...cat, count };
  });

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-8">
          <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Accueil</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          <span className="text-white font-bold">Catégories</span>
        </nav>

        {/* Hero Banner */}
        <div className="relative mb-12 py-10 px-6 sm:px-10 rounded-3xl bg-gradient-to-br from-[#171717] via-[#111111] to-[#0A0A0A] border border-white/10 shadow-2xl overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F80404]/10 border border-[#F80404]/30 text-[#F80404] text-[11px] font-black uppercase tracking-wider mb-4 font-heading">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Arborescence Officielle NutriFitness Suisse</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-heading leading-tight mb-4">
              Toutes nos Catégories de Nutrition Sportive
            </h1>

            <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl">
              Explorez nos 12 catégories certifiées, enrichies de guides d&apos;achat d&apos;experts, de comparatifs scientifiques et de conseils pratiques conformes aux normes suisses OSAV & DFI.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithCounts.map((cat) => (
            <div 
              key={cat.id}
              className="bg-[#141414] rounded-3xl p-6 sm:p-7 border border-white/10 hover:border-[#F80404]/50 transition-all flex flex-col justify-between group shadow-lg hover:shadow-2xl"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-20 h-20 rounded-2xl bg-black/40 border border-white/10 shrink-0 p-1 flex items-center justify-center group-hover:border-[#F80404]/40 transition-colors">
                    <Image 
                      src={cat.image} 
                      alt={`${cat.name} - NutriFitness`} 
                      fill 
                      className="object-contain p-1 filter drop-shadow-md group-hover:scale-110 transition-transform duration-300" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F80404]/10 text-[#F80404] border border-[#F80404]/20 text-[10px] font-black uppercase tracking-wider">
                        {cat.count} produit{cat.count > 1 ? 's' : ''}
                      </span>
                      <Layers className="w-4 h-4 text-white/30 group-hover:text-[#F80404] transition-colors" />
                    </div>
                    <h2 className="text-lg font-black uppercase text-white font-heading group-hover:text-[#F80404] transition-colors leading-snug">
                      <Link href={`/categorie/${cat.slug}/`}>
                        {cat.name}
                      </Link>
                    </h2>
                  </div>
                </div>

                <p className="text-xs text-white/60 line-clamp-2 mb-4 leading-relaxed">
                  {cat.intro[0]}
                </p>

                {/* Subcategories preview */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-1.5">
                    {cat.subcategories.slice(0, 3).map((sub, sIdx) => (
                      <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-lg bg-black/40 text-white/50 border border-white/5">
                        {sub}
                      </span>
                    ))}
                    {cat.subcategories.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-lg text-white/40">
                        +{cat.subcategories.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Link 
                href={`/categorie/${cat.slug}/`}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-[#F80404] hover:text-black text-white text-xs font-black uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 group-hover:scale-102"
              >
                <span>Découvrir la catégorie</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
