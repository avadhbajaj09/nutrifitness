import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ALL_BRANDS } from '@/lib/brands';

export default function BrandShowcase() {
  const featuredBrands = ALL_BRANDS.slice(0, 12);

  return (
    <section className="mb-16 bg-[#121212] rounded-3xl border border-white/10 p-6 sm:p-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-white/10 gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-1 font-heading">
            Distributeur Officiel en Suisse 🇨🇭
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-heading">
            Nos Marques de Nutrition Sportive Partenaires
          </h2>
        </div>
        <Link 
          href="/boutique/"
          className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider flex items-center gap-1 group shrink-0"
        >
          <span>Toutes les marques ({ALL_BRANDS.length})</span>
          <span className="text-[#F80404] group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
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
              {brand.count} produits
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
