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
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Protéines & Gainers */}
        <div>
          <h4 className="font-black text-xs uppercase tracking-widest text-[#F80404] mb-4 font-heading flex items-center gap-1.5">
            <span>✦</span> Protéines & Masse
          </h4>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li><Link href="/categorie/proteines/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Toutes les Protéines</Link></li>
            <li><Link href="/categorie/proteines/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Whey Isolate (Zéro Sucre)</Link></li>
            <li><Link href="/categorie/proteines/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Whey Concentrée</Link></li>
            <li><Link href="/categorie/proteines/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Protéines Végétales Bio</Link></li>
            <li><Link href="/categorie/gainers-prise-de-masse/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Gainers & Prise de Masse</Link></li>
          </ul>
        </div>

        {/* Col 2: Force & Performance */}
        <div>
          <h4 className="font-black text-xs uppercase tracking-widest text-[#F80404] mb-4 font-heading flex items-center gap-1.5">
            <span>✦</span> Force & Performance
          </h4>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li><Link href="/categorie/creatine/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Créatine Creapure® Pure</Link></li>
            <li><Link href="/categorie/creatine/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Créatine Monohydrate 200 Mesh</Link></li>
            <li><Link href="/categorie/pre-workout-energie/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Pré-Workout & Boosters</Link></li>
            <li><Link href="/categorie/acides-amines-recuperation/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">BCAA & EAA Essentiels</Link></li>
            <li><Link href="/categorie/acides-amines-recuperation/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">L-Glutamine Kyowa Quality®</Link></li>
          </ul>
        </div>

        {/* Col 3: Santé & Bien-être */}
        <div>
          <h4 className="font-black text-xs uppercase tracking-widest text-[#F80404] mb-4 font-heading flex items-center gap-1.5">
            <span>✦</span> Santé & Vitalité
          </h4>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li><Link href="/categorie/vitamines-mineraux/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Magnésium Bisglycinate</Link></li>
            <li><Link href="/categorie/vitamines-mineraux/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Zinc & Formules ZMA</Link></li>
            <li><Link href="/categorie/vitamines-mineraux/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Vitamines D3/K2 & Vitamine C</Link></li>
            <li><Link href="/categorie/vitamines-mineraux/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Oméga-3 EPA / DHA</Link></li>
            <li><Link href="/categorie/bien-etre-sommeil-digestion/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Ashwagandha KSM-66 & Sommeil</Link></li>
          </ul>
        </div>

        {/* Col 4: Nutrition & Endurance */}
        <div>
          <h4 className="font-black text-xs uppercase tracking-widest text-[#F80404] mb-4 font-heading flex items-center gap-1.5">
            <span>✦</span> Nutrition & Snacks
          </h4>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li><Link href="/categorie/snacks-healthy-food/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Barres & Cookies Protéinés</Link></li>
            <li><Link href="/categorie/snacks-healthy-food/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Gamme Keto Sans Sucres</Link></li>
            <li><Link href="/categorie/snacks-healthy-food/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Farines d'Avoine & Crèmes de Riz</Link></li>
            <li><Link href="/categorie/pendant-effort-hydratation/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Électrolytes & Hydratation</Link></li>
            <li><Link href="/categorie/perte-de-poids/" onClick={onClose} className="hover:text-white hover:translate-x-1 inline-block transition-transform">Perte de Poids & Définition</Link></li>
          </ul>
        </div>

      </div>

      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
        <Link href="/categorie/" onClick={onClose} className="hover:text-[#F80404] font-bold text-white flex items-center gap-1 transition-colors">
          <span>Voir les 12 catégories certifiées</span>
          <span>→</span>
        </Link>
        <span>📍 Retrait gratuit 2h à notre boutique au 34 Rue des Pâquis, Genève</span>
      </div>
    </div>
  );
}
