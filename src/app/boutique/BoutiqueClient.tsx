'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import BoutiqueFAQ from '@/components/BoutiqueFAQ';
import { PRODUCTS, CATEGORIES } from '@/lib/catalog';
import { useStore } from '@/context/StoreContext';
import { isProductDeliverableToCountry } from '@/lib/delivery/defaults';
import { trackViewItemList } from '@/lib/analytics';
import { getLocalized } from '@/lib/types';
import { searchProducts, normalizeSearchString } from '@/lib/search';

function ShopContent() {
  const searchParams = useSearchParams();
  const { countryCode, isProductVisible, currency, getProductPricing, locale } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [swissOnly, setSwissOnly] = useState<boolean>(false);
  const [deliverableOnly, setDeliverableOnly] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>('featured');

  useEffect(() => {
    const brandParam = searchParams.get('brand');
    const catParam = searchParams.get('cat');
    const qParam = searchParams.get('q');
    if (brandParam) {
      setSelectedBrand(brandParam);
    }
    if (catParam) {
      setSelectedCategory(catParam);
    }
    if (qParam !== null) {
      setSearchQuery(qParam.trim());
    }
  }, [searchParams]);

  const brands = useMemo(() => {
    return Array.from(new Set(PRODUCTS.filter(p => isProductVisible(p)).map(p => p.brand))).sort();
  }, [isProductVisible]);

  const filteredProducts = useMemo(() => {
    let baseList = PRODUCTS.filter(p => {
      // Exclude deleted or draft products
      if (!isProductVisible(p)) return false;
      // Ebook has its own dedicated landing page at /guide-des-complements-alimentaires/
      if (p.categorySlug === 'guides-ebooks' || p.id === 'prod-25430') return false;
      if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) return false;
      if (selectedBrand !== 'all') {
        const pBrand = normalizeSearchString(p.brand || '');
        const sBrand = normalizeSearchString(selectedBrand || '');
        if (pBrand !== sBrand && !pBrand.includes(sBrand) && !sBrand.includes(pBrand)) {
          return false;
        }
      }
      if (swissOnly && !p.isSwissOrigin) return false;
      return true;
    });

    if (searchQuery.trim()) {
      baseList = searchProducts(baseList, searchQuery, locale || 'fr');
    }

    if (sortBy === 'price-asc') return [...baseList].sort((a, b) => a.priceChf - b.priceChf);
    if (sortBy === 'price-desc') return [...baseList].sort((a, b) => b.priceChf - a.priceChf);
    if (sortBy === 'name-asc') return [...baseList].sort((a, b) => (a.name?.fr || '').localeCompare(b.name?.fr || ''));

    return baseList;
  }, [selectedCategory, selectedBrand, searchQuery, swissOnly, deliverableOnly, sortBy, isProductVisible, locale]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSearchQuery('');
    setSwissOnly(false);
    setDeliverableOnly(false);
    setSortBy('featured');
  };

  useEffect(() => {
    if (filteredProducts.length === 0) return;
    const items = filteredProducts.slice(0, 30).map(p => {
      const pricing = getProductPricing(p);
      return {
        item_id: p.id,
        item_name: (typeof p.name === 'object' ? p.name?.fr : p.name) || p.id,
        item_brand: p.brand || 'NutriFitness',
        item_category: p.categorySlug || 'Boutique',
        price: pricing.price,
        quantity: 1,
      };
    });
    trackViewItemList({
      item_list_id: selectedCategory !== 'all' ? selectedCategory : 'boutique_all',
      item_list_name: selectedCategory !== 'all' ? `Catégorie: ${selectedCategory}` : 'Boutique Complète',
      items,
      currency,
    });
  }, [selectedCategory, selectedBrand, currency]);

  return (
    <div className="py-4">
      {/* Header */}
      <div className="py-6 mb-6 border-b border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-[#F80404]/10 border border-[#F80404]/30 text-[#F80404] text-[10px] font-black uppercase tracking-wider rounded-full mb-2">
            🇨🇭 100% Stock en Suisse · Expédié sous 24h
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase font-heading">
            Boutique Nutrition Sportive
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-2xl">
            Retrouvez les meilleures marques certifiées. Produits dédouanés et expédiés directement depuis notre entrepôt à Genève ou disponibles au retrait Rue des Pâquis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {searchQuery && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-xs text-white border border-white/20">
              <span>Recherche : &ldquo;{searchQuery}&rdquo;</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#F80404] hover:text-white font-bold"
                aria-label="Effacer la recherche"
              >
                ✕
              </button>
            </div>
          )}
          {(selectedBrand !== 'all' || selectedCategory !== 'all' || swissOnly || searchQuery) && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#F80404] hover:underline font-bold px-3 py-1.5 rounded-lg bg-[#F80404]/10 border border-[#F80404]/30"
            >
              Effacer filtres ✕
            </button>
          )}
          <span className="text-xs font-bold text-white/50">
            {filteredProducts.length} compléments
          </span>
        </div>
      </div>

      {/* Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Filter Facets */}
        <aside className="lg:col-span-3 bg-[#141414] rounded-2xl border border-white/10 p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-wider text-white font-heading">
              Filtres & Affinage
            </h3>
            <button 
              type="button" 
              onClick={clearFilters}
              className="text-[11px] text-[#F80404] hover:underline font-bold"
            >
              Réinitialiser
            </button>
          </div>

          {/* Active Brand Indicator */}
          {selectedBrand !== 'all' && (
            <div className="p-3 bg-[#F80404]/10 border border-[#F80404]/30 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-white">Marque : <span className="text-[#F80404]">{selectedBrand}</span></span>
              <button onClick={() => setSelectedBrand('all')} className="text-white/60 hover:text-white font-black">✕</button>
            </div>
          )}

          {/* Category Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 mb-3 font-heading">
              Catégories
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center gap-2 text-xs text-white/80 hover:text-white cursor-pointer">
                <input 
                  type="radio" 
                  name="shop-cat" 
                  checked={selectedCategory === 'all'} 
                  onChange={() => setSelectedCategory('all')}
                  className="text-[#F80404] focus:ring-[#F80404]" 
                />
                <span>Toutes les catégories</span>
              </label>
              {CATEGORIES.filter(c => c.id !== 'guides-ebooks').map(cat => (
                <label key={cat.id} className="flex items-center gap-2 text-xs text-white/70 hover:text-white cursor-pointer">
                  <input 
                    type="radio" 
                    name="shop-cat" 
                    checked={selectedCategory === cat.slug.fr} 
                    onChange={() => setSelectedCategory(cat.slug.fr)}
                    className="text-[#F80404] focus:ring-[#F80404]" 
                  />
                  <span className="truncate">{cat.name.fr}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 mb-3 font-heading">
              Marques
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <label className="flex items-center gap-2 text-xs text-white/80 hover:text-white cursor-pointer">
                <input 
                  type="radio" 
                  name="shop-brand" 
                  checked={selectedBrand === 'all'} 
                  onChange={() => setSelectedBrand('all')}
                  className="text-[#F80404] focus:ring-[#F80404]" 
                />
                <span>Toutes les marques</span>
              </label>
              {brands.map(b => (
                <label key={b} className="flex items-center gap-2 text-xs text-white/70 hover:text-white cursor-pointer">
                  <input 
                    type="radio" 
                    name="shop-brand" 
                    checked={selectedBrand.toLowerCase() === b.toLowerCase()} 
                    onChange={() => setSelectedBrand(b)}
                    className="text-[#F80404] focus:ring-[#F80404]" 
                  />
                  <span className="truncate">{b}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Deliverable to Selected Country Filter */}
          <div className="pt-4 border-t border-white/10">
            <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
              <input 
                type="checkbox" 
                checked={deliverableOnly} 
                onChange={(e) => setDeliverableOnly(e.target.checked)}
                className="rounded text-[#F80404] focus:ring-[#F80404]" 
              />
              <span className="flex items-center gap-1.5">
                <span>🚚</span>
                <span>Livrable en {countryCode || 'CH'}</span>
              </span>
            </label>
          </div>

          {/* Swiss Origin Filter */}
          <div className="pt-4 border-t border-white/10">
            <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
              <input 
                type="checkbox" 
                checked={swissOnly} 
                onChange={(e) => setSwissOnly(e.target.checked)}
                className="rounded text-[#F80404] focus:ring-[#F80404]" 
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-[#D52B1E] inline-block" />
                Origine Suisse uniquement
              </span>
            </label>
          </div>

          {/* Trust box */}
          <div className="pt-4 border-t border-white/10 bg-white/5 rounded-xl p-3 text-[11px] text-white/60 space-y-1">
            <p className="font-bold text-white">🇨🇭 Expédition directe</p>
            <p>PostPac Priority 24h ou retrait Click & Collect 2h à Genève.</p>
          </div>
        </aside>

        {/* Right Side: Sort Bar + Product Grid */}
        <div className="lg:col-span-9 space-y-6">
          {/* Search & Sort Bar */}
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Direct Search Input */}
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, marque, goût (ex: Isolate, Créatine, ABE)..."
                className="w-full bg-[#1C1C1C] border border-white/15 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-bold"
                  aria-label="Effacer la recherche"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60 font-medium whitespace-nowrap">Trier par :</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#1C1C1C] border border-white/15 rounded-xl text-xs text-white px-3 py-2 focus:border-[#F80404] focus:outline-none"
                >
                  <option value="featured">Populaires & Bestsellers</option>
                  <option value="price-asc">Prix : Croissant</option>
                  <option value="price-desc">Prix : Décroissant</option>
                  <option value="name-asc">Nom : A - Z</option>
                </select>
              </div>

              <div className="text-xs text-white/50 whitespace-nowrap font-medium">
                {filteredProducts.length} produit(s)
              </div>
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-[#141414] rounded-2xl border border-white/10 p-8">
              <p className="text-white text-base font-bold mb-2">Aucun produit ne correspond à ces critères</p>
              <p className="text-xs text-white/60 mb-6">Essayez de réinitialiser vos filtres de catégorie ou de marque.</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-[#F80404] text-black font-black uppercase text-xs rounded-xl"
              >
                Afficher tous les produits
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Boutique FAQ Section */}
      <BoutiqueFAQ />
    </div>
  );
}

export default function BoutiqueClient() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-white/50">Chargement de la boutique...</div>}>
      <ShopContent />
    </Suspense>
  );
}
