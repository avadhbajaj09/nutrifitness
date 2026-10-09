'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { FlagIcon } from './FlagIcon';
import { DeliveryEstimateItemResult, OriginId } from '@/lib/delivery/types';
import { useDeliveryEstimates } from '@/hooks/useDeliveryEstimate';
import { 
  Truck, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  ShieldAlert,
  PackageCheck
} from 'lucide-react';

interface DeliveryEstimateProps {
  productId: string;
  variantSku?: string;
  shippingOriginHint?: 'switzerland' | 'portugal' | 'common';
  quantity?: number;
  mode?: 'card' | 'detail' | 'compact' | 'checkout';
  className?: string;
  preloadedEstimate?: DeliveryEstimateItemResult;
}

export function DeliveryEstimate({
  productId,
  variantSku,
  shippingOriginHint,
  quantity = 1,
  mode = 'card',
  className = '',
  preloadedEstimate
}: DeliveryEstimateProps) {
  const { countryCode, locale } = useStore();
  const [detailsOpen, setDetailsOpen] = useState(false);

  // If preloaded estimate is provided, use it directly without network call
  const singleItem = React.useMemo(() => [
    {
      productId,
      variantSku,
      shippingOriginHint,
      quantity
    }
  ], [productId, variantSku, shippingOriginHint, quantity]);

  const { estimates, loading } = useDeliveryEstimates(
    preloadedEstimate ? [] : singleItem,
    countryCode || 'CH'
  );

  const estimate: DeliveryEstimateItemResult | undefined = preloadedEstimate || estimates.get(productId);
  const currentLocale = (locale === 'de' ? 'de' : locale === 'en' ? 'en' : 'fr') as 'fr' | 'en' | 'de';

  // Loading skeleton
  if (loading && !estimate) {
    return (
      <div className={`animate-pulse space-y-1.5 py-1 ${className}`}>
        <div className="h-4 bg-white/10 rounded-md w-3/4" />
        <div className="h-3 bg-white/5 rounded-md w-1/2" />
      </div>
    );
  }

  // If product is not available in destination country
  if (estimate && !estimate.isAvailable && estimate.stockPillText) {
    const notAvailText = currentLocale === 'en'
      ? 'Not available in your country'
      : currentLocale === 'de'
      ? 'In Ihrem Land nicht verfügbar'
      : 'Non livrable dans votre pays';

    return (
      <div className={`space-y-1 text-left ${className}`}>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-950/40 border border-red-800/40 px-2 py-0.5 rounded-md">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{notAvailText}</span>
        </div>
      </div>
    );
  }

  // If Out of Stock
  if (estimate && estimate.stockStatus === 'out_of_stock') {
    const oosText = currentLocale === 'en'
      ? 'Out of stock'
      : currentLocale === 'de'
      ? 'Nicht vorrätig'
      : 'Rupture de stock';

    return (
      <div className={`space-y-1 text-left ${className}`}>
        <span className="inline-block text-[11px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
          {oosText}
        </span>
      </div>
    );
  }

  const resolvedOrigin: OriginId = estimate?.resolvedOrigin || (shippingOriginHint === 'portugal' ? 'PORTUGAL' : 'GENEVA');
  const originCountry = resolvedOrigin === 'GENEVA' ? 'CH' : 'PT';
  const displayPromise = estimate?.displayDates?.[currentLocale] || (
    currentLocale === 'en' ? 'Fast tracked delivery' : 'Livraison express suivie'
  );
  const shipsFrom = estimate?.shipsFromText?.[currentLocale] || (
    resolvedOrigin === 'GENEVA' ? 'Expédié de Genève' : 'Expédié du Portugal'
  );

  // Stock Pill (Strictly no quantities shown on customer storefront)
  const stockCount = estimate?.stockCount ?? 20;
  const isOutOfStock = estimate?.stockStatus === 'out_of_stock' || stockCount <= 0;
  const isLowStock = !isOutOfStock && stockCount < 5;
  const stockText = isOutOfStock
    ? (estimate?.stockPillText?.[currentLocale] || (currentLocale === 'en' ? 'Out of stock' : currentLocale === 'de' ? 'Nicht vorrätig' : 'Rupture de stock'))
    : isLowStock
    ? (estimate?.stockPillText?.[currentLocale] || (currentLocale === 'en' ? 'Few items left – selling fast' : currentLocale === 'de' ? 'Geringer Bestand – fast ausverkauft' : 'Stock limité – vite épuisé'))
    : (estimate?.stockPillText?.[currentLocale] || (currentLocale === 'en' ? 'In stock' : currentLocale === 'de' ? 'Auf Lager' : 'En stock'));

  // 1. PRODUCT CARD MODE
  if (mode === 'card') {
    return (
      <div className={`space-y-1 text-left text-xs ${className}`}>
        {/* 1. Primary, bold: Flag icon (SVG) + Delivery Promise Date */}
        <div className="flex items-center gap-1.5 font-bold text-white leading-tight">
          <FlagIcon countryCode={originCountry} className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold text-white/95 text-[11px] sm:text-xs">
            {displayPromise}
          </span>
        </div>

        {/* 2. Secondary, small and muted: Ships from */}
        <div className="text-[10px] text-white/50 leading-none">
          {shipsFrom}
        </div>

        {/* 3. Stock pill on its own */}
        <div className="pt-0.5">
          <span
            className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase ${
              isOutOfStock
                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : isLowStock
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {stockText}
          </span>
        </div>
      </div>
    );
  }

  // 2. PRODUCT DETAIL PAGE MODE (With Expander)
  if (mode === 'detail') {
    const rawEst = estimate?.estimate;
    const earliestStr = rawEst?.earliestDate;
    const latestStr = rawEst?.latestDate;
    const orderByTime = rawEst?.orderByTime;
    const requiresCustoms = rawEst?.requiresCustoms;

    return (
      <div className={`space-y-3 bg-[#171717] border border-white/10 rounded-2xl p-4 text-xs ${className}`}>
        {/* Primary Line */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FlagIcon countryCode={originCountry} className="w-4 h-4 shrink-0" />
            <span className="font-bold text-white text-sm">
              {displayPromise}
            </span>
          </div>

          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
              isOutOfStock
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : isLowStock
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {stockText}
          </span>
        </div>

        {/* Secondary: Ships from */}
        <div className="flex items-center justify-between text-xs text-white/60">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#F80404]" />
            <span>{shipsFrom}</span>
          </span>

          {/* Toggle details */}
          <button
            type="button"
            onClick={() => setDetailsOpen(prev => !prev)}
            className="text-[11px] font-bold text-white/80 hover:text-white flex items-center gap-1 transition-colors underline"
          >
            <span>{currentLocale === 'en' ? 'Delivery details' : 'Détails de livraison'}</span>
            {detailsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Order-by hint if available today */}
        {orderByTime && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-800/30 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>
              {currentLocale === 'en'
                ? `Order within ${orderByTime.formatted} for dispatch today`
                : `Commandez d'ici ${orderByTime.formatted} pour une expédition aujourd'hui`}
            </span>
          </div>
        )}

        {/* Expander Content */}
        {detailsOpen && (
          <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-white/70 animate-in fade-in duration-150">
            {earliestStr && latestStr && (
              <div className="flex justify-between text-[11px]">
                <span className="text-white/50">{currentLocale === 'en' ? 'Estimated delivery window:' : 'Fenêtre estimée de livraison :'}</span>
                <span className="font-bold text-white">
                  {earliestStr} → {latestStr}
                </span>
              </div>
            )}

            <div className="flex justify-between text-[11px]">
              <span className="text-white/50">{currentLocale === 'en' ? 'Transit lead time:' : 'Délai d\'acheminement :'}</span>
              <span className="font-semibold text-white">
                {rawEst ? `${rawEst.transitMinDays}–${rawEst.transitMaxDays} ${currentLocale === 'en' ? 'working days' : 'jours ouvrables'}` : (resolvedOrigin === 'GENEVA' ? '1–3 jours ouvrables' : '3–5 jours ouvrables')}
              </span>
            </div>

            <div className="flex justify-between text-[11px]">
              <span className="text-white/50">{currentLocale === 'en' ? 'Handling time:' : 'Préparation en entrepôt :'}</span>
              <span className="font-semibold text-white">
                {rawEst ? `${rawEst.handlingDays} ${currentLocale === 'en' ? 'day' : 'jour'}` : '0 jour'}
              </span>
            </div>

            <div className="flex justify-between text-[11px]">
              <span className="text-white/50">{currentLocale === 'en' ? 'Order cutoff time:' : 'Heure limite quotidienne :'}</span>
              <span className="font-semibold text-white">
                {resolvedOrigin === 'GENEVA' ? '14:00 (Genève)' : '12:00 (Lisbonne)'}
              </span>
            </div>

            <div className="flex justify-between text-[11px]">
              <span className="text-white/50">{currentLocale === 'en' ? 'Fulfilment center:' : 'Centre logistique :'}</span>
              <span className="font-bold text-white">
                {resolvedOrigin === 'GENEVA' ? '🇨🇭 Genève, Suisse' : '🇵🇹 Oliveira de Azeméis, Portugal'}
              </span>
            </div>

            {requiresCustoms && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p>
                  {currentLocale === 'en'
                    ? `Customs clearance required for ${rawEst?.destinationCountry || countryCode || 'destination'}. Handled automatically.`
                    : `Dédouanement et formalités requis pour ${rawEst?.destinationCountry || countryCode || 'cette destination'}. Déclaration incluse.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 3. COMPACT / CHECKOUT MODE
  return (
    <div className={`flex items-center gap-2 text-xs text-white/80 ${className}`}>
      <FlagIcon countryCode={originCountry} className="w-3.5 h-3.5 shrink-0" />
      <span className="font-bold text-white">{displayPromise}</span>
      <span className="text-white/40">·</span>
      <span className="text-white/60">{shipsFrom}</span>
    </div>
  );
}
