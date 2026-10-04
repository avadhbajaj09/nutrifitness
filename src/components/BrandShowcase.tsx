import React from 'react';
import Link from 'next/link';

const brands = [
  { name: 'BigMan Nutrition', logoText: 'BIGMAN', country: 'Espagne / Europe' },
  { name: 'Optimum Nutrition', logoText: 'ON OPTIMUM', country: 'USA' },
  { name: 'BioTechUSA', logoText: 'BIOTECHUSA', country: 'Europe' },
  { name: 'Applied Nutrition', logoText: 'APPLIED', country: 'UK' },
  { name: 'Creapure®', logoText: 'CREAPURE®', country: 'Allemagne' },
  { name: 'NutriFitness Lab', logoText: 'NUTRIFITNESS LAB', country: 'Suisse 🇨🇭' }
];

export default function BrandShowcase() {
  return (
    <section className="mb-16 bg-[#121212] rounded-3xl border border-white/10 p-8 sm:p-10">
      <div className="text-center max-w-xl mx-auto mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-1 font-heading">
          Partenaires Officiels & Certifiés
        </p>
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-heading">
          Les Plus Grandes Marques Mondiales Disponibles en Suisse
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {brands.map(brand => (
          <Link 
            key={brand.name}
            href={`/boutique/?brand=${encodeURIComponent(brand.name)}`}
            className="flex flex-col items-center justify-center p-5 bg-[#181818] hover:bg-[#202020] rounded-2xl border border-white/5 hover:border-[#F80404]/40 transition-all group"
          >
            <span className="text-sm font-black text-white/70 group-hover:text-white uppercase font-heading tracking-wider transition-colors text-center">
              {brand.logoText}
            </span>
            <span className="text-[10px] text-white/40 group-hover:text-[#F80404] mt-1 transition-colors">
              {brand.country}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
