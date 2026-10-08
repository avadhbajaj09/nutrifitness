'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { PRODUCTS } from '@/lib/catalog';
import { formatChf } from '@/lib/tax';
import { getLocalized } from '@/lib/types';

export default function SearchOverlay() {
  const { isSearchOpen, closeSearch, isProductVisible } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeSearch]);

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();
  const visibleProducts = PRODUCTS.filter(p => isProductVisible(p));
  const results = q 
    ? visibleProducts.filter(p => 
        (p.name?.fr && p.name.fr.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        p.categorySlug.toLowerCase().includes(q)
      ).slice(0, 12)
    : visibleProducts.slice(0, 9);

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[110] flex flex-col justify-start items-center p-4 sm:p-8 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche de compléments"
    >
      <div className="w-full max-w-4xl pt-6 sm:pt-12">
        {/* Search Bar Row */}
        <div className="relative flex items-center gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <input 
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par produit, marque ou objectif (ex: Isolate, Créatine, BigMan)..."
              className="w-full min-h-[58px] pl-14 pr-12 text-sm sm:text-base font-medium bg-[#141414] border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none transition-all shadow-2xl"
              autoComplete="off"
            />

            {query && (
              <button 
                type="button" 
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 text-xs"
                aria-label="Effacer la recherche"
              >
                ✕
              </button>
            )}
          </div>

          <button 
            type="button" 
            onClick={closeSearch}
            className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shrink-0 transition-colors"
            aria-label="Fermer la recherche"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Search Suggestions */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Populaires :</span>
          {['Whey Isolate', 'Creapure®', 'Pre-Workout Booster', 'BigMan', 'Vitamines & Zinc'].map(tag => (
            <button 
              key={tag}
              type="button" 
              onClick={() => setQuery(tag)}
              className="px-3 py-1 bg-white/5 hover:bg-[#F80404] hover:text-black text-white/80 text-xs font-bold rounded-lg border border-white/10 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="mt-6 max-h-[60vh] overflow-y-auto pr-2">
          <div className="text-xs font-bold text-white/50 mb-3 flex items-center justify-between">
            <span>{q ? `Résultats pour "${query}"` : 'Produits populaires en Suisse'}</span>
            <span className="text-[#F80404]">{results.length} produit(s)</span>
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center text-white/50 space-y-2">
              <p className="text-sm font-bold text-white">Aucun produit ne correspond à &quot;{query}&quot;</p>
              <p className="text-xs">Essayez un autre mot-clé comme &quot;whey&quot;, &quot;creatine&quot; ou &quot;vitamine&quot;.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map(item => {
                const slug = getLocalized(item.slug);
                const name = getLocalized(item.name);
                const img = item.images?.[0]?.src || '/images/placeholder.webp';

                return (
                  <Link 
                    key={item.id}
                    href={`/produit/${slug}/`}
                    onClick={closeSearch}
                    className="flex items-center gap-3 p-3 bg-[#181818] hover:bg-[#202020] rounded-xl border border-white/10 hover:border-[#F80404]/50 transition-all group"
                  >
                    <div className="relative w-14 h-14 bg-black/40 rounded-lg p-1.5 shrink-0 flex items-center justify-center border border-white/5">
                      <Image src={img} alt={name} fill className="object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform p-1" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase text-[#F80404] tracking-wider truncate">{item.brand}</p>
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-[#F80404] transition-colors">{name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-black text-white">{formatChf(item.priceChf)}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">En stock 24h</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
