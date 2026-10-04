import React from 'react';

export default function TrustStrip() {
  return (
    <section className="mb-16">
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
              Entrepôt physique à Genève. Aucun frais de douane ni taxe imprévue à la réception.
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
              Livraison Express 24h
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
              Boutique à Genève
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
