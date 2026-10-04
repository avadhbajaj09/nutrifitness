'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';

export default function TopBar() {
  const [closed, setClosed] = useState(false);
  const { t } = useStore();

  if (closed) return null;

  return (
    <div className="bg-[#F80404] text-black py-1.5 border-b border-black/20 select-none relative z-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
        
        {/* Animated Marquee Strip in selected language */}
        <div className="overflow-hidden whitespace-nowrap flex-1 relative">
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
