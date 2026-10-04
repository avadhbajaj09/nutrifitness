import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  HelpCircle, 
  ArrowLeft,
  FileText
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Moyens de Paiement Sécurisé Suisse (TWINT, PostFinance) | NutriFitness.ch',
  description: 'Modalités de paiement 100% sécurisé sur NutriFitness.ch : TWINT, PostFinance, cartes bancaires Visa et Mastercard, Apple Pay. Prix en CHF toutes taxes comprises.',
  alternates: {
    canonical: 'https://nutrifitness.ch/paiement/',
  }
};

export default function PaiementPage() {
  const faqs = [
    {
      q: 'Quels moyens de paiement acceptez-vous sur le site ?',
      a: 'Nous acceptons l\'ensemble des solutions de paiement adaptées au marché suisse : TWINT, PostFinance Card et E-Finance, cartes de crédit/débit (Visa, Mastercard, American Express via 3D Secure), ainsi qu\'Apple Pay et Google Pay. Tous les moyens disponibles sont affichés lors de la validation du panier.'
    },
    {
      q: 'Le paiement en ligne est-il 100% sécurisé ?',
      a: 'Oui. Toutes les transactions sont chiffrées selon les normes bancaires SSL/TLS 256 bits les plus rigoureuses et traitées par des prestataires de paiement certifiés PCI-DSS de niveau 1. Nous ne stockons jamais vos coordonnées bancaires ou numéros de carte sur nos serveurs.'
    },
    {
      q: 'Dans quelle devise sont indiqués les prix et la TVA est-elle incluse ?',
      a: 'Tous les prix sont affichés en Francs Suisses (CHF) toutes taxes comprises (TTC). Ils incluent le taux de TVA suisse applicable (2.6 % sur les compléments et denrées alimentaires, 8.1 % sur les accessoires et shakers). Aucun frais caché ni taxe d\'importation n\'est appliqué.'
    },
    {
      q: 'Puis-je payer directement lors du retrait en boutique à Genève ?',
      a: 'Oui. Si vous optez pour le service Click & Collect à notre boutique des Pâquis (34 Rue des Pâquis, 1201 Genève), vous pouvez soit régler en ligne lors de la commande, soit choisir de régler sur place par TWINT, carte bancaire, PostFinance ou espèces en Francs Suisses.'
    },
    {
      q: 'Comment utiliser un code promo ou un bon de réduction ?',
      a: 'Saisissez votre code promo dans le champ prévu à cet effet dans le récapitulatif de votre panier avant de procéder au règlement. La réduction s\'applique immédiatement sur le total de vos articles éligibles. Les codes promo ne sont généralement pas cumulables entre eux.'
    },
    {
      q: 'Vais-je recevoir une confirmation de commande et une facture ?',
      a: 'Oui, un e-mail de confirmation détaillé vous est envoyé automatiquement quelques secondes après la validation de votre paiement. Votre facture officielle téléchargeable au format PDF est accessible à tout moment dans votre espace « Mon Compte ».'
    },
    {
      q: 'Puis-je modifier ou annuler ma commande après paiement ?',
      a: 'Si vous souhaitez modifier une adresse ou annuler un article, contactez-nous immédiatement par téléphone (+41 79 250 35 64) ou par e-mail (support@nutrifitness.ch). Dès lors que le colis n\'a pas encore été scellé et confié à La Poste Suisse, la modification est effectuée sans frais.'
    },
    {
      q: 'Dois-je obligatoirement créer un compte pour commander ?',
      a: 'Non, vous pouvez finaliser votre commande rapidement en mode invité sans mot de passe. Cependant, la création d\'un compte gratuit vous permet de retrouver vos factures en 1 clic, de suivre vos expéditions PostPac en temps réel et de cumuler des points fidélité.'
    }
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }))
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-[#F80404] font-bold">Paiement & Commandes</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#95d600]/15 border border-[#95d600]/30 text-[#95d600] text-xs font-black uppercase tracking-wider mb-3 font-heading">
          <Lock className="w-3.5 h-3.5" />
          Paiement 100% Sécurisé SSL 256 Bits
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          Moyens de <span className="text-[#F80404]">Paiement en Suisse</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-2">
          Réglez vos achats en toute confiance avec les solutions de paiement suisses de référence (TWINT, PostFinance, cartes bancaires et Apple Pay).
        </p>
      </header>

      {/* 4 Swiss Payment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-black text-white font-heading">TWINT 🇨🇭</span>
            <Smartphone className="w-5 h-5 text-[#95d600]" />
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            La solution de paiement mobile n°1 en Suisse. Réglez en quelques secondes en scannant le QR code ou via confirmation sur votre smartphone.
          </p>
          <span className="inline-block text-[10px] font-bold text-[#95d600] uppercase font-heading bg-[#95d600]/10 px-2.5 py-1 rounded-full">
            Instantané & Sans Frais
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-black text-white font-heading">PostFinance E-Finance & Card</span>
            <CreditCard className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Paiement direct sécurisé pour les clients de la poste suisse via PostFinance Card et application mobile PostFinance.
          </p>
          <span className="inline-block text-[10px] font-bold text-amber-400 uppercase font-heading bg-amber-400/10 px-2.5 py-1 rounded-full">
            Standard Suisse
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-black text-white font-heading">Cartes Bancaires (Visa, Mastercard)</span>
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Protection maximale avec le protocole 3D Secure (authentification biométrique auprès de votre banque émettrice).
          </p>
          <span className="inline-block text-[10px] font-bold text-blue-400 uppercase font-heading bg-blue-400/10 px-2.5 py-1 rounded-full">
            Protocole 3D-Secure
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-black text-white font-heading">Apple Pay & Google Pay</span>
            <Smartphone className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Validez votre commande en un seul geste via Touch ID ou Face ID depuis votre iPhone, iPad, Mac ou appareil Android.
          </p>
          <span className="inline-block text-[10px] font-bold text-purple-400 uppercase font-heading bg-purple-400/10 px-2.5 py-1 rounded-full">
            Validation Biométrique 1-Clic
          </span>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="mb-14">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ Paiement
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
            Questions Fréquentes sur le Paiement
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group bg-[#141414] rounded-2xl border border-white/10 p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
              <summary className="flex justify-between items-center text-xs sm:text-sm font-bold text-white group-open:text-[#F80404] transition-colors">
                <span>{faq.q}</span>
                <span className="text-lg transition-transform group-open:rotate-45 shrink-0 ml-3">+</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-white/5 pt-3">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-4 text-xs font-bold">
        <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/livraison/" className="text-white/60 hover:text-white transition-colors">
            Conditions de Livraison
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/cgv/" className="text-[#F80404] hover:underline">
            Conditions Générales de Vente →
          </Link>
        </div>
      </div>

    </div>
  );
}
