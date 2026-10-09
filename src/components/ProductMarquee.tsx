'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductItem, getLocalized } from '@/lib/types';
import { formatChf } from '@/lib/tax';
import { useStore } from '@/context/StoreContext';

interface ProductMarqueeProps {
  products: ProductItem[];
}

export default function ProductMarquee({ products }: ProductMarqueeProps) {
  const { isProductVisible, isProductDeliverable, countryCode } = useStore();
  const visibleProducts = useMemo(() => {
    return products.filter(p => isProductVisible(p) && isProductDeliverable(p));
  }, [products, isProductVisible, isProductDeliverable, countryCode]);

  // Select up to 12 diverse iconic products
  const marqueeItems = visibleProducts.slice(0, 12);
  if (marqueeItems.length === 0) return null;
  // Duplicate for seamless infinite marquee loop
  const displayItems = [...marqueeItems, ...marqueeItems];

  return (
    <div className="bg-[#101010] border-y border-white/10 overflow-hidden py-3 mb-14 relative group">
      {/* Subtle Side Vignette Gradients */}
      <div className="absolute left-0 inset-y-0 w-12 sm:w-20 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-12 sm:w-20 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />

      {/* Infinite Scrolling Track */}
      <div className="flex items-center gap-4 w-max animate-marquee hover:[animation-play-state:paused] transition-all">
        {displayItems.map((prod, idx) => {
          const name = getLocalized(prod.name);
          const slug = getLocalized(prod.slug);
          const img = prod.images?.[0]?.src || '/images/placeholder.webp';

          return (
            <Link
              key={`${prod.id}-${idx}`}
              href={`/produit/${slug}/`}
              className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-[#F80404]/50 transition-all shrink-0 group/item"
            >
              {/* Small Product Thumbnail */}
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 bg-black/40 rounded-lg p-1 shrink-0 overflow-hidden border border-white/5">
                <Image
                  src={img}
                  alt={name}
                  fill
                  sizes="48px"
                  className="object-contain p-0.5 transition-transform duration-300 group-hover/item:scale-110"
                />
              </div>

              {/* Product Meta */}
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[9px] font-black uppercase text-[#F80404] tracking-wider truncate max-w-[140px]">
                  {prod.brand}
                </span>
                <span className="text-xs font-bold text-white group-hover/item:text-[#F80404] transition-colors truncate max-w-[150px] sm:max-w-[180px]">
                  {name}
                </span>
                <span className="text-[11px] font-black text-white/70">
                  {formatChf(prod.priceChf)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
