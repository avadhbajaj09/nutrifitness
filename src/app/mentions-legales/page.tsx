import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, MapPin, Phone, Mail, Building, Globe, Server, Scale, ArrowLeft } from 'lucide-react';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Mentions Légales & Impressum | NutriFitness.ch Suisse',
  description: 'Mentions légales, identification de l\'éditeur, hébergement et coordonnées officielles de NutriFitness en Suisse.',
  alternates: {
    canonical: 'https://nutrifitness.ch/mentions-legales/',
  }
};

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-[#F80404] font-bold">Mentions Légales & Impressum</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider mb-3 font-heading">
          <Scale className="w-3.5 h-3.5" />
          Conformité Droit Suisse
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          Mentions Légales & <span className="text-[#F80404]">Impressum</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-2">
          Informations réglementaires relatives à l&apos;éditeur et à l&apos;exploitation du site internet nutrifitness.ch.
        </p>
      </header>

      {/* Main Content Blocks */}
      <div className="space-y-8 text-xs sm:text-sm text-white/80 leading-relaxed">
        
        {/* Section 1: Présentation de l'entreprise */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <Building className="w-5 h-5 text-[#F80404]" />
            <h2>1. Identification Légale de l&apos;Entreprise &amp; Exploitant</h2>
          </div>
          <p>
            Le site marchand <strong>nutrifitness.ch</strong> est la propriété exclusive et est exploité par l&apos;entreprise individuelle suisse <strong>{COMPANY.legalName}</strong> (exerçant sous l&apos;enseigne commerciale <strong>{COMPANY.tradingName}</strong>), immatriculée au Registre du Commerce de Genève et strictement conforme aux réglementations fédérales suisses et aux exigences d&apos;acceptation des paiements <strong>TWINT</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold text-white/50 uppercase block">Raison de commerce officielle (Company Name) :</span>
              <p className="text-sm font-black text-white">{COMPANY.legalName}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold text-white/50 uppercase block">Forme juridique (Legal Form) :</span>
              <p className="text-sm font-bold text-[#95d600]">{COMPANY.legalForm} <span className="text-white/60 font-normal">({COMPANY.legalFormEn})</span></p>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold text-white/50 uppercase block">Titulaire &amp; Propriétaire (Business Owner) :</span>
              <p className="text-sm font-black text-white">{COMPANY.ownerFullName}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold text-white/50 uppercase block">Numéro d&apos;identification des entreprises (IDE / UID) :</span>
              <p className="text-sm font-mono font-bold text-white">{COMPANY.uid}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold text-white/50 uppercase block">Registre du Commerce :</span>
              <p className="text-sm font-bold text-white">{COMPANY.rcRegistry}</p>
              <p className="text-[11px] text-white/50 font-mono">N° fédéral : {COMPANY.rcNumber}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold text-white/50 uppercase block">Numéro de TVA suisse :</span>
              <p className="text-sm font-mono font-bold text-white">{COMPANY.tvaNumber}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1 sm:col-span-2">
              <span className="text-[11px] font-bold text-white/50 uppercase block">Siège social &amp; Magasin physique à Genève (Full Business Address) :</span>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F80404] shrink-0" />
                <span>{COMPANY.address.full}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Section 1bis: Conformité TWINT & Expédition en Suisse */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <Scale className="w-5 h-5 text-[#95d600]" />
            <h2>Conformité TWINT &amp; Expédition en Suisse</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <span className="text-[11px] font-bold text-[#95d600] uppercase block">Paiements TWINT en Francs Suisses (CHF) :</span>
              <p className="text-xs text-white/80 leading-relaxed">
                Le moyen de paiement mobile suisse <strong>TWINT</strong> est pleinement intégré pour tous nos clients via la passerelle certifiée Stripe. Tous les prix sur nutrifitness.ch sont affichés et facturés en <strong>Francs Suisses (CHF)</strong> toutes taxes comprises (TTC / TVA suisse incluse).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <span className="text-[11px] font-bold text-[#F80404] uppercase block">Livraison Directe en Suisse :</span>
              <p className="text-xs text-white/80 leading-relaxed">
                La <strong>Suisse</strong> est notre destination de livraison principale. L&apos;ensemble des marchandises physiques est dédouané, stocké en Suisse et expédié sous 24h par <strong>PostPac Priority</strong> (La Poste Suisse) avec suivi ou disponible en retrait <strong>Click &amp; Collect</strong> à notre magasin de Genève ({COMPANY.address.street}).
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Contact */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <Phone className="w-5 h-5 text-[#F80404]" />
            <h2>2. Coordonnées & Contact</h2>
          </div>
          <p>
            Pour toute demande d&apos;information, question relative à une commande, conseil technique ou réclamation, vous pouvez joindre notre service client :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a 
              href="tel:+41792503564"
              className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-[#F80404]/50 transition-colors flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F80404]/10 text-[#F80404] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-white/50 font-bold uppercase block">Téléphone direct</span>
                <span className="text-sm font-black text-white group-hover:text-[#F80404] transition-colors">+41 79 250 35 64</span>
              </div>
            </a>

            <a 
              href="mailto:info@nutrifitness.ch"
              className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-[#F80404]/50 transition-colors flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#95d600]/10 text-[#95d600] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-white/50 font-bold uppercase block">Courrier électronique</span>
                <span className="text-sm font-black text-white group-hover:text-[#95d600] transition-colors">info@nutrifitness.ch</span>
              </div>
            </a>
          </div>
          <p className="text-xs text-white/50">
            Horaires d&apos;accueil téléphonique et boutique : Lundi – Vendredi : 12h30 – 19h00 | Samedi : 12h00 – 17h00.
          </p>
        </section>

        {/* Section 3: Hébergement */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <Server className="w-5 h-5 text-[#F80404]" />
            <h2>3. Hébergement du Site Internet</h2>
          </div>
          <p>
            Le site internet nutrifitness.ch est hébergé conformément aux normes de sécurité informatique par :
          </p>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
            <p className="font-bold text-white">Hostinger International Ltd.</p>
            <p className="text-xs text-white/60">Adresse : 61 Lordou Vironos Street, 6023 Larnaca, Chypre</p>
            <p className="text-xs text-white/60">Site web : <a href="https://www.hostinger.fr" target="_blank" rel="noopener noreferrer" className="text-[#F80404] hover:underline">www.hostinger.fr</a></p>
          </div>
        </section>

        {/* Section 4: Cadre Réglementaire & Sécurité Alimentaire */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <ShieldCheck className="w-5 h-5 text-[#95d600]" />
            <h2>4. Réglementation Suisse & Sécurité des Aliments</h2>
          </div>
          <p>
            NutriFitness s&apos;engage à respecter scrupuleusement l&apos;ensemble des dispositions légales fédérales suisses applicables aux denrées alimentaires et aux compléments alimentaires pour sportifs, notamment :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-white/70">
            <li>La <strong>Loi fédérale sur les denrées alimentaires et les objets usuels (LDAp)</strong>.</li>
            <li>L&apos;<strong>Ordonnance du DFI sur les compléments alimentaires (OCAl)</strong>.</li>
            <li>Les exigences de l&apos;<strong>Office fédéral de la sécurité alimentaire et des affaires vétérinaires (OSAV)</strong>.</li>
          </ul>
          <p className="text-xs text-white/60 pt-1">
            Tous nos compléments alimentaires sont légalement autorisés à la vente sur le territoire helvétique, stockés dans notre entrepôt et magasin de Genève, et taxés au taux de TVA suisse réduit de 2.6% applicable aux denrées alimentaires.
          </p>
        </section>

        {/* Section 5: Propriété intellectuelle */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-3">
          <h2 className="text-white font-heading font-black text-lg uppercase">5. Propriété Intellectuelle</h2>
          <p>
            L&apos;ensemble des éléments composant le site nutrifitness.ch (textes, visuels, photographies, logos, charte graphique, bases de données, comparatifs et guides rédactionnels) sont protégés par les lois suisses et internationales relatives à la propriété intellectuelle.
          </p>
          <p className="text-xs text-white/60">
            Toute reproduction, représentation, diffusion ou exploitation totale ou partielle du contenu sans l&apos;accord écrit préalable de NutriFit est formellement interdite et constitue une contrefaçon susceptible d&apos;engager la responsabilité civile et pénale de son auteur.
          </p>
        </section>

        {/* Section 6: Droit applicable & For juridique */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-3">
          <h2 className="text-white font-heading font-black text-lg uppercase">6. Droit Applicable & For Juridique</h2>
          <p>
            Le présent site et ses mentions légales sont soumis exclusivement au <strong>droit matériel suisse</strong>.
          </p>
          <p className="text-xs text-white/60">
            En cas de litige relatif à l&apos;utilisation du site ou à son contenu, et à défaut de résolution amiable, les tribunaux ordinaires du <strong>Canton de Genève (Suisse)</strong> sont exclusivement compétents.
          </p>
        </section>

      </div>

      {/* Back button */}
      <div className="mt-12 pt-6 border-t border-white/10 flex justify-between items-center">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>
        <Link 
          href="/cgv/"
          className="text-xs font-bold text-[#F80404] hover:underline"
        >
          Consulter les CGV →
        </Link>
      </div>

    </div>
  );
}
