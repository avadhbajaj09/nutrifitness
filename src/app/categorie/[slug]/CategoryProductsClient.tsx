'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import type { ProductItem } from '@/lib/types';
import { Filter, ArrowUpDown, ShieldCheck, Sparkles } from 'lucide-react';

interface CategoryProductsClientProps {
  products: ProductItem[];
  categoryName: string;
}

export default function CategoryProductsClient({ products, categoryName }: CategoryProductsClientProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [swissOnly, setSwissOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');

  const availableBrands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand))).filter(Boolean).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
        if (swissOnly && !p.isSwissOrigin) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.priceChf - b.priceChf;
        if (sortBy === 'price-desc') return b.priceChf - a.priceChf;
        if (sortBy === 'name-asc') return (a.name?.fr || '').localeCompare(b.name?.fr || '');
        return 0;
      });
  }, [products, selectedBrand, swissOnly, sortBy]);

  return (
    <div className="space-y-6">
      {/* Control bar: brand filter, swiss only, sort, count */}
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand pills / selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-white/50 flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#F80404]" />
            Marques :
          </span>
          <button
            type="button"
            onClick={() => setSelectedBrand('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              selectedBrand === 'all'
                ? 'bg-[#F80404] text-black font-black'
                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            Toutes ({products.length})
          </button>
          {availableBrands.map(brand => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedBrand === brand
                  ? 'bg-[#F80404] text-black font-black'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Right: Swiss only + Sort */}
        <div className="flex items-center gap-3 ml-auto">
          <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 hover:border-white/20 transition-all text-xs text-white">
            <input 
              type="checkbox" 
              checked={swissOnly} 
              onChange={(e) => setSwissOnly(e.target.checked)}
              className="accent-[#F80404] rounded cursor-pointer"
            />
            <span className="font-bold">🇨🇭 Stock Suisse</span>
          </label>

          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-white/40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-[#141414]">Recommandés</option>
              <option value="price-asc" className="bg-[#141414]">Prix croissant</option>
              <option value="price-desc" className="bg-[#141414]">Prix décroissant</option>
              <option value="name-asc" className="bg-[#141414]">Nom (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-[#141414] rounded-2xl border border-white/10 p-6">
          <p className="text-sm text-white/70 mb-3">Aucun produit ne correspond à ces critères dans cette catégorie.</p>
          <button
            type="button"
            onClick={() => { setSelectedBrand('all'); setSwissOnly(false); }}
            className="px-4 py-2 rounded-xl bg-[#F80404] text-black font-black text-xs uppercase"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product, idx) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              priority={idx < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}
