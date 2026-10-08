'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/context/StoreContext';
import { SUPPORTED_COUNTRIES } from '@/components/CountrySelector';
import type { AvailabilityResult } from '@/lib/fulfillment/types';
import { MapPin, Truck, ChevronDown, Check } from 'lucide-react';

interface DeliveryBadgeProps {
  productId: string;
  shippingOrigin?: 'switzerland' | 'portugal' | 'common';
  locationType?: 'COMMON' | 'GENEVA_ONLY' | 'PORTUGAL_ONLY';
  stockGeneva?: number;
  stockPortugal?: number;
  className?: string;
}

export default function DeliveryBadge({
  productId,
  shippingOrigin,
  locationType,
  stockGeneva,
  stockPortugal,
  className = ''
}: DeliveryBadgeProps) {
  const { countryCode, setCountryCode, locale } = useStore();
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChangingCountry, setIsChangingCountry] = useState(false);

  const activeCountry = SUPPORTED_COUNTRIES.find(c => c.code === countryCode) || SUPPORTED_COUNTRIES[0];
  const activeCountryName = activeCountry.name[locale] || activeCountry.name.fr;

  const fetchAvailability = useCallback(async (cc: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        productId,
        country: cc,
        ...(shippingOrigin ? { origin: shippingOrigin } : {}),
        ...(locationType ? { locationType } : {}),
        ...(typeof stockGeneva === 'number' ? { stockGeneva: String(stockGeneva) } : {}),
        ...(typeof stockPortugal === 'number' ? { stockPortugal: String(stockPortugal) } : {}),
      });
      const res = await fetch(`/api/fulfillment/availability/?${params.toString()}`);
      if (res.ok) {
        const data = await res.json() as AvailabilityResult;
        setResult(data);
      }
    } catch {
      const isCom = locationType === 'COMMON' || shippingOrigin === 'common';
      const isCH = cc === 'CH' || cc === 'LI';
      const lbl = isCom
        ? isCH
          ? '🇨🇭 Expédié depuis Genève – livraison en 1–3 jours ouvrables'
          : '🇵🇹 Expédié depuis le Portugal – livraison en 3–5 jours ouvrables'
        : shippingOrigin === 'portugal'
        ? '🇵🇹 Expédié depuis le Portugal – livraison en 3–5 jours ouvrables'
        : '🇨🇭 Expédié depuis Genève – livraison en 1–3 jours ouvrables';
      setResult({
        available: true,
        origin: isCom ? (isCH ? 'GENEVA' : 'PORTUGAL') : shippingOrigin === 'portugal' ? 'PORTUGAL' : 'GENEVA',
        isCommon: isCom,
        commonNote: isCom
          ? isCH
            ? '🌍 Stock disponible à Genève & Portugal · Auto-sélection expédition suisse rapide'
            : "🌍 Stock disponible à Genève & Portugal · Auto-sélection expédition directe usine UE (sans douane)"
          : undefined,
        label: lbl,
        labelFr: lbl,
        labelEn: lbl
      });
    } finally {
      setLoading(false);
    }
  }, [productId, shippingOrigin, locationType, stockGeneva, stockPortugal]);

  useEffect(() => {
    void fetchAvailability(countryCode || 'CH');
  }, [countryCode, fetchAvailability]);

  const isCommon = result?.isCommon || locationType === 'COMMON' || shippingOrigin === 'common';

  const badgeColor = !result
    ? 'border-white/10 bg-white/5'
    : !result.available
    ? 'border-red-500/30 bg-red-500/10'
    : isCommon
    ? 'border-purple-500/30 bg-purple-950/20'
    : result.origin === 'GENEVA'
    ? 'border-emerald-500/30 bg-emerald-500/10'
    : 'border-blue-500/30 bg-blue-500/10';

  return (
    <div className={`rounded-2xl border ${badgeColor} p-3.5 text-xs transition-all ${className}`}>
      {/* Header bar: Delivery destination + quick switch button */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Truck className="w-3.5 h-3.5 text-white/50 shrink-0" />
          <span className="text-white/60">Livraison vers :</span>
          <span className="font-bold text-white flex items-center gap-1 truncate">
            <span>{activeCountry.flag}</span>
            <span className="truncate">{activeCountryName}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsChangingCountry(!isChangingCountry)}
          className="text-[11px] font-bold text-white/60 hover:text-white underline underline-offset-2 shrink-0 transition-colors"
        >
          {isChangingCountry ? 'Fermer' : 'Modifier'}
        </button>
      </div>

      {/* Inline country switcher dropdown when toggled */}
      {isChangingCountry && (
        <div className="mb-3 p-2 bg-black/50 border border-white/10 rounded-xl max-h-40 overflow-y-auto space-y-1 animate-in fade-in duration-150">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1 px-1">
            Changer le pays de destination :
          </div>
          <div className="grid grid-cols-2 gap-1">
            {SUPPORTED_COUNTRIES.map((c) => {
              const active = c.code === countryCode;
              const cName = c.name[locale] || c.name.fr;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCountryCode(c.code);
                    setIsChangingCountry(false);
                  }}
                  className={`flex items-center justify-between p-1.5 rounded-lg text-[11px] font-bold transition-all text-left ${
                    active
                      ? 'bg-[#F80404] text-black font-black'
                      : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1 truncate">
                    <span>{c.flag}</span>
                    <span className="truncate">{cName}</span>
                  </span>
                  {active && <Check className="w-3 h-3 shrink-0 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reassurance text */}
      {loading ? (
        <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
      ) : (
        <div className="space-y-1.5">
          <p className={`font-bold flex items-center gap-1.5 ${result?.available === false ? 'text-red-400' : 'text-white'}`}>
            <span>{result?.available === false ? '❌' : result?.origin === 'PORTUGAL' ? '🇵🇹' : '🇨🇭'}</span>
            <span>{result?.label ?? ''}</span>
          </p>

          {result?.commonNote && (
            <p className="text-[11px] text-purple-200/90 font-medium leading-relaxed bg-purple-500/10 px-2.5 py-1.5 rounded-lg border border-purple-500/20">
              {result.commonNote}
            </p>
          )}

          {result?.dutiesNote && (
            <p className="text-yellow-400/90 text-[11px] flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
              <span>⚠️</span>
              <span>{result.dutiesNote}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
