import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { formatMetaTitle, formatMetaDescription } from '@/lib/seo';
import {
  Zap,
  Clock,
  MapPin,
  CheckCircle2,
  PackageCheck,
  CreditCard,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Navigation,
  Car,
  FileText
} from 'lucide-react';

export const metadata: Metadata = {
  title: formatMetaTitle('Click & Collect Gratuit en 2h à Genève | NutriFitness.ch'),
  description: formatMetaDescription('Commandez en ligne et retirez vos compléments alimentaires en 2h au 34 Rue des Pâquis, 1201 Genève. Retrait 100% gratuit sans minimum d\'achat.'),
  alternates: {
    canonical: 'https://nutrifitness.ch/click-and-collect/',
  },
  openGraph: {
    title: 'Click & Collect Gratuit en 2h à Genève | NutriFitness.ch',
    description: 'Commandez en ligne et retirez vos compléments gratuitement en 2h à Genève. Zéro frais de livraison, préparation rapide.',
    url: 'https://nutrifitness.ch/click-and-collect/',
    siteName: 'NutriFitness.ch',
    locale: 'fr_CH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Click & Collect Gratuit en 2h à Genève | NutriFitness.ch',
    description: 'Retirez vos compléments en 2h au 34 Rue des Pâquis, 1201 Genève. Gratuit sans minimum d\'achat.',
  },
};

