'use client';

import React, { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import type { ProductItem } from '@/lib/types';
import { ArrowUpDown, ShoppingBag } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface BrandProductsClientProps {
  products: ProductItem[];
  brandName: string;
}

export default function BrandProductsClient({ products, brandName }: BrandProductsClientProps) {
  const { isProductVisible, isProductDeliverable, countryCode } = useStore();
  const [sortBy, setSortBy] = useState<string>('featured');

  const deliverableProducts = useMemo(() => {
    return products.filter(p => isProductVisible(p) && isProductDeliverable(p));
  }, [products, isProductVisible, isProductDeliverable, countryCode]);

  const sortedProducts = useMemo(() => {
    const list = [...deliverableProducts];
    if (sortBy === 'price-asc') {
      return list.sort((a, b) => a.priceChf - b.priceChf);
    }
    if (sortBy === 'price-desc') {
      return list.sort((a, b) => b.priceChf - a.priceChf);
    }
    if (sortBy === 'name-asc') {
      return list.sort((a, b) => (a.name?.fr || '').localeCompare(b.name?.fr || ''));
    }
    return list;
  }, [deliverableProducts, sortBy]);

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-white/60">
          <span className="font-bold text-white">{sortedProducts.length}</span> produit{sortedProducts.length > 1 ? 's' : ''} disponible{sortedProducts.length > 1 ? 's' : ''}
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-white/40" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-black/50 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#F80404]"
            aria-label="Trier les produits"
          >
            <option value="featured">Tri recommandé</option>
            <option value="price-asc">Prix : croissant</option>
            <option value="price-desc">Prix : décroissant</option>
            <option value="name-asc">Nom (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {sortedProducts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#141414] border border-white/10">
          <ShoppingBag className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Aucun produit disponible actuellement</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            Les stocks pour la marque {brandName} sont en cours de réapprovisionnement à Genève. N&apos;hésitez pas à consulter nos autres marques.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
