'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Sparkles, Flame, Check, Gift } from 'lucide-react';

interface Props {
  compact?: boolean;
  className?: string;
}

export default function BlackFridayProgressBar({ compact = false, className = '' }: Props) {
  const { blackFriday, cartSubtotal, formatPrice } = useStore();

  if (!blackFriday.isActive) return null;

  const { discountPercent, discountAmount, nextTier, message } = blackFriday;

  // Milestone points in CHF
  const milestones = [
    { threshold: 50, percent: 10, position: 25 },  // 25% across visual bar
    { threshold: 110, percent: 15, position: 55 }, // 55% across visual bar
    { threshold: 200, percent: 25, position: 100 }, // 100% across visual bar
  ];

  // Calculate visual fill percentage across the 3 segments
  let visualPercent = 0;
  if (cartSubtotal <= 0) {
    visualPercent = 0;
  } else if (cartSubtotal < 50) {
    visualPercent = (cartSubtotal / 50) * 25;
  } else if (cartSubtotal < 110) {
    visualPercent = 25 + ((cartSubtotal - 50) / (110 - 50)) * 30; // 25% to 55%
  } else if (cartSubtotal < 200) {
    visualPercent = 55 + ((cartSubtotal - 110) / (200 - 110)) * 45; // 55% to 100%
  } else {
    visualPercent = 100;
  }
  visualPercent = Math.min(100, Math.max(0, visualPercent));

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        discountPercent > 0
          ? 'bg-gradient-to-br from-red-950/40 via-black/80 to-[#121212] border-red-500/40 shadow-lg shadow-red-950/20'
          : 'bg-[#181818] border-white/10'
      } ${compact ? 'p-3.5' : 'p-4 sm:p-5'} ${className}`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-[#F80404] text-xs font-black">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-white font-heading">
            Black Friday — Jusqu&apos;à −25%
          </span>
        </div>

        {discountPercent > 0 ? (
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-black uppercase">
              −{discountPercent}% Débloqué
            </span>
            <span className="text-[11px] font-bold text-white/90">
              Économies : <span className="text-emerald-400 font-black">{formatPrice(discountAmount)}</span>
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-bold text-white/50 uppercase">
            Remise automatique
          </span>
        )}
      </div>

      {/* Motivational Status Message */}
      <div className="text-xs font-medium text-white/90 mb-3 flex items-center gap-1.5">
        {nextTier ? (
          <>
            <span className="text-amber-400 font-bold">⚡</span>
            <span>
              Plus que <strong className="text-amber-400 font-bold">{formatPrice(nextTier.remaining)}</strong> pour profiter de{' '}
              <strong className="text-white font-bold">{nextTier.discountPercent}%</strong> de réduction !
            </span>
          </>
        ) : (
          <>
            <span className="text-emerald-400 font-bold">🎉</span>
            <span className="text-emerald-300 font-bold">
              Félicitations ! Vous profitez de la remise maximale de {discountPercent}% !
            </span>
          </>
        )}
      </div>

      {/* Visual Progress Bar with Milestones */}
      <div className="relative pt-1 pb-4">
        {/* Track */}
        <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 relative">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 via-[#F80404] to-emerald-400"
            style={{ width: `${visualPercent}%` }}
          />
        </div>

        {/* Milestone Markers */}
        <div className="relative w-full mt-1.5">
          {milestones.map((m) => {
            const isReached = cartSubtotal >= m.threshold;
            return (
              <div
                key={m.threshold}
                className="absolute -top-3.5 flex flex-col items-center -translate-x-1/2"
                style={{ left: `${m.position}%` }}
              >
                {/* Node Dot */}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    isReached
                      ? 'bg-emerald-500 border-white text-black scale-110 shadow-md shadow-emerald-500/50'
                      : 'bg-black/90 border-white/30 text-white/40'
                  }`}
                >
                  {isReached ? (
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  )}
                </div>

                {/* Milestone Label */}
                <span
                  className={`text-[10px] mt-1 whitespace-nowrap font-bold uppercase tracking-tight ${
                    isReached ? 'text-emerald-400 font-black' : 'text-white/50'
                  }`}
                >
                  CHF {m.threshold} ({m.percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
