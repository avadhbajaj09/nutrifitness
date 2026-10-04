'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import type { ProductItem } from '@/lib/types';
import type { SuggestedProduct } from '@/lib/blog';
import { getProductReviewStats } from '@/lib/reviews';
import { 
  ShoppingBag, 
  ArrowRight, 
  Star, 
  Check, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

export interface BlogProductItem extends SuggestedProduct {
  product?: ProductItem;
}

interface BlogProductCardsProps {
  products: BlogProductItem[];
  variant?: 'in-article' | 'sidebar';
}

export default function BlogProductCards({ products, variant = 'in-article' }: BlogProductCardsProps) {
  const { addToCart, openCart, formatPrice } = useStore();
  const [addedId, setAddedId] = useState<string | null>(null);

  if (!products || products.length === 0) return null;

  const handleQuickAdd = (e: React.MouseEvent, item: BlogProductItem) => {
    e.preventDefault();
    e.stopPropagation();

    if (!item.product) return;

    const defaultVariant = item.product.variants?.[0];
    const flavor = defaultVariant ? (defaultVariant.flavorName?.fr || 'Standard') : 'Standard';

    addToCart(item.product, {
      quantity: 1,
      flavor
    });

    setAddedId(item.product.id);
    setTimeout(() => setAddedId(null), 2000);
    openCart();
  };

  /* =========================================================================
     SIDEBAR VARIANT: Sleek vertical stack of recommended products
     ========================================================================= */
  if (variant === 'sidebar') {
    return (
      <div className="space-y-3">
        {products.map((item, idx) => {
          const product = item.product;
          const href = item.href || (product ? `/produit/${product.slug.fr}/` : '#');
          const imgSrc = product?.images?.[0]?.src || '/images/placeholder.webp';
          const price = product?.priceChf || 29.90;
          const brand = item.brand || product?.brand || 'NutriFitness';
          const title = item.name || product?.name.fr || '';
          const reviewStats = product ? getProductReviewStats(product.id, product.categorySlug, product.slug.fr) : { rating: 4.9, count: 42, stars: '★★★★★' };
          const isAdded = addedId === (product?.id || `idx-${idx}`);

          return (
            <div 
              key={idx}
              className="p-3 bg-[#141414] hover:bg-[#1A1A1A] rounded-2xl border border-white/10 hover:border-[#F80404]/50 transition-all duration-300 group flex flex-col gap-2.5 shadow-lg"
            >
              {/* Top row: badge & Swiss stock */}
              <div className="flex items-center justify-between gap-2 text-[10px]">
                {item.badge ? (
                  <span className="px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-[#F80404]/15 text-[#F80404] border border-[#F80404]/30 truncate max-w-[170px]">
                    {item.badge}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-white/10 text-white/70">
                    Sélection Guide
                  </span>
                )}
                <span className="text-[#95d600] font-bold shrink-0">
                  🇨🇭 En stock
                </span>
              </div>

              {/* Main row: thumbnail & info */}
              <div className="flex items-center gap-3">
                <Link 
                  href={href}
                  className="relative w-16 h-16 shrink-0 bg-[#0A0A0A] rounded-xl border border-white/10 p-1.5 flex items-center justify-center overflow-hidden group-hover:border-[#F80404]/40 transition-colors"
                >
                  <Image 
                    src={imgSrc}
                    alt={title}
                    fill
                    sizes="64px"
                    className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#F80404] font-heading truncate">
                    {brand}
                  </p>
                  <Link 
                    href={href}
                    className="block text-xs font-bold text-white group-hover:text-[#F80404] transition-colors line-clamp-2 leading-tight"
                    title={title}
                  >
                    {title}
                  </Link>
                  <div className="flex items-center gap-1 mt-1 text-[11px]">
                    <span className="text-amber-400 font-bold">★ {reviewStats.rating.toFixed(1)}</span>
                    <span className="text-white/40 text-[10px]">({reviewStats.count})</span>
                  </div>
                </div>
              </div>

              {/* Bottom row: Price and CTA buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                <div>
                  <span className="text-sm font-black text-[#95d600] font-heading">
                    {formatPrice(price)}
                  </span>
                  <span className="block text-[9px] text-white/40">TVA suisse incluse</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {product ? (
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, item)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-md ${
                        isAdded 
                          ? 'bg-[#95d600] text-black font-black' 
                          : 'bg-[#F80404] hover:bg-[#FF3D00] text-black hover:scale-105 active:scale-95'
                      }`}
                      title="Ajouter au panier"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Ajouté</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Ajouter</span>
                        </>
                      )}
                    </button>
                  ) : null}

                  <Link
                    href={href}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label={`Voir la fiche de ${title}`}
                    title="Voir la fiche produit"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* =========================================================================
     IN-ARTICLE VARIANT: Premium 3-column product cards with images
     ========================================================================= */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {products.map((item, idx) => {
        const product = item.product;
        const href = item.href || (product ? `/produit/${product.slug.fr}/` : '#');
        const imgSrc = product?.images?.[0]?.src || '/images/placeholder.webp';
        const price = product?.priceChf || 29.90;
        const compareAt = product?.compareAtPriceChf;
        const brand = item.brand || product?.brand || 'NutriFitness';
        const title = item.name || product?.name.fr || '';
        const reviewStats = product ? getProductReviewStats(product.id, product.categorySlug, product.slug.fr) : { rating: 4.9, count: 48, stars: '★★★★★' };
        const isAdded = addedId === (product?.id || `idx-${idx}`);

        return (
          <div 
            key={idx}
            className="p-5 rounded-3xl bg-[#141414] border border-white/10 hover:border-[#F80404]/60 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:shadow-[#F80404]/10 hover:-translate-y-1"
          >
            <div>
              {/* Badge & Swiss Stock */}
              <div className="flex items-center justify-between gap-2 mb-3">
                {item.badge ? (
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F80404]/20 text-[#F80404] border border-[#F80404]/30 truncate">
                    {item.badge}
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-white/70">
                    Sélection Experte
                  </span>
                )}
                <span className="text-[11px] font-bold text-[#95d600] shrink-0 flex items-center gap-1">
                  🇨🇭 En stock
                </span>
              </div>

              {/* Product Image Frame */}
              <Link 
                href={href}
                className="relative block aspect-square w-full rounded-2xl bg-[#0A0A0A] border border-white/5 p-4 mb-4 overflow-hidden group-hover:border-[#F80404]/30 transition-colors"
              >
                <Image 
                  src={imgSrc}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-2 group-hover:scale-108 transition-transform duration-500"
                />
              </Link>

              {/* Brand & Title */}
              <p className="text-[11px] font-black uppercase tracking-widest text-[#F80404] font-heading mb-1">
                {brand}
              </p>
              <Link 
                href={href}
                className="block text-sm font-bold text-white group-hover:text-[#F80404] transition-colors line-clamp-2 leading-snug mb-2.5 min-h-[40px]"
                title={title}
              >
                {title}
              </Link>

              {/* Star Rating */}
              <div className="flex items-center gap-1.5 text-xs mb-3">
                <span className="text-amber-400 font-bold">{reviewStats.stars}</span>
                <span className="font-bold text-white text-xs">{reviewStats.rating.toFixed(1)}</span>
                <span className="text-white/40 text-[11px]">({reviewStats.count} avis)</span>
              </div>
            </div>

            {/* Bottom: Price + Actions */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-black text-[#95d600] font-heading">
                    {formatPrice(price)}
                  </span>
                  {compareAt && compareAt > price && (
                    <span className="text-xs text-white/40 line-through ml-2">
                      {formatPrice(compareAt)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/50">Expédié sous 24h</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {product && (
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, item)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md ${
                      isAdded 
                        ? 'bg-[#95d600] text-black' 
                        : 'bg-[#F80404] hover:bg-[#FF3D00] text-black active:scale-95'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Ajouté</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Panier</span>
                      </>
                    )}
                  </button>
                )}

                <Link
                  href={href}
                  className={`py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1 border border-white/10 hover:border-white/20 ${
                    !product ? 'col-span-2' : ''
                  }`}
                >
                  <span>Détails</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
