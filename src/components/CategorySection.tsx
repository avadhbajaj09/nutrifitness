'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  {
    title: 'Protéines & Whey',
    tag: 'Isolate & Whey CFM',
    image: '/images/categories/categorie-proteines.png',
    link: '/categorie/proteines/'
  },
  {
    title: 'Créatine Monohydrate',
    tag: 'Creapure® & Force',
    image: '/images/categories/categorie-creatine.png',
    link: '/categorie/creatine/'
  },
  {
    title: 'Gainers & Masse',
    tag: 'Prise de Volume',
    image: '/images/categories/categorie-gainers-prise-de-masse.png',
    link: '/categorie/gainers-prise-de-masse/'
  },
  {
    title: 'Acides Aminés & BCAA',
    tag: 'EAA & Glutamine',
    image: '/images/categories/categorie-acides-amines-recuperation.png',
    link: '/categorie/acides-amines-recuperation/'
  },
  {
    title: 'Pré-Workout & Énergie',
    tag: 'Focus & Congestion',
    image: '/images/categories/categorie-pre-workout-energie.png',
    link: '/categorie/pre-workout-energie/'
  },
  {
    title: 'Perte de Poids & Sèche',
    tag: 'Brûleur Thermogénique',
    image: '/images/categories/categorie-perte-de-poids.png',
    link: '/categorie/perte-de-poids/'
  },
  {
    title: 'Santé & Vitamines',
    tag: 'Zinc & Minéraux',
    image: '/images/categories/categorie-vitamines-mineraux.png',
    link: '/categorie/vitamines-mineraux/'
  },
  {
    title: 'Bien-Être & Sommeil',
    tag: 'Ashwagandha KSM-66',
    image: '/images/categories/categorie-bien-etre-sommeil-digestion.png',
    link: '/categorie/bien-etre-sommeil-digestion/'
  },
  {
    title: 'Snacks & Barres Keto',
    tag: 'Collation Protéinée',
    image: '/images/categories/categorie-snacks-healthy-food.png',
    link: '/categorie/snacks-healthy-food/'
  },
  {
    title: 'Pendant Effort & Glucides',
    tag: 'Crème de Riz & Énergie',
    image: '/images/categories/categorie-pendant-effort-hydratation.png',
    link: '/categorie/pendant-effort-hydratation/'
  },
  {
    title: 'Accessoires & Shakers',
    tag: 'Shakers Antifuites',
    image: '/images/categories/categorie-accessoires.webp',
    link: '/categorie/accessoires/'
  },
  {
    title: 'Guide Ultime Ebook',
    tag: 'Guide 66 Pages PDF',
    image: '/images/categories/categorie-guides-ebooks.webp',
    link: '/guide-des-complements-alimentaires/'
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
            href="/categorie/" 
            className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider mr-2 hidden sm:inline-block transition-colors"
          >
            Toutes les Catégories →
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

      {/* Horizontal Category Slider (Compact Cards with Real Product Packshots) */}
      <div 
        ref={scrollRef}
        className="flex gap-3.5 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {categories.map((cat, idx) => (
          <Link 
            key={idx}
            href={cat.link}
            className="group relative rounded-2xl overflow-hidden w-[145px] sm:w-[170px] md:w-[185px] h-[195px] sm:h-[220px] shrink-0 border border-white/10 hover:border-[#F80404]/60 shadow-lg transition-all duration-300 hover:-translate-y-1 bg-[#141414] flex flex-col justify-between p-3"
          >
            {/* Real Product Packshot Image */}
            <div className="relative w-full h-[115px] sm:h-[135px] flex items-center justify-center">
              <Image 
                src={cat.image} 
                alt={`${cat.title} - NutriFitness Suisse`}
                fill
                sizes="(max-width: 640px) 145px, 185px"
                className="object-contain p-1 filter drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            
            <div className="z-10 pt-2 border-t border-white/5">
              <span className="inline-block px-1.5 py-0.5 bg-black/60 border border-white/10 text-[9px] font-black uppercase text-[#F80404] tracking-wider rounded mb-1 truncate max-w-full">
                {cat.tag}
              </span>
              <h3 className="text-xs font-black text-white uppercase font-heading group-hover:text-[#F80404] transition-colors leading-tight line-clamp-1">
                {cat.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
