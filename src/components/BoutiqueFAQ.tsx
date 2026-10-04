'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function BoutiqueFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const boutiqueFaqs = [
    {
      q: 'Quelle est la différence entre toutes les catégories de la boutique ?',
      a: 'Chaque catégorie répond à un besoin physiologique précis : les protéines (whey, isolat, caséine, végétales) soutiennent la reconstruction musculaire quotidienne ; les gainers apportent un surplus calorique sain pour prendre du poids ; la créatine augmente la force explosive et l\'hydratation cellulaire ; les BCAA/EAA limitent la dégradation musculaire ; les pré-workouts boostent la concentration à l\'entraînement ; et les vitamines/minéraux préservent l\'équilibre immunitaire et articulaire.'
    },
    {
      q: 'Comment comparer deux produits efficacement ?',
      a: 'Analysez trois critères fondamentaux : la quantité réelle de principe actif par portion (ex : 24g de protéine par scoop), le nombre total de portions par pot et le coût de revient par portion journalière. Consultez également l\'aminogramme complet et l\'absence de sucres ajoutés ou de charges inutiles.'
    },
    {
      q: 'Les prix affichés incluent-ils la TVA suisse ?',
      a: 'Oui, tous nos prix sont indiqués en Francs Suisses (CHF) toutes taxes comprises (TTC), avec application stricte du taux réduit de TVA suisse de 2.6 % pour les compléments alimentaires et denrées alimentaires, et 8.1 % pour les accessoires et shakers. Aucun frais de douane supplémentaire n\'est facturé.'
    },
    {
      q: 'Comment savoir si un produit est en stock ?',
      a: 'Tous les produits visibles avec le bouton « Ajouter au panier » sont physiquement disponibles dans notre entrepôt et boutique de Genève. Si un produit est temporairement épuisé, la mention « En rupture » est clairement affichée. Pour réserver un produit en boutique, vous pouvez aussi nous téléphoner au +41 79 250 35 64.'
    },
    {
      q: 'Peut-on filtrer les produits par marque, catégorie ou origine suisse ?',
      a: 'Oui, notre boutique intègre des filtres dynamiques instantanés en colonne latérale et sur mobile. Vous pouvez filtrer par marque (Optimum Nutrition, Applied, Marvelous, etc.), par catégorie spécifique ou afficher uniquement les produits d\'origine suisse certifiés.'
    },
    {
      q: 'Vos compléments conviennent-ils aux végétariens, vegans ou intolérants au lactose ?',
      a: 'Absolument. Nous disposons d\'une gamme complète de protéines végétales bio (riz brun germé, pois, chanvre) 100 % véganes, ainsi que d\'isolats de whey ultra-purs microfiltrés à froid (CFM) dont la teneur en lactose est quasiment nulle (< 0.5 %), parfaitement tolérés par les personnes sensibles.'
    },
    {
      q: 'Puis-je obtenir un conseil d\'expert avant d\'acheter ?',
      a: 'Oui, avec grand plaisir ! Vous pouvez nous rendre visite directement à notre boutique de Genève (34 Rue des Pâquis) pour échanger avec Marco Scarpantoni, ou nous envoyer un message par e-mail ou téléphone. Nous vous orienterons en toute franchise vers le produit le plus adapté à votre budget et à vos objectifs.'
    }
  ];

  return (
    <section className="mt-16 pt-12 border-t border-white/10">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
          FAQ Boutique
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
          Questions Fréquentes sur la Boutique
        </h2>
        <p className="text-xs text-white/60 mt-1">
          Tout pour bien choisir vos compléments alimentaires au meilleur prix en Suisse.
        </p>
      </div>

      <div className="space-y-3 max-w-4xl mx-auto">
        {boutiqueFaqs.map((faq, idx) => {
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
