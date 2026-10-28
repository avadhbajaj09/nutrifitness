import React from 'react';
import { Truck, ShieldCheck, Smartphone, MapPin } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: 'Livraison 1-2 jours',
    subtitle: 'Poste Suisse',
  },
  {
    icon: ShieldCheck,
    title: 'Stock 100% Suisse',
    subtitle: 'Sans frais de douane',
  },
  {
    icon: Smartphone,
    title: 'Paiement TWINT',
    subtitle: 'En 1 scan',
  },
  {
    icon: MapPin,
    title: 'Click & Collect 2h',
    subtitle: 'Boutique Genève',
  },
];

/**
 * Mobile-only compact horizontal trust strip (rendered under hero on mobile phones)
 * display: none by default on desktop (>= 768px).
 */
export function MobileTrustStrip() {
  return (
    <div 
      className="md:hidden flex gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 mb-6 -mx-4 px-4 select-none"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      aria-label="Engagements NutriFitness Suisse"
    >
      {TRUST_ITEMS.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-2 px-3 py-2 bg-[#121212] border border-white/10 rounded-xl shrink-0 min-h-[44px]"
          >
            <div className="w-7 h-7 rounded-lg bg-[#F80404]/10 border border-[#F80404]/25 flex items-center justify-center shrink-0">
              <Icon className="w-3.5 h-3.5 text-[#F80404]" />
            </div>
            <div className="flex flex-col min-w-0 pr-1">
              <span className="text-[11px] font-black uppercase text-white tracking-tight whitespace-nowrap">
                {item.title}
              </span>
              <span className="text-[10px] text-white/50 whitespace-nowrap">
                {item.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Standard TrustStrip section:
 * Kept identical on desktop (>= 768px).
 * Hidden on mobile (< 768px) to eliminate redundancy.
 */
export default function TrustStrip() {
  return (
    <section className="hidden md:block mb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1 */}
        <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 flex items-start gap-4 hover:border-[#F80404]/50 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-[#D52B1E]/15 border border-[#D52B1E]/30 flex items-center justify-center shrink-0 text-xl">
            🇨🇭
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase font-heading group-hover:text-[#F80404] transition-colors mb-1">
              Stock 100% en Suisse
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Entrepôt physique en Suisse. Aucun frais de douane ni taxe imprévue à la réception.
            </p>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 flex items-start gap-4 hover:border-[#F80404]/50 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-[#F80404]/15 border border-[#F80404]/30 flex items-center justify-center shrink-0 text-xl">
            ⚡
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase font-heading group-hover:text-[#F80404] transition-colors mb-1">
              Livraison Express 1-2 jours
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              PostPac Priority par la Poste Suisse. Frais de port offerts dès 75 CHF d'achat.
            </p>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 flex items-start gap-4 hover:border-[#F80404]/50 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-xl">
            📍
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase font-heading group-hover:text-[#F80404] transition-colors mb-1">
              Boutique en Suisse
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              34 Rue des Pâquis. Retrait Click & Collect immédiat et conseils personnalisés de coachs.
            </p>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 flex items-start gap-4 hover:border-[#F80404]/50 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-xl">
            🛡️
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase font-heading group-hover:text-[#F80404] transition-colors mb-1">
              Paiement TWINT & Sécurisé
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              TWINT en 1 scan, PostFinance, Apple Pay, cartes bancaires et QR-facture suisse.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
