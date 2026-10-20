'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { LANGUAGE_OPTIONS } from '@/lib/translations';
import { SupportedLocale } from '@/lib/types';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { applyLanguageTranslation } from './GoogleTranslate';

interface LanguageCurrencySwitcherProps {
  variant?: 'topbar' | 'header' | 'mobile';
}

export default function LanguageCurrencySwitcher({ variant = 'header' }: LanguageCurrencySwitcherProps) {
  const { locale, setLocale } = useStore();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGE_OPTIONS.find(l => l.code === locale) || LANGUAGE_OPTIONS[0];

  const handleLanguageSelect = (code: SupportedLocale) => {
    setLocale(code);
    applyLanguageTranslation(code);
    setIsLangOpen(false);
  };

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
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-2">
            Langue / Language
          </span>
          <div className="grid grid-cols-4 gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
            {LANGUAGE_OPTIONS.map((item) => {
              const active = item.code === locale;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleLanguageSelect(item.code)}
                  className={`min-h-[44px] rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center transition-all ${
                    active 
                      ? 'bg-[#F80404] text-black shadow-md' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                  aria-label={`Changer de langue: ${item.label}`}
                >
                  <span>{item.shortName}</span>
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
                onClick={() => handleLanguageSelect(item.code)}
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
      </div>
    );
  }

  // Default 'header' variant: Clean Language Selector only
  return (
    <div className="relative" ref={dropdownRef}>
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
                onClick={() => handleLanguageSelect(item.code)}
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
  );
}
