'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Home, LayoutGrid, Search, ShoppingBag, User } from 'lucide-react';

interface MobileBottomTabBarProps {
  onOpenCategories?: () => void;
}

export default function MobileBottomTabBar({ onOpenCategories }: MobileBottomTabBarProps) {
  const pathname = usePathname();
  const { cartCount, openCart, openSearch } = useStore();

  const isHome = pathname === '/';
  const isBoutique = pathname?.startsWith('/boutique') || pathname?.startsWith('/categorie');
  const isAccount = pathname?.startsWith('/compte');

  return (
    <nav
      aria-label="Navigation principale mobile"
      className="hidden max-md:flex fixed bottom-0 left-0 right-0 z-[90] bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 items-stretch justify-around safe-area-bottom h-[calc(56px+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)]"
      style={{
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* 1. Accueil */}
      <Link
        href="/"
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors select-none ${
          isHome ? 'text-[#F80404]' : 'text-white/60 hover:text-white'
        }`}
        aria-label="Accueil"
        aria-current={isHome ? 'page' : undefined}
      >
        <Home className={`w-5 h-5 ${isHome ? 'text-[#F80404] stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-bold tracking-tight">Accueil</span>
      </Link>

      {/* 2. Catégories */}
      <button
        type="button"
        onClick={() => {
          if (onOpenCategories) {
            onOpenCategories();
          }
        }}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors select-none ${
          isBoutique ? 'text-[#F80404]' : 'text-white/60 hover:text-white'
        }`}
        aria-label="Catégories"
        aria-current={isBoutique ? 'page' : undefined}
      >
        <LayoutGrid className={`w-5 h-5 ${isBoutique ? 'text-[#F80404] stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-bold tracking-tight">Catégories</span>
      </button>

      {/* 3. Recherche */}
      <button
        type="button"
        onClick={openSearch}
        className="flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 text-white/60 hover:text-white transition-colors select-none"
        aria-label="Recherche"
      >
        <Search className="w-5 h-5 stroke-[1.8]" />
        <span className="text-[10px] font-bold tracking-tight">Recherche</span>
      </button>

      {/* 4. Panier */}
      <button
        type="button"
        onClick={openCart}
        className="flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 text-white/60 hover:text-white transition-colors relative select-none"
        aria-label={`Panier (${cartCount} articles)`}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#F80404] text-black text-[9px] font-black flex items-center justify-center border border-black shadow-md">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold tracking-tight">Panier</span>
      </button>

      {/* 5. Compte */}
      <Link
        href="/compte/"
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors select-none ${
          isAccount ? 'text-[#F80404]' : 'text-white/60 hover:text-white'
        }`}
        aria-label="Compte"
        aria-current={isAccount ? 'page' : undefined}
      >
        <User className={`w-5 h-5 ${isAccount ? 'text-[#F80404] stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-bold tracking-tight">Compte</span>
      </Link>
    </nav>
  );
}
