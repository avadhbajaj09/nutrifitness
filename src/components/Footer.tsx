'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { COMPANY } from '@/lib/company';
import { useStore } from '@/context/StoreContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { showToast } = useStore();
  const [email, setEmail] = useState('');
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (sec: string) => {
    setOpenSection(prev => prev === sec ? null : sec);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    showToast('Club NutriFitness', 'Merci ! Votre bon de réduction de 10% a été envoyé.');
    setEmail('');
  };

  return (
    <footer className="bg-[#050505] text-white/80 pt-10 sm:pt-16 pb-12 border-t border-white/10 mt-12 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Mobile Accordion Navigation (Section P) */}
        <div className="md:hidden space-y-2 mb-8">
          {/* Logo & Entity intro */}
          <div className="mb-6">
            <Link href="/" className="inline-block mb-3">
              <div className="relative h-9 w-40">
                <Image 
                  src="/images/brand/logo.png" 
                  alt="NutriFitness.ch" 
                  fill
                  className="object-contain filter brightness-110"
                />
              </div>
            </Link>
            <p className="text-xs text-white/60 leading-relaxed">
              Boutique suisse officielle de nutrition sportive &amp; compléments alimentaires à Genève.
            </p>
          </div>

          {/* Group 1: Boutique */}
          <div className="border-b border-white/10">
            <button
              type="button"
              onClick={() => toggleSection('boutique')}
              className="w-full min-h-[48px] flex items-center justify-between text-xs font-black uppercase tracking-wider text-white py-3 text-left"
            >
              <span>Boutique &amp; Produits</span>
              <span className="text-sm font-bold text-white/60">{openSection === 'boutique' ? '−' : '+'}</span>
            </button>
            {openSection === 'boutique' && (
              <ul className="pb-4 space-y-1 text-xs text-white/70">
                <li><Link href="/categorie/proteines/" className="min-h-[44px] flex items-center hover:text-[#F80404]">Protéines &amp; Whey</Link></li>
                <li><Link href="/categorie/creatine/" className="min-h-[44px] flex items-center hover:text-[#F80404]">Créatines (Creapure®)</Link></li>
                <li><Link href="/categorie/gainers-prise-de-masse/" className="min-h-[44px] flex items-center hover:text-[#F80404]">Gainers &amp; Prise de masse</Link></li>
                <li><Link href="/categorie/bcaa-acides-amines/" className="min-h-[44px] flex items-center hover:text-[#F80404]">BCAA &amp; Acides aminés</Link></li>
                <li><Link href="/marques/" className="min-h-[44px] flex items-center hover:text-[#F80404]">Toutes les Marques</Link></li>
                <li><Link href="/boutique/" className="min-h-[44px] flex items-center font-bold text-[#F80404]">Voir toute la boutique →</Link></li>
              </ul>
            )}
          </div>

          {/* Group 2: Informations & Services */}
          <div className="border-b border-white/10">
            <button
              type="button"
              onClick={() => toggleSection('services')}
              className="w-full min-h-[48px] flex items-center justify-between text-xs font-black uppercase tracking-wider text-white py-3 text-left"
            >
              <span>Showroom &amp; Livraison</span>
              <span className="text-sm font-bold text-white/60">{openSection === 'services' ? '−' : '+'}</span>
            </button>
            {openSection === 'services' && (
              <ul className="pb-4 space-y-1 text-xs text-white/70">
                <li><Link href="/magasin-geneve/" className="min-h-[44px] flex items-center hover:text-white">📍 Showroom Genève (Rue des Pâquis 34)</Link></li>
                <li><Link href="/click-and-collect/" className="min-h-[44px] flex items-center text-white font-bold hover:text-[#F80404]">⚡ Click &amp; Collect gratuit (2h)</Link></li>
                <li><Link href="/livraison/" className="min-h-[44px] flex items-center hover:text-white">Livraison 24h La Poste Suisse</Link></li>
                <li><Link href="/paiement/" className="min-h-[44px] flex items-center hover:text-white">Paiement TWINT &amp; Cartes</Link></li>
                <li><Link href="/retours/" className="min-h-[44px] flex items-center hover:text-white">Retours 14 jours</Link></li>
                <li><Link href="/commande/" className="min-h-[44px] flex items-center hover:text-white">Suivi de commande</Link></li>
              </ul>
            )}
          </div>

          {/* Group 3: Conseils & Dossiers */}
          <div className="border-b border-white/10">
            <button
              type="button"
              onClick={() => toggleSection('conseils')}
              className="w-full min-h-[48px] flex items-center justify-between text-xs font-black uppercase tracking-wider text-white py-3 text-left"
            >
              <span>Conseils &amp; Coaching</span>
              <span className="text-sm font-bold text-white/60">{openSection === 'conseils' ? '−' : '+'}</span>
            </button>
            {openSection === 'conseils' && (
              <ul className="pb-4 space-y-1 text-xs text-white/70">
                <li><Link href="/coaching-nutritionnel-personnalise/" className="min-h-[44px] flex items-center text-white font-bold hover:text-[#F80404]">✦ Coaching Personnalisé</Link></li>
                <li><Link href="/guide-des-complements-alimentaires/" className="min-h-[44px] flex items-center text-white font-bold hover:text-[#95d600]">✦ Guide Ebook (66 pages PDF)</Link></li>
                <li><Link href="/blog/" className="min-h-[44px] flex items-center hover:text-white">Blog &amp; Guides Scientifiques (20 dossiers)</Link></li>
                <li><Link href="/quel-complement-choisir/" className="min-h-[44px] flex items-center hover:text-white">Quel complément choisir ?</Link></li>
                <li><Link href="/faq/" className="min-h-[44px] flex items-center hover:text-white">Centre d&apos;aide &amp; FAQ</Link></li>
              </ul>
            )}
          </div>

          {/* Group 4: Contact & Légal */}
          <div className="border-b border-white/10">
            <button
              type="button"
              onClick={() => toggleSection('legal')}
              className="w-full min-h-[48px] flex items-center justify-between text-xs font-black uppercase tracking-wider text-white py-3 text-left"
            >
              <span>Contact &amp; Légal</span>
              <span className="text-sm font-bold text-white/60">{openSection === 'legal' ? '−' : '+'}</span>
            </button>
            {openSection === 'legal' && (
              <ul className="pb-4 space-y-1 text-xs text-white/70">
                <li><a href={`tel:${COMPANY.contact.phone.replace(/\s+/g, '')}`} className="min-h-[44px] flex items-center hover:text-[#F80404]">📞 {COMPANY.contact.phoneFormatted}</a></li>
                <li><a href={`mailto:${COMPANY.contact.email}`} className="min-h-[44px] flex items-center hover:text-[#F80404]">✉️ {COMPANY.contact.email}</a></li>
                <li><Link href="/mentions-legales/" className="min-h-[44px] flex items-center hover:text-white">Mentions Légales &amp; Impressum</Link></li>
                <li><Link href="/cgv/" className="min-h-[44px] flex items-center hover:text-white">Conditions Générales de Vente</Link></li>
                <li><Link href="/cookies/" className="min-h-[44px] flex items-center hover:text-white">Gestion des Cookies</Link></li>
              </ul>
            )}
          </div>
        </div>

        {/* 4 Column Grid (Desktop Only - Pixel-Identical) */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          
          {/* Col 1: Store & Entity Info (EEAT) */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <div className="relative h-10 w-44">
                <Image 
                  src="/images/brand/logo.png" 
                  alt="NutriFitness.ch" 
                  fill
                  className="object-contain filter brightness-110"
                />
              </div>
            </Link>
            <p className="text-xs text-white/60 leading-relaxed mb-4">
              Votre boutique suisse spécialisée en nutrition sportive, protéines pures et compléments haute performance.
            </p>
            <address className="not-italic text-xs text-white/70 space-y-1.5">
              <p className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F80404] inline-block" />
                Boutique physique en Suisse :
              </p>
              <p>{COMPANY.address.street}, {COMPANY.address.postalCode} Suisse</p>
              <p className="text-white/80">Service Client : <span className="font-bold text-white">Équipe NutriFitness Suisse</span></p>
              <p>Tél : <a href={`tel:${COMPANY.contact.phone.replace(/\s+/g, '')}`} className="hover:text-[#F80404] transition-colors">{COMPANY.contact.phoneFormatted}</a></p>
              <p>E-mail : <a href={`mailto:${COMPANY.contact.email}`} className="hover:text-[#F80404] transition-colors">{COMPANY.contact.email}</a></p>
              <p className="text-[11px] text-white/40 pt-1">IDE / UID : {COMPANY.uid}</p>
            </address>
          </div>

          {/* Col 2: Expertises & Coaching */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-4 font-heading">Conseils & Expertises</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link href="/coaching-nutritionnel-personnalise/" className="hover:text-[#F80404] font-bold text-white transition-colors">✦ Coaching Personnalisé (Bilan Gratuit)</Link></li>
              <li><Link href="/guide-des-complements-alimentaires/" className="hover:text-[#95d600] font-bold text-white transition-colors">✦ Guide Ultime Ebook (66 pages PDF)</Link></li>
              <li><Link href="/blog/" className="hover:text-[#F80404] font-bold text-white transition-colors">✦ Blog & Guides Scientifiques (20 Dossiers)</Link></li>
              <li><Link href="/quel-complement-choisir/" className="hover:text-white transition-colors font-medium text-white/90">✦ Quel Complément Choisir ?</Link></li>
              <li><Link href="/marques/" className="hover:text-white transition-colors">Nos Marques Officielles</Link></li>
              <li><Link href="/a-propos/" className="hover:text-white transition-colors">À Propos & Notre Histoire (2015)</Link></li>
              <li><Link href="/faq/" className="hover:text-white transition-colors font-bold text-white">Centre d&apos;Aide & FAQ Complète</Link></li>
            </ul>
          </div>

          {/* Col 3: Boutique & Livraison */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-4 font-heading">Boutique & Livraison</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link href="/magasin-geneve/" className="hover:text-white transition-colors font-bold text-white">📍 Boutique en Suisse & Horaires</Link></li>
              <li><Link href="/click-and-collect/" className="hover:text-[#F80404] transition-colors font-bold text-white">⚡ Click & Collect Gratuit (2h)</Link></li>
              <li><Link href="/livraison/" className="hover:text-white transition-colors">Livraison Express 24h & Tarifs</Link></li>
              <li><Link href="/paiement/" className="hover:text-white transition-colors">Paiement Sécurisé (TWINT, Cartes)</Link></li>
              <li><Link href="/retours/" className="hover:text-white transition-colors">Politique de Retours (14 Jours)</Link></li>
              <li><Link href="/contact/" className="hover:text-white transition-colors">Contactez Notre Équipe</Link></li>
              <li><Link href="/compte/" className="hover:text-white transition-colors">Mon Compte Client</Link></li>
              <li><Link href="/commande/" className="hover:text-white transition-colors">Suivi de Commande en Ligne</Link></li>
            </ul>
          </div>

          {/* Col 4: Sécurité & Newsletter */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-4 font-heading">Conformité & Club</h4>
            <ul className="space-y-1.5 text-[11px] text-white/60 mb-4">
              <li><Link href="/qualite-conservation/" className="hover:text-white transition-colors">Qualité, Authenticité & DDM</Link></li>
              <li><Link href="/sante-securite/" className="hover:text-white transition-colors">Santé, Sécurité & Mises en Garde</Link></li>
              <li><Link href="/mentions-legales/" className="hover:text-white transition-colors">Mentions Légales & Impressum</Link></li>
              <li><Link href="/cgv/" className="hover:text-white transition-colors">Conditions Générales de Vente (CGV)</Link></li>
              <li><Link href="/cookies/" className="hover:text-white transition-colors">Politique des Cookies</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('openCookieConsent'));
                    }
                  }}
                  className="hover:text-[#F80404] transition-colors text-left cursor-pointer"
                >
                  Gérer les cookies
                </button>
              </li>
            </ul>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse e-mail"
                className="w-full min-h-[40px] px-3 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none transition-colors"
              />
              <button 
                type="submit"
                className="w-full min-h-[40px] px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#F80404] hover:bg-[#FF3D00] rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
              >
                S&apos;inscrire au Club (-10%)
              </button>
            </form>
          </div>
        </div>

        {/* Payment Badges & Shipping Partners */}
        <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-white/50">
            <span className="font-bold text-white/80 mr-1">Paiements :</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-white">TWINT</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-white">PostFinance</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-white">Apple Pay</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-white">Visa</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-white">Mastercard</span>
          </div>

          <div className="text-xs text-white/50 text-center md:text-right space-y-1">
            <p>🇨🇭 Expédition PostPac Priority (24h) par La Poste Suisse</p>
            <p className="text-[11px] text-white/40 flex flex-wrap items-center justify-center md:justify-end gap-1.5">
              <span>© {currentYear} NutriFitness.ch 🇨🇭 Tous droits réservés.</span>
              <span className="hidden sm:inline">•</span>
              <span>
                Designed and built by{' '}
                <a 
                  href="https://avadhbajaj.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white/60 hover:text-white transition-colors underline decoration-white/20 underline-offset-2 font-medium"
                >
                  avadhbajaj.com
                </a>
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
