'use client';

import React, { useRef, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import type { ProductItem } from '@/lib/types';
import { useStore } from '@/context/StoreContext';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: ProductItem[];
  id?: string;
  seeAllHref?: string;
}

export default function ProductCarousel({ title, subtitle, products, seeAllHref = '/boutique/' }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { isProductVisible } = useStore();

  const visibleProducts = useMemo(() => {
    return products.filter(p => isProductVisible(p));
  }, [products, isProductVisible]);

  const scroll = (direction: 'left' | 'right') => {
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (visibleProducts.length === 0) return null;

  return (
    <section className="mb-8 sm:mb-16">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/10 px-4 sm:px-0">
        <div>
          {subtitle && (
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#F80404] mb-0.5 sm:mb-1 font-heading">
              {subtitle}
            </p>
          )}
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-white uppercase font-heading leading-tight">
            {title}
          </h2>
          <span className="sm:hidden text-[10px] text-white/40 block mt-0.5">
            *Prix en CHF, TVA suisse incluse
          </span>
        </div>

        {/* Mobile: Voir tout link */}
        <Link 
          href={seeAllHref}
          className="sm:hidden text-xs font-bold text-[#F80404] hover:underline shrink-0 min-h-[44px] inline-flex items-center"
        >
          Voir tout →
        </Link>

        {/* Desktop: Arrow Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button 
            type="button"
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#F80404] hover:text-black text-white flex items-center justify-center border border-white/10 transition-colors shadow-sm"
            aria-label="Défiler vers la gauche"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button 
            type="button"
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#F80404] hover:text-black text-white flex items-center justify-center border border-white/10 transition-colors shadow-sm"
            aria-label="Défiler vers la droite"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track: 2.2 cards visible on mobile with scroll snap */}
      <div 
        ref={trackRef}
        className="flex gap-3 sm:gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {visibleProducts.map((product, idx) => (
          <div 
            key={product.id || idx} 
            className="w-[calc((100vw-36px)/2.15)] min-w-[155px] max-w-[185px] sm:w-[280px] sm:min-w-0 sm:max-w-none lg:w-[290px] shrink-0 snap-start"
          >
            <ProductCard product={product} priority={idx < 2} />
          </div>
        ))}
      </div>
    </section>
  );
}
