import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  UserCheck, 
  Server, 
  Mail, 
  Phone, 
  Building, 
  Scale, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Protection des Données (nDSG Suisse & RGPD) | NutriFitness.ch',
  description: 'Politique de confidentialité et protection des données personnelles conforme à la nouvelle Loi fédérale sur la protection des données (nDSG suisse). Vos droits et sécurités.',
  alternates: {
    canonical: 'https://nutrifitness.ch/protection-donnees/',
  }
};

export default function ProtectionDonneesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-[#F80404] font-bold">Protection des Données (nDSG)</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#95d600]/15 border border-[#95d600]/30 text-[#95d600] text-xs font-black uppercase tracking-wider mb-3 font-heading">
          <ShieldCheck className="w-3.5 h-3.5" />
          Conformité nDSG Suisse (revLPD 2023)
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          Politique de Confidentialité & <span className="text-[#F80404]">Protection des Données</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-2">
          Déclaration relative au traitement des données personnelles pour la boutique en ligne nutrifitness.ch basée à Genève, Suisse.
        </p>
      </header>

      {/* Trust Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#95d600]/10 text-[#95d600] flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-heading">Zéro Revente</h4>
            <p className="text-[11px] text-white/50">Vos données ne sont jamais vendues ni cédées.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F80404]/10 text-[#F80404] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-heading">Chiffrement SSL 256</h4>
            <p className="text-[11px] text-white/50">Transactions et paiements 100 % sécurisés.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-heading">Vos Droits Garantis</h4>
            <p className="text-[11px] text-white/50">Accès, rectification et suppression sur demande.</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8 text-xs sm:text-sm text-white/80 leading-relaxed">
        
        {/* 1. Responsable */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <Building className="w-5 h-5 text-[#F80404]" />
            <h2>1. Responsable du Traitement des Données</h2>
          </div>
          <p>
            Le responsable du traitement des données personnelles collectées lors de votre navigation ou lors de vos achats sur <strong>nutrifitness.ch</strong> au sens de la Loi fédérale sur la protection des données (nDSG) est :
          </p>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1 text-xs">
            <p className="text-white font-bold">NutriFit (NutriFitness)</p>
            <p>Représenté par : <strong>Marco Scarpantoni</strong></p>
            <p>Adresse physique : Rue des Pâquis 34, 1201 Genève, Suisse</p>
            <p>Téléphone : +41 79 250 35 64</p>
            <p>Courrier électronique dédié : <a href="mailto:info@nutrifitness.ch" className="text-[#F80404] hover:underline">info@nutrifitness.ch</a></p>
          </div>
        </section>

        {/* 2. Données collectées */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <Eye className="w-5 h-5 text-[#95d600]" />
            <h2>2. Données Personnelles Collectées</h2>
          </div>
          <p>
            Nous recueillons uniquement les données strictement nécessaires au bon déroulement de votre commande, à la livraison en Suisse et à l&apos;amélioration de nos services :
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-white/70">
            <li>
              <strong>Données d&apos;identification et de contact :</strong> Nom, prénom, adresse e-mail, numéro de téléphone portable (notamment pour les notifications de livraison de La Poste Suisse).
            </li>
            <li>
              <strong>Données de livraison et facturation :</strong> Adresse postale complète en Suisse ou au Liechtenstein, instructions d&apos;acheminement, informations de facturation.
            </li>
            <li>
              <strong>Données de paiement :</strong> Nous n&apos;avons jamais accès à vos numéros complets de carte bancaire. Les paiements par TWINT, PostFinance, Visa, Mastercard ou Apple Pay sont directement délégués à des prestataires de paiement bancaires agréés et certifiés aux normes PCI-DSS les plus strictes.
            </li>
            <li>
              <strong>Données de commande :</strong> Historique de vos achats, compléments commandés, factures générées, avis déposés.
            </li>
            <li>
              <strong>Données techniques de connexion :</strong> Adresse IP (anonymisée), type de navigateur, identifiants de session pour maintenir votre panier d&apos;achat actif.
            </li>
          </ul>
        </section>

        {/* 3. Finalités du traitement */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <Scale className="w-5 h-5 text-[#F80404]" />
            <h2>3. Finalités du Traitement & Bases Légales</h2>
          </div>
          <p>
            Vos données personnelles sont traitées pour des objectifs précis et licites :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#95d600]" />
                Exécution du Contrat
              </span>
              <p className="text-white/60">Gestion et préparation de vos commandes de compléments, envoi par PostPac Priority, facturation légale.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#95d600]" />
                Service Client & Conseils
              </span>
              <p className="text-white/60">Réponses à vos questions par e-mail, téléphone ou via notre assistance personnalisée en boutique.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#95d600]" />
                Obligations Légales Suisses
              </span>
              <p className="text-white/60">Conservation des pièces comptables et justificatifs d&apos;achat pendant 10 ans selon l&apos;art. 958f du Code des Obligations (CO).</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#95d600]" />
                Offres & Nouveautés (Opt-in)
              </span>
              <p className="text-white/60">Envoi de nos guides et promotions exclusives uniquement si vous y avez consenti, désinscription en un clic.</p>
            </div>
          </div>
        </section>

        {/* 4. Partage avec des tiers */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <Server className="w-5 h-5 text-[#95d600]" />
            <h2>4. Partage des Données avec des Partenaires Indispensables</h2>
          </div>
          <p>
            <strong>NutriFitness ne vend ni ne loue jamais vos données personnelles à des tiers.</strong>
          </p>
          <p>
            Certaines informations sont exclusivement communiquées à des sous-traitants techniques rigoureusement encadrés, tenus par contrat de respecter la confidentialité et la réglementation suisse :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-white/70">
            <li><strong>La Poste Suisse (PostPac Priority) :</strong> Transmission de votre nom, adresse de livraison et éventuellement numéro de téléphone afin d&apos;assurer l&apos;acheminement rapide de vos colis.</li>
            <li><strong>Opérateurs de paiement suisses et bancaires :</strong> TWINT, PostFinance, passerelles bancaires sécurisées pour le traitement chiffré des transactions.</li>
            <li><strong>Hébergement web et infrastructure :</strong> Hostinger International Ltd., assurant l&apos;hébergement de nos serveurs sous protocoles de sécurité modernes.</li>
          </ul>
        </section>

        {/* 5. Sécurité des données */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-3">
          <h2 className="text-white font-heading font-black text-lg uppercase">5. Mesures de Sécurité Techniques & Organisationnelles</h2>
          <p>
            Nous mettons en œuvre des mesures techniques appropriées pour prévenir la perte, l&apos;altération ou l&apos;accès non autorisé à vos données : chiffrement SSL/TLS de l&apos;ensemble des flux, pare-feux applicatifs, contrôle des accès et sauvegardes régulières.
          </p>
        </section>

        {/* 6. Vos droits */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <UserCheck className="w-5 h-5 text-[#F80404]" />
            <h2>6. Vos Droits Concernant Vos Données Personnelles</h2>
          </div>
          <p>
            En vertu de la Loi fédérale sur la protection des données (nDSG), vous disposez à tout moment des droits suivants :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="font-bold text-white block">Droit d&apos;accès :</span>
              <span className="text-white/60">Obtenir la confirmation que vos données sont traitées et en recevoir une copie gratuite.</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="font-bold text-white block">Droit de rectification :</span>
              <span className="text-white/60">Demander la correction immédiate de données inexactes ou incomplètes.</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="font-bold text-white block">Droit à l&apos;effacement :</span>
              <span className="text-white/60">Demander la suppression de votre compte et de vos données (sous réserve des délais légaux de conservation comptable).</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="font-bold text-white block">Droit d&apos;opposition :</span>
              <span className="text-white/60">Vous opposer à tout moment à l&apos;utilisation de vos coordonnées à des fins publicitaires.</span>
            </div>
          </div>
          <p className="pt-2">
            Pour exercer l&apos;un de ces droits, il vous suffit de nous adresser un message par e-mail avec un justificatif d&apos;identité à : <a href="mailto:info@nutrifitness.ch" className="text-[#F80404] font-bold hover:underline">info@nutrifitness.ch</a> ou par courrier postal à notre boutique de Genève.
          </p>
        </section>

        {/* 7. Autorité de surveillance en Suisse */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-3">
          <h2 className="text-white font-heading font-black text-lg uppercase">7. Autorité de Surveillance Helvétique</h2>
          <p>
            Si vous estimez que le traitement de vos données enfreint la législation suisse, vous disposez du droit de saisir l&apos;autorité compétente :
          </p>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-white/70 space-y-1">
            <p className="font-bold text-white">Préposé fédéral à la protection des données et à la transparence (PFPDT / EDÖB)</p>
            <p>Feldeggweg 1, CH-3003 Berne, Suisse</p>
            <p>Site web : <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer" className="text-[#F80404] hover:underline">www.edoeb.admin.ch</a></p>
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
          <Link href="/cookies/" className="text-white/60 hover:text-white transition-colors">
            Gestion des Cookies
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/retours/" className="text-[#F80404] hover:underline">
            Politique de Retour & Remboursement →
          </Link>
        </div>
      </div>

    </div>
  );
}
