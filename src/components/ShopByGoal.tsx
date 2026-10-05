'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';

const goals = [
  {
    title: 'Prise de Masse & Volume',
    tag: 'Volume & Force',
    desc: 'Mass Gainers, Whey Isolate & Glucides.',
    link: '/boutique/?goal=masse',
    image: '/images/goals/goal-masse.webp'
  },
  {
    title: 'Sèche & Définition',
    tag: 'Minceur & Brûleur',
    desc: 'Fat Burn Thermo, L-Carnitine & CLA.',
    link: '/boutique/?goal=seche',
    image: '/images/goals/goal-seche.webp'
  },
  {
    title: 'Force Pure & Explosivité',
    tag: 'Creapure® 99.9%',
    desc: 'Créatines monohydrate pures & ATP.',
    link: '/boutique/?goal=force',
    image: '/images/goals/goal-force.webp'
  },
  {
    title: 'Énergie & Pré-Workout',
    tag: 'Focus & Congestion',
    desc: 'L-Citrulline Malate, Caféine & Boosters.',
    link: '/boutique/?goal=energie',
    image: '/images/goals/goal-energie.webp'
  },
  {
    title: 'Santé & Vitalité',
    tag: 'Immunité & Sommeil',
    desc: 'Ashwagandha KSM-66, Zinc & Minéraux.',
    link: '/boutique/?goal=sante',
    image: '/images/goals/goal-sante.webp'
  },
  {
    title: 'Snacks & Collation Saine',
    tag: 'Keto & Sans Sucre',
    desc: 'Barres sandwich protéinées & Purées bio.',
    link: '/boutique/?goal=snacks',
    image: '/images/goals/goal-snacks.webp'
  }
];

export default function ShopByGoal() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-14">
      {/* Header with Title & Navigation Controls */}
      <div className="flex items-end justify-between mb-5 pb-3 border-b border-white/10">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-1 font-heading flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            <span>Vos Objectifs Physiques</span>
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

      {/* Horizontal Goal Carousel (Compact Cards with Authentic Product Packshots) */}
      <div 
        ref={scrollRef}
        className="flex gap-3.5 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {goals.map((goal, idx) => (
          <Link 
            key={idx}
            href={goal.link}
            className="group relative rounded-2xl overflow-hidden w-[170px] sm:w-[200px] md:w-[220px] h-[250px] sm:h-[275px] shrink-0 border border-white/10 hover:border-[#F80404] shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between p-4 bg-black"
          >
            {/* Real Human Athlete Background Representation */}
            <Image 
              src={goal.image} 
              alt={`${goal.title} - Objectif Sportif NutriFitness`}
              fill
              sizes="(max-width: 640px) 170px, 220px"
              className="object-cover object-center filter brightness-[0.75] contrast-[1.05] group-hover:scale-110 group-hover:brightness-[0.9] transition-all duration-500"
            />

            {/* Dark Gradient Overlay for Clear Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 pointer-events-none" />

            {/* Top Category Tag Badge */}
            <div className="relative z-10">
              <span className="inline-block px-2.5 py-0.5 bg-black/80 backdrop-blur-md border border-[#F80404]/60 text-[9px] font-black uppercase text-[#F80404] tracking-wider rounded-full shadow-md">
                {goal.tag}
              </span>
            </div>

            {/* Bottom Content Panel */}
            <div className="relative z-10 space-y-1 pt-4">
              <h3 className="text-xs sm:text-sm font-black text-white uppercase font-heading group-hover:text-[#F80404] transition-colors leading-tight line-clamp-1 drop-shadow-md">
                {goal.title}
              </h3>
              <p className="text-[10px] text-white/80 line-clamp-2 leading-relaxed drop-shadow">
                {goal.desc}
              </p>
              <div className="pt-1 flex items-center gap-1 text-[11px] font-black text-[#F80404] group-hover:translate-x-1 transition-transform">
                <span>Découvrir</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
