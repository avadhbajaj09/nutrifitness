import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] text-white/80 pt-16 pb-12 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          
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
                Boutique physique à Genève :
              </p>
              <p>34 Rue des Pâquis, 1201 Genève</p>
              <p className="text-white/80">Fondateur & Gérant : <span className="font-bold text-white">Marco Scarpantoni</span></p>
              <p>Tél : <a href="tel:+41792503564" className="hover:text-[#F80404] transition-colors">+41 79 250 35 64</a></p>
              <p>E-mail : <a href="mailto:hello@nutrifitness.ch" className="hover:text-[#F80404] transition-colors">hello@nutrifitness.ch</a></p>
              <p className="text-[11px] text-white/40 pt-1">IDE / UID : [TODO: UID / CHE-XXX.XXX.XXX]</p>
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
              <li><Link href="/magasin-geneve/" className="hover:text-white transition-colors font-bold text-white">📍 Boutique Genève & Click & Collect</Link></li>
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
              <li><Link href="/protection-donnees/" className="hover:text-white transition-colors">Protection des Données (nDSG Suisse)</Link></li>
              <li><Link href="/cookies/" className="hover:text-white transition-colors">Gestion des Cookies</Link></li>
            </ul>
            <div className="space-y-2">
              <input 
                type="email" 
                placeholder="Votre adresse e-mail"
                className="w-full min-h-[40px] px-3 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none"
              />
              <button 
                type="button"
                className="w-full min-h-[40px] px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#F80404] hover:bg-[#FF3D00] rounded-xl transition-all shadow-md active:scale-98"
              >
                S&apos;inscrire au Club
              </button>
            </div>
          </div>
        </div>

        {/* Payment Badges & Shipping Partners */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            <span className="font-bold text-white/80 mr-1">Paiements suisses :</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-white">TWINT</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-white">PostFinance</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-white">Mastercard</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-white">Visa</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-white">Apple Pay</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-white">QR-Facture</span>
          </div>

          <div className="text-xs text-white/50 text-center md:text-right space-y-1">
            <p>🇨🇭 Expédition PostPac Priority (24h) par La Poste Suisse</p>
            <p className="text-[11px] text-white/40">
              © {currentYear} NutriFitness.ch. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
