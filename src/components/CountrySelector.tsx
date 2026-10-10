'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { ChevronDown, Check } from 'lucide-react';

export interface CountryOption {
  code: string;
  flag: string;
  name: Record<'fr' | 'de' | 'it' | 'en', string>;
  currency: 'CHF' | 'EUR';
  originLabel: string;
}

export const REGION_OPTIONS: CountryOption[] = [
  {
    code: 'CH',
    flag: '🇨🇭',
    name: { fr: 'Suisse (CHF)', de: 'Schweiz (CHF)', it: 'Svizzera (CHF)', en: 'Switzerland (CHF)' },
    currency: 'CHF',
    originLabel: 'Expédié de Suisse (1–3 jours)'
  },
  {
    code: 'EU',
    flag: '🇪🇺',
    name: { fr: 'Europe (EUR €)', de: 'Europa (EUR €)', it: 'Europa (EUR €)', en: 'Europe (EUR €)' },
    currency: 'EUR',
    originLabel: 'Expédié du Portugal (3–5 jours)'
  }
];

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  ...REGION_OPTIONS,
  { code: 'LI', flag: '🇱🇮', name: { fr: 'Liechtenstein', de: 'Liechtenstein', it: 'Liechtenstein', en: 'Liechtenstein' }, currency: 'CHF', originLabel: 'Expédié de Suisse' },
  { code: 'FR', flag: '🇫🇷', name: { fr: 'France', de: 'Frankreich', it: 'Francia', en: 'France' }, currency: 'EUR', originLabel: 'Expédié du Portugal' },
  { code: 'PT', flag: '🇵🇹', name: { fr: 'Portugal', de: 'Portugal', it: 'Portogallo', en: 'Portugal' }, currency: 'EUR', originLabel: 'Expédié du Portugal' },
  { code: 'ES', flag: '🇪🇸', name: { fr: 'Espagne', de: 'Spanien', it: 'Spagna', en: 'Spain' }, currency: 'EUR', originLabel: 'Expédié du Portugal' },
  { code: 'DE', flag: '🇩🇪', name: { fr: 'Allemagne', de: 'Deutschland', it: 'Germania', en: 'Germany' }, currency: 'EUR', originLabel: 'Expédié du Portugal' },
  { code: 'IT', flag: '🇮🇹', name: { fr: 'Italie', de: 'Italien', it: 'Italia', en: 'Italy' }, currency: 'EUR', originLabel: 'Expédié du Portugal' },
  { code: 'AT', flag: '🇦🇹', name: { fr: 'Autriche', de: 'Österreich', it: 'Austria', en: 'Austria' }, currency: 'EUR', originLabel: 'Expédié du Portugal' },
  { code: 'BE', flag: '🇧🇪', name: { fr: 'Belgique', de: 'Belgien', it: 'Belgio', en: 'Belgium' }, currency: 'EUR', originLabel: 'Expédié du Portugal' },
  { code: 'NL', flag: '🇳🇱', name: { fr: 'Pays-Bas', de: 'Niederlande', it: 'Paesi Bassi', en: 'Netherlands' }, currency: 'EUR', originLabel: 'Expédié du Portugal' },
  { code: 'LU', flag: '🇱🇺', name: { fr: 'Luxembourg', de: 'Luxemburg', it: 'Lussemburgo', en: 'Luxembourg' }, currency: 'EUR', originLabel: 'Expédié du Portugal' },
  { code: 'GB', flag: '🇬🇧', name: { fr: 'Royaume-Uni', de: 'Vereinigtes Königreich', it: 'Regno Unito', en: 'United Kingdom' }, currency: 'EUR', originLabel: 'Expédié du Portugal' },
  { code: 'NO', flag: '🇳🇴', name: { fr: 'Norvège', de: 'Norwegen', it: 'Norvegia', en: 'Norway' }, currency: 'EUR', originLabel: 'Expédié du Portugal' },
  { code: 'PL', flag: '🇵🇱', name: { fr: 'Pologne', de: 'Polen', it: 'Polonia', en: 'Poland' }, currency: 'EUR', originLabel: 'Expédié du Portugal' },
  { code: 'SE', flag: '🇸🇪', name: { fr: 'Suède', de: 'Schweden', it: 'Svezia', en: 'Sweden' }, currency: 'EUR', originLabel: 'Expédié du Portugal' },
  { code: 'DK', flag: '🇩🇰', name: { fr: 'Danemark', de: 'Dänemark', it: 'Danimarca', en: 'Denmark' }, currency: 'EUR', originLabel: 'Expédié du Portugal' },
  { code: 'FI', flag: '🇫🇮', name: { fr: 'Finlande', de: 'Finnland', it: 'Finlandia', en: 'Finland' }, currency: 'EUR', originLabel: 'Expédié du Portugal' }
];

