import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Clock, Phone, ShieldCheck, Zap, Award, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Boutique Nutrition Sportive Genève Pâquis | NutriFitness.ch',
  description: 'Visitez notre boutique physique à Genève au 34 Rue des Pâquis. Conseil expert nutrition sportive, protéines whey, créatines et Click & Collect gratuit en 2h.',
};

export default function BoutiqueGenevePage() {
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    'name': 'NutriFitness Genève — Nutrition Sportive',
    'image': 'https://nutrifitness.ch/images/brand/logo.png',
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
        'opens': '10:00',
        'closes': '19:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Saturday'],
        'opens': '10:00',
        'closes': '18:30'
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
      title: 'Conseils Experts Certifiés',
      desc: 'Nos coachs et spécialistes nutrition vous orientent vers les ratios caloriques et formules adaptés à votre morphologie et objectif.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#F80404]" />,
      title: 'Dégustation d\'Arômes',
      desc: 'Hésitant sur une saveur ? Venez tester nos échantillons de whey isolate et pré-workouts directement au bar de dégustation.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#F80404]" />,
      title: 'Stock 100% Suisse',
      desc: 'Tous nos produits sont en rayon, étiquetés selon les normes DFI/FSVO et disponibles immédiatement sans délai de douane.'
    }
  ];

  const faqs = [
    {
      q: 'Comment fonctionne le Click & Collect à Genève ?',
      a: 'Sélectionnez "Retrait Boutique Genève" à la commande. Dès que votre sac est prêt (généralement en moins de 2 heures ouvrées), vous recevez un SMS/email de confirmation. Présentez simplement votre numéro de commande.'
    },
    {
      q: 'Quels sont les moyens de paiement acceptés en boutique ?',
      a: 'Nous acceptons TWINT, PostFinance Card, Maestro, Mastercard, Visa, Apple Pay, Google Pay ainsi que les espèces en Francs Suisses (CHF).'
    },
    {
      q: 'Comment se rendre à la boutique depuis la gare de Genève ?',
      a: 'La boutique se situe à seulement 5 minutes à pied de la gare Genève-Cornavin via la Rue de Monthoux, ou via le Tram 15 (arrêt Môle).'
    }
  ];

  return (
    <div className="py-6">
      {/* Schema.org injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Fil d'Ariane" className="text-xs text-white/50 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-white font-medium">Boutique Genève</span>
      </nav>

      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-black via-[#141414] to-black border border-white/10 p-8 sm:p-12 mb-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F80404]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F80404]/10 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider rounded-full mb-4">
            <MapPin className="w-3.5 h-3.5" />
            Genève — Rue des Pâquis
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-heading mb-4">
            Votre Boutique de <span className="text-[#F80404]">Nutrition Sportive</span> à Genève
          </h1>
          <p className="text-base text-white/70 leading-relaxed mb-8">
            Située au cœur de Genève à 5 minutes de la Gare Cornavin, notre boutique vous accueille du lundi au samedi. 
            Fondée et dirigée par <strong>Marco Scarpantoni</strong>, découvrez un catalogue complet de protéines, créatines et boosters avec les conseils avisés de spécialistes de terrain.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/boutique/"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              Commander pour retrait 2h
            </Link>
            <a
              href="https://maps.google.com/?q=34+Rue+des+Pâquis+1201+Genève"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-wider text-xs rounded-xl border border-white/10 transition-all"
            >
              <MapPin className="w-4 h-4 text-[#F80404]" />
              Ouvrir dans Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* 2-Column Info & Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Contact & Hours Card */}
        <div className="lg:col-span-6 bg-[#141414] rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-black uppercase text-white font-heading flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#F80404]" />
            Horaires d'ouverture
          </h2>

          <div className="space-y-3 border-y border-white/10 py-4 text-sm">
            <div className="flex justify-between items-center text-white/80">
              <span>Lundi – Vendredi</span>
              <span className="font-bold text-white">10h00 – 19h00 (non-stop)</span>
            </div>
            <div className="flex justify-between items-center text-white/80">
              <span>Samedi</span>
              <span className="font-bold text-white">10h00 – 18h30</span>
            </div>
            <div className="flex justify-between items-center text-white/40">
              <span>Dimanche & Jours fériés</span>
              <span className="italic">Fermé</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-5 h-5 text-[#F80404] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Adresse physique</strong>
                <p className="text-white/70">34 Rue des Pâquis, 1201 Genève, Suisse</p>
                <p className="text-xs text-white/50 mt-1">À 400m de la Gare Cornavin • Tram 15 (Arrêt Môle)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm pt-2">
              <Phone className="w-5 h-5 text-[#F80404] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Téléphone & WhatsApp</strong>
                <p className="text-white/70">+41 79 250 35 64</p>
                <p className="text-xs text-white/50 mt-1">Réponse directe pendant les heures d'ouverture</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Placeholder Card */}
        <div className="lg:col-span-6 bg-[#141414] rounded-2xl border border-white/10 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black uppercase text-white font-heading mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F80404]" />
              Plan d'accès
            </h2>
            <p className="text-sm text-white/70 mb-6">
              Idéalement placé au cœur du quartier des Pâquis, notre showroom dispose de places de stationnement en zone bleue à proximité immédiate ainsi que du Parking Cornavin à 4 minutes à pied.
            </p>
          </div>

          <div className="h-64 bg-[#181818] rounded-xl border border-white/10 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#F80404_1px,transparent_1px)] [background-size:16px_16px]" />
            <MapPin className="w-12 h-12 text-[#F80404] animate-bounce mb-3 relative z-10" />
            <h3 className="font-bold text-white text-base relative z-10">34 Rue des Pâquis, 1201 Genève</h3>
            <p className="text-xs text-white/60 mt-1 mb-4 relative z-10">Coordonnées GPS: 46.2120° N, 6.1480° E</p>
            <a
              href="https://maps.google.com/?q=34+Rue+des+Pâquis+1201+Genève"
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 px-5 py-2.5 bg-[#F80404] text-black text-xs font-black uppercase tracking-wider rounded-lg shadow hover:bg-[#FF3D00] transition-colors"
            >
              Itinéraire Google Maps
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
            <div key={idx} className="bg-[#141414] p-6 rounded-2xl border border-white/10 hover:border-[#F80404]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#F80404]/10 border border-[#F80404]/30 flex items-center justify-center mb-4">
                {s.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
              <p className="text-xs text-white/65 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Geneva FAQ */}
      <div className="max-w-3xl mx-auto mb-12">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white font-heading text-center mb-6">
          Questions Fréquentes — Boutique Genève
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group bg-[#141414] rounded-xl border border-white/10 p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
              <summary className="flex justify-between items-center text-sm font-bold text-white group-open:text-[#F80404] transition-colors">
                <span>{faq.q}</span>
                <span className="text-lg transition-transform group-open:rotate-45">+</span>
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
