'use client';

import React, { useMemo } from 'react';
import type { CartItem } from '@/context/StoreContext';
import { FlagIcon } from '@/components/delivery/FlagIcon';
import { useDeliveryEstimates } from '@/hooks/useDeliveryEstimate';
import { useStore } from '@/context/StoreContext';
import { Truck, ShieldAlert, Sparkles } from 'lucide-react';

interface CartShipmentGroupsProps {
  cartItems: CartItem[];
  countryCode?: string;
}

export default function CartShipmentGroups({ cartItems, countryCode = 'CH' }: CartShipmentGroupsProps) {
  const { locale, formatPrice } = useStore();
  const currentLocale = (locale === 'de' ? 'de' : locale === 'en' ? 'en' : 'fr') as 'fr' | 'en' | 'de';

  const physicalItems = useMemo(() => cartItems.filter(it => !it.isEbook), [cartItems]);
  const destCountry = (countryCode || 'CH').toUpperCase().trim();
  const isCH = destCountry === 'CH' || destCountry === 'LI';

  // Prepare batch request for delivery dates
  const estimateInputs = useMemo(() => {
    return physicalItems.map(it => ({
      productId: it.id || it.slug,
      shippingOriginHint: it.shippingOrigin,
      quantity: it.quantity
    }));
  }, [physicalItems]);

  const { estimates, overallLatestFormatted, overallLatestDate } = useDeliveryEstimates(
    estimateInputs,
    destCountry
  );

  if (!physicalItems.length) return null;

  // Auto-route each item based on destination country and origin
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

  // Find dynamic delivery date per shipment group
  const genevaEstimate = genevaItems[0] ? estimates.get(genevaItems[0].id || genevaItems[0].slug) : undefined;
  const ptEstimate = ptItems[0] ? estimates.get(ptItems[0].id || ptItems[0].slug) : undefined;

  const genevaDateText = genevaEstimate?.displayDates?.[currentLocale] || '1–2 jours ouvrables';
  const ptDateText = ptEstimate?.displayDates?.[currentLocale] || '3–5 jours ouvrables';

  // 1. Single Origin Cart
  if (!isMixed) {
    const origin = ptItems.length > 0 ? 'portugal' : 'geneva';
    const estDate = origin === 'geneva' ? genevaDateText : ptDateText;

    return (
      <div className={`rounded-xl border p-4 mb-4 text-xs ${origin === 'geneva' ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-blue-500/30 bg-blue-950/20'}`}>
        <div className="flex items-start gap-3">
          <FlagIcon countryCode={origin === 'geneva' ? 'CH' : 'PT'} className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                {currentLocale === 'en' ? 'Estimated delivery:' : 'Livraison estimée :'} <span className="text-white underline decoration-emerald-500 decoration-2">{estDate}</span>
              </span>
            </div>
            <p className="text-white/70">
              {origin === 'geneva'
                ? 'Tous vos articles sont expédiés directement depuis notre boutique à Genève, Suisse.'
                : 'Tous vos articles sont expédiés en direct d\'usine depuis notre entrepôt au Portugal.'}
            </p>
            {hasCommon && (
              <p className="text-purple-300 text-[11px] pt-1">
                ✓ Produit commun stocké à Genève et au Portugal : automatiquement expédié depuis le centre optimal ({isCH ? 'Genève pour la Suisse' : 'Portugal pour l’Europe sans droits de douane'}).
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Mixed Cart (2 Separate Shipments)
  const genevaSubtotal = genevaItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const ptSubtotal = ptItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);

  const latestCombinedPromise = overallLatestFormatted?.[currentLocale] || overallLatestDate;

  return (
    <div className="mb-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-white/90 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <span>📦</span>
          <span>Votre commande sera expédiée en 2 envois distincts</span>
        </p>
        <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2.5 py-0.5 rounded-full">
          Routage multi-origine automatique
        </span>
      </div>

      {/* Geneva shipment */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FlagIcon countryCode="CH" className="w-4 h-4 shrink-0" />
            <div>
              <p className="text-white font-bold text-sm">Colis 1 — Expédié depuis Genève, Suisse</p>
              <p className="text-emerald-400 font-semibold text-xs">
                Livraison estimée : {genevaDateText}
              </p>
            </div>
          </div>
          <span className="text-emerald-400 text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
            {genevaSubtotal >= 75 ? 'Offert' : 'CHF 7.90'}
          </span>
        </div>

        <ul className="space-y-1 pt-1 border-t border-emerald-500/20">
          {genevaItems.map((it) => (
            <li key={it.itemKey} className="text-white/80 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{it.name} {it.flavor ? `– ${it.flavor}` : ''} × {it.quantity}</span>
              </span>
              {(it.locationType === 'COMMON' || it.shippingOrigin === 'common') && (
                <span className="text-[10px] text-purple-300 font-medium">🇨🇭 🇵🇹 (Stocké aux 2 sites)</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Portugal shipment */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FlagIcon countryCode="PT" className="w-4 h-4 shrink-0" />
            <div>
              <p className="text-white font-bold text-sm">Envoi 2 — Expédié depuis le Portugal</p>
              <p className="text-blue-400 font-semibold text-xs">
                Livraison estimée : {ptDateText}
              </p>
            </div>
          </div>
          <span className="text-blue-400 text-xs font-bold border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
            {ptSubtotal >= 120 ? 'Offert' : 'CHF 9.90'}
          </span>
        </div>

        <ul className="space-y-1 pt-1 border-t border-blue-500/20">
          {ptItems.map((it) => (
            <li key={it.itemKey} className="text-white/80 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>{it.name} {it.flavor ? `– ${it.flavor}` : ''} × {it.quantity}</span>
              </span>
              {(it.locationType === 'COMMON' || it.shippingOrigin === 'common') && (
                <span className="text-[10px] text-purple-300 font-medium">🇨🇭 🇵🇹 (Stocké aux 2 sites)</span>
              )}
            </li>
          ))}
        </ul>

        {(destCountry === 'CH' || destCountry === 'LI' || destCountry === 'GB' || destCountry === 'NO' || destCountry === 'IS') && (
          <div className="flex items-center gap-1.5 text-amber-300/90 text-[11px] pt-1">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Formalités douanières incluses depuis l&apos;UE vers {destCountry}.</span>
          </div>
        )}
      </div>

      {/* Single combined line at bottom of cart shipments */}
      {latestCombinedPromise && (
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-white/80">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {currentLocale === 'en'
                ? `All items arrive by`
                : `Tous vos articles arrivent d'ici le`}
            </span>
          </span>
          <span className="font-black text-white text-sm font-heading">
            {latestCombinedPromise}
          </span>
        </div>
      )}
    </div>
  );
}
