'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import ProductCarousel from '@/components/ProductCarousel';
import DynamicPricingBox from '@/components/DynamicPricingBox';
import { ProductItem, getLocalized } from '@/lib/types';
import { getProductFaqs } from '@/lib/productFaq';
import { DeliveryEstimate } from '@/components/delivery/DeliveryEstimate';
import { isProductDeliverableToCountry } from '@/lib/delivery/defaults';
import { getProductOriginType } from '@/lib/translations';

import { getCategoryBySlug } from '@/lib/categories';
import { getProductGtin } from '@/lib/seo';
import { trackViewItem, trackMetaViewContent } from '@/lib/analytics';
import { getRelevantGuideForProduct } from '@/lib/blog';
import { BookOpen, ArrowRight } from 'lucide-react';
import { sanitizeProductHtml } from '@/lib/formatContent';

interface Props {
  product: ProductItem;
  relatedProducts: ProductItem[];
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const { addToCart, formatPrice, locale, countryCode, currency, t, getProductStock } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState<'desc' | 'usage' | 'nutrition' | 'faq'>('desc');
  const [mobileOpenSection, setMobileOpenSection] = useState<string | null>('desc');
  const [selectedFlavor, setSelectedFlavor] = useState<string>(
    product.variants?.find(v => v.inStock)?.flavorName?.fr ||
    getLocalized(product.variants?.[0]?.flavorName, locale) ||
    'Standard'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const productFaqs = getProductFaqs(product);

  const slug = getLocalized(product.slug, locale);
  const name = getLocalized(product.name, locale);
  const localizedLongDesc = getLocalized(product.longDescription, locale) || product.longDescription?.fr || '';
  const localizedUsage = getLocalized(product.usageInstructions, locale) || product.usageInstructions?.fr || '';
  const localizedIngredients = getLocalized(product.ingredients, locale) || product.ingredients?.fr || '';
  const localizedAllergens = getLocalized(product.allergens, locale) || product.allergens?.fr || '';
  const primaryImg = product.images?.[0]?.src || '/images/placeholder.webp';

  const category = getCategoryBySlug(product.categorySlug);
  const categoryName = category?.name || 'Boutique';
  const categoryHref = category ? `/categorie/${category.slug}/` : '/boutique/';
  const relevantGuide = getRelevantGuideForProduct(product.categorySlug, name);

  const selectedVariant = product.variants?.find(
    v => (v.flavorName && (v.flavorName[locale] === selectedFlavor || v.flavorName.fr === selectedFlavor))
  );
  const currentGtin = getProductGtin(product, selectedVariant);
  const activeImg = selectedImage || selectedVariant?.image || primaryImg;
  const [mainImgSrc, setMainImgSrc] = useState<string>(activeImg);
  useEffect(() => {
    setMainImgSrc(activeImg);
  }, [activeImg]);
  const currentPrice = selectedVariant?.priceChf || product.priceChf;

  const originType = getProductOriginType(product);
  // First client render matches server HTML (CH) to guarantee zero hydration mismatch
  const effectiveCountry = mounted ? (countryCode || 'CH') : 'CH';
  const isCommon = product.locationType === 'COMMON' || product.shippingOrigin === 'common';
  const isSwissDestination = effectiveCountry === 'CH' || effectiveCountry === 'LI';
  const isPortugal = product.locationType === 'PORTUGAL_ONLY' || product.shippingOrigin === 'portugal' || (isCommon && !isSwissDestination);
  const isDeliverable = isProductDeliverableToCountry(effectiveCountry, product.locationType, product.shippingOrigin, product.stockGeneva, product.stockPortugal);

  const compareAtPrice = product.compareAtPriceChf || (currentPrice > 40 ? Math.round((currentPrice * 1.18) * 20) / 20 : undefined);
  const discountPercent = compareAtPrice ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100) : 0;

  useEffect(() => {
    const itemData = {
      item_id: selectedVariant?.sku || product.variants?.[0]?.sku || product.id,
      item_name: name,
      item_brand: product.brand,
      item_category: product.categorySlug,
      price: currentPrice,
      quantity: 1,
    };
    const activeCurr = currency || 'CHF';
    trackViewItem(itemData, activeCurr);
    trackMetaViewContent({ item: itemData, currency: activeCurr });
  }, [product.id, currency, selectedVariant?.sku, currentPrice, name, product.brand, product.categorySlug]);

