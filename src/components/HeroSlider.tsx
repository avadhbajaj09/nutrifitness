'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface BannerSlide {
  id: number;
  productName: string;
  brand: string;
  tag: string;
  badge: string;
  wideImage: string;
  mobileImage: string;
  link: string;
  ctaText: string;
}

const slides: BannerSlide[] = [
  {
    id: 1,
    productName: 'BULK Isolat de Whey CFM 100% – Chocolate Fudge',
    brand: 'Marvelous Nutrition',
    tag: '⚡ 52g Protéines · 12g BCAA Naturels',
    badge: 'Isolat CFM Haute Pureté',
    wideImage: '/images/banners/wide/nutriftiness-banner3.jpg',
    mobileImage: '/images/banners/mobile/imgi_84_nutrifitness-banner18-819x1024.jpg',
    link: '/produit/iso-bulk-whey-biologique/',
    ctaText: 'Commander la Whey CFM'
  },
  {
    id: 2,
    productName: 'Créatine Monohydrate 100% Micronisée 300g',
    brand: 'Marvelous Nutrition',
    tag: '💪 Force · Puissance Explosive · Récupération',
    badge: '100% Pure Micronised',
    wideImage: '/images/banners/wide/nutriftiness-banner4.jpg',
    mobileImage: '/images/banners/mobile/imgi_12_nutrifitness-banner17.jpg',
    link: '/produit/creatine-en-poudre-300g/',
    ctaText: 'Découvrir la Créatine'
  },
  {
    id: 3,
    productName: 'Magnésium Bisglycinate Chélaté 90 Gélules',
    brand: 'Marvelous Nutrition',
    tag: '🌙 Sommeil Réparateur · Anti-Stress · Système Nerveux',
    badge: 'Haute Biodisponibilité',
    wideImage: '/images/banners/wide/nutriftiness-banner1.jpg',
    mobileImage: '/images/banners/mobile/imgi_14_nutrifitness-banner-a1-1.jpg',
    link: '/produit/magnesium-bisglycinate-90-caps/',
    ctaText: 'Voir le Magnésium'
  },
  {
    id: 4,
    productName: 'Le Guide Ultime des Compléments Alimentaires (PDF)',
    brand: 'NutriFitness Suisse',
    tag: '📖 11 Ans d\'Expérience · Conseils Honnêtes Sans Marketing',
    badge: 'Ebook Téléchargeable Immédiat',
    wideImage: '/images/banners/wide/nutriftiness-banner2.jpg',
    mobileImage: '/images/banners/mobile/imgi_10_guidebook.jpg',
    link: '/guide-des-complements-alimentaires/',
    ctaText: 'Découvrir le Guide (PDF)'
  },
  {
    id: 5,
    productName: 'Pronutrition Ashwagandha Forte 60 Gélules',
    brand: 'Pronutrition',
    tag: '🌿 Équilibre · Énergie & Résilience · Gestion du Stress',
    badge: 'Adaptogène Naturel',
    wideImage: '/images/banners/wide/nutriftiness-banner5.jpg',
    mobileImage: '/images/banners/mobile/imgi_9_nutrifitness-banner-a2-1.jpg',
    link: '/produit/ashwagandha-60-caps/',
    ctaText: "Découvrir l'Ashwagandha Forte"
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mobileSlide, setMobileSlide] = useState(0);
  const mobileTrackRef = useRef<HTMLDivElement>(null);

  // Desktop autoplay
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Mobile auto-slide timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setMobileSlide(prev => {
        const next = (prev + 1) % slides.length;
        if (mobileTrackRef.current) {
          const width = mobileTrackRef.current.clientWidth;
          if (width > 0) {
            mobileTrackRef.current.scrollTo({
              left: next * width,
              behavior: 'smooth'
            });
          }
        }
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Handle mobile scroll snap index detection (guarded)
  const handleMobileScroll = () => {
    if (!mobileTrackRef.current) return;
    const scrollLeft = mobileTrackRef.current.scrollLeft;
    const width = mobileTrackRef.current.clientWidth;
    if (width > 0) {
      const idx = Math.round(scrollLeft / width);
      setMobileSlide(idx);
    }
  };

  const scrollToMobileSlide = (index: number) => {
    if (!mobileTrackRef.current) return;
    const width = mobileTrackRef.current.clientWidth;
    mobileTrackRef.current.scrollTo({
      left: index * width,
      behavior: 'smooth'
    });
    setMobileSlide(index);
  };

  const slide = slides[current];

  return (
    <>
      {/* ============================================================
          DESKTOP HERO SLIDER (Untouched >= 768px, identical render)
         ============================================================ */}
      <section 
        className="hidden md:block relative rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/10 mb-10 shadow-2xl group/slider select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Bannières et offres du moment"
      >
        <Link 
          href={slide.link} 
          className="block relative w-full overflow-hidden bg-black transition-transform duration-500"
          aria-label={`Accéder à ${slide.productName}`}
        >
          <div className="relative w-full aspect-[1600/660]">
            <Image
              src={slide.wideImage}
              alt={slide.productName}
              fill
              priority={current === 0}
              className="object-cover object-center transform transition-transform duration-700 group-hover/slider:scale-[1.01]"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
        </Link>

        <div className="relative bg-[#141414]/95 backdrop-blur-md border-t border-white/10 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F80404] animate-ping shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-[#F80404] tracking-wider truncate">
                  {slide.brand}
                </span>
                <span className="hidden sm:inline-block text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  100% Stock Suisse
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate font-heading">
                {slide.productName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <Link
              href={slide.link}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-[11px] rounded-xl transition-all shadow-md hover:shadow-[#F80404]/25 flex items-center gap-1.5 active:scale-95"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center gap-1 border-l border-white/10 pl-3">
              <button
                type="button"
                onClick={() => setCurrent(prev => (prev - 1 + slides.length) % slides.length)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                aria-label="Bannière précédente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrent(prev => (prev + 1) % slides.length)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                aria-label="Bannière suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          MOBILE HERO SLIDER (< 768px only, same horizontal wide images as desktop, auto-slide & swipe)
         ============================================================ */}
      <section 
        className="block md:hidden relative rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/10 mb-6 shadow-xl select-none"
        aria-label="Bannières et offres mobiles"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div 
          ref={mobileTrackRef}
          onScroll={handleMobileScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {slides.map((s, idx) => (
            <div key={s.id} className="w-full shrink-0 snap-center relative flex flex-col">
              {/* Horizontal Wide Banner Image (Identical to Desktop) */}
              <Link href={s.link} className="relative w-full aspect-[1600/670] block overflow-hidden bg-black" aria-label={`Voir ${s.productName}`}>
                <Image
                  src={s.wideImage}
                  alt={s.productName}
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover object-center"
                />
              </Link>

              {/* Bottom bar with brand, title & CTA */}
              <div className="p-3 bg-[#141414] border-t border-white/10 flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-black uppercase text-[#F80404] tracking-wider truncate">
                      {s.brand}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 truncate">
                      100% Stock Suisse
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white truncate font-heading">
                    {s.productName}
                  </h3>
                </div>

                <Link
                  href={s.link}
                  className="shrink-0 px-3.5 py-2 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-[10px] rounded-xl flex items-center justify-center gap-1 transition-all shadow-md active:scale-95"
                >
                  <span>{s.ctaText}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
