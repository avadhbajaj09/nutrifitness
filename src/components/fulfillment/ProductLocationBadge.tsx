'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { MapPin } from 'lucide-react';

export interface ProductLocationBadgeProps {
  locationType?: 'COMMON' | 'GENEVA_ONLY' | 'PORTUGAL_ONLY';
  shippingOrigin?: 'switzerland' | 'portugal';
  mainLocation?: 'GENEVA' | 'PORTUGAL';
  stockGeneva?: number;
  stockPortugal?: number;
  inStock?: boolean;
  className?: string;
  variant?: 'card' | 'pill' | 'compact';
}

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
  const { t } = useStore();

  // Determine location derived from data
  // COMMON product (Geneva + Portugal active): badge is ALWAYS Geneva (Geneva stock)
  // Geneva only: Geneva
  // Portugal only: Portugal
  const isPortugalOnly =
    locationType === 'PORTUGAL_ONLY' ||
    (shippingOrigin === 'portugal' && locationType !== 'COMMON');

  const isCommon = locationType === 'COMMON';

  // Effective location displayed on the card badge
  const displayLocation = isPortugalOnly ? 'PORTUGAL' : 'GENEVA';

  // Stock count determination
  let effectiveStock: number;
  if (displayLocation === 'GENEVA') {
    effectiveStock = typeof stockGeneva === 'number' ? stockGeneva : inStock ? 15 : 0;
  } else {
    effectiveStock = typeof stockPortugal === 'number' ? stockPortugal : inStock ? 15 : 0;
  }

  // Fallback for COMMON products: if Geneva has 0 stock but Portugal has stock
  const hasFallbackStock =
    isCommon && effectiveStock === 0 && (stockPortugal ?? 0) > 0;

  const isOutOfStock = effectiveStock <= 0 && !hasFallbackStock;
  const isLowStock = effectiveStock > 0 && effectiveStock <= 5;

  // Labels
  let locationLabel: string;
  let flagIcon: string;

  if (displayLocation === 'GENEVA' && !hasFallbackStock) {
    locationLabel = t.common.inStockGeneva || 'En stock à Genève';
    flagIcon = '🇨🇭';
  } else {
    locationLabel = t.common.inStockPortugal || 'Expédié du Portugal';
    flagIcon = '🇵🇹';
  }

  // Stock count text formatting
  let stockText: string;
  if (isOutOfStock) {
    stockText = t.common.ruptureStock || 'Rupture de stock';
  } else if (hasFallbackStock) {
    stockText = `${stockPortugal} dispo PT`;
  } else if (isLowStock) {
    stockText = (t.common.onlyLeft || 'Plus que {count} en stock').replace(
      '{count}',
      effectiveStock.toString()
    );
  } else {
    stockText = (t.common.unitsInStock || '{count} en stock').replace(
      '{count}',
      effectiveStock.toString()
    );
  }

  // Compact Pill (e.g. over image corner or in tight spaces)
  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md border shadow-xs transition-colors ${
          isOutOfStock
            ? 'bg-red-950/80 text-red-400 border-red-500/30'
            : isLowStock
            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
            : displayLocation === 'GENEVA'
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
            isOutOfStock
              ? 'bg-red-500'
              : isLowStock
              ? 'bg-amber-400 animate-pulse'
              : 'bg-emerald-400 animate-pulse'
          }`}
          aria-hidden="true"
        />
        <span className="text-xs leading-none">{flagIcon}</span>
        <span
          className={`truncate font-bold ${
            isOutOfStock
              ? 'text-red-400'
              : isLowStock
              ? 'text-amber-300'
              : 'text-emerald-400'
          }`}
        >
          {locationLabel}
        </span>
      </div>

      <span
        className={`shrink-0 font-extrabold text-[10px] px-2 py-0.5 rounded-full border ${
          isOutOfStock
            ? 'bg-red-500/10 text-red-400 border-red-500/30'
            : isLowStock
            ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}
      >
        {stockText}
      </span>
    </div>
  );
}
