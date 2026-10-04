'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const goals = [
  {
    title: 'Prise de Masse & Muscle',
    tag: 'Volume & Force',
    desc: 'Whey Isolate, Mass Gainers & Créatines.',
    link: '/boutique/?goal=masse',
    image: '/images/fitrush/imgi_48_banner-h9-1.webp'
  },
  {
    title: 'Sèche & Définition',
    tag: 'Minceur & Ripped',
    desc: 'Whey 0 Sucre, Thermogéniques & Carnitine.',
    link: '/boutique/?goal=seche',
    image: '/images/fitrush/imgi_47_banner-h9-4.webp'
  },
  {
    title: 'Force Pure & Explosivité',
    tag: 'Creapure® 99.9%',
    desc: 'Créatines pharmaceutiques & Boosters NO.',
    link: '/boutique/?goal=force',
    image: '/images/fitrush/imgi_49_banner-h9-2.webp'
  },
  {
    title: 'Énergie & Pré-Workout',
    tag: 'Focus Sans Crash',
    desc: 'Bêta-alanine, Caféine & Citrulline malate.',
    link: '/boutique/?goal=energie',
    image: '/images/fitrush/imgi_50_banner-h9-3.webp'
  },
  {
    title: 'Santé & Récupération',
    tag: 'Vitalité Quotidienne',
    desc: 'Oméga-3 marin, Bisglycinate & Collagène.',
    link: '/boutique/?goal=sante',
    image: '/images/fitrush/imgi_46_banner-h9-5.webp'
  }
];

export default function ShopByGoal() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-14">
      {/* Header with Title & Navigation Controls */}
      <div className="flex items-end justify-between mb-5 pb-3 border-b border-white/10">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-1 font-heading">
            Vos Objectifs Physiques
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-heading">
            Acheter par Objectif Sportif
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Link 
            href="/boutique/" 
            className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider mr-2 hidden sm:inline-block transition-colors"
          >
            Tout le Catalogue →
          </Link>
          <button 
            type="button"
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
            aria-label="Objectifs précédents"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
            aria-label="Objectifs suivants"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Goal Carousel (Compact Cards) */}
      <div 
        ref={scrollRef}
        className="flex gap-3.5 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {goals.map((goal, idx) => (
          <Link 
            key={idx}
            href={goal.link}
            className="group relative rounded-2xl overflow-hidden w-[170px] sm:w-[210px] md:w-[230px] h-[210px] sm:h-[240px] shrink-0 border border-white/10 hover:border-[#F80404]/60 shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-end p-4 bg-[#141414]"
          >
            <Image 
              src={goal.image} 
              alt={goal.title}
              fill
              sizes="(max-width: 640px) 170px, 230px"
              className="object-cover transition-transform duration-500 group-hover:scale-108 filter brightness-[0.65] group-hover:brightness-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="relative z-10 space-y-1">
              <span className="inline-block px-2 py-0.5 bg-black/70 backdrop-blur-md border border-white/15 text-[9px] font-black uppercase text-[#F80404] tracking-wider rounded">
                {goal.tag}
              </span>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase font-heading group-hover:text-[#F80404] transition-colors leading-tight line-clamp-1">
                {goal.title}
              </h3>
              <p className="text-[10px] text-white/60 line-clamp-2 leading-relaxed">
                {goal.desc}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/80 group-hover:text-[#F80404] pt-0.5 transition-colors">
                Découvrir →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
