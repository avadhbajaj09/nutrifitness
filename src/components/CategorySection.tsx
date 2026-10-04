'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  {
    title: 'Protéines & Whey',
    tag: 'Musculation',
    image: '/images/fitrush/imgi_48_banner-h9-1.webp',
    link: '/boutique/?cat=proteines'
  },
  {
    title: 'Créatines Creapure®',
    tag: 'Force & Puissance',
    image: '/images/fitrush/imgi_49_banner-h9-2.webp',
    link: '/boutique/?cat=creatine'
  },
  {
    title: 'Pré-Workout & Énergie',
    tag: 'Focus & Pump',
    image: '/images/fitrush/imgi_50_banner-h9-3.webp',
    link: '/boutique/?cat=pre-workout'
  },
  {
    title: 'Sèche & Minceur',
    tag: 'Définition',
    image: '/images/fitrush/imgi_47_banner-h9-4.webp',
    link: '/boutique/?cat=perte-de-poids'
  },
  {
    title: 'Santé & Vitamines',
    tag: 'Vitalité & Sommeil',
    image: '/images/fitrush/imgi_46_banner-h9-5.webp',
    link: '/boutique/?cat=vitamines'
  },
  {
    title: 'Snacks & Barres Keto',
    tag: 'Gourmandise Saine',
    image: '/images/fitrush/imgi_250_img-1x1-1.webp',
    link: '/boutique/?cat=snacks'
  },
  {
    title: 'Gainers & Masse',
    tag: 'Volume Extrême',
    image: '/images/fitrush/imgi_252_img-slider-9-4.webp',
    link: '/boutique/?cat=prise-de-masse'
  },
  {
    title: 'Acides Aminés & BCAA',
    tag: 'Anti-Catabolisme',
    image: '/images/fitrush/imgi_254_img-slider-9-3.webp',
    link: '/boutique/?cat=bcaa'
  }
];

export default function CategorySection() {
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
          <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-1 font-heading">
            Explorez le Catalogue
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-heading">
            Catégories Vedettes
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Link 
            href="/boutique/" 
            className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider mr-2 hidden sm:inline-block transition-colors"
          >
            Tout Voir →
          </Link>
          <button 
            type="button"
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
            aria-label="Catégories précédentes"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
            aria-label="Catégories suivantes"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Category Slider (Compact Cards) */}
      <div 
        ref={scrollRef}
        className="flex gap-3.5 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {categories.map((cat, idx) => (
          <Link 
            key={idx}
            href={cat.link}
            className="group relative rounded-2xl overflow-hidden w-[150px] sm:w-[180px] md:w-[200px] h-[190px] sm:h-[220px] shrink-0 border border-white/10 hover:border-[#F80404]/60 shadow-md transition-all duration-300 hover:-translate-y-1 bg-[#141414]"
          >
            <Image 
              src={cat.image} 
              alt={cat.title}
              fill
              sizes="(max-width: 640px) 150px, 200px"
              className="object-cover transition-transform duration-500 group-hover:scale-108 filter brightness-[0.75] group-hover:brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            
            <div className="absolute bottom-3 left-3 right-3 z-10">
              <span className="inline-block px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/15 text-[9px] font-black uppercase text-[#F80404] tracking-wider rounded mb-1">
                {cat.tag}
              </span>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase font-heading group-hover:text-[#F80404] transition-colors leading-tight line-clamp-2">
                {cat.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
