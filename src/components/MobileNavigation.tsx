'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ALL_BRANDS } from '@/lib/brands';
import { useStore } from '@/context/StoreContext';
import LanguageCurrencySwitcher from './LanguageCurrencySwitcher';
import { 
  X, 
  ChevronDown, 
  ChevronRight, 
  ShoppingBag, 
  Target, 
  Sparkles, 
  BookOpen, 
  User, 
  ShieldCheck, 
  MapPin, 
  Truck, 
  RotateCcw, 
  Phone, 
  Package, 
  Dumbbell,
  Download
} from 'lucide-react';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'categories' | 'goals' | 'brands' | null;
}

const CATEGORY_ITEMS = [
  { name: 'Protéines Whey & Isolate', href: '/categorie/proteines/', badge: 'Bestseller' },
  { name: 'Prise de masse / Gainers', href: '/categorie/prise-de-masse/' },
  { name: 'Créatine Monohydrate & Creapure®', href: '/categorie/creatine/' },
  { name: 'Pré-Workouts & Boosters', href: '/categorie/pre-workout/' },
  { name: 'Acides Aminés BCAA & EAA', href: '/categorie/acides-amines/' },
  { name: 'Sèche, Minceur & Brûleurs', href: '/categorie/perte-de-poids/' },
  { name: 'Vitamines, Minéraux & Santé', href: '/categorie/vitamines/' },
  { name: 'Barres & Snacks Protéinés', href: '/categorie/snacks/' },
  { name: 'Accessoires, Gourdes & Shakers', href: '/categorie/accessoires/' },
];

const GOAL_ITEMS = [
  { name: 'Prise de Masse & Volume', desc: 'Gainers, Whey Isolate & Glucides', href: '/boutique/?goal=masse' },
  { name: 'Sèche & Définition', desc: 'Fat Burners, L-Carnitine & CLA', href: '/boutique/?goal=seche' },
  { name: 'Force Pure & Explosivité', desc: 'Creapure® 99.9% & Créatines pures', href: '/boutique/?goal=force' },
  { name: 'Énergie & Pré-Workout', desc: 'L-Citrulline Malate & Boosters', href: '/boutique/?goal=energie' },
  { name: 'Santé & Vitalité', desc: 'Ashwagandha KSM-66 & Minéraux', href: '/boutique/?goal=sante' },
  { name: 'Snacks & Keto', desc: 'Barres protéinées & Purées bio', href: '/boutique/?goal=snacks' },
];

