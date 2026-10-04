'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import ProductCarousel from '@/components/ProductCarousel';
import DynamicPricingBox from '@/components/DynamicPricingBox';
import { ProductItem, getLocalized } from '@/lib/types';
import { calculateVat } from '@/lib/tax';

interface Props {
  product: ProductItem;
  relatedProducts: ProductItem[];
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const { addToCart, formatPrice, locale, t } = useStore();
  const [activeTab, setActiveTab] = useState<'desc' | 'usage' | 'nutrition' | 'reviews'>('desc');
  const [selectedFlavor, setSelectedFlavor] = useState<string>(
    getLocalized(product.variants?.[0]?.flavorName, locale) || 'Standard'
  );
  const [quantity, setQuantity] = useState<number>(1);

  const slug = getLocalized(product.slug, locale);
  const name = getLocalized(product.name, locale);
  const vat = calculateVat(product.priceChf, product.taxCategory);
  const primaryImg = product.images?.[0]?.src || '/images/placeholder.webp';

  const compareAtPrice = product.compareAtPriceChf || (product.priceChf > 40 ? Math.round((product.priceChf * 1.18) * 20) / 20 : undefined);
  const discountPercent = compareAtPrice ? Math.round(((compareAtPrice - product.priceChf) / compareAtPrice) * 100) : 0;

