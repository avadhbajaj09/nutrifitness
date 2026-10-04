'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { LANGUAGE_OPTIONS, CURRENCY_OPTIONS, SupportedCurrency } from '@/lib/translations';
import { SupportedLocale } from '@/lib/types';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageCurrencySwitcherProps {
  variant?: 'topbar' | 'header' | 'mobile';
}

export default function LanguageCurrencySwitcher({ variant = 'header' }: LanguageCurrencySwitcherProps) {
  const { locale, setLocale, currency, setCurrency } = useStore();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGE_OPTIONS.find(l => l.code === locale) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'mobile') {
    return (
      <div className="space-y-3 pt-2">
        {/* Language selector for mobile */}
        <div>
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            🌐 Langue / Language
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {LANGUAGE_OPTIONS.map((item) => {
              const active = item.code === locale;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLocale(item.code)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                    active 
                      ? 'bg-[#F80404] text-black border-[#F80404] font-black shadow-md' 
                      : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{item.flag}</span>
                  <span className="text-[11px] uppercase tracking-wider">{item.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Currency selector for mobile */}
        <div>
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            💰 Devise / Currency
          </span>
          <div className="grid grid-cols-2 gap-2">
            {CURRENCY_OPTIONS.map((item) => {
              const active = item.code === currency;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setCurrency(item.code)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    active 
                      ? 'bg-white text-black border-white font-black shadow-md' 
                      : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{item.code === 'CHF' ? '🇨🇭' : '🇪🇺'}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'topbar') {
    return (
      <div className="flex items-center gap-2 text-xs">
        {/* Languages in TopBar */}
        <div className="flex items-center bg-black/40 rounded-full p-0.5 border border-black/30">
          {LANGUAGE_OPTIONS.map((item) => {
            const active = item.code === locale;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setLocale(item.code)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-all ${
                  active 
                    ? 'bg-black text-white shadow-sm' 
                    : 'text-black/70 hover:text-black'
                }`}
                title={item.label}
              >
                {item.shortName}
              </button>
            );
          })}
        </div>

        {/* Currency Switcher in TopBar */}
        <div className="flex items-center bg-black/40 rounded-full p-0.5 border border-black/30">
          {CURRENCY_OPTIONS.map((item) => {
            const active = item.code === currency;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setCurrency(item.code)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-all ${
                  active 
                    ? 'bg-black text-white shadow-sm' 
                    : 'text-black/70 hover:text-black'
                }`}
                title={item.label}
              >
                {item.code}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default 'header' variant
  return (
    <div className="flex items-center gap-1.5" ref={dropdownRef}>
      {/* Language Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="h-9 px-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
          aria-label="Sélectionner la langue"
          aria-expanded={isLangOpen}
        >
          <span className="text-sm">{currentLang.flag}</span>
          <span className="uppercase tracking-wider text-[11px] font-black">{currentLang.shortName}</span>
          <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
        </button>

        {isLangOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-36 bg-[#161616] border border-white/15 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in duration-150">
            {LANGUAGE_OPTIONS.map((item) => {
              const active = item.code === locale;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLocale(item.code);
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    active 
                      ? 'bg-[#F80404] text-black font-black' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{item.flag}</span>
                    <span>{item.label}</span>
                  </span>
                  {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Currency Switcher Toggle */}
      <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 h-9">
        {CURRENCY_OPTIONS.map((item) => {
          const active = item.code === currency;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setCurrency(item.code)}
              className={`px-2 h-full rounded-lg text-[11px] font-black transition-all flex items-center gap-1 ${
                active 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-white/60 hover:text-white'
              }`}
              title={`Passer en ${item.label}`}
            >
              <span>{item.code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
