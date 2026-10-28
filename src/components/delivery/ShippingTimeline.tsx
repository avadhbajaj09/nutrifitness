'use client';

import React, { useMemo } from 'react';
import { ShoppingBag, Truck, MapPin } from 'lucide-react';

interface ShippingTimelineProps {
  origin: 'GENEVA' | 'PORTUGAL';
  destinationCountry?: string;
  isClickCollect?: boolean;
  locale?: string;
  className?: string;
}

export function ShippingTimeline({
  origin,
  destinationCountry = 'CH',
  isClickCollect = false,
  locale = 'fr',
  className = ''
}: ShippingTimelineProps) {
  // Compute timeline dates based on origin cutoff and destination working days
  const timeline = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    const isWeekend = currentDay === 0 || currentDay === 6;

    const cutoffHour = origin === 'GENEVA' ? 14 : 12;
    const isBeforeCutoff = !isWeekend && currentHour < cutoffHour;

    // Helper: add working days (Mon-Fri)
    const addWorkingDays = (startDate: Date, days: number): Date => {
      const cur = new Date(startDate);
      let count = 0;
      while (count < days) {
        cur.setDate(cur.getDate() + 1);
        const day = cur.getDay();
        if (day !== 0 && day !== 6) {
          count++;
        }
      }
      return cur;
    };

    // Calculate dispatch date
    let dispatchDate = new Date(now);
    if (isClickCollect) {
      // Handled today
    } else if (isWeekend) {
      const daysToAdd = currentDay === 0 ? 1 : 2;
      dispatchDate.setDate(dispatchDate.getDate() + daysToAdd);
    } else if (!isBeforeCutoff) {
      dispatchDate = addWorkingDays(dispatchDate, 1);
    }

    // Transit days: Geneva to CH/LI = 1-2 days, Portugal to CH/EU = 3-5 days
    const minDays = origin === 'GENEVA' ? 1 : 3;
    const maxDays = origin === 'GENEVA' ? 2 : 5;

    const earliestDelivery = addWorkingDays(dispatchDate, minDays);
    const latestDelivery = addWorkingDays(dispatchDate, maxDays);

    const intlLocale = locale === 'en' ? 'en-US' : locale === 'de' ? 'de-CH' : locale === 'it' ? 'it-CH' : 'fr-CH';
    const dayMonthFmt = new Intl.DateTimeFormat(intlLocale, { day: 'numeric', month: 'short' });

    const orderDateStr = dayMonthFmt.format(now);
    const dispatchDateStr = dayMonthFmt.format(dispatchDate);

    // Delivery range formatting
    const earliestStr = dayMonthFmt.format(earliestDelivery);
    const latestStr = dayMonthFmt.format(latestDelivery);

    let deliveryDateStr = '';
    if (earliestDelivery.getMonth() === latestDelivery.getMonth()) {
      deliveryDateStr = `${earliestDelivery.getDate()}–${latestStr}`;
    } else {
      deliveryDateStr = `${earliestStr} → ${latestStr}`;
    }

    return {
      isBeforeCutoff,
      orderDateStr,
      dispatchDateStr,
      deliveryDateStr,
      cutoffHour
    };
  }, [origin, isClickCollect, locale]);

  const lang = locale === 'de' ? 'de' : locale === 'en' ? 'en' : locale === 'it' ? 'it' : 'fr';

  const labels = {
    order: lang === 'en' ? 'Order' : lang === 'de' ? 'Bestellung' : lang === 'it' ? 'Ordine' : 'Commande',
    shipping: lang === 'en' ? 'Shipping' : lang === 'de' ? 'Versand' : lang === 'it' ? 'Spedizione' : 'Expédition',
    delivery: lang === 'en' ? 'Delivery' : lang === 'de' ? 'Lieferung' : lang === 'it' ? 'Consegna' : 'Livraison',
    collect: lang === 'en' ? 'Ready in 2h' : lang === 'de' ? 'Bereit in 2h' : lang === 'it' ? 'Pronto in 2h' : 'Prêt en 2h',
  };

  // Headline message above timeline
  let headline = '';
  if (isClickCollect) {
    headline = lang === 'en'
      ? '📍 Collect today in 2h at our Geneva store (Rue des Pâquis 34).'
      : lang === 'de'
      ? '📍 Heute in 2h in unserem Store in Genf abholbereit (Rue des Pâquis 34).'
      : lang === 'it'
      ? '📍 Ritiro oggi in 2h nel nostro negozio di Ginevra (Rue des Pâquis 34).'
      : "📍 Retrait disponible aujourd'hui en 2h à notre boutique de Genève (Rue des Pâquis 34).";
  } else if (origin === 'GENEVA') {
    if (timeline.isBeforeCutoff) {
      headline = lang === 'en'
        ? `Order today before ${timeline.cutoffHour}:00 PM and you will receive your package in 1 to 2 business days.`
        : lang === 'de'
        ? `Heute vor ${timeline.cutoffHour}:00 Uhr bestellen und Ihr Paket in 1 bis 2 Werktagen erhalten.`
        : lang === 'it'
        ? `Ordina oggi prima delle ${timeline.cutoffHour}:00 e ricevi il tuo pacco in 1-2 giorni lavorativi.`
        : `Commandez aujourd'hui avant ${timeline.cutoffHour}h pour une expédition le jour même et une livraison sous 1 à 2 jours.`;
    } else {
      headline = lang === 'en'
        ? 'Dispatched tomorrow morning via Swiss Post Priority (1 to 2 business days delivery).'
        : lang === 'de'
        ? 'Versand morgen früh mit Schweizer Post Priority (1 bis 2 Werktage Lieferzeit).'
        : lang === 'it'
        ? 'Spedito domani mattina con La Posta Svizzera Priority (consegna in 1-2 giorni lavorativi).'
        : 'Colis préparé et expédié demain matin par PostPac Priority (livraison en 1 à 2 jours ouvrables).';
    }
  } else {
    headline = lang === 'en'
      ? 'Dispatched directly from our European hub in Portugal (3 to 5 business days delivery).'
      : lang === 'de'
      ? 'Direktversand aus unserem EU-Logistikzentrum in Portugal (3 bis 5 Werktage Lieferzeit).'
      : lang === 'it'
      ? 'Spedito dal polo logistico europeo in Portogallo (3-5 giorni lavorativi).'
      : 'Colis expédié directement depuis notre centre logistique au Portugal (3 à 5 jours ouvrables).';
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5 text-xs ${className}`}>
      {/* Top Headline Message */}
      <p className="text-xs sm:text-sm font-bold text-white mb-4 flex items-center gap-2">
        <span>{headline}</span>
      </p>

      {/* Visual 3-Node Timeline matching reference */}
      <div className="relative py-2 px-2 sm:px-6">
        {/* Background Connecting Line */}
        <div className="absolute left-8 right-8 top-7 -translate-y-1/2 h-[2px] bg-white/15 -z-0" />
        <div 
          className="absolute left-8 top-7 -translate-y-1/2 h-[2px] bg-[#95d600] -z-0 transition-all duration-300"
          style={{ width: isClickCollect ? '85%' : '45%' }}
        />

        <div className="relative z-10 flex items-start justify-between">
          {/* Milestone 1: Commande / Order */}
          <div className="flex flex-col items-center text-center w-24">
            <div className="w-9 h-9 rounded-full bg-[#181818] border-2 border-[#95d600] text-[#95d600] flex items-center justify-center shadow-lg mb-1.5">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-white">{timeline.orderDateStr}</span>
            <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider">{labels.order}</span>
          </div>

          {/* Milestone 2: Expédition / Shipping */}
          <div className="flex flex-col items-center text-center w-24">
            <div className={`w-9 h-9 rounded-full bg-[#181818] border-2 flex items-center justify-center shadow-lg mb-1.5 ${
              timeline.isBeforeCutoff || isClickCollect ? 'border-white text-white' : 'border-white/50 text-white/70'
            }`}>
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-white">
              {isClickCollect ? labels.collect : timeline.dispatchDateStr}
            </span>
            <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider">{labels.shipping}</span>
          </div>

          {/* Milestone 3: Livraison / Delivery */}
          <div className="flex flex-col items-center text-center w-24">
            <div className="w-9 h-9 rounded-full bg-[#181818] border-2 border-[#F80404] text-[#F80404] flex items-center justify-center shadow-lg mb-1.5">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-[#F80404]">
              {isClickCollect ? 'Boutique Genève' : timeline.deliveryDateStr}
            </span>
            <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider">{labels.delivery}</span>
          </div>
        </div>
      </div>

      {/* Bottom Info Pill */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/70">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">
            {origin === 'GENEVA'
              ? (isClickCollect ? 'Retrait physique gratuit à Genève' : 'En stock à Genève · Livraison sous 1 à 2 jours')
              : 'En stock plateforme Europe · Livraison sous 3 à 5 jours'}
          </span>
        </div>
        <span className="text-[10px] text-white/50">
          {origin === 'GENEVA' ? 'PostPac Priority (La Poste Suisse)' : 'Transporteur Express International'}
        </span>
      </div>
    </div>
  );
}
