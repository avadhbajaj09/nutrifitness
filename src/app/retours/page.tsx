import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft,
  PackageCheck,
  AlertTriangle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Politique de Retour & Remboursement (14 Jours) | NutriFitness.ch',
  description: 'Modalités de retours, droit de rétractation de 14 jours, réexpéditions et remboursements pour la boutique NutriFitness à Genève (Suisse).',
  alternates: {
    canonical: 'https://nutrifitness.ch/retours/',
  }
};

export default function RetoursPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-[#F80404] font-bold">Politique de Retour & Remboursement</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider mb-3 font-heading">
          <RotateCcw className="w-3.5 h-3.5" />
          Garantie Sérénité 14 Jours
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          Politique de Retour & <span className="text-[#F80404]">Remboursement</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-2">
          Conditions applicables aux achats réalisés sur notre boutique en ligne située en Suisse à Genève.
        </p>
      </header>

      {/* 3 Step Quick Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="p-5 rounded-3xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-[#F80404]/10 text-[#F80404] flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-white/50 uppercase">Délai Légal</span>
          <h3 className="text-base font-black text-white font-heading mt-0.5">14 Jours Calendaires</h3>
          <p className="text-xs text-white/60 mt-1">À compter du jour de la réception de votre colis par La Poste Suisse.</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-[#95d600]/10 text-[#95d600] flex items-center justify-center mb-3">
            <PackageCheck className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-white/50 uppercase">État Exigé</span>
          <h3 className="text-base font-black text-white font-heading mt-0.5">Scellé & Intact</h3>
          <p className="text-xs text-white/60 mt-1">Non ouvert, avec opercule de sécurité d&apos;origine intact pour des raisons sanitaires.</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
            <RotateCcw className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-white/50 uppercase">Remboursement</span>
          <h3 className="text-base font-black text-white font-heading mt-0.5">Sous 7 Jours</h3>
          <p className="text-xs text-white/60 mt-1">Crédité directement sur le moyen de paiement d&apos;origine (TWINT, CB, PostFinance).</p>
        </div>
      </div>

      {/* Main Policy Content */}
      <div className="space-y-8 text-xs sm:text-sm text-white/80 leading-relaxed">
        
        {/* Section 1: Conditions d'éligibilité */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <CheckCircle2 className="w-5 h-5 text-[#95d600]" />
            <h2>1. Conditions d&apos;Éligibilité au Retour & Remboursement</h2>
          </div>
          <p>
            Notre politique de remboursement pour notre boutique en ligne située en Suisse est la suivante :
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-white/70">
            <li>
              Les clients ont <strong>14 jours à compter de la date de livraison</strong> pour demander un remboursement pour tous les produits <strong>non ouverts et non utilisés</strong>.
            </li>
            <li>
              Pour demander un remboursement, les clients doivent contacter notre équipe de service clientèle par courrier électronique ou téléphone et fournir leur <strong>numéro de commande</strong> ainsi que la <strong>raison de la demande</strong>.
            </li>
            <li>
              Nous examinons les demandes de remboursement au cas par cas et nous nous réservons le droit de refuser un remboursement si le produit a été ouvert, entamé ou utilisé.
            </li>
            <li>
              Si un remboursement est approuvé, nous émettons un remboursement sur la méthode de paiement d&apos;origine <strong>dans les 7 jours suivant l&apos;approbation</strong>.
            </li>
          </ul>
        </section>

        {/* Section 2: Produits Défectueux ou Avariés */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <ShieldAlert className="w-5 h-5 text-[#F80404]" />
            <h2>2. Produits Défectueux ou Colis Endommagés</h2>
          </div>
          <p>
            En cas de produits défectueux ou endommagés lors de la livraison :
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-white/70">
            <li>
              Les clients doivent contacter notre équipe de service clientèle dans les <strong>14 jours suivant la livraison</strong> et fournir une photo nette du produit et de l&apos;emballage endommagé.
            </li>
            <li>
              Nous fournirons soit un <strong>produit neuf de remplacement sans frais</strong>, soit un <strong>remboursement complet</strong> du coût du produit, à notre discrétion.
            </li>
          </ul>
        </section>

        {/* Section 3: Exclusions & Restrictions */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <XCircle className="w-5 h-5 text-red-500" />
            <h2>3. Exceptions & Produits Non Remboursables</h2>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-xs text-white/70">
            <li>
              <strong>Denrées alimentaires et compléments ouverts :</strong> Notre politique ne s&apos;applique pas aux biens périssables et compléments alimentaires dont le scellé de protection d&apos;hygiène a été brisé.
            </li>
            <li>
              <strong>Articles en solde :</strong> Tous les articles en solde ou en déstockage sont définitifs et ne peuvent pas être retournés ou remboursés.
            </li>
            <li>
              <strong>Ruptures et produits discontinués :</strong> Les remboursements ne seront pas émis pour les produits qui ont été discontinués ou qui sont en rupture définitive.
            </li>
            <li>
              <strong>Produits numériques (Ebooks) :</strong> Le guide numérique téléchargeable n&apos;est pas éligible au remboursement une fois le lien téléchargé.
            </li>
            <li>
              <strong>Achats en boutique physique :</strong> Cette politique de remboursement s&apos;applique aux achats effectués sur notre site web et ne s&apos;applique pas aux achats effectués directement dans des magasins physiques ou à travers d&apos;autres détaillants.
            </li>
          </ul>
        </section>

        {/* Section 4: Frais de Retour & Procédure */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <RotateCcw className="w-5 h-5 text-[#95d600]" />
            <h2>4. Frais de Port & Procédure d&apos;Expédition</h2>
          </div>
          <p>
            Tous les frais d&apos;expédition de retour postal sont <strong>à la charge du client</strong> (sauf en cas d&apos;erreur avérée de livraison ou de produit défectueux).
          </p>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <p className="font-bold text-white">Adresse officielle pour l&apos;envoi de votre colis de retour :</p>
            <address className="not-italic text-xs text-white/80 space-y-0.5">
              <p className="text-white font-bold">NutriFitness — Service Retours</p>
              <p>Rue des Pâquis 34</p>
              <p>1201 Genève</p>
              <p>Suisse 🇨🇭</p>
            </address>
            <p className="text-[11px] text-white/50 pt-1">
              Nous vous recommandons vivement d&apos;utiliser un envoi suivi (PostPac de La Poste Suisse) afin de conserver une preuve d&apos;expédition.
            </p>
          </div>
        </section>

        {/* Section 5: Engagement Qualité & Contact */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2>5. Service Client & Contact Avant Retour</h2>
          </div>
          <p>
            En cas de problème ou d&apos;insatisfaction avec un produit, <strong>veuillez contacter notre équipe de support avant d&apos;initier le processus de retour</strong> ou de réexpédition. Nous nous engageons à fournir un haut niveau de satisfaction client, et nous ferons de notre mieux pour résoudre rapidement toute question liée à votre commande.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a 
              href="mailto:support@nutrifitness.ch"
              className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-[#F80404]/50 transition-colors flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F80404]/10 text-[#F80404] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-white/50 font-bold uppercase block">Support E-mail</span>
                <span className="text-sm font-black text-white group-hover:text-[#F80404] transition-colors">support@nutrifitness.ch</span>
                <span className="text-[10px] text-white/40 block">ou info@nutrifitness.ch</span>
              </div>
            </a>

            <a 
              href="tel:+41792503564"
              className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-[#95d600]/50 transition-colors flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#95d600]/10 text-[#95d600] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-white/50 font-bold uppercase block">Téléphone direct</span>
                <span className="text-sm font-black text-white group-hover:text-[#95d600] transition-colors">+41 79 250 35 64</span>
                <span className="text-[10px] text-white/40 block">Genève (du lundi au samedi)</span>
              </div>
            </a>
          </div>
        </section>

      </div>

      {/* Navigation Footer */}
      <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-4">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-bold">
          <Link href="/cgv/" className="text-white/60 hover:text-white transition-colors">
            Conditions Générales de Vente
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/protection-donnees/" className="text-[#F80404] hover:underline">
            Protection des Données →
          </Link>
        </div>
      </div>

    </div>
  );
}
