'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { getLocalized } from '@/lib/types';
import DynamicPricingBox from './DynamicPricingBox';

export default function QuickViewModal() {
  const { quickViewProduct, closeQuickView, locale, t } = useStore();
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');

  useEffect(() => {
    if (quickViewProduct) {
      const defaultFlavor = getLocalized(quickViewProduct.variants?.[0]?.flavorName, locale) || 'Standard';
      setSelectedFlavor(defaultFlavor);
    }
  }, [quickViewProduct, locale]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeQuickView();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeQuickView]);

  if (!quickViewProduct) return null;

  const p = quickViewProduct;
  const slug = getLocalized(p.slug, locale);
  const name = getLocalized(p.name, locale);
  const image = p.images?.[0]?.src || '/images/placeholder.webp';
  const flavors = p.variants?.map((v: any) => getLocalized(v.flavorName, locale)).filter(Boolean) || ['Standard'];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] transition-opacity duration-300"
        onClick={closeQuickView}
        aria-hidden="true"
      />

      <div 
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={t.common.quickView}
      >
        <div className="relative w-full max-w-3xl bg-[#141414] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
          
          <button 
            type="button" 
            onClick={closeQuickView}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Image */}
            <div className="relative bg-[#1C1C1C] rounded-2xl p-8 flex items-center justify-center border border-white/10 aspect-square sticky top-0">
              {p.shippingOrigin === 'portugal' ? (
                <span className="absolute top-4 left-4 bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full z-10 flex items-center gap-1 shadow-sm">
                  <span>🇵🇹</span>
                  <span>Portugal (3–5j)</span>
                </span>
              ) : (
                <span className="absolute top-4 left-4 bg-[#F80404] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full z-10">
                  🇨🇭 24h Express
                </span>
              )}
              <div className="relative w-full h-full max-h-[280px]">
                <Image src={image} alt={name} fill className="object-contain filter drop-shadow-2xl" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-1 font-heading">
                {p.brand}
              </p>

              {/* Flavor Selector */}
              {flavors.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-2">
                    Saveur / Flavor :
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {flavors.map((flv: string, idx: number) => (
                      <button 
                        key={idx}
                        type="button" 
                        onClick={() => setSelectedFlavor(flv)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          selectedFlavor === flv
                            ? 'border-[#95d600] bg-[#95d600]/20 text-white' 
                            : 'border-white/20 bg-white/5 text-white/80'
                        }`}
                      >
                        {flv}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DYNAMIC PRICING BOX */}
              <DynamicPricingBox
                product={p}
                selectedFlavor={selectedFlavor}
                onAddToCartSuccess={closeQuickView}
              />

              <div className="pt-2 text-center">
                <Link 
                  href={`/produit/${slug}/`}
                  onClick={closeQuickView}
                  className="text-xs font-bold text-[#95d600] hover:underline"
                >
                  Voir la page produit complète →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
