'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { AvailabilityResult } from '@/lib/fulfillment/types';

interface DeliveryBadgeProps {
  productId: string;
  shippingOrigin?: 'switzerland' | 'portugal';
  className?: string;
}

const COUNTRY_OPTIONS: { code: string; label: string }[] = [
  { code: 'CH', label: '🇨🇭 Suisse' },
  { code: 'LI', label: '🇱🇮 Liechtenstein' },
  { code: 'FR', label: '🇫🇷 France' },
  { code: 'DE', label: '🇩🇪 Allemagne' },
  { code: 'IT', label: '🇮🇹 Italie' },
  { code: 'AT', label: '🇦🇹 Autriche' },
  { code: 'BE', label: '🇧🇪 Belgique' },
  { code: 'ES', label: '🇪🇸 Espagne' },
  { code: 'PT', label: '🇵🇹 Portugal' },
  { code: 'NL', label: '🇳🇱 Pays-Bas' },
  { code: 'PL', label: '🇵🇱 Pologne' },
  { code: 'GB', label: '🇬🇧 Royaume-Uni' },
  { code: 'NO', label: '🇳🇴 Norvège' },
  { code: 'IS', label: '🇮🇸 Islande' },
  { code: 'LU', label: '🇱🇺 Luxembourg' },
  { code: 'SE', label: '🇸🇪 Suède' },
  { code: 'DK', label: '🇩🇰 Danemark' },
  { code: 'FI', label: '🇫🇮 Finlande' },
];

const COOKIE_NAME = 'nf_country';
const COOKIE_DAYS = 30;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function DeliveryBadge({ productId, shippingOrigin, className = '' }: DeliveryBadgeProps) {
  const [country, setCountry] = useState<string>('CH');
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = getCookie(COOKIE_NAME);
    if (saved && COUNTRY_OPTIONS.some((c) => c.code === saved)) {
      setCountry(saved);
    }
  }, []);

  const fetchAvailability = useCallback(async (cc: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        productId,
        country: cc,
        ...(shippingOrigin ? { origin: shippingOrigin } : {}),
      });
      const res = await fetch(`/api/fulfillment/availability/?${params.toString()}`);
      if (res.ok) {
        const data = await res.json() as AvailabilityResult;
        setResult(data);
      }
    } catch {
      const lbl = shippingOrigin === 'portugal'
          ? '🇵🇹 Expédié depuis le Portugal – livraison en 3–7 jours ouvrables'
          : '🇨🇭 Expédié depuis Genève – livraison en 1–3 jours ouvrables';
      setResult({
        available: true,
        label: lbl,
        labelFr: lbl,
        labelEn: lbl
      });
    } finally {
      setLoading(false);
    }
  }, [productId, shippingOrigin]);

  useEffect(() => {
    void fetchAvailability(country);
  }, [country, fetchAvailability]);

  function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const cc = e.target.value;
    setCountry(cc);
    setCookie(COOKIE_NAME, cc, COOKIE_DAYS);
  }

  const badgeColor = !result
    ? 'border-white/10 bg-white/5'
    : !result.available
    ? 'border-red-500/30 bg-red-500/10'
    : result.origin === 'GENEVA'
    ? 'border-emerald-500/30 bg-emerald-500/10'
    : 'border-blue-500/30 bg-blue-500/10';

  return (
    <div className={`rounded-xl border ${badgeColor} p-3 text-xs ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-white/50 shrink-0">🌍 Livraison vers :</span>
        <select
          value={country}
          onChange={handleCountryChange}
          className="bg-black/40 border border-white/10 text-white text-xs rounded-md px-2 py-0.5 focus:outline-none focus:border-white/30 cursor-pointer flex-1 min-w-0"
        >
          {COUNTRY_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
      ) : (
        <div>
          <p className={`font-semibold ${result?.available === false ? 'text-red-400' : 'text-white'}`}>
            {result?.label ?? ''}
          </p>
          {result?.dutiesNote && (
            <p className="text-yellow-400/80 mt-1">⚠️ {result.dutiesNote}</p>
          )}
        </div>
      )}
    </div>
  );
}