export default function ClickAndCollectPage() {
  const steps = [
    {
      num: '1',
      title: 'Commandez sur NutriFitness.ch',
      desc: 'Sélectionnez vos protéines, créatines ou vitamines sur notre boutique en ligne. Lors de la validation de votre panier, choisissez l\'option « Retrait Boutique Genève ».'
    },
    {
      num: '2',
      title: 'Préparation express en 2 heures',
      desc: 'Notre équipe au magasin du 34 Rue des Pâquis rassemble vos produits directement depuis notre stock physique genevois et emballe soigneusement votre colis.'
    },
    {
      num: '3',
      title: 'Notification par e-mail & SMS',
      desc: 'Dès que votre commande est prête, vous recevez un message de confirmation indiquant que votre paquet vous attend au comptoir.'
    },
    {
      num: '4',
      title: 'Retrait sans frais au comptoir',
      desc: 'Passez en boutique aux horaires d\'ouverture avec votre numéro de commande et repartez immédiatement avec vos compléments, sans frais de port ni attente.'
    }
  ];

  const faqs = [
    {
      q: 'Quel est le délai de préparation d\'une commande Click & Collect ?',
      a: 'Toute commande passée pendant les heures d\'ouverture est préparée en moins de 2 heures ouvrées. Si vous commandez en dehors des horaires d\'ouverture, elle sera disponible dès l\'ouverture de la boutique le jour ouvré suivant.'
    },
    {
      q: 'Le retrait en magasin est-il vraiment 100% gratuit ?',
      a: 'Oui, le service de Click & Collect est totalement gratuit, sans aucun frais de préparation et sans aucun montant minimum d\'achat.'
    },
    {
      q: 'Combien de temps ma commande reste-t-elle disponible en magasin ?',
      a: 'Votre commande reste réservée et conservée en toute sécurité dans notre boutique pendant 14 jours ouvrés. Passé ce délai, notre service client vous contacte pour convenir d\'un créneau ou d\'un envoi postal.'
    },
    {
      q: 'Que dois-je apporter pour retirer ma commande ?',
      a: 'Présentez simplement l\'e-mail ou le SMS de confirmation contenant votre numéro de commande (sur votre smartphone ou imprimé) ainsi qu\'une pièce d\'identité valable au même nom.'
    },
    {
      q: 'Une autre personne peut-elle retirer le colis à ma place ?',
      a: 'Oui. La personne doit présenter votre e-mail de confirmation avec le numéro de commande, une procuration sur papier libre ou par message électronique, ainsi qu\'une copie de votre pièce d\'identité.'
    }
  ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://nutrifitness.ch/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Click & Collect',
        item: 'https://nutrifitness.ch/click-and-collect/'
      }
    ]
  };

  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'NutriFitness Genève',
    image: 'https://nutrifitness.ch/images/store/shop-front.jpeg',
    telephone: '+41 79 250 35 64',
    url: 'https://nutrifitness.ch/click-and-collect/',
    priceRange: 'CHF',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rue des Pâquis 34',
      addressLocality: 'Genève',
      postalCode: '1201',
      addressCountry: 'CH'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 46.2120,
      longitude: 6.1480
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '12:30',
        closes: '19:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '12:00',
        closes: '17:00'
      }
    ]
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }))
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <ChevronRight className="w-3 h-3 text-white/30" />
        <span className="text-[#F80404] font-bold">Click & Collect</span>
      </nav>

      {/* Hero Header */}
      <header className="mb-12 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider mb-4 font-heading">
          <Zap className="w-3.5 h-3.5" />
          Retrait Express en Boutique
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          Click & Collect à Genève : <span className="text-[#F80404]">Retrait Gratuit en 2h</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/70 mt-3 leading-relaxed">
          Commandez vos compléments en ligne et retirez-les sans frais dans notre magasin au 34 Rue des Pâquis à Genève. Vos produits sont prêts au comptoir en 2 heures ouvrées.
        </p>
      </header>

      {/* Step by Step Process */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F80404] font-heading block">
            Simple, Rapide et Sans Frais
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
            Comment Fonctionne le Click & Collect ?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st, i) => (
            <div key={i} className="p-6 rounded-3xl bg-[#141414] border border-white/10 flex flex-col justify-between shadow-lg">
              <div>
                <span className="w-9 h-9 rounded-2xl bg-[#F80404] text-black text-sm font-black flex items-center justify-center mb-4 font-heading shadow-md">
                  {st.num}
                </span>
                <h3 className="text-sm font-bold text-white mb-2 font-heading">
                  {st.title}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Advantages Banner */}
      <section className="mb-16 p-8 rounded-3xl bg-gradient-to-r from-black via-[#161616] to-black border border-white/10 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#F80404]/10 border border-[#F80404]/25 flex items-center justify-center shrink-0 text-[#F80404]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Prêt en 2h ouvrées</h3>
              <p className="text-xs text-white/60 mt-1">Vos compléments sont préparés immédiatement depuis notre stock à Genève.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#95d600]/10 border border-[#95d600]/25 flex items-center justify-center shrink-0 text-[#95d600]">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">0 CHF de frais de port</h3>
              <p className="text-xs text-white/60 mt-1">Économisez sur la livraison quel que soit le montant de votre commande.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Conseils d&apos;experts</h3>
              <p className="text-xs text-white/60 mt-1">Échangez directement avec notre équipe d&apos;experts au comptoir lors de votre retrait.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Store Location & Practical Details */}
      <section className="mb-16 p-6 sm:p-10 rounded-3xl bg-[#141414] border border-white/10 shadow-2xl">
        <div className="max-w-3xl mb-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F80404] font-heading block">
            Lieu de Retrait
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
            Où et Quand Retirer Votre Commande ?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Address & Hours */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <MapPin className="w-4 h-4 text-[#F80404]" />
                <span>Adresse de la Boutique</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed pl-6">
                <strong>NutriFitness Genève</strong><br />
                Rue des Pâquis 34<br />
                1201 Genève, Suisse<br />
                <span className="text-white/50">Téléphone : +41 79 250 35 64</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Clock className="w-4 h-4 text-[#F80404]" />
                <span>Horaires d&apos;Ouverture pour Retrait</span>
              </div>
              <ul className="text-xs text-white/80 space-y-1.5 pl-6">
                <li><span className="font-bold text-white">Lundi au Vendredi :</span> 12h30 – 19h00 sans interruption</li>
                <li><span className="font-bold text-white">Samedi :</span> 12h00 – 17h00</li>
                <li className="text-white/50">Dimanche & Jours fériés officiels : Fermé</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-[#F80404]/10 border border-[#F80404]/25 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F80404]">
                <FileText className="w-4 h-4" />
                <span>Ce qu&apos;il faut apporter au comptoir</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                Munissez-vous de votre e-mail ou SMS de confirmation (avec le numéro de commande) ainsi que d&apos;une pièce d&apos;identité valable.
              </p>
            </div>
          </div>

          {/* Access & Transports */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Navigation className="w-4 h-4 text-[#F80404]" />
                <span>Transports Publics (TPG)</span>
              </div>
              <ul className="text-xs text-white/80 space-y-2 pl-6">
                <li>
                  <strong>Tram 15 :</strong> Arrêt <em>Môle</em> (à 2 minutes à pied) ou arrêt <em>Gare Cornavin</em>.
                </li>
                <li>
                  <strong>Bus 1, 8 et 25 :</strong> Arrêt <em>Monthoux</em>.
                </li>
                <li>
                  <strong>À pied depuis la Gare Cornavin :</strong> 400 mètres (5 minutes de marche). Descendez la rue de Monthoux vers le lac, puis prenez à gauche sur la Rue des Pâquis.
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Car className="w-4 h-4 text-[#F80404]" />
                <span>Stationnement & Parking</span>
              </div>
              <ul className="text-xs text-white/80 space-y-2 pl-6">
                <li>
                  <strong>Zone bleue & Horodateurs :</strong> Places disponibles directement dans la Rue des Pâquis et rues adjacentes.
                </li>
                <li>
                  <strong>Parking Cornavin & Parking des Alpes :</strong> Situés à moins de 5 minutes de marche.
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                href="/boutique-geneve/"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#F80404] hover:underline"
              >
                <span>Découvrir la page de notre magasin de Genève</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-14 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ Retrait
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
            Questions Fréquentes sur le Click & Collect
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-[#141414] rounded-2xl border border-white/10 p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer"
            >
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

      {/* Bottom CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] border border-white/10 text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-black uppercase text-white font-heading">
          Prêt à Passer Commande ?
        </h3>
        <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto">
          Parcourez nos protéines whey, créatines et formules de récupération en stock à Genève et retirez votre colis dès aujourd&apos;hui.
        </p>
        <div>
          <Link
            href="/boutique/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#F80404] text-black text-xs font-black uppercase tracking-wider font-heading hover:bg-white transition-all shadow-xl"
          >
            <span>Commander en Ligne & Retirer en 2h</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
