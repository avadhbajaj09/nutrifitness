import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Truck, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  HelpCircle, 
  Package, 
  CheckCircle2, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Livraison 24h & Expédition Suisse | NutriFitness.ch Genève',
  description: 'Conditions de livraison en Suisse et Liechtenstein par La Poste Suisse (PostPac Priority). Livraison gratuite dès 75 CHF d\'achats, envoi sous 24h ouvrées.',
  alternates: {
    canonical: 'https://nutrifitness.ch/livraison/',
  }
};

export default function LivraisonPage() {
  const faqs = [
    {
      q: 'Dans quels pays livrez-vous ?',
      a: 'Nous livrons dans toute la Suisse et au Liechtenstein. Tous nos colis partent directement de notre entrepôt et magasin physique situé à Genève. La livraison hors de Suisse et du Liechtenstein n\'est pas proposée pour le moment afin de garantir des délais ultra-rapides sans frais de douane.'
    },
    {
      q: 'Combien de temps faut-il pour recevoir ma commande ?',
      a: 'En Suisse, le délai est de 24 heures ouvrables (1 jour ouvré) via le service PostPac Priority de La Poste Suisse. Toute commande validée du lundi au vendredi avant 14h00 est expédiée le jour même pour une livraison à votre porte le lendemain matin.'
    },
    {
      q: 'Quels sont les frais de livraison ?',
      a: 'La livraison est 100 % GRATUITE pour toute commande égale ou supérieure à CHF 75.– d\'achats. Pour les commandes inférieures à ce montant, une participation forfaitaire de CHF 7.90 est appliquée pour l\'envoi prioritaire avec suivi.'
    },
    {
      q: 'Quel transporteur utilisez-vous pour acheminer les colis ?',
      a: 'Nous travaillons exclusivement avec La Poste Suisse (PostPac Priority). Ce partenariat garantit un acheminement fiable, rapide et sécurisé sur l\'ensemble du territoire helvétique.'
    },
    {
      q: 'Comment suivre l\'acheminement de mon colis ?',
      a: 'Dès que votre commande est remise à La Poste Suisse, vous recevez un e-mail de confirmation contenant votre numéro de suivi officiel et un lien direct vers le portail de suivi en ligne de La Poste. Vous pouvez aussi suivre l\'avancement dans votre espace « Mon Compte ».'
    },
    {
      q: 'Puis-je modifier mon adresse de livraison après validation de la commande ?',
      a: 'Contactez-nous le plus rapidement possible par téléphone au +41 79 250 35 64 ou par e-mail à support@nutrifitness.ch en mentionnant votre numéro de commande. Si le colis n\'a pas encore été pris en charge par le coursier, nous corrigerons immédiatement l\'étiquette.'
    },
    {
      q: 'Que se passe-t-il si je suis absent lors de la livraison ?',
      a: 'Le facteur dépose le colis dans votre boîte aux lettres ou boîte à colis si la taille le permet. Si le colis est trop volumineux, il laisse un avis de passage vous permettant de le retirer dans votre bureau de poste de quartier ou de demander une seconde présentation via l\'application La Poste Suisse.'
    },
    {
      q: 'Les produits sont-ils bien protégés pendant le transport ?',
      a: 'Nos colis sont emballés avec un rembourrage renforcé et des cartons haute résistance pour éviter tout choc ou détérioration des pots de protéines et flacons. En cas de dommage constaté à la réception, prenez une photo du colis et contactez-nous sous 14 jours pour un remplacement immédiat sans frais.'
    },
    {
      q: 'Livrez-vous les produits frais (comme le blanc d\'œuf liquide) ?',
      a: 'Les produits frais périssables nécessitant une chaîne du froid continue sont réservés au retrait Click & Collect direct dans notre boutique de Genève (34 Rue des Pâquis) afin d\'en préserver la fraîcheur optimale.'
    },
    {
      q: 'Puis-je retirer ma commande gratuitement en boutique à Genève (Click & Collect) ?',
      a: 'Oui, tout à fait. Choisissez l\'option « Retrait Boutique Genève » lors de votre commande. Votre commande est préparée sous 2 heures ouvrées et vous êtes prévenu par e-mail ou SMS. Vous pouvez ensuite venir la récupérer au 34 Rue des Pâquis, 1201 Genève.'
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
      {/* Schema.org injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-[#F80404] font-bold">Livraison & Expédition</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider mb-3 font-heading">
          <Truck className="w-3.5 h-3.5" />
          La Poste Suisse · PostPac Priority 24h
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          Livraison & <span className="text-[#F80404]">Expédition en Suisse</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-2">
          Tous nos compléments alimentaires sont expédiés depuis notre boutique de Genève avec suivi en temps réel et zéro frais de douane.
        </p>
      </header>

      {/* Delivery Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="p-5 rounded-3xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-[#F80404]/10 text-[#F80404] flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-white/50 uppercase">Délai Rapide</span>
          <h3 className="text-base font-black text-white font-heading mt-0.5">24h Ouvrées</h3>
          <p className="text-xs text-white/60 mt-1">Commandez avant 14h00, recevez le lendemain matin partout en Suisse.</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-[#95d600]/10 text-[#95d600] flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-white/50 uppercase">Frais Offerts</span>
          <h3 className="text-base font-black text-white font-heading mt-0.5">Dès CHF 75.–</h3>
          <p className="text-xs text-white/60 mt-1">Livraison prioritaire gratuite en Suisse dès 75 CHF (sinon CHF 7.90).</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-white/50 uppercase">Click & Collect</span>
          <h3 className="text-base font-black text-white font-heading mt-0.5">Retrait Gratuit 2h</h3>
          <p className="text-xs text-white/60 mt-1">À notre boutique des Pâquis à Genève (34 Rue des Pâquis).</p>
        </div>
      </div>

      {/* Shipping Rates Table */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 mb-10 space-y-4">
        <h2 className="text-lg font-black text-white uppercase font-heading flex items-center gap-2">
          <Package className="w-5 h-5 text-[#F80404]" />
          Grille des Tarifs & Modes de Livraison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-white/10 rounded-2xl overflow-hidden">
            <thead className="bg-black/60 text-white/60 uppercase font-heading text-[10px]">
              <tr>
                <th className="p-3">Mode de Livraison</th>
                <th className="p-3">Délai Estimé</th>
                <th className="p-3">Commande &lt; 75 CHF</th>
                <th className="p-3">Commande ≥ 75 CHF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              <tr className="bg-black/20">
                <td className="p-3 font-bold text-white">PostPac Priority (La Poste Suisse)</td>
                <td className="p-3">24h ouvrées (J+1)</td>
                <td className="p-3">CHF 7.90</td>
                <td className="p-3 font-bold text-[#95d600]">GRATUIT (0.00 CHF)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">Click & Collect Genève (Pâquis)</td>
                <td className="p-3">Prêt en 2 heures</td>
                <td className="p-3 font-bold text-[#95d600]">GRATUIT</td>
                <td className="p-3 font-bold text-[#95d600]">GRATUIT</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-white/50 pt-1">
          * Les commandes passées le vendredi après 14h00 ou le week-end sont expédiées le lundi matin par La Poste Suisse.
        </p>
      </section>

      {/* FAQ Accordion Section */}
      <section className="mb-14">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ Livraison
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
            Questions Fréquentes sur la Livraison
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
          <Link href="/retours/" className="text-white/60 hover:text-white transition-colors">
            Politique de Retour
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/paiement/" className="text-[#F80404] hover:underline">
            Moyens de Paiement (TWINT) →
          </Link>
        </div>
      </div>

    </div>
  );
}
