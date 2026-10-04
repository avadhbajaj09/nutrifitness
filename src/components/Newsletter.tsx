'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';

export default function Newsletter() {
  const { showToast } = useStore();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    showToast('Club NutriFitness', 'Merci ! Votre bon de réduction de 10% a été envoyé.');
    setEmail('');
  };

  return (
    <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#161616] via-[#1A1A1A] to-[#161616] border border-white/15 p-8 sm:p-14 mb-16 shadow-2xl">
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
        <span className="inline-block px-3 py-1 bg-[#F80404]/20 border border-[#F80404]/40 text-[#F80404] text-xs font-black uppercase tracking-wider rounded-full">
          ⚡ Club Athlète NutriFitness
        </span>

        <h2 className="text-2xl sm:text-4xl font-black text-white uppercase font-heading tracking-tight">
          PROFITEZ DE <span className="text-[#F80404]">-10% SUR VOTRE PREMIÈRE COMMANDE</span>
        </h2>

        <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto leading-relaxed">
          Inscrivez-vous pour recevoir votre code promo immédiat, nos guides exclusifs de posologie créatine/whey et nos ventes privées en Suisse.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse e-mail..."
            className="flex-1 min-h-[48px] px-4 text-xs sm:text-sm bg-black/60 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none transition-all"
          />
          <button 
            type="submit"
            className="min-h-[48px] px-6 py-3 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg hover:shadow-[#F80404]/25 shrink-0"
          >
            Rejoindre (-10%)
          </button>
        </form>

        <p className="text-[11px] text-white/40 pt-1">
          Conforme à la nDSG suisse. Désinscription en 1 clic à tout moment. Zéro spam.
        </p>
      </div>
    </section>
  );
}
