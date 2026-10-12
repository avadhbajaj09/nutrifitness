'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root layout error caught by global boundary:', error);
  }, [error]);

  return (
    <html lang="fr" className="bg-[#0A0A0A] text-white">
      <body className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-[#141414] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#F80404]/10 border border-[#F80404]/30 flex items-center justify-center text-[#F80404] mx-auto text-2xl">
            ⚡
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-black uppercase text-white tracking-tight">
              NutriFitness Suisse
            </h1>
            <p className="text-xs text-white/60">
              Une interruption temporaire s&apos;est produite lors du chargement. Vos données de commande sont sécurisées.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                try {
                  reset();
                } catch {
                  window.location.href = '/';
                }
              }}
              className="w-full py-3 px-6 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-full transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Recharger l&apos;application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
