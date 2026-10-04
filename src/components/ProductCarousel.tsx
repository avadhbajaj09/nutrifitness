'use client';

import React, { useRef } from 'react';
import ProductCard from './ProductCard';
import type { ProductItem } from '@/lib/types';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: ProductItem[];
  id?: string;
}

export default function ProductCarousel({ title, subtitle, products }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-16">
      {/* Section Header with Arrows */}
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          {subtitle && (
            <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-1 font-heading">
              {subtitle}
            </p>
          )}
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
            {title}
          </h2>
        </div>

        {/* Arrow Controls */}
        <div className="flex items-center gap-2">
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

      {/* Horizontal Scroll Track */}
      <div 
        ref={trackRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, idx) => (
          <div key={product.id || idx} className="w-[260px] sm:w-[280px] lg:w-[290px] shrink-0 snap-start">
            <ProductCard product={product} priority={idx < 2} />
          </div>
        ))}
      </div>
    </section>
  );
}
