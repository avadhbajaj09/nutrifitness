'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MegaMenu from './MegaMenu';
import MobileNavigation from './MobileNavigation';
import LanguageCurrencySwitcher from './LanguageCurrencySwitcher';
import { useStore } from '@/context/StoreContext';
import { ALL_BRANDS } from '@/lib/brands';
import { ShoppingBag, Search, User, Menu, ChevronDown, Sparkles } from 'lucide-react';

export default function Header() {
  const { cartCount, openCart, openSearch, t } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const brandsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close brands dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandsDropdownRef.current && !brandsDropdownRef.current.contains(event.target as Node)) {
        setIsBrandsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header 
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-2.5' 
            : 'bg-[#0A0A0A] border-b border-white/10 py-3.5'
        }`}
      >
        <div className="max-w-7xl w-full mx-auto px-4 flex items-center justify-between gap-2 sm:gap-4 relative">
          
          {/* Left: Mobile Hamburger & Brand Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button 
              type="button" 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center shrink-0 py-1" aria-label="NutriFitness.ch Accueil">
              <div className="relative h-9 w-36 sm:w-44">
                <Image 
                  src="/images/brand/logo.png" 
                  alt="NutriFitness.ch" 
                  fill
                  priority
                  className="object-contain object-left filter brightness-110"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Bar */}
          <nav aria-label="Menu principal" className="hidden lg:flex items-center gap-5 xl:gap-6">
            
            {/* 1. BOUTIQUE / SHOP with Mega Menu Trigger */}
            <div 
              className="relative flex items-center h-9"
              onMouseEnter={() => { setIsMegaOpen(true); setIsBrandsOpen(false); }}
            >
              <button 
                type="button"
                onClick={() => setIsMegaOpen(!isMegaOpen)}
                className="h-9 inline-flex items-center gap-1 font-heading font-bold text-xs uppercase tracking-wider text-white/90 hover:text-[#F80404] transition-colors leading-none"
              >
                <span>{t.nav.shop}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaOpen ? 'rotate-180 text-[#F80404]' : 'text-white/40'}`} />
              </button>
            </div>

            {/* 2. SHOP BY BRAND / TOUTES LES MARQUES Dropdown */}
            <div 
              ref={brandsDropdownRef}
              className="relative flex items-center h-9"
              onMouseEnter={() => { setIsBrandsOpen(true); setIsMegaOpen(false); }}
              onMouseLeave={() => setIsBrandsOpen(false)}
            >
              <button 
                type="button"
                onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                className="h-9 inline-flex items-center gap-1 font-heading font-bold text-xs uppercase tracking-wider text-white/90 hover:text-[#F80404] transition-colors leading-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F80404]" />
                <span>{t.nav.brands}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isBrandsOpen ? 'rotate-180 text-[#F80404]' : 'text-white/40'}`} />
              </button>

              {/* Brands Flyout Dropdown */}
              {isBrandsOpen && (
                <div 
                  className="absolute top-full left-0 w-[420px] bg-[#141414] border border-white/10 rounded-2xl p-5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <span className="text-xs font-black uppercase tracking-wider text-white font-heading">
                      {t.nav.brands}
                    </span>
                    <Link 
                      href="/boutique/"
                      onClick={() => setIsBrandsOpen(false)}
                      className="text-[11px] text-[#F80404] hover:underline font-bold"
                    >
                      {t.common.viewAll} →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
                    {ALL_BRANDS.map(brand => (
                      <Link
                        key={brand.slug}
                        href={`/boutique/?brand=${encodeURIComponent(brand.name)}`}
                        onClick={() => setIsBrandsOpen(false)}
                        className="flex items-center p-2 rounded-xl bg-white/5 hover:bg-[#F80404]/10 hover:border-[#F80404]/40 border border-transparent transition-all group gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="relative w-8 h-5 shrink-0 bg-black/40 rounded p-0.5 border border-white/10 flex items-center justify-center">
                            <Image 
                              src={brand.logo} 
                              alt={brand.displayName} 
                              fill 
                              className="object-contain p-0.5 filter brightness-110" 
                            />
                          </div>
                          <span className="text-xs font-bold text-white/90 group-hover:text-white truncate">
                            {brand.displayName}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10 text-center">
                    <Link
                      href="/boutique/"
                      onClick={() => setIsBrandsOpen(false)}
                      className="inline-block w-full py-2 bg-white/5 hover:bg-[#F80404] hover:text-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                    >
                      {t.nav.filterByBrand}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Coaching Personnalisé */}
            <Link 
              href="/coaching-nutritionnel-personnalise/" 
              className="h-9 inline-flex items-center font-heading font-bold text-xs uppercase tracking-wider text-[#F80404] hover:text-[#FF3D00] transition-colors leading-none"
            >
              <span>{t.nav.coaching}</span>
            </Link>

            {/* Ebook Guide Ultime */}
            <Link 
              href="/guide-des-complements-alimentaires/" 
              className="h-9 inline-flex items-center font-heading font-bold text-xs uppercase tracking-wider text-[#95d600] hover:text-[#b0fa00] transition-colors leading-none"
            >
              <span>{t.nav.ebook}</span>
            </Link>

            {/* Blog & Guides */}
            <Link 
              href="/blog/" 
              className="h-9 inline-flex items-center font-heading font-bold text-xs uppercase tracking-wider text-white/90 hover:text-[#F80404] transition-colors leading-none"
            >
              <span>{t.nav.blog}</span>
            </Link>
          </nav>

          {/* Right: Language, Search, Account, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Switcher on header */}
            <div className="hidden sm:flex items-center gap-1.5">
              <LanguageCurrencySwitcher variant="header" />
            </div>

            {/* Spacious Search Trigger on Desktop / Icon on Mobile */}
            <button 
              type="button"
              onClick={openSearch}
              className="hidden md:flex items-center justify-between h-10 w-44 lg:w-60 xl:w-72 px-3.5 bg-white/5 hover:bg-white/10 hover:border-white/25 text-white rounded-full border border-white/15 text-xs transition-all group"
              aria-label="Rechercher des produits"
            >
              <span className="flex items-center gap-2 text-white/60 group-hover:text-white/80 transition-colors truncate">
                <Search className="w-4 h-4 text-white/50 group-hover:text-[#F80404] transition-colors shrink-0" />
                <span className="text-[12px] truncate">{t.nav.search.replace('...', '')}</span>
              </span>
              <kbd className="hidden lg:inline-flex items-center text-[9px] bg-white/10 group-hover:bg-white/15 px-1.5 py-0.5 rounded text-white/50 font-mono tracking-wider shrink-0 ml-1">
                ESC
              </kbd>
            </button>

            {/* Mobile Search Button */}
            <button 
              type="button"
              onClick={openSearch}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
              aria-label="Rechercher"
            >
              <Search className="w-4 h-4 text-white/80" />
            </button>

            {/* Account Icon */}
            <Link 
              href="/compte/"
              className="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-colors"
              aria-label="Espace compte client"
              title={t.nav.account}
            >
              <User className="w-4 h-4 text-white/80 hover:text-[#F80404]" />
            </Link>

            {/* Cart Trigger Button - Clean Icon only with Badge */}
            <button 
              type="button" 
              onClick={openCart}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#F80404] hover:bg-[#FF3D00] text-black transition-all shadow-md active:scale-95 group shrink-0"
              aria-label={`Panier (${cartCount})`}
              title={t.nav.cart}
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 rounded-full bg-black text-[#F80404] text-[10px] font-black flex items-center justify-center border border-white/20 shadow">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        <MegaMenu isOpen={isMegaOpen} onClose={() => setIsMegaOpen(false)} />
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
}
