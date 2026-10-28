'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';

const MOBILE_MESSAGES = [
  'Livraison offerte dès 75 CHF',
  'Livraison 1-2 jours Poste Suisse',
  'Paiement TWINT'
];

export default function TopBar() {
  const [closed, setClosed] = useState(false);
  const [activeMobileMsg, setActiveMobileMsg] = useState(0);
  const { t } = useStore();

  useEffect(() => {
    // Only run mobile rotation if on phone screens
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 767px)');
    if (!media.matches) return;

    const interval = setInterval(() => {
      setActiveMobileMsg(prev => (prev + 1) % MOBILE_MESSAGES.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  if (closed) return null;

  return (
    <div className="bg-[#F80404] text-black py-1.5 border-b border-black/20 select-none relative z-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
        
        {/* Desktop: Animated Marquee Strip in selected language (Untouched >= 768px) */}
        <div className="hidden md:block overflow-hidden whitespace-nowrap flex-1 relative">
          <div className="animate-marquee text-xs font-black uppercase tracking-wider flex items-center gap-6">
            <span className="flex items-center gap-2">{t.topBar.shipping24h}</span>
            <span>✦</span>
            <span className="flex items-center gap-2">{t.topBar.storeGeneva}</span>
            <span>✦</span>
            <span className="flex items-center gap-2">{t.topBar.stockSwiss}</span>
            <span>✦</span>
            <span className="flex items-center gap-2">{t.topBar.certified}</span>
            <span>✦</span>
            <span className="flex items-center gap-2">{t.topBar.twint}</span>
            <span>✦</span>
            {/* Infinite loop repetition */}
            <span className="flex items-center gap-2">{t.topBar.shipping24h}</span>
            <span>✦</span>
            <span className="flex items-center gap-2">{t.topBar.storeGeneva}</span>
            <span>✦</span>
            <span className="flex items-center gap-2">{t.topBar.stockSwiss}</span>
            <span>✦</span>
            <span className="flex items-center gap-2">{t.topBar.certified}</span>
            <span>✦</span>
            <span className="flex items-center gap-2">{t.topBar.twint}</span>
            <span>✦</span>
          </div>
        </div>

        {/* Mobile: Clean single message rotating display (< 768px, max 32px height, 12px font) */}
        <div className="md:hidden flex-1 flex items-center justify-center overflow-hidden h-7 text-center">
          <span 
            key={activeMobileMsg}
            className="text-[12px] font-black uppercase tracking-wider text-black truncate transition-all duration-500 animate-in fade-in"
          >
            {MOBILE_MESSAGES[activeMobileMsg]}
          </span>
        </div>

        {/* Close Button only */}
        <button 
          type="button" 
          onClick={() => setClosed(true)}
          className="bg-black/10 hover:bg-black/20 text-black px-2 py-0.5 rounded text-[10px] font-black transition-colors shrink-0"
          aria-label="Fermer le bandeau"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
