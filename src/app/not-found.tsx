import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES_DATA } from '@/lib/categories';
import { Search, Home, ArrowRight, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page introuvable (404) | NutriFitness.ch',
  description: 'La page que vous recherchez n’existe pas ou a été déplacée.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  const topCategories = CATEGORIES_DATA.slice(0, 6);

  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* 404 Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider mb-6 font-heading">
        <AlertCircle className="w-4 h-4" />
        Erreur 404
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white font-heading mb-4 leading-tight">
        Page <span className="text-[#F80404]">introuvable</span>
      </h1>

      {/* Helpful French Message */}
      <p className="text-sm sm:text-base text-white/70 max-w-lg mb-8 leading-relaxed">
        Désolé, la page que vous recherchez n&apos;existe pas, a été déplacée ou son URL est incorrecte.
        Utilisez la recherche ci-dessous ou explorez nos catégories phares.
      </p>

      {/* Search Form submitting to /boutique/?q= */}
      <form action="/boutique/" method="GET" className="w-full max-w-md relative mb-10">
        <input
          type="text"
          name="q"
          placeholder="Rechercher une protéine, créatine, marque..."
          className="w-full bg-[#141414] border border-white/20 rounded-full pl-5 pr-32 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#F80404] transition-colors shadow-inner"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase text-xs rounded-full transition-colors flex items-center gap-1.5"
          aria-label="Lancer la recherche"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Chercher</span>
        </button>
      </form>

      {/* Top 6 Product Categories */}
      <div className="w-full max-w-2xl mb-10">
        <p className="text-xs font-black uppercase tracking-wider text-white/50 font-heading mb-4">
          Catégories Populaires en Suisse
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {topCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorie/${cat.slug}/`}
              className="p-3.5 rounded-2xl bg-[#141414] hover:bg-[#1C1C1C] border border-white/10 hover:border-[#F80404]/50 transition-all text-left flex items-center justify-between group shadow-sm"
            >
              <span className="text-xs font-bold text-white group-hover:text-[#F80404] transition-colors truncate">
                {cat.name}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-[#F80404] group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
            </Link>
          ))}
        </div>
      </div>

      {/* Back to Homepage Button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-[#F80404] text-black font-black uppercase tracking-wider text-xs rounded-full transition-all shadow-md active:scale-95 font-heading"
        >
          <Home className="w-4 h-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>
      </div>
    </div>
  );
}
