import React from 'react';
import Image from 'next/image';

const posts = [
  { img: '/images/blog/nutriftiness-images26.jpg', tag: '#NutriFitnessCH' },
  { img: '/images/blog/nutriftiness-images29.jpg', tag: '#SwissFitness' },
  { img: '/images/blog/nutriftiness-images45.jpg', tag: '#SwissAthletes' },
  { img: '/images/blog/nutriftiness-images27.jpg', tag: '#CreapureSuisse' },
  { img: '/images/blog/nutriftiness-images32.jpg', tag: '#PostPacPriority' }
];

export default function SocialGrid() {
  return (
    <section className="mb-8 sm:mb-16">
      <div className="flex items-end justify-between mb-4 sm:mb-8 pb-3 sm:pb-4 border-b border-white/10 px-4 sm:px-0">
        <div>
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#F80404] mb-0.5 sm:mb-1 font-heading">
            Communauté Athlètes
          </p>
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-white uppercase font-heading leading-tight">
            #NutriFitnessCH
          </h2>
        </div>
        <a 
          href="https://instagram.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs font-bold text-[#F80404] sm:text-white/70 hover:text-white uppercase tracking-wider flex items-center gap-1.5 min-h-[44px] shrink-0"
        >
          <span>@NutriFitness.ch</span>
          <span>→</span>
        </a>
      </div>

      {/* Mobile: Horizontal scroll row */}
      <div 
        className="sm:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {posts.map((p, idx) => (
          <div key={idx} className="w-[140px] min-w-[140px] shrink-0 snap-start rounded-2xl overflow-hidden aspect-square border border-white/10 relative shadow-md">
            <Image 
              src={p.img} 
              alt="Athlète NutriFitness" 
              fill
              className="object-cover"
            />
            <div className="absolute bottom-2 left-2 right-2">
              <span className="text-[9px] font-bold text-white bg-black/80 px-2 py-0.5 rounded-full border border-white/10 truncate block text-center">
                {p.tag}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Grid (Unchanged) */}
      <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {posts.map((p, idx) => (
          <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-square border border-white/10 shadow-lg">
            <Image 
              src={p.img} 
              alt="Athlète NutriFitness" 
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110 filter brightness-90 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
              <span className="text-xs font-black text-white bg-black/70 px-3 py-1.5 rounded-full border border-white/20">
                {p.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
