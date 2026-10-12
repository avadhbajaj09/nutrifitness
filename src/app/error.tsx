'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCw, Home, ShoppingBag } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled route error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6 text-2xl">
        ⚠️
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading tracking-tight mb-3">
        Une erreur temporaire est survenue
      </h1>
      
      <p className="text-xs sm:text-sm text-white/60 max-w-md mb-8 leading-relaxed">
        Votre panier et vos préférences sont conservés en toute sécurité. Cliquez ci-dessous pour recharger la page ou continuer vos achats.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            try {
              reset();
            } catch {
              window.location.reload();
            }
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-full transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
          <span>Recharger la page</span>
        </button>

        <Link
          href="/boutique/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs rounded-full transition-all border border-white/10"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Voir la boutique</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold uppercase tracking-wider text-xs rounded-full transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Accueil</span>
        </Link>
      </div>
    </div>
  );
}
