'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { PRODUCTS } from '@/lib/catalog';
import { formatChf } from '@/lib/tax';
import { getLocalized } from '@/lib/types';
import { searchProducts } from '@/lib/search';
import { trackSearch } from '@/lib/analytics';

export default function SearchOverlay() {
  const router = useRouter();
  const { isSearchOpen, closeSearch, isProductVisible, locale } = useStore();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches on mount (guarded)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nf_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch (_) {}
  }, []);

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    try {
      const next = [clean, ...recentSearches.filter(s => s.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
      setRecentSearches(next);
      localStorage.setItem('nf_recent_searches', JSON.stringify(next));
    } catch (_) {}
  };

  const clearRecentSearches = () => {
    try {
      localStorage.removeItem('nf_recent_searches');
      setRecentSearches([]);
    } catch (_) {}
  };

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

  const trimmedQuery = query.trim();
  const visibleProducts = PRODUCTS.filter(p => isProductVisible(p));
  const matchedProducts = trimmedQuery
    ? searchProducts(visibleProducts, trimmedQuery, locale || 'fr')
    : visibleProducts;

  const results = trimmedQuery ? matchedProducts.slice(0, 15) : visibleProducts.slice(0, 9);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmedQuery) {
      saveRecentSearch(trimmedQuery);
      trackSearch(trimmedQuery);
      closeSearch();
      router.push(`/boutique?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const POPULAR_SEARCHES = ['Créatine', 'Whey', 'Magnésium', 'Zinc', 'Pre-Workout', 'Isolate'];

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[110] flex flex-col justify-start items-center p-3 sm:p-6 md:p-8 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche de compléments"
    >
      <div className="w-full max-w-4xl pt-2 sm:pt-6 md:pt-10">
        {/* Search Bar Form Row */}
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2 sm:gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-white/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <input 
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit, une marque..."
              className="w-full min-h-[48px] sm:min-h-[58px] pl-11 sm:pl-14 pr-10 sm:pr-12 text-sm sm:text-base font-medium bg-[#141414] border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none transition-all shadow-2xl"
              autoComplete="off"
            />

            {query && (
              <button 
                type="button" 
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center text-xs"
                aria-label="Effacer la recherche"
              >
                ✕
              </button>
            )}
          </div>

          {/* Close button with explicit 'Fermer' text on mobile + icon on desktop */}
          <button 
            type="button" 
            onClick={closeSearch}
            className="min-h-[48px] sm:min-h-[58px] px-3.5 sm:px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1.5 shrink-0 transition-colors text-xs font-bold"
            aria-label="Fermer la recherche"
          >
            <span className="md:hidden">Fermer</span>
            <svg className="w-5 h-5 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>

        {/* Recent Searches (if available and query is empty) */}
        {!trimmedQuery && recentSearches.length > 0 && (
          <div className="mt-3.5 pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Recherches récentes :</span>
              <button 
                type="button" 
                onClick={clearRecentSearches}
                className="text-[10px] text-white/40 hover:text-[#F80404] transition-colors"
              >
                Effacer
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {recentSearches.map(term => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    saveRecentSearch(term);
                  }}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-white/90 text-xs font-medium rounded-lg border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-white/40 text-[10px]">⏱</span>
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Popular Searches (créatine, whey, magnésium, zinc) */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-1">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Populaires :</span>
          {POPULAR_SEARCHES.map(tag => (
            <button 
              key={tag}
              type="button" 
              onClick={() => {
                setQuery(tag);
                saveRecentSearch(tag);
              }}
              className="px-3 py-1 bg-white/5 hover:bg-[#F80404] hover:text-black text-white/80 text-xs font-bold rounded-lg border border-white/10 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="mt-6 max-h-[60vh] overflow-y-auto pr-2">
          <div className="text-xs font-bold text-white/50 mb-3 flex items-center justify-between">
            <span>{trimmedQuery ? `Résultats pour "${query}"` : 'Produits populaires en Suisse'}</span>
            <span className="text-[#F80404] font-black">{matchedProducts.length} produit(s)</span>
          </div>

          {matchedProducts.length === 0 ? (
            <div className="py-12 text-center text-white/50 space-y-2">
              <p className="text-sm font-bold text-white">Aucun produit ne correspond à &quot;{query}&quot;</p>
              <p className="text-xs">Essayez un autre mot-clé comme &quot;whey&quot;, &quot;creatine&quot;, &quot;booster&quot; ou &quot;vitamines&quot;.</p>
            </div>
          ) : (
            <>
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
                          <span className="text-[10px] text-emerald-400 font-bold">En stock (Suisse)</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {trimmedQuery && matchedProducts.length > results.length && (
                <div className="mt-4 pt-2 text-center">
                  <Link
                    href={`/boutique?q=${encodeURIComponent(trimmedQuery)}`}
                    onClick={closeSearch}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-[#F80404] text-white hover:text-black text-xs font-bold transition-all"
                  >
                    <span>Voir les {matchedProducts.length} résultats dans la boutique</span>
                    <span>→</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
