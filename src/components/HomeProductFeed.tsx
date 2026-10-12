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
    <section className="mb-16">
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-1 font-heading">
            Gamme Force & Endurance
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
            Collection Performance Suisse
          </h2>
        </div>
        <Link href="/boutique/?cat=pre-workout" className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider">
          Boosters & Créatines →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {performanceCollection.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
