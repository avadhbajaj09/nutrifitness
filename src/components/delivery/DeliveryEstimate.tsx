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
    currentLocale === 'en' ? 'Tracked priority delivery' : currentLocale === 'de' ? 'Verfolgter Versand' : 'Livraison suivie prioritaire'
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
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/80">
            <FlagIcon countryCode={originCountry} className="w-3 h-3 shrink-0" />
            <span>
              {resolvedOrigin === 'GENEVA' 
                ? (currentLocale === 'en' ? 'Swiss stock' : currentLocale === 'de' ? 'Schweizer Lager' : 'Stock Suisse') 
                : (currentLocale === 'en' ? 'EU stock' : currentLocale === 'de' ? 'EU Lager' : 'Stock Europe')}
            </span>
          </span>
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

  // 2. PRODUCT DETAIL PAGE MODE (With Clean Notice)
  if (mode === 'detail') {
    const rawEst = estimate?.estimate;
    const orderByTime = rawEst?.orderByTime;

    return (
      <div className={`space-y-3 bg-[#171717] border border-white/10 rounded-2xl p-4 text-xs ${className}`}>
        {/* Primary Line: Origin & Stock */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FlagIcon countryCode={originCountry} className="w-4 h-4 shrink-0" />
            <span className="font-bold text-white text-sm">
              {resolvedOrigin === 'GENEVA' 
                ? (currentLocale === 'en' ? 'Dispatched from Geneva, Switzerland' : currentLocale === 'de' ? 'Versand aus Genf, Schweiz' : 'Expédié depuis Genève, Suisse') 
                : (currentLocale === 'en' ? 'Dispatched from European Hub (Portugal)' : currentLocale === 'de' ? 'Versand aus EU-Hub (Portugal)' : 'Expédié depuis le Hub Europe (Portugal)')}
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

        {/* Secondary: Notice that exact delivery dates are calculated at checkout */}
        <div className="flex items-center justify-between text-xs text-white/70 bg-white/5 p-2.5 rounded-xl border border-white/5">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#F80404]" />
            <span>
              {currentLocale === 'en'
                ? 'Exact delivery dates & carrier timeline calculated at checkout'
                : currentLocale === 'de'
                ? 'Genaue Lieferzeiten werden beim Checkout berechnet'
                : 'Délais exacts et calendrier de livraison calculés à la commande'}
            </span>
          </span>
        </div>

        {/* Order-by hint if available today */}
        {orderByTime && resolvedOrigin === 'GENEVA' && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-800/30 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>
              {currentLocale === 'en'
                ? `Order within ${orderByTime.formatted} for dispatch today`
                : `Commandez d'ici ${orderByTime.formatted} pour une expédition aujourd'hui`}
            </span>
          </div>
        )}
      </div>
    );
  }

  // 3. COMPACT / CHECKOUT MODE
  return (
    <div className={`flex items-center gap-1.5 text-xs text-white/80 ${className}`}>
      <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span className="font-bold text-white">{displayPromise}</span>
    </div>
  );
}