export default function MobileNavigation({ isOpen, onClose, initialTab = null }: MobileNavigationProps) {
  const { t } = useStore();
  const [openSection, setOpenSection] = useState<'categories' | 'goals' | 'brands' | null>(initialTab || 'categories');

  if (!isOpen) return null;

  const toggleSection = (section: 'categories' | 'goals' | 'brands') => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md z-[95] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <div 
        className="fixed top-0 left-0 h-full w-[88%] max-w-sm bg-[#111111] text-white z-[96] border-r border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation mobile"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#0c0c0c] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F80404]" />
            <span className="text-sm font-black uppercase text-white font-heading tracking-wider">
              NutriFitness.ch
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:bg-white/25 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 safe-area-bottom">
          
          {/* Quick Home Link */}
          <Link 
            href="/" 
            onClick={onClose} 
            className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white font-heading text-xs font-bold uppercase tracking-wider transition-colors min-h-[44px]"
          >
            <span>Accueil</span>
            <ChevronRight className="w-4 h-4 text-white/30" />
          </Link>

          {/* ============================================================
              ACCORDION 1: BOUTIQUE (CATÉGORIES)
             ============================================================ */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('categories')}
              className="w-full min-h-[48px] flex items-center justify-between px-3.5 py-3 text-left transition-colors font-heading text-xs font-bold uppercase tracking-wider"
              aria-expanded={openSection === 'categories'}
            >
              <div className="flex items-center gap-2 text-white">
                <ShoppingBag className="w-4 h-4 text-[#F80404]" />
                <span>Boutique (Catégories)</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-200 ${openSection === 'categories' ? 'rotate-180 text-[#F80404]' : ''}`} />
            </button>

            {openSection === 'categories' && (
              <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-1">
                {CATEGORY_ITEMS.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={onClose}
                    className="flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors min-h-[40px]"
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat.badge && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#F80404]/20 text-[#F80404] border border-[#F80404]/30">
                        {cat.badge}
                      </span>
                    )}
                  </Link>
                ))}
                <Link
                  href="/boutique/"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 mt-2 py-2.5 px-3 rounded-lg bg-white/5 hover:bg-[#F80404] hover:text-black text-white text-xs font-black uppercase tracking-wider transition-all min-h-[44px]"
                >
                  <span>Voir tous les produits</span>
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>

          {/* ============================================================
              ACCORDION 2: PAR OBJECTIF
             ============================================================ */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('goals')}
              className="w-full min-h-[48px] flex items-center justify-between px-3.5 py-3 text-left transition-colors font-heading text-xs font-bold uppercase tracking-wider"
              aria-expanded={openSection === 'goals'}
            >
              <div className="flex items-center gap-2 text-white">
                <Target className="w-4 h-4 text-[#FF3D00]" />
                <span>Par Objectif</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-200 ${openSection === 'goals' ? 'rotate-180 text-[#FF3D00]' : ''}`} />
            </button>

            {openSection === 'goals' && (
              <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-1">
                {GOAL_ITEMS.map((goal) => (
                  <Link
                    key={goal.href}
                    href={goal.href}
                    onClick={onClose}
                    className="flex flex-col py-2 px-2.5 rounded-lg hover:bg-white/5 transition-colors min-h-[44px] justify-center"
                  >
                    <span className="text-xs font-bold text-white/90">{goal.name}</span>
                    <span className="text-[10px] text-white/50">{goal.desc}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ============================================================
              ACCORDION 3: MARQUES (SHOP BY BRAND)
             ============================================================ */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('brands')}
              className="w-full min-h-[48px] flex items-center justify-between px-3.5 py-3 text-left transition-colors font-heading text-xs font-bold uppercase tracking-wider"
              aria-expanded={openSection === 'brands'}
            >
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 text-[#F80404]" />
                <span>Marques</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-200 ${openSection === 'brands' ? 'rotate-180 text-[#F80404]' : ''}`} />
            </button>

            {openSection === 'brands' && (
              <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-1 max-h-60 overflow-y-auto">
                {ALL_BRANDS.map(brand => (
                  <Link
                    key={brand.slug}
                    href={`/boutique/?brand=${encodeURIComponent(brand.name)}`}
                    onClick={onClose}
                    className="flex items-center justify-between py-2 px-2 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors min-h-[40px]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-7 h-5 shrink-0 bg-black/40 rounded p-0.5 border border-white/10 flex items-center justify-center">
                        <Image 
                          src={brand.logo} 
                          alt={brand.displayName} 
                          fill 
                          className="object-contain filter brightness-110" 
                        />
                      </div>
                      <span className="truncate">{brand.displayName}</span>
                    </div>
                    <span className="text-[10px] text-white/40 px-1.5 py-0.5 rounded bg-black/40 shrink-0 font-mono">
                      {brand.count}
                    </span>
                  </Link>
                ))}
                <Link
                  href="/marques/"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 mt-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-[#F80404] hover:text-black text-white text-[11px] font-black uppercase tracking-wider transition-all min-h-[40px]"
                >
                  <span>Toutes les marques</span>
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>

          {/* Coaching Personnalisé */}
          <Link 
            href="/coaching-nutritionnel-personnalise/" 
            onClick={onClose} 
            className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-[#F80404]/10 border border-[#F80404]/30 text-white hover:bg-[#F80404]/20 transition-colors min-h-[48px]"
          >
            <div className="flex items-center gap-2.5">
              <Dumbbell className="w-4 h-4 text-[#F80404]" />
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase font-heading">{t.nav.coaching}</span>
                <span className="text-[10px] text-white/60">Bilan gratuit & suivi par expert</span>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#F80404] text-black font-black uppercase">
              Bilan
            </span>
          </Link>

          {/* Guides & Blog */}
          <Link 
            href="/blog/" 
            onClick={onClose} 
            className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white font-heading text-xs font-bold uppercase tracking-wider transition-colors min-h-[44px]"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-[#F80404]" />
              <span>Guides & Blog (20 Dossiers)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30" />
          </Link>

          {/* ============================================================
              PROMO CARD: EBOOK GUIDE ULTIME (Moved out of priority links)
             ============================================================ */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#162010] to-[#0e140a] border border-[#95d600]/30 shadow-lg">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#95d600] text-black">
                Ebook Gratuit
              </span>
              <span className="text-[10px] text-white/50">66 pages PDF</span>
            </div>
            <h4 className="text-xs font-black text-white uppercase font-heading mb-1 leading-snug">
              Guide Ultime des Compléments
            </h4>
            <p className="text-[11px] text-white/70 mb-3 leading-relaxed">
              Posologies, timings et protocoles scientifiques complets pour votre progression.
            </p>
            <Link
              href="/guide-des-complements-alimentaires/"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-[#95d600] hover:bg-[#b0fa00] text-black font-black text-xs uppercase tracking-wider transition-all min-h-[40px] shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger le Guide</span>
            </Link>
          </div>

          {/* ============================================================
              SECONDARY SERVICE LINKS
             ============================================================ */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-2 py-1">
              Services & Aide
            </p>

            <Link 
              href="/magasin-geneve/" 
              onClick={onClose} 
              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors min-h-[40px]"
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#F80404]" />
                <span>Boutique physique Genève</span>
              </div>
              <span className="text-[10px] text-white/40">Pâquis 34</span>
            </Link>

            <Link 
              href="/livraison/" 
              onClick={onClose} 
              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors min-h-[40px]"
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-white/60" />
                <span>Livraison 1-2 jours & Tarifs</span>
              </div>
            </Link>

            <Link 
              href="/retours/" 
              onClick={onClose} 
              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors min-h-[40px]"
            >
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-white/60" />
                <span>Politique de Retours (14j)</span>
              </div>
            </Link>

            <Link 
              href="/contact/" 
              onClick={onClose} 
              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors min-h-[40px]"
            >
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-white/60" />
                <span>Contact & Service Client</span>
              </div>
            </Link>

            <Link 
              href="/compte/" 
              onClick={onClose} 
              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors min-h-[40px]"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-white/60" />
                <span>Mon Compte Client</span>
              </div>
            </Link>

            <Link 
              href="/commande/" 
              onClick={onClose} 
              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors min-h-[40px]"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-white/60" />
                <span>Suivi de Commande</span>
              </div>
            </Link>
          </div>

          {/* ============================================================
              LANGUE (Text switcher FR / DE / IT / EN - No flags)
             ============================================================ */}
          <div className="pt-3 border-t border-white/10">
            <LanguageCurrencySwitcher variant="mobile" />
          </div>

          {/* Trust reassurance note */}
          <div className="pt-2 pb-4 space-y-1.5 text-white/60">
            <div className="flex items-center gap-2 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Stock en Suisse · Zéro frais de douane</span>
            </div>
            <p className="text-[10px] text-white/40">
              Paiement sécurisé TWINT, Cartes & PostFinance · Livraison Poste 1-2 jours
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
