'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const homeFaqs = [
    {
      q: 'Où acheter des compléments alimentaires de sport à Genève ?',
      a: 'Nutrifitness est une boutique de nutrition sportive située au 34 Rue des Pâquis, 1201 Genève, à 5 minutes de la Gare Cornavin. Vous y trouvez un stock complet de protéines whey, créatines pures, acides aminés BCAA, vitamines, minéraux et accessoires, avec des conseils personnalisés sur place par Marco Scarpantoni et notre équipe. Nous disposons également d\'une boutique en ligne avec livraison dans toute la Suisse.'
    },
    {
      q: 'Nutrifitness livre-t-il dans toute la Suisse ?',
      a: 'Oui, notre boutique en ligne expédie dans l\'ensemble des cantons suisses et au Liechtenstein via La Poste Suisse (service PostPac Priority en 24h ouvrées). La livraison est 100 % gratuite dès CHF 75.– d\'achats (forfait de CHF 7.90 en dessous). Zéro frais de douane ni taxe cachée.'
    },
    {
      q: 'Quels types de produits trouve-t-on chez Nutrifitness ?',
      a: 'Notre catalogue réunit des protéines (whey concentrée, isolat CFM, caséine et protéines végétales bio), des gainers pour la prise de masse, de la créatine monohydrate (label Creapure®), des acides aminés essentiels (BCAA et EAA), des pré-workouts énergisants, des brûleurs de graisses, des vitamines & minéraux, des snacks protéinés et des accessoires sportifs.'
    },
    {
      q: 'Comment choisir son premier complément alimentaire ?',
      a: 'Commencez toujours par une alimentation solide équilibrée, un bon sommeil et un entraînement régulier. Choisissez ensuite un seul produit pour un besoin précis : un isolat de whey si vous manquez d\'apport protéique journalier, ou de la créatine monohydrate pour les sports de force et les efforts explosifs. Notre équipe vous conseille volontiers en boutique.'
    },
    {
      q: 'Quelles marques de nutrition sportive proposez-vous ?',
      a: 'Nous distribuons officiellement les marques de renommée internationale et européenne les plus fiables : Optimum Nutrition, Applied Nutrition, Dymatize, Marvelous, Ghost Lifestyle, Bigman Nutrition et Pronutrition, ainsi que notre marque propre d\'accessoires NutriFit.'
    },
    {
      q: 'Puis-je retirer ma commande gratuitement en boutique à Genève (Click & Collect) ?',
      a: 'Oui, absolument. Lors de votre commande en ligne, choisissez simplement l\'option « Retrait Boutique Genève ». Votre commande est préparée sous 2 heures ouvrées et vous êtes prévenu dès qu\'elle est prête. Vous n\'avez qu\'à vous présenter au 34 Rue des Pâquis avec votre numéro de commande.'
    },
    {
      q: 'Les compléments alimentaires remplacent-ils une alimentation équilibrée ?',
      a: 'Non. Conformément à la législation suisse de l\'OSAV, les compléments alimentaires s\'ajoutent à une alimentation variée et équilibrée et à un mode de vie sain, ils ne s\'y substituent pas. Respectez toujours les doses recommandées sur l\'étiquette.'
    },
    {
      q: 'Comment contacter l\'équipe Nutrifitness ?',
      a: 'Vous pouvez nous joindre par téléphone au +41 79 250 35 64, par e-mail à info@nutrifitness.ch ou directement en boutique à Genève (34 Rue des Pâquis). Nous vous accueillons du Lundi au Vendredi de 12h30 à 19h00 et le Samedi de 12h00 à 17h00.'
    }
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': homeFaqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }))
  };

  return (
    <section className="mb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ NutriFitness
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
            Questions Fréquentes
          </h2>
        </div>
        <Link href="/faq/" className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider flex items-center gap-1 group">
          <span>Centre d&apos;aide complet</span>
          <span className="text-[#F80404] group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      <div className="space-y-3">
        {homeFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen ? 'bg-[#141414] border-[#F80404]/40 shadow-lg' : 'bg-[#141414]/70 border-white/10 hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className={`w-7 h-7 rounded-full border border-white/10 flex items-center justify-center shrink-0 transition-colors ${
                  isOpen ? 'bg-[#F80404] text-black' : 'bg-white/5 text-white/70'
                }`}>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-white/70 leading-relaxed border-t border-white/5 pt-3">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