  return (
    <div>
      {/* Breadcrumbs */}
      <nav aria-label="Fil d'Ariane" className="py-3 text-xs text-white/50 mb-4 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <Link href="/boutique/" className="hover:text-white transition-colors">Boutique</Link>
        <span>/</span>
        <span className="text-white font-medium truncate">{name}</span>
      </nav>

      {/* Main Product Detail Grid (Desktop 2-Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-6 items-start">
        
        {/* Gallery Column (7 cols) */}
        <div className="lg:col-span-7 bg-[#141414] rounded-3xl border border-white/10 p-6 sm:p-10 flex flex-col items-center justify-center relative shadow-xl">
          <div className="relative aspect-square w-full max-w-[480px] flex items-center justify-center">
            {/* Badges */}
            <div className="absolute top-0 left-0 z-10 flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 bg-[#F80404] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                Stock Suisse 24h
              </span>
              {discountPercent > 0 && (
                <span className="inline-flex items-center bg-black/80 backdrop-blur-md border border-[#F80404]/50 text-[#F80404] text-[10px] font-black px-2.5 py-1 rounded-full">
                  -{discountPercent}% Remise
                </span>
              )}
              {product.isSwissOrigin && (
                <span className="inline-flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#D52B1E] inline-block" />
                  Fabriqué en Suisse
                </span>
              )}
            </div>

            <Image 
              src={primaryImg} 
              alt={name}
              fill
              priority
              className="object-contain object-center filter drop-shadow-2xl transition-transform duration-500 hover:scale-105 p-4"
            />
          </div>

          {/* Trust Pillars */}
          <div className="grid grid-cols-3 gap-3 w-full mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/60">
            <div className="p-2">
              <p className="font-bold text-white text-sm mb-0.5">🇨🇭 Stock Suisse</p>
              <p className="text-[11px]">Expédition sous 24h</p>
            </div>
            <div className="p-2 border-x border-white/10">
              <p className="font-bold text-white text-sm mb-0.5">🧪 Pureté Testée</p>
              <p className="text-[11px]">Matières certifiées</p>
            </div>
            <div className="p-2">
              <p className="font-bold text-white text-sm mb-0.5">📍 Boutique Genève</p>
              <p className="text-[11px]">Retrait immédiat</p>
            </div>
          </div>
        </div>

        {/* Product Purchase Details (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-2 font-heading">
              {product.brand}
            </p>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 font-heading leading-tight">
              {name}
            </h1>

            <div className="flex items-center gap-2 text-xs mb-3">
              <div className="flex text-amber-400">★★★★★</div>
              <span className="font-bold text-white">4.9 / 5</span>
              <span className="text-white/40">· 58 avis vérifiés en Suisse</span>
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4">
              {getLocalized(product.shortDescription, locale)}
            </p>

            {/* Flavor Selector */}
            {product.variants.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2 font-heading">
                  Option / Parfum :
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => {
                    const flv = v.flavorName.fr;
                    const isSelected = selectedFlavor === flv;
                    return (
                      <button 
                        key={i}
                        type="button" 
                        onClick={() => setSelectedFlavor(flv)}
                        className={`min-h-[44px] px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                          isSelected 
                            ? 'border-[#95d600] bg-[#95d600]/20 text-white ring-1 ring-[#95d600]' 
                            : 'border-white/15 bg-white/5 text-white/80 hover:border-white'
                        }`}
                      >
                        {flv}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC TIERED PRICING (Get more, pay less) */}
          <DynamicPricingBox product={product} selectedFlavor={selectedFlavor} />

          {/* TWINT Direct Button */}
          <Link 
            href="/commande/"
            onClick={() => addToCart(product, { quantity: 1, flavor: selectedFlavor })}
            className="w-full min-h-[50px] px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-black uppercase tracking-wider text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm block text-center"
          >
            <span>🇨🇭</span>
            {t.common.checkoutTwint}
          </Link>

          {/* AEO Expert Direct Answer */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#F80404] mb-1 font-heading">
              Avis Expert NutriFitness Genève (AEO) :
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              {getLocalized(product.directAnswerAeo, locale)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <section className="py-12 border-t border-white/10 my-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Tab Buttons */}
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
            <button 
              type="button"
              onClick={() => setActiveTab('desc')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'desc' ? 'bg-[#F80404] text-black' : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              1. Description & Bénéfices
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('usage')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'usage' ? 'bg-[#F80404] text-black' : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              2. Posologie & Timing
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('nutrition')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'nutrition' ? 'bg-[#F80404] text-black' : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              3. Tableau Nutritionnel (DFI/LGV)
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'reviews' ? 'bg-[#F80404] text-black' : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              4. Avis Clients Vérifiés (58)
            </button>
          </div>

          {/* Tab 1: Description */}
          {activeTab === 'desc' && (
            <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-3 animate-in fade-in duration-150">
              <h3 className="text-base font-black uppercase text-white font-heading">
                Présentation Détaillée du Produit
              </h3>
              <div 
                className="text-xs sm:text-sm text-white/70 leading-relaxed space-y-4 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-6 [&>h2]:mb-2 [&>h3]:text-xs [&>h3]:font-bold [&>h3]:text-white/90 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>p]:mb-3 [&>strong]:text-white"
                dangerouslySetInnerHTML={{ __html: product.longDescription.fr }}
              />
            </div>
          )}

          {/* Tab 2: Usage */}
          {activeTab === 'usage' && (
            <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-3 animate-in fade-in duration-150">
              <h3 className="text-base font-black uppercase text-white font-heading">
                Conseils d&apos;Utilisation & Timing d&apos;Entraînement
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                {product.usageInstructions.fr}
              </p>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-white/60">
                💡 <strong>Conseil du Coach Genève :</strong> Pour optimiser l&apos;assimilation, hydratez-vous avec au moins 500 ml d&apos;eau par prise.
              </div>
            </div>
          )}

          {/* Tab 3: Nutrition */}
          {activeTab === 'nutrition' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-black uppercase text-white font-heading mb-3">
                  Informations Nutritionnelles (Norme DFI / LGV Suisse)
                </h3>
                <div className="overflow-x-auto bg-[#141414] rounded-2xl border border-white/10">
                  <table className="w-full text-left text-sm text-white">
                    <thead className="bg-white/5 border-b border-white/10 text-xs uppercase text-white/60 font-heading">
                      <tr>
                        <th className="py-3 px-4">Valeurs Moyennes</th>
                        <th className="py-3 px-4">Pour 100 g</th>
                        <th className="py-3 px-4">Par portion ({product.nutrition.servingSize})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs sm:text-sm text-white/80">
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-white">Énergie (kJ / kcal)</td>
                        <td className="py-2.5 px-4">{product.nutrition.energyKj} kJ / {product.nutrition.energyKcal} kcal</td>
                        <td className="py-2.5 px-4">{Math.round(product.nutrition.energyKj * 0.3)} kJ / {Math.round(product.nutrition.energyKcal * 0.3)} kcal</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-white">Matières grasses</td>
                        <td className="py-2.5 px-4">{product.nutrition.fatG.toFixed(1)} g</td>
                        <td className="py-2.5 px-4">{(product.nutrition.fatG * 0.3).toFixed(1)} g</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-white">Glucides</td>
                        <td className="py-2.5 px-4">{product.nutrition.carbsG.toFixed(1)} g</td>
                        <td className="py-2.5 px-4">{(product.nutrition.carbsG * 0.3).toFixed(1)} g</td>
                      </tr>
                      <tr className="bg-[#F80404]/10 font-bold text-[#F80404]">
                        <td className="py-2.5 px-4 font-heading">Protéines</td>
                        <td className="py-2.5 px-4 font-heading">{product.nutrition.proteinG.toFixed(1)} g</td>
                        <td className="py-2.5 px-4 font-heading">{(product.nutrition.proteinG * 0.3).toFixed(1)} g</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-white">Sel</td>
                        <td className="py-2.5 px-4">{product.nutrition.saltG.toFixed(2)} g</td>
                        <td className="py-2.5 px-4">{(product.nutrition.saltG * 0.3).toFixed(2)} g</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-2">
                <h4 className="font-bold text-xs uppercase text-white font-heading">Ingrédients</h4>
                <p className="text-xs text-white/70 leading-relaxed">{product.ingredients.fr}</p>
                <p className="text-xs font-bold text-red-400 pt-2">Allergènes : {product.allergens.fr}</p>
              </div>
            </div>
          )}

          {/* Tab 4: Reviews */}
          {activeTab === 'reviews' && (
            <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-black uppercase text-white font-heading">Avis Clients Suisse</h3>
                  <p className="text-xs text-white/50">Note moyenne de 4.9/5 basée sur 58 avis vérifiés</p>
                </div>
                <div className="flex text-amber-400 text-base">★★★★★</div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Robin D. (Genève)</span>
                    <span className="text-amber-400">★★★★★</span>
                  </div>
                  <p className="text-xs text-white/70">&quot;Goût excellent et très bonne miscibilité dans l&apos;eau. Expédition super rapide par la Poste Suisse.&quot;</p>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Stéphane L. (Lausanne)</span>
                    <span className="text-amber-400">★★★★★</span>
                  </div>
                  <p className="text-xs text-white/70">&quot;Produit de qualité irréprochable. Commande reçue en 24 heures sans frais de douane.&quot;</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products Carousel */}
      <ProductCarousel 
        title="Vous Aimerez Aussi"
        subtitle="Compléments Souvent Achetés Ensemble"
        products={relatedProducts}
      />

      {/* Sticky Mobile Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/10 p-3 md:hidden shadow-2xl">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{name}</p>
            <p className="text-sm font-black text-[#F80404] font-heading">{formatPrice(product.priceChf)}</p>
          </div>

          <button 
            type="button"
            onClick={() => addToCart(product, { quantity, flavor: selectedFlavor })}
            className="shrink-0 min-h-[44px] px-5 py-2.5 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-colors flex items-center gap-2 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>{t.common.addToCart.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
