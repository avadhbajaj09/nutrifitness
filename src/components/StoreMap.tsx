'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Phone, Clock, Train, Car } from 'lucide-react';

export default function StoreMap() {
  const address = "34 Rue des Pâquis, 1201 Genève, Suisse";
  const googleMapsDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=34+Rue+des+P%C3%A2quis+1201+Gen%C3%A8ve+Switzerland";
  const googleMapsViewUrl = "https://maps.google.com/?q=34+Rue+des+P%C3%A2quis+1201+Gen%C3%A8ve+Switzerland";

  return (
    <div className="mt-8 pt-8 border-t border-white/10">
      {/* Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <span className="text-[10px] font-black uppercase text-[#F80404] tracking-widest block mb-1">
            Localisation & Accès Boutique
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white uppercase font-heading flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#F80404]" />
            Plan d&apos;Accès Showroom NutriFitness Genève
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase text-xs rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Itinéraire Google Maps</span>
          </a>
          <a
            href="tel:+41792503564"
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/15 transition-all flex items-center gap-2"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>+41 79 250 35 64</span>
          </a>
        </div>
      </div>

      {/* Map Container with Overlay Details */}
      <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#141414]">
        {/* Interactive Google Map iframe */}
        <div className="w-full h-[320px] sm:h-[400px] md:h-[440px] relative">
          <iframe
            title="Carte NutriFitness Genève - 34 Rue des Pâquis"
            src="https://maps.google.com/maps?q=34+Rue+des+P%C3%A2quis,+1201+Gen%C3%A8ve,+Switzerland&t=&z=16&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0 filter contrast-[1.05] brightness-95"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Floating Quick Info Bar at Bottom of Map */}
        <div className="bg-[#141414]/95 backdrop-blur-md border-t border-white/10 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Train className="w-4 h-4 text-[#F80404] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Transports Publics</p>
              <p className="text-white/60 text-[11px]">
                À 5 min à pied de la Gare Cornavin. Tram 15 (arrêt Môle ou Butini).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Car className="w-4 h-4 text-[#F80404] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Parking à Proximité</p>
              <p className="text-white/60 text-[11px]">
                Parking Pâquis-Centre (Rue de Zurich) à 150 mètres.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Retrait Click &amp; Collect</p>
              <p className="text-white/60 text-[11px]">
                Commandez en ligne et retirez vos produits gratuitement au magasin dès 2h.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
