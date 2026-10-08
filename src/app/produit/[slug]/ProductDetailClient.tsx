'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import ProductCarousel from '@/components/ProductCarousel';
import DynamicPricingBox from '@/components/DynamicPricingBox';
import { ProductItem, getLocalized } from '@/lib/types';
import { calculateVat } from '@/lib/tax';
import { getProductReviewStats } from '@/lib/reviews';
import { getProductFaqs } from '@/lib/productFaq';
import { DeliveryEstimate } from '@/components/delivery/DeliveryEstimate';
import { isProductDeliverableToCountry } from '@/lib/delivery/defaults';

interface Props {
  product: ProductItem;
  relatedProducts: ProductItem[];
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const { addToCart, formatPrice, locale, countryCode, t } = useStore();
  const [activeTab, setActiveTab] = useState<'desc' | 'usage' | 'nutrition' | 'reviews' | 'faq'>('desc');
  const [selectedFlavor, setSelectedFlavor] = useState<string>(
    getLocalized(product.variants?.[0]?.flavorName, locale) || 'Standard'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const productFaqs = getProductFaqs(product);

  const slug = getLocalized(product.slug, locale);
  const name = getLocalized(product.name, locale);
  const vat = calculateVat(product.priceChf, product.taxCategory);
  const reviewStats = getProductReviewStats(product.id, product.categorySlug, slug);
  const primaryImg = product.images?.[0]?.src || '/images/placeholder.webp';

  const selectedVariant = product.variants?.find(
    v => (v.flavorName && (v.flavorName[locale] === selectedFlavor || v.flavorName.fr === selectedFlavor))
  );
  const activeImg = selectedImage || selectedVariant?.image || primaryImg;
  const currentPrice = selectedVariant?.priceChf || product.priceChf;

  const isCommon = product.locationType === 'COMMON' || product.shippingOrigin === 'common';
  const isSwissDestination = (countryCode || 'CH') === 'CH' || countryCode === 'LI';
  const isPortugal = isCommon ? !isSwissDestination : product.shippingOrigin === 'portugal';
  const isDeliverable = isProductDeliverableToCountry(countryCode || 'CH', product.locationType, product.shippingOrigin);

  const compareAtPrice = product.compareAtPriceChf || (currentPrice > 40 ? Math.round((currentPrice * 1.18) * 20) / 20 : undefined);
  const discountPercent = compareAtPrice ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100) : 0;

