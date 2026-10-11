import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Phone, Navigation, Car, ExternalLink, ShieldCheck } from 'lucide-react';

interface GenevaStoreBlockProps {
  categoryTopic?: string;
}

export default function GenevaStoreBlock({ categoryTopic }: GenevaStoreBlockProps) {
  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'NutriFitness Genève — Magasin de Nutrition Sportive',
    image: 'https://nutrifitness.ch/images/store/shop-front.jpeg',
    telephone: '+41 79 250 35 64',
    url: 'https://nutrifitness.ch/boutique-geneve/',
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

  return (
    <div className="p-6 sm:p-10 rounded-3xl bg-[#141414] border border-white/10 shadow-2xl space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F80404] font-heading block">
            Magasin Physique à Genève
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-heading">
            Venez Nous Rencontrer au 34 Rue des Pâquis
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#95d600]/10 border border-[#95d600]/25 text-[#95d600] text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Stock 100% Déclaré en Suisse
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Address and Hours */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <MapPin className="w-4 h-4 text-[#F80404]" />
              <span>Adresse & Coordonnées</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed pl-6">
              <strong>NutriFitness Genève</strong><br />
              Rue des Pâquis 34, 1201 Genève, Suisse<br />
              Tél : <a href="tel:+41792503564" className="text-white hover:text-[#F80404] underline">+41 79 250 35 64</a>
            </p>
            <div className="pt-2 pl-6">
              <a
                href="https://maps.google.com/?q=NutriFitness+Geneve+Rue+des+Paquis+34"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F80404] hover:underline"
              >
                <span>Ouvrir sur Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Clock className="w-4 h-4 text-[#F80404]" />
              <span>Horaires de la Boutique</span>
            </div>
            <ul className="text-xs text-white/80 space-y-1.5 pl-6">
              <li><span className="font-bold text-white">Lundi au Vendredi :</span> 12h30 – 19h00 non-stop</li>
              <li><span className="font-bold text-white">Samedi :</span> 12h00 – 17h00</li>
              <li className="text-white/50">Dimanche & Jours fériés : Fermé</li>
            </ul>
          </div>
        </div>

        {/* Transport & Click & Collect Link */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Navigation className="w-4 h-4 text-[#F80404]" />
              <span>Accès Facile (TPG & Gare Cornavin)</span>
            </div>
            <ul className="text-xs text-white/80 space-y-1.5 pl-6">
              <li><strong>Tram 15 :</strong> Arrêt Môle (2 min) ou Gare Cornavin.</li>
              <li><strong>Bus TPG 1, 8, 25 :</strong> Arrêt Monthoux.</li>
              <li><strong>À pied :</strong> 5 minutes de la Gare Centrale de Genève-Cornavin.</li>
              <li><strong>Parking :</strong> Zone bleue Rue des Pâquis, Parking de la Gare Cornavin.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#F80404]/10 border border-[#F80404]/25 space-y-2">
            <h3 className="text-xs font-black uppercase text-[#F80404] tracking-wider font-heading">
              Retrait Gratuit Click & Collect 2h
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Commandez vos compléments en ligne et retirez-les sans frais au magasin 2h après.
            </p>
            <div className="pt-1">
              <Link
                href="/click-and-collect/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#F80404] underline"
              >
                <span>En savoir plus sur le Click & Collect →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
