'use client';

import React from 'react';
import type { CartItem } from '@/context/StoreContext';

interface CartShipmentGroupsProps {
  cartItems: CartItem[];
  countryCode?: string;
}

export default function CartShipmentGroups({ cartItems, countryCode = 'CH' }: CartShipmentGroupsProps) {
  if (!cartItems.length) return null;

  const physicalItems = cartItems.filter(it => !it.isEbook);
  if (!physicalItems.length) return null;

  const isCH = countryCode === 'CH' || countryCode === 'LI';

  // Auto-route each item based on countryCode and item origin
  const genevaItems: CartItem[] = [];
  const ptItems: CartItem[] = [];

  for (const it of physicalItems) {
    const isCommon = it.locationType === 'COMMON' || it.shippingOrigin === 'common';
    if (isCommon) {
      if (isCH) {
        genevaItems.push(it);
      } else {
        ptItems.push(it);
      }
    } else if (it.shippingOrigin === 'portugal' || it.locationType === 'PORTUGAL_ONLY' || it.isPortugal) {
      ptItems.push(it);
    } else {
      genevaItems.push(it);
    }
  }

  const isMixed = genevaItems.length > 0 && ptItems.length > 0;
  const hasCommon = physicalItems.some(it => it.locationType === 'COMMON' || it.shippingOrigin === 'common');

  // Only render the multi-shipment banner when cart is mixed
  if (!isMixed) {
    // Single origin — show a minimal origin badge
    const origin = ptItems.length > 0 ? 'portugal' : 'geneva';
    return (
      <div className={`rounded-xl border p-3.5 mb-4 text-xs ${origin === 'geneva' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
        <div className="flex items-start gap-2.5">
          <span className="text-base leading-none mt-0.5">{origin === 'geneva' ? '🇨🇭' : '🇵🇹'}</span>
          <div>
            <p className="text-white/90 font-medium">
              {origin === 'geneva'
                ? 'Tous vos articles sont expédiés depuis notre boutique de Genève, Suisse (livraison rapide 1–3 jours).'
                : 'Tous vos articles sont expédiés depuis notre entrepôt au Portugal (livraison 3–7 jours).'}
            </p>
            {hasCommon && (
              <p className="text-purple-300/80 text-[11px] mt-1">
                ✓ Produits disponibles aux 2 endroits (Genève & Portugal) : expédition automatiquement routée vers le centre le plus proche ({isCH ? 'Genève pour la Suisse' : 'Portugal pour l’Europe sans frais de douane'}).
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mixed cart — show 2 shipment cards
  const genevaWeight = genevaItems.reduce((acc) => acc + 500, 0); // 500g per item approx
  const ptWeight = ptItems.reduce((acc) => acc + 500, 0);

  return (
    <div className="mb-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">
          📦 Votre commande sera expédiée en 2 envois distincts
        </p>
        <span className="text-[11px] text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
          Routage multi-origine automatique
        </span>
      </div>

      {/* Geneva shipment */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🇨🇭</span>
            <div>
              <p className="text-white font-bold text-sm">Envoi 1 – Expédié depuis Genève, Suisse</p>
              <p className="text-white/50 text-xs">{genevaItems.length} article{genevaItems.length > 1 ? 's' : ''} · livraison en 1–3 jours ouvrables</p>
            </div>
          </div>
          <span className="text-emerald-400 text-xs font-bold border border-emerald-500/30 px-2 py-0.5 rounded-full">
            {genevaWeight >= 75000 ? 'Livraison gratuite' : 'CHF 7.90'}
          </span>
        </div>
        <ul className="space-y-1">
          {genevaItems.map((it) => {
            const isCom = it.locationType === 'COMMON' || it.shippingOrigin === 'common';
            return (
              <li key={it.itemKey} className="text-white/70 text-xs flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {it.name} {it.flavor ? `– ${it.flavor}` : ''} × {it.quantity}
                </span>
                {isCom && (
                  <span className="text-[10px] text-purple-300 font-medium">🇨🇭 🇵🇹 (Stocké aux 2 sites)</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Portugal shipment */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🇵🇹</span>
            <div>
              <p className="text-white font-bold text-sm">Envoi 2 – Expédié depuis le Portugal</p>
              <p className="text-white/50 text-xs">
                {ptItems.length} article{ptItems.length > 1 ? 's' : ''} · livraison en{' '}
                {countryCode === 'CH' || countryCode === 'LI' ? '4–8' : countryCode === 'GB' || countryCode === 'NO' || countryCode === 'IS' ? '5–10' : '3–7'} jours ouvrables
              </p>
            </div>
          </div>
          <span className="text-blue-400 text-xs font-bold border border-blue-500/30 px-2 py-0.5 rounded-full">
            CHF 9.90
          </span>
        </div>
        <ul className="space-y-1">
          {ptItems.map((it) => {
            const isCom = it.locationType === 'COMMON' || it.shippingOrigin === 'common';
            return (
              <li key={it.itemKey} className="text-white/70 text-xs flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  {it.name} {it.flavor ? `– ${it.flavor}` : ''} × {it.quantity}
                </span>
                {isCom && (
                  <span className="text-[10px] text-purple-300 font-medium">🇨🇭 🇵🇹 (Stocké aux 2 sites)</span>
                )}
              </li>
            );
          })}
        </ul>
        {(countryCode === 'CH' || countryCode === 'LI' || countryCode === 'GB' || countryCode === 'NO' || countryCode === 'IS') && (
          <p className="mt-2 text-yellow-400/80 text-xs">
            ⚠️ Des droits de douane/TVA peuvent s&apos;appliquer à la livraison pour cet envoi.
          </p>
        )}
      </div>
    </div>
  );
}
