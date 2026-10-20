import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ALL_BRANDS } from '@/lib/brands';

export default function BrandShowcase() {
  const featuredBrands = ALL_BRANDS.slice(0, 12);

  // Largest brands first for mobile priority chips
  const mobilePriorityOrder = ['Marvelous', 'Pronutrition', 'Bigman', 'Dirty Squads', 'Applied Nutrition', 'NutriFitness Lab'];
  const mobileBrands = [
    ...ALL_BRANDS.filter(b => mobilePriorityOrder.some(p => p.toLowerCase() === b.name.toLowerCase() || p.toLowerCase() === b.displayName.toLowerCase())),
    ...ALL_BRANDS.filter(b => !mobilePriorityOrder.some(p => p.toLowerCase() === b.name.toLowerCase() || p.toLowerCase() === b.displayName.toLowerCase()))
  ].slice(0, 8);

  return (
    <section className="mb-8 sm:mb-16 bg-[#121212] rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-10">
      <div className="flex items-end justify-between mb-4 sm:mb-8 pb-3 sm:pb-4 border-b border-white/10 gap-2">
        <div>
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#F80404] mb-0.5 sm:mb-1 font-heading">
            Distributeur Officiel en Suisse 🇨🇭
          </p>
          <h2 className="text-lg sm:text-2xl font-black text-white uppercase font-heading leading-tight">
            Marques Partenaires
          </h2>
        </div>
        <Link 
          href="/boutique/"
          className="text-xs font-bold text-[#F80404] sm:text-white/70 hover:text-white uppercase tracking-wider flex items-center gap-1 group shrink-0 min-h-[44px]"
        >
          <span>Toutes ({ALL_BRANDS.length})</span>
          <span className="text-[#F80404] group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* Mobile: Horizontal scroll row of brand logo chips */}
      <div 
        className="sm:hidden flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-2 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {mobileBrands.map(brand => (
          <Link 
            key={brand.slug}
            href={`/boutique/?brand=${encodeURIComponent(brand.name)}`}
            className="flex flex-col items-center justify-center p-2.5 bg-[#181818] rounded-xl border border-white/5 active:border-[#F80404]/50 w-[110px] min-w-[110px] shrink-0 snap-start"
          >
            <div className="relative w-full h-8 flex items-center justify-center">
              <Image 
                src={brand.logo} 
                alt={`${brand.displayName} - NutriFitness Suisse`}
                fill 
                className="object-contain filter brightness-110 p-0.5"
              />
            </div>
            <span className="text-[10px] font-bold text-white/80 mt-1 truncate w-full text-center">
              {brand.displayName.replace(/\.it$/i, '')}
            </span>
          </Link>
        ))}
        {/* "Toutes les marques" end chip */}
        <Link
          href="/marques/"
          className="flex flex-col items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 w-[110px] min-w-[110px] shrink-0 snap-start text-center"
        >
          <span className="text-xs font-black uppercase text-[#F80404] font-heading">Toutes</span>
          <span className="text-[10px] text-white/60">→</span>
        </Link>
      </div>

      {/* Desktop Grid (Unchanged) */}
      <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {featuredBrands.map(brand => (
          <Link 
            key={brand.slug}
            href={`/boutique/?brand=${encodeURIComponent(brand.name)}`}
            className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-[#181818] hover:bg-[#222222] rounded-2xl border border-white/5 hover:border-[#F80404]/50 transition-all group"
          >
            <div className="relative w-full h-12 flex items-center justify-center">
              <Image 
                src={brand.logo} 
                alt={`${brand.displayName} - NutriFitness Suisse`}
                fill 
                className="object-contain filter brightness-110 p-1 group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="text-[11px] font-bold text-white/70 group-hover:text-white mt-2 truncate w-full text-center transition-colors">
              {brand.displayName}
            </span>
            <span className="text-[10px] text-white/40 group-hover:text-[#F80404] transition-colors">
              {brand.count} {brand.count > 1 ? 'produits' : 'produit'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