  return (
    <div>
      {/* Breadcrumbs */}
      <nav aria-label="Fil d'Ariane" className="py-2.5 text-[11px] sm:text-xs text-white/50 mb-3 flex items-center gap-1.5 overflow-hidden">
        <Link href="/" className="hover:text-white transition-colors shrink-0">Accueil</Link>
        <span className="text-white/30 shrink-0">/</span>
        <Link href="/boutique/" className="hover:text-white transition-colors shrink-0">Boutique</Link>
        <span className="text-white/30 shrink-0">/</span>
        <span className="text-white/90 font-medium truncate">{name}</span>
      </nav>

      {/* Mobile Product Header (Shown on mobile/tablet < lg before image) */}
      <div className="lg:hidden mb-4 space-y-1.5">
        <p className="text-xs font-black uppercase tracking-widest text-[#F80404] font-heading">
          {product.brand}
        </p>
        <h1 className="text-2xl font-black text-white tracking-tight font-heading leading-tight">
          {name}
        </h1>
        <div className="flex items-center gap-2 text-xs pt-0.5">
          <div className="flex text-amber-400">{reviewStats.stars}</div>
          <span className="font-bold text-white">{reviewStats.rating.toFixed(1)} / 5</span>
          <span className="text-white/40">· {reviewStats.count} avis vérifiés en Suisse</span>
        </div>
      </div>

      {/* Main Product Detail Grid (Desktop 2-Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 py-2 sm:py-6 items-start">
        
        {/* Gallery Column (7 cols on lg, 2nd on mobile) */}
        <div className="lg:col-span-7 bg-[#141414] rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-10 flex flex-col items-center justify-center relative shadow-xl">
          <div className="relative aspect-square w-full max-w-[340px] sm:max-w-[480px] flex items-center justify-center">
            {/* Badges (Stock Suisse removed, only discount shown) */}
            {discountPercent > 0 && (
              <div className="absolute top-0 left-0 z-10">
                <span className="inline-flex items-center bg-[#F80404] text-black text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                  -{discountPercent}% Remise
                </span>
              </div>
            )}

            <Image 
              src={activeImg} 
              alt={name}
              fill
              priority
              className="object-contain object-center filter drop-shadow-2xl transition-transform duration-500 hover:scale-105 p-2 sm:p-4"
            />
          </div>

          {/* Thumbnail Gallery if multiple images exist */}
          {product.images && product.images.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-full overflow-x-auto pb-1">
              {product.images.slice(0, 8).map((img, idx) => {
                const isCurrent = (activeImg === img.src);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img.src)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border bg-black/40 p-1 transition-all overflow-hidden ${
                      isCurrent ? 'border-[#95d600] ring-2 ring-[#95d600]' : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={getLocalized(img.alt, locale) || name}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Trust Pillars - Hidden on mobile, shown on desktop below image */}
          <div className="hidden lg:grid grid-cols-3 gap-3 w-full mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/60">
            {isPortugal ? (
              <>
                <div className="p-2">
                  <p className="font-bold text-white text-sm mb-0.5">🇵🇹 Expédié du Portugal</p>
                  <p className="text-[11px]">Usine de fabrication</p>
                </div>
                <div className="p-2 border-x border-white/10">
                  <p className="font-bold text-white text-sm mb-0.5">⚡ 3–5 Jours</p>
                  <p className="text-[11px]">Livraison suivie</p>
                </div>
                <div className="p-2">
                  <p className="font-bold text-white text-sm mb-0.5">🧪 Pureté Testée</p>
                  <p className="text-[11px]">Normes certifiées EU</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2">
                  <p className="font-bold text-white text-sm mb-0.5">Expédition 24h</p>
                  <p className="text-[11px]">La Poste Suisse Priority</p>
                </div>
                <div className="p-2 border-x border-white/10">
                  <p className="font-bold text-white text-sm mb-0.5">🧪 Pureté Testée</p>
                  <p className="text-[11px]">Matières certifiées</p>
                </div>
                <div className="p-2">
                  <p className="font-bold text-white text-sm mb-0.5">📍 Boutique Genève</p>
                  <p className="text-[11px]">Retrait immédiat en 2h</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Product Purchase Details (5 cols on lg, 3rd on mobile) */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {/* Desktop Title Header (Hidden on mobile < lg) */}
          <div className="hidden lg:block">
            <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-2 font-heading">
              {product.brand}
            </p>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 font-heading leading-tight">
              {name}
            </h1>

            <div className="flex items-center gap-2 text-xs mb-3">
              <div className="flex text-amber-400">{reviewStats.stars}</div>
              <span className="font-bold text-white">{reviewStats.rating.toFixed(1)} / 5</span>
              <span className="text-white/40">· {reviewStats.count} avis vérifiés en Suisse</span>
            </div>
          </div>

          {/* Short Description - Right below image on mobile */}
          <div className="bg-white/[0.03] lg:bg-transparent p-3.5 lg:p-0 rounded-2xl border border-white/10 lg:border-0">
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {getLocalized(product.shortDescription, locale)}
            </p>
          </div>

          {/* Dynamic Delivery Date, Live Origin & Stock Pill */}
          <DeliveryEstimate
            productId={product.id}
            variantSku={selectedVariant?.sku}
            shippingOriginHint={product.shippingOrigin}
            mode="detail"
          />


          {/* Flavor / Option Selector */}
          {product.variants.length > 0 && (
            <div>
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
                      onClick={() => {
                        setSelectedFlavor(flv);
                        if (v.image) {
                          setSelectedImage(v.image);
                        }
                      }}
                      className={`min-h-[42px] px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
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

          {/* DYNAMIC TIERED PRICING (Get more, pay less) + Add to Cart */}
          <DynamicPricingBox product={product} selectedFlavor={selectedFlavor} />

          {/* TWINT Direct Button (Only if deliverable) */}
          {isDeliverable && (
            <Link 
              href="/commande/"
              onClick={() => addToCart(product, { quantity: 1, flavor: selectedFlavor, price: currentPrice, image: activeImg })}
              className="w-full min-h-[50px] px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-black uppercase tracking-wider text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm block text-center active:scale-98"
            >
              <span>🇨🇭</span>
              {t.common.checkoutTwint}
            </Link>
          )}

          {/* Mobile Trust Pillars (Below add-to-cart on mobile) */}
          <div className="lg:hidden grid grid-cols-3 gap-2 w-full pt-4 border-t border-white/10 text-center text-xs text-white/60">
            {isPortugal ? (
              <>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <p className="font-bold text-white text-xs mb-0.5">🇵🇹 Portugal</p>
                  <p className="text-[10px]">Usine certifiée</p>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <p className="font-bold text-white text-xs mb-0.5">📦 Suivi GPS</p>
                  <p className="text-[10px]">Livraison suivie</p>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <p className="font-bold text-white text-xs mb-0.5">🧪 Pureté</p>
                  <p className="text-[10px]">Certifiée EU</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <p className="font-bold text-white text-xs mb-0.5">⚡ Express</p>
                  <p className="text-[10px]">Expédition prioritaire</p>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <p className="font-bold text-white text-xs mb-0.5">🧪 Pureté</p>
                  <p className="text-[10px]">Testée certifiée</p>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <p className="font-bold text-white text-xs mb-0.5">📍 Genève</p>
                  <p className="text-[10px]">Click & Collect 2h</p>
                </div>
              </>
            )}
          </div>

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
              4. Avis Clients Vérifiés ({reviewStats.count})
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('faq')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'faq' ? 'bg-[#F80404] text-black' : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              5. Questions Fréquentes ({productFaqs.length})
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
            <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-black uppercase text-white font-heading">Avis Clients Suisse</h3>
                  <p className="text-xs text-white/50">Note moyenne de {reviewStats.rating.toFixed(1)}/5 basée sur {reviewStats.count} avis vérifiés en Suisse</p>
                </div>
                <div className="flex text-amber-400 text-base">{reviewStats.stars}</div>
              </div>

              <div className="space-y-3">
                {reviewStats.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{rev.author} ({rev.location})</span>
                        {rev.verified && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-medium">
                            ✓ Achat vérifié
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/40">{rev.date}</span>
                        <span className="text-amber-400">{'★'.repeat(rev.rating)}</span>
                      </div>
                    </div>
                    {rev.title && (
                      <p className="text-xs font-bold text-white">{rev.title}</p>
                    )}
                    <p className="text-xs text-white/70 leading-relaxed">&quot;{rev.comment}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: FAQ & Conseils */}
          {activeTab === 'faq' && (
            <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-4 animate-in fade-in duration-150">
              <div className="pb-3 border-b border-white/10">
                <h3 className="text-base font-black uppercase text-white font-heading">
                  Questions Fréquentes sur {name}
                </h3>
                <p className="text-xs text-white/50">
                  Réponses directes et conseils pratiques basés sur l&apos;étiquette officielle et notre expertise à Genève.
                </p>
              </div>

              <div className="space-y-3">
                {productFaqs.map((faq, idx) => (
                  <div key={idx} className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span className="text-[#F80404] font-black">Q.</span>
                      {faq.question}
                    </h4>
                    <p className="text-xs text-white/75 leading-relaxed pl-4 border-l-2 border-[#F80404]/40">
                      {faq.answer}
                    </p>
                  </div>
                ))}
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
            <p className="text-sm font-black text-[#F80404] font-heading">{formatPrice(currentPrice)}</p>
          </div>

          <button 
            type="button"
            onClick={() => addToCart(product, { quantity, flavor: selectedFlavor, price: currentPrice, image: activeImg })}
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