  return (
    <div>
      {/* Breadcrumbs (Accueil > Catégorie > Produit) */}
      <nav aria-label="Fil d'Ariane" className="py-2.5 text-[11px] sm:text-xs text-white/50 mb-3 flex items-center gap-1.5 overflow-hidden">
        <Link href="/" className="hover:text-white transition-colors shrink-0">Accueil</Link>
        <span className="text-white/30 shrink-0">/</span>
        <Link href={categoryHref} className="hover:text-white transition-colors shrink-0">{categoryName}</Link>
        <span className="text-white/30 shrink-0">/</span>
        <span className="text-white/90 font-medium truncate">{name}</span>
      </nav>

      {/* Product Header (Single responsive H1 for all screen sizes) */}
      <div className="mb-4 lg:mb-6 space-y-1.5">
        <p className="text-xs font-black uppercase tracking-widest text-[#F80404] font-heading">
          {product.brand}
        </p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-heading leading-tight">
          {name}
        </h1>

      </div>

      {/* Main Product Detail Grid (Desktop 2-Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 py-2 sm:py-6 items-start">
        
        {/* Gallery Column (7 cols on lg, 2nd on mobile) */}
        <div className="lg:col-span-7 bg-[#141414] rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-10 flex flex-col items-center justify-center relative shadow-xl">
          {/* Mobile Swipeable Gallery with Dots (sm:hidden) */}
          <div className="sm:hidden w-full flex flex-col items-center">
            <div className="relative aspect-square w-full max-w-[340px] flex items-center justify-center">
              {discountPercent > 0 && (
                <div className="absolute top-0 left-0 z-10">
                  <span className="inline-flex items-center bg-[#F80404] text-black text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                    -{discountPercent}% Remise
                  </span>
                </div>
              )}
              {product.images && product.images.length > 1 ? (
                <div 
                  className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                  onScroll={(e) => {
                    const target = e.currentTarget;
                    const idx = Math.round(target.scrollLeft / target.clientWidth);
                    if (product.images[idx] && product.images[idx].src !== activeImg) {
                      setSelectedImage(product.images[idx].src);
                    }
                  }}
                >
                  {product.images.map((img, idx) => (
                    <div key={idx} className="w-full h-full shrink-0 snap-center relative flex items-center justify-center p-3">
                      <Image 
                        src={img.src || '/images/placeholder.webp'} 
                        alt={getLocalized(img.alt, locale) || name}
                        fill
                        priority={idx === 0}
                        className="object-contain object-center filter drop-shadow-xl"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Image 
                  src={mainImgSrc || '/images/placeholder.webp'} 
                  alt={name}
                  fill
                  priority
                  className="object-contain object-center filter drop-shadow-xl p-2"
                />
              )}
            </div>

            {/* Mobile Dots Indicator */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {product.images.map((img, idx) => {
                  const isCurrent = (activeImg === img.src);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img.src)}
                      aria-label={`Photo ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isCurrent ? 'w-5 bg-[#F80404]' : 'w-1.5 bg-white/20'
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Gallery (hidden sm:flex) */}
          <div className="hidden sm:flex flex-col items-center justify-center w-full">
            <div className="relative aspect-square w-full max-w-[480px] flex items-center justify-center">
              {discountPercent > 0 && (
                <div className="absolute top-0 left-0 z-10 flex flex-col gap-1.5 items-start">
                  <span className="inline-flex items-center bg-[#F80404] text-black text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                    -{discountPercent}% Remise
                  </span>
                </div>
              )}
              <Image 
                src={mainImgSrc || '/images/placeholder.webp'} 
                alt={name}
                fill
                priority
                onError={() => setMainImgSrc('/images/placeholder.webp')}
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
          </div>

          {/* Trust Pillars - Hidden on mobile, shown on desktop below image */}
          <div className="hidden lg:grid grid-cols-3 gap-3 w-full mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/60">
            {isPortugal ? (
              <>
                <div className="p-2">
                  <p className="font-bold text-white text-sm mb-0.5">Direct Fabricant</p>
                  <p className="text-[11px]">Garantie fraîcheur & pureté</p>
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
                  <p className="font-bold text-white text-sm mb-0.5">
                    {locale === 'en' ? 'Priority Dispatch' : locale === 'de' ? 'Priority Versand' : locale === 'it' ? 'Spedizione Priority' : 'Expédition Prioritaire'}
                  </p>
                  <p className="text-[11px]">La Poste Suisse Priority</p>
                </div>
                <div className="p-2 border-x border-white/10">
                  <p className="font-bold text-white text-sm mb-0.5">🧪 Pureté Testée</p>
                  <p className="text-[11px]">Matières certifiées</p>
                </div>
                <div className="p-2">
                  <p className="font-bold text-white text-sm mb-0.5">📍 Boutique Suisse</p>
                  <p className="text-[11px]">Retrait immédiat en 2h</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Product Purchase Details (5 cols on lg, 3rd on mobile) */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {/* Short Description - Right below image on mobile */}
          <div className="bg-white/[0.03] lg:bg-transparent p-3.5 lg:p-0 rounded-2xl border border-white/10 lg:border-0">
            <div
              className="text-xs sm:text-sm text-white/80 leading-relaxed space-y-1.5 [&>p]:mb-1.5 [&>strong]:text-white [&>strong]:font-bold [&>ul]:list-disc [&>ul]:pl-4"
              dangerouslySetInnerHTML={{
                __html: sanitizeProductHtml((() => {
                  let desc = getLocalized(product.shortDescription, locale);
                  if (isPortugal) {
                    desc = desc
                      .replace(/Stock direct 100% en Suisse[^\.]*\./gi, 'Expédié directement depuis notre plateforme logistique au Portugal – livraison suivie en 3 à 5 jours ouvrables.')
                      .replace(/100% Schweizer Lagerware[^\.]*\./gi, 'Direktversand aus unserem Logistikzentrum in Portugal – Sendungsverfolgung in 3–5 Werktagen.')
                      .replace(/Stock 100% svizzero[^\.]*\./gi, 'Spedito directement dal nostro polo logistico in Portogallo – consegna tracciata in 3–5 giorni lavorativi.')
                      .replace(/100% Swiss stock[^\.]*\./gi, 'Dispatched directly from our logistics hub in Portugal – tracked delivery in 3–5 business days.');
                  }
                  return desc;
                })())
              }}
            />
          </div>

          {/* Dynamic Delivery Date, Live Origin & Stock Pill */}
          <DeliveryEstimate
            productId={product.id}
            variantSku={selectedVariant?.sku}
            shippingOriginHint={selectedVariant ? (
              isSwissDestination
                ? ((selectedVariant.stockGeneva ?? 0) > 0 ? 'switzerland' : ((selectedVariant.stockPortugal ?? 0) > 0 ? 'portugal' : product.shippingOrigin))
                : 'portugal'
            ) : product.shippingOrigin}
            mode="detail"
          />


          {/* Flavor / Option Selector */}
          {(product.variants.length > 1 || (product.variants.length === 1 && product.variants[0]?.flavorName?.fr !== 'Standard')) && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2 font-heading">
                {locale === 'de' ? 'Option / Geschmack :' : locale === 'it' ? 'Opzione / Gusto :' : locale === 'en' ? 'Option / Flavor :' : 'Option / Parfum :'}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, i) => {
                  const flv = v.flavorName?.fr || 'Standard';
                  const isSelected = selectedFlavor === flv;
                  const isSwissDest = effectiveCountry === 'CH' || effectiveCountry === 'LI';
                  const vStock = getProductStock(product, flv);

                  const vGen = (vStock && typeof vStock.geneva === 'number')
                    ? vStock.geneva
                    : (typeof v.stockGeneva === 'number' ? v.stockGeneva : 0);
                  const vPt = (vStock && typeof vStock.portugal === 'number')
                    ? vStock.portugal
                    : (typeof v.stockPortugal === 'number' ? v.stockPortugal : 0);

                  const isAvailableInSwiss = vGen > 0;
                  const isAvailableInPt = vPt > 0 && product.shippingOrigin !== 'switzerland' && product.locationType !== 'GENEVA_ONLY';

                  const isOutOfStock = isSwissDest
                    ? (!isAvailableInSwiss && !isAvailableInPt)
                    : !isAvailableInPt;

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
                      className={`min-h-[44px] px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2 ${
                        isSelected 
                          ? 'border-[#95d600] bg-[#95d600]/20 text-white ring-1 ring-[#95d600]' 
                          : 'border-white/15 bg-white/5 text-white/80 hover:border-white'
                      }`}
                    >
                      <span>{flv}</span>
                      {isSwissDest ? (
                        isAvailableInSwiss ? (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                            🇨🇭 Suisse
                          </span>
                        ) : isAvailableInPt ? (
                          <span className="text-[10px] font-semibold text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 whitespace-nowrap">
                            🇵🇹 Hub Europe
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-400 font-normal whitespace-nowrap">
                            {locale === 'de' ? '(Ausverkauft)' : locale === 'it' ? '(Esaurito)' : locale === 'en' ? '(Out of stock)' : '(Épuisé)'}
                          </span>
                        )
                      ) : (
                        isAvailableInPt ? (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                            🇵🇹 En stock
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-400 font-normal whitespace-nowrap">
                            {locale === 'de' ? '(Ausverkauft)' : locale === 'it' ? '(Esaurito)' : locale === 'en' ? '(Out of stock)' : '(Épuisé)'}
                          </span>
                        )
                      )}
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
                  <p className="font-bold text-white text-xs mb-0.5">📍 Suisse</p>
                  <p className="text-[10px]">Click & Collect 2h</p>
                </div>
              </>
            )}
          </div>

          {/* Expert Direct Answer */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#F80404] mb-1 font-heading">
              {locale === 'en'
                ? 'Expert Opinion – NutriFitness Switzerland :'
                : locale === 'de'
                ? 'Expertenmeinung – NutriFitness Schweiz :'
                : locale === 'it'
                ? 'Parere dell\'Esperto – NutriFitness Svizzera :'
                : 'Avis Expert NutriFitness Suisse :'}
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              {getLocalized(product.directAnswerAeo, locale)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <section className="py-8 sm:py-12 border-t border-white/10 my-6 sm:my-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Mobile Collapsible Accordions (lg:hidden) */}
          <div className="lg:hidden space-y-3">
            {/* Accordion 1: Description */}
            <div className="bg-[#141414] rounded-2xl border border-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileOpenSection(mobileOpenSection === 'desc' ? null : 'desc')}
                className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between text-left text-xs font-black uppercase tracking-wider text-white font-heading active:bg-white/5"
              >
                <span>{locale === 'de' ? '1. Beschreibung & Vorteile' : locale === 'it' ? '1. Descrizione & Benefici' : locale === 'en' ? '1. Description & Benefits' : '1. Description & Bénéfices'}</span>
                <span className="text-[#F80404] text-base font-bold ml-2">
                  {mobileOpenSection === 'desc' ? '−' : '+'}
                </span>
              </button>
              {mobileOpenSection === 'desc' && (
                <div className="p-4 pt-1 border-t border-white/5 space-y-3 animate-in fade-in duration-150">
                  <div 
                    className="text-xs text-white/70 leading-relaxed space-y-3 [&>h2]:text-xs [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-4 [&>h2]:mb-1 [&>h3]:text-xs [&>h3]:font-bold [&>h3]:text-white/90 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-1 [&>p]:mb-2 [&>strong]:text-white"
                    dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(localizedLongDesc) }}
                  />
                </div>
              )}
            </div>

            {/* Accordion 2: Usage */}
            <div className="bg-[#141414] rounded-2xl border border-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileOpenSection(mobileOpenSection === 'usage' ? null : 'usage')}
                className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between text-left text-xs font-black uppercase tracking-wider text-white font-heading active:bg-white/5"
              >
                <span>{locale === 'de' ? '2. Dosierung & Timing' : locale === 'it' ? '2. Posologia & Assunzione' : locale === 'en' ? '2. Usage & Timing' : '2. Posologie & Timing'}</span>
                <span className="text-[#F80404] text-base font-bold ml-2">
                  {mobileOpenSection === 'usage' ? '−' : '+'}
                </span>
              </button>
              {mobileOpenSection === 'usage' && (
                <div className="p-4 pt-1 border-t border-white/5 space-y-3 animate-in fade-in duration-150">
                  <div className="text-xs text-white/70 leading-relaxed space-y-2 [&>strong]:text-white" dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(localizedUsage) }} />
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-white/60">
                    💡 <strong>{locale === 'de' ? 'Tipp vom Coach :' : locale === 'it' ? 'Consiglio del Coach :' : locale === 'en' ? 'Coach Tip :' : 'Conseil du Coach :'}</strong> {locale === 'de' ? 'Für eine optimale Aufnahme mit mindestens 500 ml Wasser pro Einnahme trinken.' : locale === 'it' ? 'Per ottimizzare l\'assimilazione, assumere con almeno 500 ml d\'acqua per dose.' : locale === 'en' ? 'To optimize absorption, drink with at least 500 ml of water per serving.' : "Pour optimiser l'assimilation, hydratez-vous avec au moins 500 ml d'eau par prise."}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Nutrition */}
            <div className="bg-[#141414] rounded-2xl border border-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileOpenSection(mobileOpenSection === 'nutrition' ? null : 'nutrition')}
                className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between text-left text-xs font-black uppercase tracking-wider text-white font-heading active:bg-white/5"
              >
                <span>{locale === 'de' ? '3. Nährwerttabelle (EDI/LKV)' : locale === 'it' ? '3. Tabella Nutrizionale (DFI/LGAL)' : locale === 'en' ? '3. Nutrition Facts (Swiss Standard)' : '3. Tableau Nutritionnel (DFI/LGV)'}</span>
                <span className="text-[#F80404] text-base font-bold ml-2">
                  {mobileOpenSection === 'nutrition' ? '−' : '+'}
                </span>
              </button>
              {mobileOpenSection === 'nutrition' && (
                <div className="p-4 pt-1 border-t border-white/5 space-y-4 animate-in fade-in duration-150">
                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
                    <table className="w-full text-left text-xs text-white">
                      <thead className="bg-white/5 border-b border-white/10 text-[10px] uppercase text-white/60 font-heading">
                        <tr>
                          <th className="py-2.5 px-3">Valeurs</th>
                          <th className="py-2.5 px-3">100g</th>
                          <th className="py-2.5 px-3">Portion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs text-white/80">
                        <tr>
                          <td className="py-2 px-3 font-medium text-white">Énergie</td>
                          <td className="py-2 px-3">{product.nutrition.energyKcal} kcal</td>
                          <td className="py-2 px-3">{Math.round(product.nutrition.energyKcal * 0.3)} kcal</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-white">Matières grasses</td>
                          <td className="py-2 px-3">{product.nutrition.fatG.toFixed(1)} g</td>
                          <td className="py-2 px-3">{(product.nutrition.fatG * 0.3).toFixed(1)} g</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-white">Glucides</td>
                          <td className="py-2 px-3">{product.nutrition.carbsG.toFixed(1)} g</td>
                          <td className="py-2 px-3">{(product.nutrition.carbsG * 0.3).toFixed(1)} g</td>
                        </tr>
                        <tr className="bg-[#F80404]/10 font-bold text-[#F80404]">
                          <td className="py-2 px-3 font-heading">Protéines</td>
                          <td className="py-2 px-3 font-heading">{product.nutrition.proteinG.toFixed(1)} g</td>
                          <td className="py-2 px-3 font-heading">{(product.nutrition.proteinG * 0.3).toFixed(1)} g</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-white">Sel</td>
                          <td className="py-2 px-3">{product.nutrition.saltG.toFixed(2)} g</td>
                          <td className="py-2 px-3">{(product.nutrition.saltG * 0.3).toFixed(2)} g</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-1.5 text-xs text-white/70">
                    <div>
                      <strong className="text-white">{locale === 'de' ? 'Inhaltsstoffe : ' : locale === 'it' ? 'Ingredienti : ' : locale === 'en' ? 'Ingredients : ' : 'Ingrédients : '}</strong>
                      <span dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(localizedIngredients).replace(/^<p>|<\/p>$/g, '') }} />
                    </div>
                    {localizedAllergens && (
                      <div className="text-red-400 font-bold">
                        <span>{locale === 'de' ? 'Allergene : ' : locale === 'it' ? 'Allergeni : ' : locale === 'en' ? 'Allergens : ' : 'Allergènes : '}</span>
                        <span dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(localizedAllergens).replace(/^<p>|<\/p>$/g, '') }} />
                      </div>
                    )}
                  </div>

                  {currentGtin && (
                    <div className="p-3 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                      <span className="font-bold text-white/60 uppercase font-heading">GTIN/EAN :</span>
                      <span className="font-mono text-white tracking-wider font-semibold">{currentGtin}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 4: FAQ */}
            <div className="bg-[#141414] rounded-2xl border border-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileOpenSection(mobileOpenSection === 'faq' ? null : 'faq')}
                className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between text-left text-xs font-black uppercase tracking-wider text-white font-heading active:bg-white/5"
              >
                <span>4. Questions Fréquentes ({productFaqs.length})</span>
                <span className="text-[#F80404] text-base font-bold ml-2">
                  {mobileOpenSection === 'faq' ? '−' : '+'}
                </span>
              </button>
              {mobileOpenSection === 'faq' && (
                <div className="p-4 pt-1 border-t border-white/5 space-y-3 animate-in fade-in duration-150">
                  {productFaqs.map((faq, idx) => (
                    <div key={idx} className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="text-[#F80404] font-black">Q.</span>
                        {faq.question}
                      </h4>
                      <p className="text-xs text-white/75 leading-relaxed pl-3 border-l border-[#F80404]/40">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Tabs (hidden on mobile, kept on desktop) */}
          <div className="hidden lg:block space-y-6">
            {/* Tab Buttons */}
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
              <button 
                type="button"
                onClick={() => setActiveTab('desc')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'desc' ? 'bg-[#F80404] text-black' : 'bg-white/5 hover:bg-white/10 text-white/70'
                }`}
              >
                {locale === 'de' ? '1. Beschreibung & Vorteile' : locale === 'it' ? '1. Descrizione & Benefici' : locale === 'en' ? '1. Description & Benefits' : '1. Description & Bénéfices'}
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('usage')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'usage' ? 'bg-[#F80404] text-black' : 'bg-white/5 hover:bg-white/10 text-white/70'
                }`}
              >
                {locale === 'de' ? '2. Dosierung & Timing' : locale === 'it' ? '2. Posologia & Assunzione' : locale === 'en' ? '2. Usage & Timing' : '2. Posologie & Timing'}
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('nutrition')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'nutrition' ? 'bg-[#F80404] text-black' : 'bg-white/5 hover:bg-white/10 text-white/70'
                }`}
              >
                {locale === 'de' ? '3. Nährwerttabelle (EDI/LKV)' : locale === 'it' ? '3. Tabella Nutrizionale (DFI/LGAL)' : locale === 'en' ? '3. Nutrition Facts (Swiss Standard)' : '3. Tableau Nutritionnel (DFI/LGV)'}
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('faq')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'faq' ? 'bg-[#F80404] text-black' : 'bg-white/5 hover:bg-white/10 text-white/70'
                }`}
              >
                {locale === 'de' ? `4. Häufige Fragen (${productFaqs.length})` : locale === 'it' ? `4. Domande Frequenti (${productFaqs.length})` : locale === 'en' ? `4. FAQ (${productFaqs.length})` : `4. Questions Fréquentes (${productFaqs.length})`}
              </button>
            </div>

            {/* Tab 1: Description */}
            {activeTab === 'desc' && (
              <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-3 animate-in fade-in duration-150">
                <h3 className="text-base font-black uppercase text-white font-heading">
                  {locale === 'de' ? 'Detaillierte Produktübersicht' : locale === 'it' ? 'Presentazione Dettagliata del Prodotto' : locale === 'en' ? 'Detailed Product Overview' : 'Présentation Détaillée du Produit'}
                </h3>
                <div 
                  className="text-xs sm:text-sm text-white/70 leading-relaxed space-y-4 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-6 [&>h2]:mb-2 [&>h3]:text-xs [&>h3]:font-bold [&>h3]:text-white/90 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>p]:mb-3 [&>strong]:text-white"
                  dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(localizedLongDesc) }}
                />
              </div>
            )}

            {/* Tab 2: Usage */}
            {activeTab === 'usage' && (
              <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-3 animate-in fade-in duration-150">
                <h3 className="text-base font-black uppercase text-white font-heading">
                  {locale === 'de' ? 'Einnahmeempfehlung & Trainings-Timing' : locale === 'it' ? 'Consigli d\'Uso & Timing di Assunzione' : locale === 'en' ? 'Directions & Workout Timing' : 'Conseils d\'Utilisation & Timing d\'Entraînement'}
                </h3>
                <div className="text-xs sm:text-sm text-white/70 leading-relaxed space-y-2 [&>strong]:text-white" dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(localizedUsage) }} />
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-white/60">
                  💡 <strong>{locale === 'de' ? 'Tipp vom Coach :' : locale === 'it' ? 'Consiglio del Coach :' : locale === 'en' ? 'Coach Tip :' : 'Conseil du Coach :'}</strong> {locale === 'de' ? 'Für eine optimale Aufnahme mit mindestens 500 ml Wasser pro Einnahme trinken.' : locale === 'it' ? 'Per ottimizzare l\'assimilazione, assumere con almeno 500 ml d\'acqua per dose.' : locale === 'en' ? 'To optimize absorption, drink with at least 500 ml of water per serving.' : "Pour optimiser l'assimilation, hydratez-vous avec au moins 500 ml d'eau par prise."}
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
                  <h4 className="font-bold text-xs uppercase text-white font-heading">{locale === 'de' ? 'Inhaltsstoffe' : locale === 'it' ? 'Ingredienti' : locale === 'en' ? 'Ingredients' : 'Ingrédients'}</h4>
                  <div className="text-xs text-white/70 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(localizedIngredients) }} />
                  {localizedAllergens && (
                    <div className="text-xs font-bold text-red-400 pt-2" dangerouslySetInnerHTML={{ __html: (locale === 'de' ? 'Allergene : ' : locale === 'it' ? 'Allergeni : ' : locale === 'en' ? 'Allergens : ' : 'Allergènes : ') + sanitizeProductHtml(localizedAllergens).replace(/^<p>|<\/p>$/g, '') }} />
                  )}
                </div>

                {currentGtin && (
                  <div className="bg-[#141414] rounded-2xl border border-white/10 p-4 flex items-center justify-between text-xs">
                    <span className="font-bold text-white/60 uppercase font-heading">Code GTIN / EAN :</span>
                    <span className="font-mono text-white tracking-wider font-semibold">{currentGtin}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: FAQ & Conseils */}
            {activeTab === 'faq' && (
              <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-4 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-white/10">
                  <h3 className="text-base font-black uppercase text-white font-heading">
                    Questions Fréquentes sur {name}
                  </h3>
                  <p className="text-xs text-white/50">
                    Réponses directes et conseils pratiques basés sur l&apos;étiquette officielle et notre expertise en Suisse.
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
        </div>
      </section>

      {/* Recommended Expert Guide Card (Internal Linking) */}
      {relevantGuide && (
        <section className="my-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#141414] to-[#1a1111] border border-[#F80404]/30 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F80404] font-heading">
                <BookOpen className="w-4 h-4" />
                <span>Guide Scientifique & Conseils de Prise</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white uppercase font-heading leading-tight">
                {relevantGuide.title}
              </h3>
              <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
                {relevantGuide.shortAnswer}
              </p>
              <div className="flex items-center gap-4 text-[11px] text-white/50 pt-1">
                <span>Par {relevantGuide.author}</span>
                <span>•</span>
                <span>{relevantGuide.readingTime} de lecture</span>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                href={`/blog/${relevantGuide.slug}/`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#F80404] text-black font-black uppercase tracking-wider text-xs transition-colors shadow-md"
              >
                <span>Lire le Guide Complet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Related Products Carousel */}
      <ProductCarousel 
        title="Vous Aimerez Aussi"
        subtitle="Compléments Souvent Achetés Ensemble"
        products={relatedProducts}
      />

      {/* Sticky Mobile Add to Cart Bar (Above Bottom Tab Bar) */}
      <div className="fixed bottom-[calc(56px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/10 p-2.5 md:hidden shadow-2xl">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative w-10 h-10 rounded-lg bg-white/5 border border-white/10 shrink-0 overflow-hidden p-1 flex items-center justify-center">
              <Image 
                src={activeImg} 
                alt={name} 
                fill 
                className="object-contain p-0.5" 
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{name}</p>
              <p className="text-sm font-black text-[#F80404] font-heading leading-tight">{formatPrice(currentPrice, product.priceEur)}</p>
            </div>
          </div>

          {!isDeliverable ? (
            <span 
              className="shrink-0 min-h-[44px] px-3 py-2 bg-red-950/40 text-red-300 font-bold uppercase tracking-wider text-[10px] rounded-xl border border-red-800/40 cursor-not-allowed flex items-center justify-center text-center"
            >
              {t.common.notAvailableCountry || (locale === 'en' ? 'Indisponible' : 'Indisponible')}
            </span>
          ) : (
            <button 
              type="button"
              onClick={() => addToCart(product, { quantity, flavor: selectedFlavor, price: currentPrice, image: activeImg })}
              className="shrink-0 min-h-[44px] px-5 py-2.5 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all flex items-center gap-2 active:scale-95 shadow-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Ajouter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
