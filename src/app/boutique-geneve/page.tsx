import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Zap, 
  Award, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight,
  HelpCircle,
  CreditCard,
  RotateCcw,
  Navigation
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Boutique Nutrition Sportive Genève Pâquis | NutriFitness.ch',
  description: 'Visitez notre magasin de compléments alimentaires au 34 Rue des Pâquis, 1201 Genève. Protéines whey, créatine, conseils nutritionnels par Marco Scarpantoni et Click & Collect gratuit en 2h.',
  alternates: {
    canonical: 'https://nutrifitness.ch/boutique-geneve/',
  }
};

export default function BoutiqueGenevePage() {
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    'name': 'NutriFitness Genève — Magasin de Nutrition Sportive',
    'image': 'https://nutrifitness.ch/images/store/shop-front.jpeg',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Rue des Pâquis 34',
      'addressLocality': 'Genève',
      'postalCode': '1201',
      'addressCountry': 'CH'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 46.2120,
      'longitude': 6.1480
    },
    'telephone': '+41 79 250 35 64',
    'founder': {
      '@type': 'Person',
      'name': 'Marco Scarpantoni'
    },
    'priceRange': 'CHF',
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        'opens': '12:30',
        'closes': '19:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Saturday'],
        'opens': '12:00',
        'closes': '17:00'
      }
    ]
  };

  const services = [
    {
      icon: <Zap className="w-6 h-6 text-[#F80404]" />,
      title: 'Click & Collect 2h',
      desc: 'Commandez en ligne sur NutriFitness.ch et retirez vos compléments gratuitement 2h après en boutique sans minimum d\'achat.'
    },
    {
      icon: <Award className="w-6 h-6 text-[#F80404]" />,
      title: 'Conseils Experts Personnalisés',
      desc: 'Marco Scarpantoni et son équipe vous orientent vers les ratios caloriques et formules adaptés à votre morphologie et vos objectifs réels.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#F80404]" />,
      title: 'Dégustation & Découverte',
      desc: 'Hésitant sur un arôme ? Venez découvrir nos échantillons de whey isolate et pré-workouts directement en rayon.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#F80404]" />,
      title: 'Stock 100% Suisse',
      desc: 'Tous nos produits sont en stock physique à Genève, étiquetés selon les ordonnances de l\'OSAV et du DFI, sans délai de douane.'
    }
  ];

  // 10 Detailed Questions from nutrifitness-faq-all-pages-fr.md PAGE 3
  const faqs = [
    {
      q: 'Où se trouve la boutique Nutrifitness à Genève ?',
      a: 'La boutique Nutrifitness est située au 34 Rue des Pâquis, 1201 Genève, dans le quartier vivant des Pâquis, à seulement 400 mètres (5 minutes à pied) de la Gare Centrale de Genève-Cornavin et du lac Léman.'
    },
    {
      q: 'Quels sont les horaires d\'ouverture ?',
      a: 'La boutique est ouverte du Lundi au Vendredi de 12h30 à 19h00 sans interruption, et le Samedi de 12h00 à 17h00. Nous sommes fermés le dimanche et les jours fériés officiels du Canton de Genève.'
    },
    {
      q: 'Comment venir en transports en commun TPG ?',
      a: 'Prenez le Tram 15 (arrêt Môle ou Gare Cornavin) ou les bus TPG 1, 8 et 25 (arrêt Monthoux). Depuis la gare Cornavin, descendez la rue de Monthoux en direction du lac puis tournez à gauche sur la Rue des Pâquis.'
    },
    {
      q: 'Y a-t-il un parking à proximité pour se garer ?',
      a: 'Des places de stationnement en zone bleue et horodateurs sont disponibles dans la Rue des Pâquis et les rues adjacentes. Vous pouvez également vous garer au Parking Cornavin (gare) ou au Parking des Alpes situés à moins de 5 minutes de marche.'
    },
    {
      q: 'Peut-on essayer ou avoir des conseils sur les goûts en boutique ?',
      a: 'Oui, notre équipe vous présente les différents formats et vous conseille précisément sur les arômes les plus appréciés (vanille bourbon, chocolat intense, mangue, baies sauvages) selon vos préférences de texture.'
    },
    {
      q: 'L\'équipe conseille-t-elle sur le choix des compléments ?',
      a: 'Oui, Marco Scarpantoni est sur place pour analyser vos objectifs (prise de muscle, sèche, force ou récupération) et vous orienter vers les compléments utiles avec les dosages adaptés. En cas de traitement médical ou de maladie, nous vous orientons toujours vers votre médecin traitant.'
    },
    {
      q: 'Les prix en boutique sont-ils les mêmes qu\'en ligne ?',
      a: 'Oui, les prix en Francs Suisses (CHF) sont rigoureusement identiques sur notre boutique en ligne et en magasin physique. Vous bénéficiez des mêmes promotions et tarifs avantageux.'
    },
    {
      q: 'Peut-on retirer en boutique une commande passée en ligne (Click & Collect) ?',
      a: 'Oui, tout à fait. Choisissez l\'option « Retrait Boutique Genève » lors de la commande sur nutrifitness.ch. Votre commande est préparée sous 2 heures ouvrées et vous recevez un e-mail ou SMS de confirmation. Présentez simplement votre numéro de commande au comptoir.'
    },
    {
      q: 'Peut-on retourner ou échanger un produit acheté en boutique ?',
      a: 'Vous pouvez échanger ou retourner un produit non ouvert avec son opercule de scellé intact dans un délai de 14 jours, sur présentation du ticket de caisse ou de la preuve d\'achat. Les produits descellés ou consommés ne peuvent être repris pour des raisons sanitaires.'
    },
    {
      q: 'Acceptez-vous les paiements par carte ou TWINT en boutique ?',
      a: 'Oui, nous acceptons TWINT, PostFinance Card, Maestro, Visa, Mastercard, Apple Pay, Google Pay ainsi que le règlement en espèces en Francs Suisses (CHF).'
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
    <div className="py-6">
      {/* Schema.org injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Fil d'Ariane" className="text-xs text-white/50 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-white font-medium">Boutique Genève</span>
      </nav>

      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-black via-[#141414] to-black border border-white/10 p-6 sm:p-12 mb-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F80404]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F80404]/10 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider rounded-full mb-4 font-heading">
            <MapPin className="w-3.5 h-3.5" />
            Genève — Rue des Pâquis 34
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-heading mb-4">
            Votre Boutique de <span className="text-[#F80404]">Nutrition Sportive</span> à Genève
          </h1>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-6">
            Située au cœur de Genève à 5 minutes de la Gare Cornavin, notre boutique vous accueille du lundi au samedi. 
            Fondée et dirigée par <strong>Marco Scarpantoni</strong> depuis 2015, découvrez un catalogue complet de protéines, créatines micronisées, BCAA et vitamines avec les conseils avisés d&apos;un vrai spécialiste de terrain.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/boutique/"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Commander pour retrait 2h</span>
            </Link>
            <a
              href="https://maps.google.com/?q=34+Rue+des+Pâquis+1201+Genève"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-wider text-xs rounded-xl border border-white/10 transition-all"
            >
              <Navigation className="w-4 h-4 text-[#F80404]" />
              <span>Itinéraire Google Maps</span>
            </a>
          </div>
        </div>
      </div>

      {/* Real Photos of Store: Front & Inside */}
      <div className="mb-16">
        <div className="text-center max-w-xl mx-auto mb-8">
          <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-1 font-heading">
            Visite Virtuelle
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
            Notre Showroom à Genève
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Venez nous rencontrer à la Rue des Pâquis 34 et profitez d&apos;un stock complet immédiatement disponible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shop Front Photo */}
          <div className="bg-[#141414] rounded-3xl border border-white/10 overflow-hidden shadow-xl group">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
              <Image
                src="/images/store/shop-front.jpeg"
                alt="Devanture officielle du magasin NutriFitness au 34 Rue des Pâquis à Genève"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full font-heading">
                Façade du Magasin · Genève
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-base font-bold text-white font-heading">Devanture NutriFitness Genève</h3>
              <p className="text-xs text-white/60 mt-1">
                Facilement repérable à la Rue des Pâquis 34, à proximité immédiate de la gare Cornavin et du quai du Mont-Blanc.
              </p>
            </div>
          </div>

          {/* Shop Inside Photo */}
          <div className="bg-[#141414] rounded-3xl border border-white/10 overflow-hidden shadow-xl group">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
              <Image
                src="/images/store/shop-inside.webp"
                alt="Rayons et intérieur du magasin NutriFitness à Genève avec compléments alimentaires"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 text-[#95d600] text-[10px] font-black uppercase px-3 py-1 rounded-full font-heading">
                Stock Physique Immédiat
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-base font-bold text-white font-heading">Rayons & Produits en Démonstration</h3>
              <p className="text-xs text-white/60 mt-1">
                Plus de 100 références de protéines whey CFM, créatines pures, BCAA et vitamines directement en stock.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Info & Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Contact & Hours Card */}
        <div className="lg:col-span-6 bg-[#141414] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-black uppercase text-white font-heading flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#F80404]" />
            Horaires d&apos;ouverture
          </h2>

          <div className="space-y-3 border-y border-white/10 py-4 text-sm">
            <div className="flex justify-between items-center text-white/80">
              <span>Lundi – Vendredi</span>
              <span className="font-bold text-white">12h30 – 19h00</span>
            </div>
            <div className="flex justify-between items-center text-white/80">
              <span>Samedi</span>
              <span className="font-bold text-white">12h00 – 17h00</span>
            </div>
            <div className="flex justify-between items-center text-white/40">
              <span>Dimanche & Jours fériés</span>
              <span className="italic">Fermé</span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-5 h-5 text-[#F80404] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Adresse physique</strong>
                <p className="text-white/70">34 Rue des Pâquis, 1201 Genève, Suisse</p>
                <p className="text-xs text-white/50 mt-0.5">À 400m de la Gare Cornavin · Tram 15 (Arrêt Môle)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <Phone className="w-5 h-5 text-[#95d600] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Téléphone direct</strong>
                <a href="tel:+41792503564" className="text-white/80 hover:text-[#95d600] transition-colors font-bold">
                  +41 79 250 35 64
                </a>
                <p className="text-xs text-white/50 mt-0.5">Conseils & réservation Click & Collect</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Placeholder Card */}
        <div className="lg:col-span-6 bg-[#141414] rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black uppercase text-white font-heading mb-3 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#F80404]" />
              Accès & Stationnement
            </h2>
            <p className="text-xs sm:text-sm text-white/70 mb-6 leading-relaxed">
              Idéalement placé au cœur du quartier des Pâquis, notre boutique dispose de places de stationnement en zone bleue à proximité immédiate ainsi que du Parking Cornavin et du Parking des Alpes à 4 minutes à pied.
            </p>
          </div>

          <div className="h-60 bg-[#181818] rounded-2xl border border-white/10 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#F80404_1px,transparent_1px)] [background-size:16px_16px]" />
            <MapPin className="w-10 h-10 text-[#F80404] mb-2 relative z-10" />
            <h3 className="font-bold text-white text-sm relative z-10">34 Rue des Pâquis, 1201 Genève</h3>
            <p className="text-[11px] text-white/60 mt-1 mb-4 relative z-10">GPS : 46.2120° N, 6.1480° E</p>
            <a
              href="https://maps.google.com/?q=34+Rue+des+Pâquis+1201+Genève"
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 px-5 py-2.5 bg-[#F80404] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow hover:bg-[#FF3D00] transition-colors"
            >
              Ouvrir l&apos;itinéraire Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white font-heading text-center mb-8">
          Pourquoi Venir en Boutique ?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, idx) => (
            <div key={idx} className="bg-[#141414] p-6 rounded-3xl border border-white/10 hover:border-[#F80404]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#F80404]/10 border border-[#F80404]/30 flex items-center justify-center mb-4">
                {s.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2 font-heading">{s.title}</h3>
              <p className="text-xs text-white/65 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 10 Geneva Store FAQs */}
      <div className="max-w-3xl mx-auto mb-14">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ Magasin Genève
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
            Questions Fréquentes — Boutique Genève
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Tout ce qu&apos;il faut savoir pour préparer votre visite ou votre retrait Click & Collect.
          </p>
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
      </div>
    </div>
  );
}
