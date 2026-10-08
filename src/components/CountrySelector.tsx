'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { ChevronDown, Check, Globe } from 'lucide-react';

export interface CountryOption {
  code: string;
  flag: string;
  name: Record<'fr' | 'de' | 'it' | 'en', string>;
  originLabel: string; // Geneva, Portugal, etc.
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: 'CH', flag: '🇨🇭', name: { fr: 'Suisse', de: 'Schweiz', it: 'Svizzera', en: 'Switzerland' }, originLabel: 'Genève (24h)' },
  { code: 'LI', flag: '🇱🇮', name: { fr: 'Liechtenstein', de: 'Liechtenstein', it: 'Liechtenstein', en: 'Liechtenstein' }, originLabel: 'Genève (24h)' },
  { code: 'FR', flag: '🇫🇷', name: { fr: 'France', de: 'Frankreich', it: 'Francia', en: 'France' }, originLabel: 'Portugal / Genève' },
  { code: 'DE', flag: '🇩🇪', name: { fr: 'Allemagne', de: 'Deutschland', it: 'Germania', en: 'Germany' }, originLabel: 'Portugal / Genève' },
  { code: 'IT', flag: '🇮🇹', name: { fr: 'Italie', de: 'Italien', it: 'Italia', en: 'Italy' }, originLabel: 'Portugal / Genève' },
  { code: 'AT', flag: '🇦🇹', name: { fr: 'Autriche', de: 'Österreich', it: 'Austria', en: 'Austria' }, originLabel: 'Portugal / Genève' },
  { code: 'PT', flag: '🇵🇹', name: { fr: 'Portugal', de: 'Portugal', it: 'Portogallo', en: 'Portugal' }, originLabel: 'Portugal (Direct Usine)' },
  { code: 'ES', flag: '🇪🇸', name: { fr: 'Espagne', de: 'Spanien', it: 'Spagna', en: 'Spain' }, originLabel: 'Portugal (3–5j)' },
  { code: 'BE', flag: '🇧🇪', name: { fr: 'Belgique', de: 'Belgien', it: 'Belgio', en: 'Belgium' }, originLabel: 'Portugal (3–5j)' },
  { code: 'NL', flag: '🇳🇱', name: { fr: 'Pays-Bas', de: 'Niederlande', it: 'Paesi Bassi', en: 'Netherlands' }, originLabel: 'Portugal (3–5j)' },
  { code: 'LU', flag: '🇱🇺', name: { fr: 'Luxembourg', de: 'Luxemburg', it: 'Lussemburgo', en: 'Luxembourg' }, originLabel: 'Portugal (3–5j)' },
  { code: 'GB', flag: '🇬🇧', name: { fr: 'Royaume-Uni', de: 'Vereinigtes Königreich', it: 'Regno Unito', en: 'United Kingdom' }, originLabel: 'Portugal (5–10j)' },
  { code: 'NO', flag: '🇳🇴', name: { fr: 'Norvège', de: 'Norwegen', it: 'Norvegia', en: 'Norway' }, originLabel: 'Portugal (5–10j)' },
  { code: 'PL', flag: '🇵🇱', name: { fr: 'Pologne', de: 'Polen', it: 'Polonia', en: 'Poland' }, originLabel: 'Portugal (3–5j)' },
  { code: 'SE', flag: '🇸🇪', name: { fr: 'Suède', de: 'Schweden', it: 'Svezia', en: 'Sweden' }, originLabel: 'Portugal (3–5j)' },
  { code: 'DK', flag: '🇩🇰', name: { fr: 'Danemark', de: 'Dänemark', it: 'Danimarca', en: 'Denmark' }, originLabel: 'Portugal (3–5j)' },
  { code: 'FI', flag: '🇫🇮', name: { fr: 'Finlande', de: 'Finnland', it: 'Finlandia', en: 'Finland' }, originLabel: 'Portugal (3–5j)' },
];

interface CountrySelectorProps {
  variant?: 'header' | 'topbar' | 'mobile';
  className?: string;
}

export default function CountrySelector({ variant = 'header', className = '' }: CountrySelectorProps) {
  const { countryCode, setCountryCode, locale, showToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCountry = SUPPORTED_COUNTRIES.find(c => c.code === countryCode) || SUPPORTED_COUNTRIES[0];
  const countryName = currentCountry.name[locale] || currentCountry.name.fr;

  const handleSelect = (code: string) => {
    setCountryCode(code);
    setIsOpen(false);
    const selected = SUPPORTED_COUNTRIES.find(c => c.code === code);
    const sName = selected ? (selected.name[locale] || selected.name.fr) : code;
    showToast('Destination de livraison', `Pays sélectionné : ${selected?.flag} ${sName}`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'mobile') {
    return (
      <div className={`space-y-2 ${className}`}>
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">
          📍 Pays de livraison / Destination
        </span>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {SUPPORTED_COUNTRIES.map((item) => {
            const active = item.code === countryCode;
            const name = item.name[locale] || item.name.fr;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item.code)}
                className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between border transition-all text-left ${
                  active
                    ? 'bg-[#F80404] text-black border-[#F80404] font-black shadow-md'
                    : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="text-sm shrink-0">{item.flag}</span>
                  <span className="truncate text-[11px]">{name}</span>
                </span>
                {active && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'topbar') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 text-[10px] font-bold transition-colors"
          title={`Livraison vers ${countryName}`}
        >
          <span>{currentCountry.flag}</span>
          <span>{currentCountry.code}</span>
          <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-[#161616] border border-white/15 rounded-xl p-1.5 shadow-2xl z-50 max-h-64 overflow-y-auto">
            {SUPPORTED_COUNTRIES.map((item) => {
              const active = item.code === countryCode;
              const name = item.name[locale] || item.name.fr;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    active
                      ? 'bg-[#F80404] text-black font-black'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span>{item.flag}</span>
                    <span className="truncate">{name}</span>
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

  // Default 'header' variant: compact button placed next to LanguageCurrencySwitcher
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
        aria-label={`Sélectionner le pays de livraison : actuellement ${countryName}`}
        aria-expanded={isOpen}
      >
        <span className="text-sm shrink-0">{currentCountry.flag}</span>
        <span className="uppercase tracking-wider text-[11px] font-black">{currentCountry.code}</span>
        <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-60 bg-[#161616] border border-white/15 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in duration-150 max-h-80 overflow-y-auto">
          <div className="px-2.5 py-1.5 border-b border-white/10 mb-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/40">
              🌍 Pays de livraison
            </p>
          </div>
          {SUPPORTED_COUNTRIES.map((item) => {
            const active = item.code === countryCode;
            const name = item.name[locale] || item.name.fr;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item.code)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  active
                    ? 'bg-[#F80404] text-black font-black'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm shrink-0">{item.flag}</span>
                  <div className="truncate text-left">
                    <span className="block truncate">{name}</span>
                    <span className={`text-[9px] block ${active ? 'text-black/70' : 'text-white/40'}`}>
                      {item.originLabel}
                    </span>
                  </div>
                </div>
                {active && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
