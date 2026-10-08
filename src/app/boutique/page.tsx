'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import BoutiqueFAQ from '@/components/BoutiqueFAQ';
import { PRODUCTS, CATEGORIES } from '@/lib/catalog';
import { useStore } from '@/context/StoreContext';

function ShopContent() {
  const searchParams = useSearchParams();
  const { countryCode, isProductVisible } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [swissOnly, setSwissOnly] = useState<boolean>(false);
  const [deliverableOnly, setDeliverableOnly] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>('featured');

  useEffect(() => {
    const brandParam = searchParams.get('brand');
    const catParam = searchParams.get('cat');
    if (brandParam) {
      setSelectedBrand(brandParam);
    }
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  const brands = useMemo(() => {
    return Array.from(new Set(PRODUCTS.filter(p => isProductVisible(p)).map(p => p.brand))).sort();
  }, [isProductVisible]);

  const filteredProducts = useMemo(() => {
    const cc = (countryCode || 'CH').toUpperCase();
    const genevaAllowList = ['CH', 'LI', 'FR', 'DE', 'IT', 'AT'];

    return PRODUCTS.filter(p => {
      // Exclude deleted or draft products
      if (!isProductVisible(p)) return false;
      // Ebook has its own dedicated landing page at /guide-des-complements-alimentaires/
      if (p.categorySlug === 'guides-ebooks' || p.id === 'prod-25430') return false;
      if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) return false;
      if (selectedBrand !== 'all') {
        const pBrand = p.brand.toLowerCase();
        const sBrand = selectedBrand.toLowerCase();
        if (pBrand !== sBrand && !pBrand.includes(sBrand) && !sBrand.includes(pBrand)) {
          return false;
        }
      }
      if (swissOnly && !p.isSwissOrigin) return false;

      // Filter by delivery destination availability if deliverableOnly is checked
      if (deliverableOnly) {
        const isCommon = p.locationType === 'COMMON' || p.shippingOrigin === 'common';
        const isPortugal = p.shippingOrigin === 'portugal' && !isCommon;
        const isGenevaOnly = !isCommon && !isPortugal;
        if (isGenevaOnly && !genevaAllowList.includes(cc)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceChf - b.priceChf;
      if (sortBy === 'price-desc') return b.priceChf - a.priceChf;
      if (sortBy === 'name-asc') return (a.name?.fr || '').localeCompare(b.name?.fr || '');
      return 0;
    });
  }, [selectedCategory, selectedBrand, swissOnly, deliverableOnly, countryCode, sortBy, isProductVisible]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSwissOnly(false);
    setDeliverableOnly(false);
    setSortBy('featured');
  };

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
          {(selectedBrand !== 'all' || selectedCategory !== 'all' || swissOnly) && (
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
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60 font-medium">Trier par :</span>
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

            <div className="text-xs text-white/50">
              Affichage de {filteredProducts.length} produits
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-white/50">Chargement de la boutique...</div>}>
      <ShopContent />
    </Suspense>
  );
}
