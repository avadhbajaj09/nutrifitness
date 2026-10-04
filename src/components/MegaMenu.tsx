'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="absolute left-0 right-0 top-full mt-2 w-full bg-[#121212]/98 backdrop-blur-2xl border-y border-white/10 shadow-2xl p-8 z-50 text-white animate-in fade-in slide-in-from-top-2 duration-200"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Col 1: Protéines */}
        <div>
          <h4 className="font-black text-xs uppercase tracking-widest text-[#F80404] mb-4 font-heading flex items-center gap-1.5">
            <span>✦</span> Protéines & Whey
          </h4>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li><Link href="/boutique/?cat=proteines" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Whey Concentrée</Link></li>
            <li><Link href="/boutique/?cat=proteines" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Whey Isolate (Zero Sucre)</Link></li>
            <li><Link href="/boutique/?cat=proteines" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Protéines Véganes Bio</Link></li>
            <li><Link href="/boutique/?cat=proteines" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Caséine Micellaire Nuit</Link></li>
            <li><Link href="/boutique/?cat=gainers" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Mass Gainers & Prise de Masse</Link></li>
          </ul>
        </div>

        {/* Col 2: Force & Performance */}
        <div>
          <h4 className="font-black text-xs uppercase tracking-widest text-[#F80404] mb-4 font-heading flex items-center gap-1.5">
            <span>✦</span> Force & Créatine
          </h4>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li><Link href="/boutique/?cat=creatine" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Créatine Creapure® Pure</Link></li>
            <li><Link href="/boutique/?cat=pre-workout" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Pré-Workout Booster d'Énergie</Link></li>
            <li><Link href="/boutique/?cat=acides-amines" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">BCAA 2:1:1 / 4:1:1</Link></li>
            <li><Link href="/boutique/?cat=acides-amines" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">EAA Acides Aminés Essentiels</Link></li>
            <li><Link href="/boutique/?cat=acides-amines" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">L-Glutamine Kyowa® Pure</Link></li>
          </ul>
        </div>

        {/* Col 3: Santé & Bien-être */}
        <div>
          <h4 className="font-black text-xs uppercase tracking-widest text-[#F80404] mb-4 font-heading flex items-center gap-1.5">
            <span>✦</span> Santé & Vitalité
          </h4>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li><Link href="/boutique/?cat=vitamines" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Oméga-3 Haute Pureté</Link></li>
            <li><Link href="/boutique/?cat=vitamines" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Vitamines D3/K2 & Zinc</Link></li>
            <li><Link href="/boutique/?cat=vitamines" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Magnésium Bisglycinate</Link></li>
            <li><Link href="/boutique/?cat=vitamines" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Collagène Marin Peptan®</Link></li>
            <li><Link href="/boutique/?cat=vitamines" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Ashwagandha KSM-66</Link></li>
          </ul>
        </div>

        {/* Col 4: Shop by Goal */}
        <div>
          <h4 className="font-black text-xs uppercase tracking-widest text-[#F80404] mb-4 font-heading flex items-center gap-1.5">
            <span>✦</span> Objectifs
          </h4>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li><Link href="/boutique/?goal=masse" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Prise de Masse Musculaire</Link></li>
            <li><Link href="/boutique/?goal=seche" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Sèche & Définition Abdominale</Link></li>
            <li><Link href="/boutique/?goal=force" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Force Pure & Explosivité</Link></li>
            <li><Link href="/boutique/?goal=endurance" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Endurance & Électrolytes</Link></li>
            <li><Link href="/boutique/?goal=sante" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Santé Globale & Articulations</Link></li>
          </ul>
        </div>

        {/* Col 5: Featured Card */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#1C1C1C] to-black border border-white/10 p-5 flex flex-col justify-between group/card">
          <span className="inline-block px-2.5 py-0.5 bg-[#F80404] text-black text-[10px] font-black uppercase tracking-wider rounded w-fit">
            Exclusivité Suisse
          </span>
          <div className="my-3 text-center">
            <div className="relative w-28 h-28 mx-auto">
              <Image 
                src="/images/fitrush/imgi_49_banner-h9-2.webp" 
                alt="Pack Créatine Creapure" 
                fill 
                className="object-contain group-hover/card:scale-105 transition-transform"
              />
            </div>
            <p className="text-xs font-bold text-white mt-3">Pack Force & Creapure®</p>
            <p className="text-[10px] text-white/50">Expédition 24h par la Poste</p>
          </div>
          <Link 
            href="/boutique/?cat=creatine"
            onClick={onClose}
            className="w-full py-2 bg-white/10 hover:bg-[#F80404] hover:text-black text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all text-center block"
          >
            Découvrir →
          </Link>
        </div>
      </div>
    </div>
  );
}
