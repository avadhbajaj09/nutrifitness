'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, CheckCircle2 } from 'lucide-react';
import type { BlogFaq } from '@/lib/blog';

interface BlogFaqAccordionProps {
  faqs: BlogFaq[];
  title?: string;
}

export default function BlogFaqAccordion({ faqs, title = "Questions Fréquentes (FAQ)" }: BlogFaqAccordionProps) {
  // First item open by default
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggle = (index: number) => {
    setOpenIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="my-10 bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-[#F80404]/10 border border-[#F80404]/20 flex items-center justify-center shrink-0">
          <HelpCircle className="w-5 h-5 text-[#F80404]" />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F80404] font-heading">
            Réponses d&apos;Experts NutriFitness
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-heading">
            {title}
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndices.includes(index);
          return (
            <div 
              key={index}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen 
                  ? 'bg-white/5 border-[#F80404]/40 shadow-md' 
                  : 'bg-black/30 border-white/10 hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white group"
              >
                <span className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-black shrink-0 transition-colors ${
                    isOpen ? 'bg-[#F80404] text-black' : 'bg-white/10 text-white/70 group-hover:text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="group-hover:text-[#F80404] transition-colors">
                    {faq.question}
                  </span>
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-white/50 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#F80404]' : ''
                  }`} 
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 text-sm text-white/80 leading-relaxed border-t border-white/5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#95d600] shrink-0 mt-1" />
                    <div>{faq.answer}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
        <span>🇨🇭 Réponses rédigées et validées par nos coachs certifiés à Genève</span>
        <span className="text-[11px] text-white/40">Données conformes OSAV & DFI</span>
      </div>
    </div>
  );
}
