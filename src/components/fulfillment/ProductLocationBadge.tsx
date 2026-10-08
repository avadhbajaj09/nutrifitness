'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';

export interface ProductLocationBadgeProps {
  locationType?: 'COMMON' | 'GENEVA_ONLY' | 'PORTUGAL_ONLY';
  shippingOrigin?: 'switzerland' | 'portugal' | 'common';
  mainLocation?: 'GENEVA' | 'PORTUGAL';
  stockGeneva?: number;
  stockPortugal?: number;
  inStock?: boolean;
  className?: string;
  variant?: 'card' | 'pill' | 'compact';
}

const GENEVA_ALLOW_LIST = new Set(['CH', 'LI', 'FR', 'DE', 'IT', 'AT']);

export default function ProductLocationBadge({
  locationType,
  shippingOrigin,
  mainLocation,
  stockGeneva,
  stockPortugal,
  inStock = true,
  className = '',
  variant = 'card'
}: ProductLocationBadgeProps) {
  const { t, countryCode } = useStore();

  const isCommon = locationType === 'COMMON' || shippingOrigin === 'common';
  const isPortugalOnly =
    locationType === 'PORTUGAL_ONLY' ||
    (shippingOrigin === 'portugal' && !isCommon);

  // Stock status determination without exposing numeric quantities
  let hasStock = inStock;
  if (isCommon) {
    const sGen = typeof stockGeneva === 'number' ? stockGeneva : 25;
    const sPt = typeof stockPortugal === 'number' ? stockPortugal : 25;
    hasStock = inStock && (sGen > 0 || sPt > 0);
  } else if (isPortugalOnly) {
    const sPt = typeof stockPortugal === 'number' ? stockPortugal : 25;
    hasStock = inStock && sPt > 0;
  } else {
    const sGen = typeof stockGeneva === 'number' ? stockGeneva : 25;
    hasStock = inStock && sGen > 0;
  }

  const isOutOfStock = !hasStock;

  // Destination context
  const currentCc = (countryCode || 'CH').toUpperCase();
  const isSwissDestination = currentCc === 'CH' || currentCc === 'LI';
  const isGenevaAllowed = GENEVA_ALLOW_LIST.has(currentCc);

  let isBlocked = false;
  let locationLabel: string;
  let flagIcon: string;
  let activeOrigin: 'GENEVA' | 'PORTUGAL' = 'GENEVA';

  if (isCommon) {
    // COMMON: auto-select nearest origin based on customer country
    if (isSwissDestination) {
      activeOrigin = 'GENEVA';
      locationLabel = 'Expédié de Genève (24h)';
      flagIcon = '🇨🇭';
    } else {
      activeOrigin = 'PORTUGAL';
      locationLabel = 'Expédié du Portugal (3–5j)';
      flagIcon = '🇵🇹';
    }
  } else if (isPortugalOnly) {
    activeOrigin = 'PORTUGAL';
    locationLabel = 'Expédié du Portugal (3–5j)';
    flagIcon = '🇵🇹';
  } else {
    // GENEVA ONLY
    activeOrigin = 'GENEVA';
    if (!isGenevaAllowed) {
      isBlocked = true;
      locationLabel = 'Stock Genève';
      flagIcon = '🇨🇭';
    } else {
      locationLabel = 'Expédié de Genève (24h)';
      flagIcon = '🇨🇭';
    }
  }

  // Stock text strictly without numbers: "En stock" / "Rupture de stock" / "Non livrable"
  let stockText: string;
  if (isBlocked) {
    stockText = `Non livrable (${currentCc})`;
  } else if (isOutOfStock) {
    stockText = t.common.ruptureStock || 'Rupture de stock';
  } else {
    stockText = 'En stock';
  }

  const isGreen = !isBlocked && !isOutOfStock && activeOrigin === 'GENEVA';
  const isBlue = !isBlocked && !isOutOfStock && activeOrigin === 'PORTUGAL';

  // Compact Pill (e.g. over image corner or in product detail)
  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md border shadow-xs transition-colors ${
          isBlocked || isOutOfStock
            ? 'bg-red-950/80 text-red-400 border-red-500/30'
            : isGreen
            ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/40'
            : 'bg-blue-950/85 text-blue-300 border-blue-500/40'
        } ${className}`}
      >
        <span className="text-xs leading-none">{flagIcon}</span>
        <span>{locationLabel}</span>
        <span className="text-white/40">·</span>
        <span className="font-extrabold">{stockText}</span>
      </span>
    );
  }

  // Standard Card Badge (integrated into product cards)
  return (
    <div
      className={`flex items-center justify-between gap-1 text-[11px] font-semibold transition-all ${className}`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isBlocked || isOutOfStock
              ? 'bg-red-500'
              : isGreen
              ? 'bg-emerald-400 animate-pulse'
              : 'bg-blue-400 animate-pulse'
          }`}
          aria-hidden="true"
        />
        <span className="text-xs leading-none">{flagIcon}</span>
        <span
          className={`truncate font-bold ${
            isBlocked || isOutOfStock
              ? 'text-red-400'
              : isGreen
              ? 'text-emerald-400'
              : 'text-blue-300'
          }`}
        >
          {locationLabel}
        </span>
      </div>

      <span
        className={`shrink-0 font-extrabold text-[10px] px-2 py-0.5 rounded-full border ${
          isBlocked || isOutOfStock
            ? 'bg-red-500/10 text-red-400 border-red-500/30'
            : isGreen
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
        }`}
      >
        {stockText}
      </span>
    </div>
  );
}
