'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductItem, getLocalized } from '@/lib/types';
import { Check, Sparkles, ShoppingBag, AlertCircle } from 'lucide-react';
import { isProductDeliverableToCountry } from '@/lib/delivery/defaults';

interface DynamicPricingBoxProps {
  product: ProductItem;
  selectedFlavor?: string;
  onAddToCartSuccess?: () => void;
}

export default function DynamicPricingBox({
  product,
  selectedFlavor = 'Standard',
  onAddToCartSuccess,
}: DynamicPricingBoxProps) {
  const { formatPrice, addToCart, locale, countryCode, t } = useStore();
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(1);

  const selectedVariant = product.variants?.find(
    v => (v.flavorName && (v.flavorName[locale] === selectedFlavor || v.flavorName.fr === selectedFlavor))
  );
  const basePrice = selectedVariant?.priceChf || product.priceChf;
  const name = getLocalized(product.name, locale);

  // Generate deterministic Item SKU
  const itemSku = product.variants?.[0]?.sku || 
    product.id.replace(/\D/g, '').padEnd(12, '8') || 
    '634240078392';

  // Calculate Tier Prices (Tier 1: 0%, Tier 2: 5%, Tier 3: 10%)
  const tier1UnitPrice = basePrice;
  const tier2UnitPrice = Math.round(basePrice * 0.95 * 100) / 100;
  const tier3UnitPrice = Math.round(basePrice * 0.90 * 100) / 100;

  // Active unit price based on selected tier
  const activeUnitPrice = selectedTier === 1 
    ? tier1UnitPrice 
    : selectedTier === 2 
    ? tier2UnitPrice 
    : tier3UnitPrice;

  const currentTotal = activeUnitPrice * quantity;
  const regularTotal = basePrice * quantity;
  const currentSavings = Math.max(0, regularTotal - currentTotal);

  // Handle clicking tier buttons
  const handleSelectTier = (tier: 1 | 2 | 3) => {
    setSelectedTier(tier);
    if (tier === 1) {
      setQuantity(1);
    } else if (tier === 2) {
      setQuantity(2);
    } else if (tier === 3) {
      setQuantity(prev => (prev >= 3 ? prev : 3));
    }
  };

  // Handle Stepper
  const handleQuantityChange = (newQty: number) => {
    const qty = Math.max(1, newQty);
    setQuantity(qty);
    if (qty === 1) {
      setSelectedTier(1);
    } else if (qty === 2) {
      setSelectedTier(2);
    } else {
      setSelectedTier(3);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, {
      quantity,
      flavor: selectedFlavor,
      price: activeUnitPrice,
      image: selectedVariant?.image,
    });
    if (onAddToCartSuccess) onAddToCartSuccess();
  };

  // Benefits tailored to product category
  const getProductBenefits = () => {
    const cat = (product.categorySlug || '').toLowerCase();
    const prodName = (product.id || '').toLowerCase();

    if (cat.includes('proteine') || prodName.includes('whey') || prodName.includes('casein') || prodName.includes('isolat')) {
      return [
        'Optimise la synthèse des protéines et la prise de masse sèche',
        'Améliore la récupération musculaire post-entraînement',
        'Absorption ultra-rapide et haute biodisponibilité (CFM)',
        'Riche en BCAA et acides aminés essentiels d\'origine contrôlée',
        'Digestibilité maximale sans inconfort gastrique',
      ];
    }
    if (cat.includes('creatine') || prodName.includes('creatine') || prodName.includes('creapure')) {
      return [
        'Augmente la force musculaire maximale et l\'explosivité',
        'Améliore la puissance anaérobie lors de séries répétées',
        'Accélère la resynthèse cellulaire d\'ATP',
        'Creapure® 100% pure micronisée pour une dissolution parfaite',
        'Zéro rétention d\'eau sous-cutanée indésirable',
      ];
    }
    if (cat.includes('pre-workout') || prodName.includes('pump') || prodName.includes('booster') || prodName.includes('glycerol')) {
      return [
        'Optimise la congestion musculaire et la vasodilatation',
        'Améliore l\'hydratation cellulaire et l\'oxygénation des fibres',
        'Performance maximale dès la première séance',
        'Accélère la récupération entre chaque série',
        'Augmente le focus mental et l\'intensité des entraînements',
      ];
    }
    if (cat.includes('recuperation') || prodName.includes('bcaa') || prodName.includes('glutamine') || prodName.includes('eaa')) {
      return [
        'Préserve la masse musculaire en période de restriction calorique',
        'Réduit les courbatures et la fatigue musculaire persistante',
        'Soutient les défenses immunitaires et le confort digestif',
        'Formule fermentée d\'origine végétale de haute pureté',
        'Dissolution instantanée sans résidu ni amertume',
      ];
    }
    // Default high-performance benefits
    return [
      'Formule hautement concentrée certifiée sans impuretés',
      'Matières premières de grade pharmaceutique testées en Suisse',
      'Efficacité démontrée scientifiquement pour sportifs exigeants',
      product.shippingOrigin === 'portugal'
        ? "Expédié directement depuis l'usine de fabrication au Portugal"
        : 'Traçabilité 100% garantie depuis notre stock en Suisse',
      'Conforme aux normes antidopage les plus strictes',
    ];
  };

  const benefits = getProductBenefits();

  return (
    <div className="bg-[#111111] rounded-2xl border border-white/10 p-4 sm:p-6 text-white space-y-4 shadow-2xl">
      
      {/* Dynamic Unit Price Display & Stock */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
            {formatPrice(activeUnitPrice, product.priceEur ? activeUnitPrice * (product.priceEur / (product.priceChf || 1)) : undefined)}
          </span>
          {selectedTier > 1 && (
            <span className="text-base text-white/40 line-through font-mono">
              {formatPrice(basePrice, product.priceEur)}
            </span>
          )}
          {selectedTier > 1 && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#95d600]/20 text-[#95d600] text-xs font-black uppercase tracking-wider">
              -{selectedTier === 2 ? '5%' : '10%'} Remise
            </span>
          )}
        </div>
        {(() => {
          const isCommon = product.locationType === 'COMMON' || product.shippingOrigin === 'common';
          const isSwiss = (countryCode || 'CH') === 'CH' || countryCode === 'LI';
          let label = '🇨🇭 Expédié depuis la Suisse (24h) · En stock';
          if (isCommon) {
            label = isSwiss ? '🇨🇭 Expédié depuis la Suisse (24h) · En stock' : '🇵🇹 Expédié depuis le Portugal (3–5j) · En stock';
          } else if (product.shippingOrigin === 'portugal') {
            label = '🇵🇹 Expédié depuis le Portugal (3–5j) · En stock';
          }
          return (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#95d600]">
              <span className="w-2 h-2 rounded-full bg-[#95d600] animate-pulse" />
              <span>{label}</span>
            </div>
          );
        })()}
      </div>

      {/* Section: Obtenez plus, payez moins (Tiered Volume Discounts) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-white/90 font-heading tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#95d600]" />
            <span>Obtenez plus, payez moins</span>
          </h3>
          <span className="text-[10px] text-white/40 font-mono">SKU: {itemSku}</span>
        </div>

        {/* 3 Dynamic Pricing Tier Buttons in 3 columns for mobile & desktop */}
        <div className="grid grid-cols-3 gap-2">
          
          {/* Tier 1: 1 piece */}
          <button
            type="button"
            onClick={() => handleSelectTier(1)}
            className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
              selectedTier === 1
                ? 'border-white bg-white/10 ring-1 ring-white/50 shadow-md'
                : 'border-white/15 bg-black/40 hover:border-white/40 hover:bg-white/5'
            }`}
          >
            <div className="text-xs sm:text-sm font-black text-white font-heading">
              {formatPrice(tier1UnitPrice)}
            </div>
            <div className="text-[11px] text-white/60 font-medium mt-0.5">
              1 pièce
            </div>
          </button>

          {/* Tier 2: 2 pieces (5% off) */}
          <button
            type="button"
            onClick={() => handleSelectTier(2)}
            className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all relative overflow-hidden ${
              selectedTier === 2
                ? 'border-[#95d600] bg-[#95d600]/15 ring-1 ring-[#95d600] shadow-md'
                : 'border-white/15 bg-black/40 hover:border-[#95d600]/60 hover:bg-white/5'
            }`}
          >
            <div className="text-xs sm:text-sm font-black text-white font-heading">
              {formatPrice(tier2UnitPrice)}
            </div>
            <div className="text-[10px] font-black text-[#95d600] mt-0.5">
              2 pcs (-5%)
            </div>
          </button>

          {/* Tier 3: 3+ pieces (10% off) */}
          <button
            type="button"
            onClick={() => handleSelectTier(3)}
            className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all relative overflow-hidden ${
              selectedTier === 3
                ? 'border-[#95d600] bg-[#95d600]/20 ring-2 ring-[#95d600] shadow-md'
                : 'border-white/15 bg-black/40 hover:border-[#95d600]/60 hover:bg-white/5'
            }`}
          >
            <div className="text-xs sm:text-sm font-black text-[#95d600] font-heading">
              {formatPrice(tier3UnitPrice)}
            </div>
            <div className="text-[10px] font-black text-white bg-[#95d600]/30 px-1 py-0.5 rounded mt-0.5">
              3+ pcs (-10%)
            </div>
          </button>
        </div>
      </div>

      {/* Quantity Stepper & Add to Cart row */}
      <div className="flex gap-3 pt-2">
        {/* Stepper */}
        <div className="flex items-center border border-white/20 rounded-xl bg-black/60 px-1 shrink-0 h-12">
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity - 1)}
            className="w-10 h-full flex items-center justify-center text-white/70 hover:text-white font-bold text-lg transition-colors"
            aria-label="Diminuer la quantité"
          >
            -
          </button>
          <span className="w-8 text-center text-sm font-black text-white font-heading">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity + 1)}
            className="w-10 h-full flex items-center justify-center text-white/70 hover:text-white font-bold text-lg transition-colors"
            aria-label="Augmenter la quantité"
          >
            +
          </button>
        </div>

        {/* Add to Cart Button (or disabled if non-deliverable) */}
        {!isProductDeliverableToCountry(countryCode || 'CH', product.locationType, product.shippingOrigin, product.stockGeneva, product.stockPortugal) ? (
          <button
            type="button"
            disabled
            className="flex-1 h-12 px-4 bg-red-950/40 text-red-300 font-black uppercase tracking-wider text-[11px] sm:text-xs rounded-xl border border-red-800/50 opacity-80 cursor-not-allowed flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>Non livrable dans votre région</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 h-12 px-6 bg-[#95d600] hover:bg-[#85c000] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-xl hover:shadow-[#95d600]/30 flex items-center justify-center gap-2 active:scale-98"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span>Ajouter au panier</span>
          </button>
        )}
      </div>

      {/* REMISE / SAVINGS BREAKDOWN */}
      <div className="pt-3 border-t border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-white/60 font-heading">
            REMISE & DÉTAIL DU PRIX
          </span>
          {selectedTier > 1 && (
            <span className="text-[11px] font-black text-[#95d600] bg-[#95d600]/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#95d600]/30">
              <Sparkles className="w-3 h-3" />
              Remise de {selectedTier === 2 ? '5%' : '10%'} active
            </span>
          )}
        </div>

        {/* Dynamic calculation line */}
        <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-white/90">
            <span className="font-bold">
              {quantity}x {name}
            </span>
            <div className="text-right">
              {selectedTier > 1 && (
                <span className="text-[11px] text-white/40 line-through mr-2">
                  {formatPrice(regularTotal)}
                </span>
              )}
              <span className="text-sm font-black text-white font-heading">
                {formatPrice(currentTotal)}
              </span>
            </div>
          </div>

          {/* Unit price note */}
          <div className="flex justify-between items-center text-[11px] text-white/50 pt-1 border-t border-white/5">
            <span>Prix unitaire appliqué :</span>
            <span className="font-mono text-white/80 font-bold">{formatPrice(activeUnitPrice)} / pièce</span>
          </div>

          {/* Savings Highlight Badge when clicking tier buttons */}
          {currentSavings > 0 ? (
            <div className="pt-2 border-t border-[#95d600]/20 flex items-center justify-between text-xs">
              <span className="font-bold text-[#95d600] flex items-center gap-1.5">
                <span>🎉</span>
                <span>Économie réalisée :</span>
              </span>
              <span className="font-black text-sm text-[#95d600] font-heading bg-[#95d600]/10 px-2 py-0.5 rounded">
                +{formatPrice(currentSavings)} de gain
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-white/40 italic pt-1">
              💡 Sélectionnez 2 pièces pour économiser 5% ou 3+ pièces pour 10% de remise immédiate.
            </p>
          )}

          {/* Feature Bullet Points with checkmarks */}
          <div className="pt-2 border-t border-white/10">
            <ul className="space-y-1.5 text-xs text-white/80">
              {benefits.slice(0, 3).map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#95d600] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span className="leading-snug">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