interface CountrySelectorProps {
  variant?: 'header' | 'topbar' | 'mobile';
  className?: string;
}

export default function CountrySelector({ variant = 'header', className = '' }: CountrySelectorProps) {
  const { countryCode, setCountryCode, locale, showToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSwiss = countryCode === 'CH' || countryCode === 'LI';
  const currentRegion = isSwiss ? REGION_OPTIONS[0] : REGION_OPTIONS[1];
  const regionName = currentRegion.name[locale] || currentRegion.name.fr;

  const handleSelect = (code: string) => {
    setCountryCode(code);
    setIsOpen(false);
    const selected = REGION_OPTIONS.find(c => c.code === code) || REGION_OPTIONS[0];
    const sName = selected.name[locale] || selected.name.fr;
    showToast('Région de livraison & Devise', `${selected.flag} ${sName}`);
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
          📍 Région de livraison & Devise
        </span>
        <div className="grid grid-cols-2 gap-2">
          {REGION_OPTIONS.map((item) => {
            const active = (item.code === 'CH' && isSwiss) || (item.code === 'EU' && !isSwiss);
            const name = item.name[locale] || item.name.fr;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item.code)}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all text-left ${
                  active
                    ? 'bg-[#F80404] text-black border-[#F80404] font-black shadow-md'
                    : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex flex-col truncate">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="text-base">{item.flag}</span>
                    <span className="truncate text-xs">{item.code === 'CH' ? 'Suisse' : 'Europe'}</span>
                  </span>
                  <span className={`text-[10px] ${active ? 'text-black/80' : 'text-white/50'}`}>
                    {item.currency === 'CHF' ? 'Devise: CHF' : 'Devise: EUR €'}
                  </span>
                </div>
                {active && <Check className="w-4 h-4 shrink-0 stroke-[3]" />}
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
          className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 text-[10px] font-bold transition-colors"
          title={`Livraison vers ${regionName}`}
        >
          <span>{currentRegion.flag}</span>
          <span>{currentRegion.code === 'CH' ? 'CHF' : 'EUR'}</span>
          <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-[#161616] border border-white/15 rounded-xl p-1.5 shadow-2xl z-50">
            {REGION_OPTIONS.map((item) => {
              const active = (item.code === 'CH' && isSwiss) || (item.code === 'EU' && !isSwiss);
              const name = item.name[locale] || item.name.fr;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                    active
                      ? 'bg-[#F80404] text-black font-black'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-sm">{item.flag}</span>
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

  // Default 'header' variant: clean 2-choice region toggle
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
        aria-label={`Région de livraison : actuellement ${regionName}`}
        aria-expanded={isOpen}
      >
        <span className="text-sm shrink-0">{currentRegion.flag}</span>
        <span className="uppercase tracking-wider text-[11px] font-black">{currentRegion.code === 'CH' ? 'CH (CHF)' : 'EU (EUR)'}</span>
        <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#161616] border border-white/15 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in duration-150">
          <div className="px-2.5 py-1.5 border-b border-white/10 mb-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/40">
              🌍 Région de livraison & Devise
            </p>
          </div>
          {REGION_OPTIONS.map((item) => {
            const active = (item.code === 'CH' && isSwiss) || (item.code === 'EU' && !isSwiss);
            const name = item.name[locale] || item.name.fr;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item.code)}
                className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  active
                    ? 'bg-[#F80404] text-black font-black'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-base shrink-0">{item.flag}</span>
                  <div className="truncate text-left">
                    <span className="block truncate font-bold">{name}</span>
                    <span className={`text-[9px] block ${active ? 'text-black/70' : 'text-white/40'}`}>
                      {item.originLabel}
                    </span>
                  </div>
                </div>
                {active && <Check className="w-4 h-4 shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
