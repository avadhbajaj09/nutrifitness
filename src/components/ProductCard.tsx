'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ProductItem, getLocalized } from '@/lib/types';
import { DeliveryEstimate } from '@/components/delivery/DeliveryEstimate';
import { getProductOriginType } from '@/lib/translations';
import { isProductDeliverableToCountry } from '@/lib/delivery/defaults';

interface ProductCardProps {
  product: ProductItem;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart, closeCart, openQuickView, getProductPricing, locale, countryCode, t, getCatalogOverride, getProductStock } = useStore();

  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isAdded, setIsAdded] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const override = getCatalogOverride ? getCatalogOverride(product) : null;

  // First client render matches server HTML (CH) to prevent hydration mismatch
  const effectiveCountry = mounted ? (countryCode || 'CH') : 'CH';
  const stockCheck = getProductStock ? getProductStock(product) : null;
  const effectiveGen = override?.stockGeneva ?? (stockCheck ? stockCheck.geneva : product.stockGeneva);
  const effectivePt = override?.stockPortugal ?? (stockCheck ? stockCheck.portugal : product.stockPortugal);

  const locType = override?.mainLocation 
    ? (override.mainLocation === 'COMMON' ? 'COMMON' : override.mainLocation === 'PORTUGAL' ? 'PORTUGAL_ONLY' : 'GENEVA_ONLY') 
    : product.locationType;
  const shipOrigin = override?.mainLocation 
    ? (override.mainLocation === 'COMMON' ? 'common' : override.mainLocation === 'PORTUGAL' ? 'portugal' : 'switzerland') 
    : product.shippingOrigin;

  const isDeliverable = isProductDeliverableToCountry(
    effectiveCountry,
    locType,
    shipOrigin,
    effectiveGen,
    effectivePt
  );

  const originType = getProductOriginType({
    shippingOrigin: shipOrigin,
    locationType: locType
  });

  const slug = getLocalized(product.slug, locale);
  const name = override?.name || getLocalized(product.name, locale);
  const primaryImg = override?.images?.[0]?.src || product.images?.[0]?.src || '/images/placeholder.webp';
  const [imgSrc, setImgSrc] = React.useState<string>(primaryImg);

  React.useEffect(() => {
    const activeOverride = getCatalogOverride ? getCatalogOverride(product) : null;
    setImgSrc(activeOverride?.images?.[0]?.src || product.images?.[0]?.src || '/images/placeholder.webp');
  }, [product.images, getCatalogOverride, product]);

  const effectiveProductForPricing = override?.priceChf ? {
    ...product,
    priceChf: override.priceChf,
    compareAtPriceChf: override.compareAtPriceChf
  } : product;

  const pricing = getProductPricing(effectiveProductForPricing);
  const compareAtPrice = pricing.compareAt;
  const discountPercent = compareAtPrice && compareAtPrice > pricing.price ? Math.round(((compareAtPrice - pricing.price) / compareAtPrice) * 100) : 0;
  const hasStock = ((effectiveGen ?? 0) + (effectivePt ?? 0)) > 0;

  // Mobile text transform for Pronutrition.it -> Pronutrition
  const displayBrand = React.useMemo(() => {
    if (isMobile && product.brand?.toLowerCase() === 'pronutrition.it') {
      return 'Pronutrition';
    }
    return product.brand;
  }, [isMobile, product.brand]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    if (isMobile) {
      // Keep mobile user in context with quick feedback
      closeCart();
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <article className={`group relative flex flex-col bg-[#141414] rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-[#F80404]/60 hover:shadow-2xl hover:shadow-[#F80404]/10 hover:-translate-y-1 ${!isDeliverable ? 'max-md:opacity-75' : ''}`}>
      
      {/* Image Container */}
      <div className="relative block aspect-square w-full bg-[#1A1A1A] p-3 sm:p-6 overflow-hidden">
        {/* Badges (Top Left) */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {discountPercent > 0 && (
            <span className="inline-flex items-center bg-[#F80404] text-white text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {!hasStock && (
            <span className="inline-flex items-center bg-black/80 text-white/90 border border-white/20 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Épuisé
            </span>
          )}
          {!isDeliverable && (
            <span className="sm:hidden inline-flex items-center bg-red-950/90 text-red-300 border border-red-800/60 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Indisponible
            </span>
          )}
        </div>

        {/* Floating Action Buttons (Top Right - Desktop Only) */}
        <div className="hidden sm:flex absolute top-3 right-3 z-20 flex-col gap-2">
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
            src={imgSrc} 
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            onError={() => setImgSrc('/images/placeholder.webp')}
            className="object-contain object-center transition-transform duration-500 group-hover:scale-108 filter drop-shadow-md"
          />
        </Link>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 px-2 py-2.5 sm:p-5">
        <p className="text-[10px] sm:text-[11px] font-bold text-white/60 sm:text-[#F80404] tracking-widest uppercase mb-1 font-heading truncate">
          {displayBrand}
        </p>

        <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] mb-1.5 sm:mb-2 group-hover:text-[#F80404] transition-colors leading-snug">
          <Link href={`/produit/${slug}/`}>
            {name}
          </Link>
        </h3>

        {/* Dynamic Delivery Date, Ships From & Live Stock Pill */}
        <DeliveryEstimate
          productId={product.id}
          shippingOriginHint={product.shippingOrigin}
          mode="card"
          className="mb-2 sm:mb-3.5"
        />

        {/* Price & Add to Cart Row */}
        <div className="mt-auto pt-2 sm:pt-2.5 border-t border-white/10 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap min-w-0">
              <span className="text-sm sm:text-lg font-black text-white font-heading whitespace-nowrap tracking-tight leading-none">
                {pricing.formatted}
              </span>
              {pricing.formattedCompareAt && (
                <span className="text-[9px] sm:text-xs text-white/40 line-through whitespace-nowrap">
                  {pricing.formattedCompareAt}
                </span>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:block shrink-0">
              {!isDeliverable ? (
                <span 
                  className="inline-flex items-center justify-center min-h-[34px] px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-red-300/80 bg-red-950/40 rounded-xl border border-red-800/40 cursor-not-allowed text-center whitespace-nowrap"
                  title={
                    locale === 'en'
                      ? 'Not available in your country'
                      : locale === 'de'
                      ? 'In Ihrem Land nicht verfügbar'
                      : locale === 'it'
                      ? 'Non disponible nel tuo paese'
                      : 'Non disponible dans votre pays'
                  }
                >
                  Indisponible
                </span>
              ) : !hasStock ? (
                <span 
                  className="inline-flex items-center justify-center min-h-[34px] px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-white/40 bg-white/5 rounded-xl border border-white/10 cursor-not-allowed text-center whitespace-nowrap"
                >
                  Épuisé
                </span>
              ) : (
                <button 
                  type="button"
                  onClick={() => addToCart(product)}
                  className="inline-flex items-center justify-center min-h-[34px] px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-black bg-[#F80404] hover:bg-[#FF3D00] rounded-xl transition-all shadow-sm active:scale-95 gap-1.5 shrink-0"
                  aria-label={`${t.common.addToCart}: ${name}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>+</span>
                </button>
              )}
            </div>

            {/* Mobile Actions: Compact button, prevents price collision */}
            <div className="sm:hidden shrink-0">
              {!isDeliverable ? (
                <span 
                  className="inline-flex items-center justify-center h-7 px-1.5 text-[8.5px] font-bold uppercase tracking-wider text-white/40 bg-white/5 rounded-md border border-white/10 cursor-not-allowed text-center whitespace-nowrap"
                >
                  Indisponible
                </span>
              ) : !hasStock ? (
                <span 
                  className="inline-flex items-center justify-center h-7 px-2 text-[8.5px] font-bold uppercase tracking-wider text-white/40 bg-white/5 rounded-md border border-white/10 cursor-not-allowed text-center whitespace-nowrap"
                >
                  Épuisé
                </span>
              ) : (
                <button 
                  type="button"
                  onClick={handleAddToCart}
                  className={`inline-flex items-center justify-center h-7 px-1.5 text-[9px] font-black uppercase tracking-tight rounded-md transition-all shadow-sm active:scale-95 gap-1 shrink-0 ${
                    isAdded
                      ? 'bg-emerald-500 text-black'
                      : 'bg-[#F80404] hover:bg-[#FF3D00] text-black'
                  }`}
                  aria-label={`Ajouter au panier: ${name}`}
                >
                  {isAdded ? (
                    <>
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Ajouté</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Ajouter</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
