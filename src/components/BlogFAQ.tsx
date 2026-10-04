'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export default function BlogFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const blogFaqs = [
    {
      q: 'Que trouve-t-on dans le blog Nutrifitness ?',
      a: 'Des guides pratiques et complets sur les compléments alimentaires : créatine, protéines (whey isolate, concentrée, caséine), pré-workout, vitamines et minéraux, ainsi que des conseils d\'alimentation et des recettes riches en protéines. Les articles sont courts, concrets et réactualisés régulièrement selon la science sportive.'
    },
    {
      q: 'Qui écrit les articles et dossiers ?',
      a: 'Les articles et guides sont rédigés et supervisés par Marco Scarpantoni (fondateur de NutriFitness et coach en nutrition sportive fort de plus de 20 ans d\'expérience) ainsi que nos spécialistes en préparation physique à Genève. Chaque dossier mentionne son auteur, sa date de mise à jour et s\'appuie sur la science ISSN. Ces informations ne remplacent pas un avis médical.'
    },
    {
      q: 'Les informations des articles sont-elles sourcées scientifiquement ?',
      a: 'Oui, sans exception. Chaque article s\'appuie sur des publications scientifiques reconnues (méta-analyses indexées PubMed, International Society of Sports Nutrition - ISSN, autorités sanitaires suisses OSAV) répertoriées avec transparence en fin de dossier.'
    },
    {
      q: 'À quelle fréquence publiez-vous de nouveaux articles ?',
      a: 'Nous publions régulièrement de nouveaux guides et passons en revue nos dossiers majeurs (créatine Creapure, whey isolate, caféine, récupération) tous les 2 à 3 mois afin d\'intégrer les dernières découvertes de la recherche et les actualisations légales suisses.'
    },
    {
      q: 'Par quel article commencer quand on débute ?',
      a: 'Si vous faites vos premiers pas en nutrition sportive, débutez par notre guide du débutant : « Premiers compléments alimentaires ». Si votre objectif est le développement musculaire et la récupération, continuez avec notre dossier pratique « Comment choisir sa whey : étiquettes et prix ».'
    },
    {
      q: 'Puis-je poser une question qui n\'est pas encore traitée sur le blog ?',
      a: 'Absolument ! Écrivez-nous via notre formulaire de Contact ou passez directement dans notre boutique à Genève (34 Rue des Pâquis). Vos questions récurrentes servent de base à la création de nos prochains dossiers thématiques.'
    }
  ];

  return (
    <section className="mt-20 pt-12 border-t border-white/10">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
          <BookOpen className="w-3.5 h-3.5 text-[#F80404]" />
          FAQ Blog & Guides
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
          Questions Fréquentes sur Nos Guides & Articles
        </h2>
        <p className="text-xs text-white/60 mt-1">
          Comprendre notre méthodologie éditoriale, nos sources scientifiques et nos conseils en nutrition.
        </p>
      </div>

      <div className="space-y-3 max-w-4xl mx-auto">
        {blogFaqs.map((faq, idx) => {
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
