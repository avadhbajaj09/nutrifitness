'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ALL_BRANDS } from '@/lib/brands';
import { useStore } from '@/context/StoreContext';
import LanguageCurrencySwitcher from './LanguageCurrencySwitcher';
import { X, ChevronDown, ChevronRight, Sparkles, User, ShieldCheck, BookOpen } from 'lucide-react';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const [areBrandsExpanded, setAreBrandsExpanded] = useState(false);
  const { t } = useStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md z-[95] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <div 
        className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-[#111111] text-white z-[96] border-r border-white/10 p-5 sm:p-6 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation mobile"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F80404] animate-ping" />
            <span className="text-sm font-black uppercase text-white font-heading tracking-wider">
              NutriFitness.ch
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-5 space-y-1.5 text-xs font-bold uppercase tracking-wider font-heading">
          <Link 
            href="/" 
            onClick={onClose} 
            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-white hover:text-[#F80404] transition-colors"
          >
            <span>🏠 Accueil</span>
            <ChevronRight className="w-4 h-4 text-white/30" />
          </Link>

          <Link 
            href="/boutique/" 
            onClick={onClose} 
            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-white hover:text-[#F80404] transition-colors"
          >
            <span>⚡ {t.nav.shop}</span>
            <ChevronRight className="w-4 h-4 text-white/30" />
          </Link>

          {/* Shop by Brand Accordion */}
          <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden my-2">
            <button
              type="button"
              onClick={() => setAreBrandsExpanded(!areBrandsExpanded)}
              className="w-full flex items-center justify-between p-3 text-left text-white hover:text-[#F80404] transition-colors"
            >
              <div className="flex items-center gap-2 text-[#F80404]">
                <Sparkles className="w-4 h-4" />
                <span className="text-white font-black">{t.nav.brands} (Shop by Brand)</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${areBrandsExpanded ? 'rotate-180 text-[#F80404]' : ''}`} />
            </button>

            {areBrandsExpanded && (
              <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-1 max-h-56 overflow-y-auto">
                {ALL_BRANDS.map(brand => (
                  <Link
                    key={brand.slug}
                    href={`/boutique/?brand=${encodeURIComponent(brand.name)}`}
                    onClick={onClose}
                    className="flex items-center justify-between py-2 px-2 rounded-lg text-[11px] font-bold text-white/70 hover:text-white hover:bg-white/10 transition-colors gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-7 h-4 shrink-0 bg-black/40 rounded p-0.5 border border-white/10 flex items-center justify-center">
                        <Image 
                          src={brand.logo} 
                          alt={brand.displayName} 
                          fill 
                          className="object-contain filter brightness-110" 
                        />
                      </div>
                      <span className="truncate">{brand.displayName}</span>
                    </div>
                    <span className="text-[10px] text-white/40 px-1.5 py-0.5 rounded bg-black/40 shrink-0">{brand.count}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>



          <Link 
            href="/coaching-nutritionnel-personnalise/" 
            onClick={onClose} 
            className="flex items-center justify-between p-3 rounded-xl bg-[#F80404]/10 border border-[#F80404]/30 text-white hover:bg-[#F80404]/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-[#F80404]">🎯</span>
              <span className="text-white font-bold">{t.nav.coaching} (20+ ans)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F80404] text-black font-black">BILAN</span>
          </Link>

          <Link 
            href="/guide-des-complements-alimentaires/" 
            onClick={onClose} 
            className="flex items-center justify-between p-3 rounded-xl bg-[#95d600]/10 border border-[#95d600]/30 text-white hover:bg-[#95d600]/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-[#95d600]">📖</span>
              <span className="text-[#95d600] font-bold">{t.nav.ebook} Guide Ultime</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#95d600] text-black font-black">PDF</span>
          </Link>

          {/* Blog & Guides */}
          <Link 
            href="/blog/" 
            onClick={onClose} 
            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-white/90 hover:text-[#F80404] transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#F80404]" />
              <span>{t.nav.blog} (20 Dossiers)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30" />
          </Link>

          <Link 
            href="/compte/" 
            onClick={onClose} 
            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-white/90 hover:text-[#F80404] transition-colors"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-white/60" />
              <span>{t.nav.account}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30" />
          </Link>
        </nav>

        {/* Language and Currency Switcher in mobile drawer */}
        <div className="py-4 border-t border-white/10">
          <LanguageCurrencySwitcher variant="mobile" />
        </div>

        {/* Footer info in drawer */}
        <div className="pt-3 border-t border-white/10 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Stock en Suisse · Pas de frais de douane</span>
          </div>
          <p className="text-[10px] text-white/40">
            Paiement instantané TWINT, Carte & PostFinance · Expédition 24h
          </p>
        </div>
      </div>
    </>
  );
}
