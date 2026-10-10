'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ProductItem, getLocalized } from '@/lib/types';
import { calculateVat } from '@/lib/tax';
import { getProductReviewStats } from '@/lib/reviews';
import { DeliveryEstimate } from '@/components/delivery/DeliveryEstimate';

interface ProductCardProps {
  product: ProductItem;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart, openQuickView, getProductPricing, locale, countryCode, t, isProductDeliverable } = useStore();

  const isDeliverable = isProductDeliverable(product);

  const slug = getLocalized(product.slug, locale);
  const name = getLocalized(product.name, locale);
  const primaryImg = product.images?.[0]?.src || '/images/placeholder.webp';

  const isCommon = product.locationType === 'COMMON' || product.shippingOrigin === 'common';
  const isSwissDestination = (countryCode || 'CH') === 'CH' || countryCode === 'LI';

  const pricing = getProductPricing(product);
  const compareAtPrice = pricing.compareAt;
  const discountPercent = compareAtPrice && compareAtPrice > pricing.price ? Math.round(((compareAtPrice - pricing.price) / compareAtPrice) * 100) : 0;
  const hasStock = product.variants?.some(v => v.inStock) ?? true;
  const vat = calculateVat(pricing.price, product.taxCategory);
  const reviewStats = getProductReviewStats(product.id, product.categorySlug, slug);

  return (
    <article className="group relative flex flex-col bg-[#141414] rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-[#F80404]/60 hover:shadow-2xl hover:shadow-[#F80404]/10 hover:-translate-y-1">
      
      {/* Image Container */}
      <div className="relative block aspect-square w-full bg-[#1A1A1A] p-6 overflow-hidden">
        {/* Badges (Top Left) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {discountPercent > 0 && (
            <span className="inline-flex items-center bg-[#F80404] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.isSwissOrigin && (
            <span className="inline-flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-xs bg-[#D52B1E] inline-block" aria-hidden="true"></span>
              CH
            </span>
          )}
          {isCommon ? (
            !isSwissDestination ? (
              <span className="inline-flex items-center gap-1 bg-blue-950/85 backdrop-blur-md border border-blue-500/40 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                <span>🇵🇹</span>
                <span>Expédié du Portugal (3–5j)</span>
              </span>
            ) : null
          ) : product.shippingOrigin === 'portugal' ? (
            <span className="inline-flex items-center gap-1 bg-blue-950/85 backdrop-blur-md border border-blue-500/40 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              <span>🇵🇹</span>
              <span>{t.common.shippedFromPortugal || 'Expédié du Portugal'}</span>
            </span>
          ) : null}
        </div>

        {/* Floating Action Buttons (Top Right) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
          {/* Quick View Eye Button */}
          <button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              openQuickView(product);
            }}
            className="w-9 h-9 rounded-full bg-black/80 hover:bg-[#F80404] text-white/80 hover:text-black flex items-center justify-center border border-white/20 transition-all shadow-md group-hover:scale-105"
            aria-label={t.common.quickView}
            title={t.common.quickView}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>

        {/* Packshot Image */}
        <Link href={`/produit/${slug}/`} className="block w-full h-full relative" tabIndex={-1}>
          <Image 
            src={primaryImg} 
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            className="object-contain object-center transition-transform duration-500 group-hover:scale-108 filter drop-shadow-md"
          />
        </Link>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        <p className="text-[11px] font-black tracking-widest uppercase text-[#F80404] mb-1 font-heading">
          {product.brand}
        </p>

        <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-[#F80404] transition-colors leading-snug">
          <Link href={`/produit/${slug}/`}>
            {name}
          </Link>
        </h3>

        {/* Rating Stars */}
        <div className="flex items-center gap-1.5 mb-2.5 text-xs">
          <div className="flex text-amber-400 text-xs">{reviewStats.stars}</div>
          <span className="text-white/40 text-[11px]">{reviewStats.rating.toFixed(1)} ({reviewStats.count})</span>
        </div>

        {/* Dynamic Delivery Date, Ships From & Live Stock Pill */}
        <DeliveryEstimate
          productId={product.id}
          shippingOriginHint={product.shippingOrigin}
          mode="card"
          className="mb-3.5"
        />

        {/* Price & Add to Cart Row */}
        <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-white font-heading">
                {pricing.formatted}
              </span>
              {pricing.formattedCompareAt && (
                <span className="text-xs text-white/40 line-through">
                  {pricing.formattedCompareAt}
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/40">
              {t.common.vatIncluded} ({vat.ratePercentage})
            </p>
          </div>

          {!isDeliverable ? (
            <span 
              className="inline-flex items-center justify-center min-h-[40px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300/80 bg-red-950/40 rounded-xl border border-red-800/40 cursor-not-allowed text-center leading-tight"
              title={
                locale === 'en'
                  ? 'Not available in your country'
                  : locale === 'de'
                  ? 'In Ihrem Land nicht verfügbar'
                  : locale === 'it'
                  ? 'Non disponibile nel tuo paese'
                  : 'Non disponible dans votre pays'
              }
            >
              {locale === 'en' ? 'Not available in your country' : 'Non disponible dans votre pays'}
            </span>
          ) : (
            <button 
              type="button"
              onClick={() => addToCart(product)}
              className="inline-flex items-center justify-center min-h-[40px] px-3.5 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#F80404] hover:bg-[#FF3D00] rounded-xl transition-all shadow-sm active:scale-95 gap-1.5"
              aria-label={`${t.common.addToCart}: ${name}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>+</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
