'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import ProductCarousel from '@/components/ProductCarousel';
import ProductMarquee from '@/components/ProductMarquee';
import ProductCard from '@/components/ProductCard';
import { ProductItem } from '@/lib/types';
import { useStore } from '@/context/StoreContext';

interface Props {
  products: ProductItem[];
}

function useVisibleProducts(products: ProductItem[]) {
  const { isProductVisible } = useStore();

  return useMemo(() => {
    return products.filter(p => isProductVisible(p));
  }, [products, isProductVisible]);
}

export function HomeMarqueeSection({ products }: Props) {
  const visible = useVisibleProducts(products);
  if (visible.length === 0) return null;
  return <ProductMarquee products={visible} />;
}

export function HomeBestsellersSection({ products }: Props) {
  const visible = useVisibleProducts(products);
  const bestSellers = visible.slice(0, 10);

  if (bestSellers.length === 0) return null;

  return (
    <ProductCarousel 
      title="Bestsellers & Tendances en Suisse"
      subtitle="Les Plus Plébiscités"
      products={bestSellers}
      seeAllHref="/boutique/?sort=featured"
    />
  );
}

export function HomeNewArrivalsSection({ products }: Props) {
  const visible = useVisibleProducts(products);
  // Shift window so we don't repeat the exact same products as bestsellers
  const newArrivals = visible.length > 10 ? visible.slice(10, 20) : visible.slice(0, 8);

  if (newArrivals.length === 0) return null;

  return (
    <ProductCarousel 
      title="Nouveautés & Derniers Arrivages"
      subtitle="Fraîchement Entrés en Stock"
      products={newArrivals}
      seeAllHref="/boutique/?sort=featured"
    />
  );
}

export function HomePerformanceSection({ products }: Props) {
  const visible = useVisibleProducts(products);
  const performanceCollection = visible.length > 20 
    ? visible.slice(20, 28) 
    : visible.slice(0, Math.min(8, visible.length));

  if (performanceCollection.length === 0) return null;

  return (
    <section className="mb-8 sm:mb-16">
      <div className="flex items-end justify-between mb-4 sm:mb-8 pb-3 sm:pb-4 border-b border-white/10 px-4 sm:px-0">
        <div>
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#F80404] mb-0.5 sm:mb-1 font-heading">
            Gamme Force & Endurance
          </p>
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-white uppercase font-heading leading-tight">
            Collection Performance Suisse
          </h2>
          <span className="sm:hidden text-[10px] text-white/40 block mt-0.5">
            *Prix en CHF, TVA suisse incluse
          </span>
        </div>
        <Link 
          href="/boutique/?cat=pre-workout" 
          className="min-h-[44px] flex items-center text-xs font-bold text-[#F80404] sm:text-white/70 hover:text-white uppercase tracking-wider shrink-0"
        >
          Boosters & Créatines →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 px-4 sm:px-0">
        {performanceCollection.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
