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

function useDeliverableProducts(products: ProductItem[]) {
  const { isProductVisible, isProductDeliverable, countryCode } = useStore();

  return useMemo(() => {
    return products.filter(p => isProductVisible(p) && isProductDeliverable(p));
  }, [products, isProductVisible, isProductDeliverable, countryCode]);
}

export function HomeMarqueeSection({ products }: Props) {
  const deliverable = useDeliverableProducts(products);
  if (deliverable.length === 0) return null;
  return <ProductMarquee products={deliverable} />;
}

export function HomeBestsellersSection({ products }: Props) {
  const deliverable = useDeliverableProducts(products);
  const bestSellers = deliverable.slice(0, 10);
  const { countryCode } = useStore();
  const isCH = (countryCode || 'CH') === 'CH' || countryCode === 'LI';

  if (bestSellers.length === 0) return null;

  return (
    <ProductCarousel 
      title={isCH ? "Bestsellers & Tendances en Suisse" : "Bestsellers & Tendances"}
      subtitle="Les Plus Plébiscités"
      products={bestSellers}
    />
  );
}

export function HomeNewArrivalsSection({ products }: Props) {
  const deliverable = useDeliverableProducts(products);
  // Shift window so we don't repeat the exact same products as bestsellers
  const newArrivals = deliverable.length > 10 ? deliverable.slice(10, 20) : deliverable.slice(0, 8);

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
  const deliverable = useDeliverableProducts(products);
  const performanceCollection = deliverable.length > 20 
    ? deliverable.slice(20, 28) 
    : deliverable.slice(0, Math.min(8, deliverable.length));
  const { countryCode } = useStore();
  const isCH = (countryCode || 'CH') === 'CH' || countryCode === 'LI';

  if (performanceCollection.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-1 font-heading">
            Gamme Force & Endurance
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
            {isCH ? "Collection Performance Suisse" : "Collection Performance"}
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
