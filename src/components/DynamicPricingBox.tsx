'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductItem, getLocalized } from '@/lib/types';
import { Check, Sparkles, ShoppingBag } from 'lucide-react';

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
  const { formatPrice, addToCart, locale, t } = useStore();
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(1);

  const basePrice = product.priceChf;
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
      'Traçabilité 100% garantie depuis notre stock de Genève',
      'Conforme aux normes antidopage les plus strictes',
    ];
  };

  const benefits = getProductBenefits();

  return (
    <div className="bg-[#111111] rounded-2xl border border-white/10 p-5 sm:p-6 text-white space-y-5 shadow-2xl">
      
      {/* Product Title (Lime Green) & SKU */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#95d600] uppercase font-heading tracking-wide leading-tight">
          {name}
        </h2>
        <p className="text-[11px] text-white/40 font-mono mt-0.5">
          Item #: {itemSku}
        </p>
      </div>

      <div className="h-px bg-white/10 w-full" />

      {/* Dynamic Unit Price Display */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
          {formatPrice(activeUnitPrice)}
        </span>
        {selectedTier > 1 && (
          <span className="text-base text-white/40 line-through font-mono">
            {formatPrice(basePrice)}
          </span>
        )}
        {selectedTier > 1 && (
          <span className="px-2.5 py-0.5 rounded-full bg-[#95d600]/20 text-[#95d600] text-xs font-black uppercase tracking-wider">
            -{selectedTier === 2 ? '5%' : '10%'} Remise appliquée
          </span>
        )}
      </div>

      {/* Feature Bullet Points with checkmarks */}
      <ul className="space-y-2 text-xs text-white/80">
        {benefits.map((benefit, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-white/50 shrink-0 mt-0.5 stroke-[2.5]" />
            <span className="leading-snug">{benefit}</span>
          </li>
        ))}
      </ul>

      {/* Stock Status */}
      <div className="flex items-center gap-2 text-xs font-bold text-[#95d600]">
        <span className="w-2 h-2 rounded-full bg-[#95d600] animate-pulse" />
        <span>En stock à Genève (Expédition 24h)</span>
      </div>

      {/* Section Header: Obtenez plus, payez moins */}
      <div className="pt-2">
        <h3 className="text-lg sm:text-xl font-black text-white uppercase font-heading tracking-wider mb-3">
          Obtenez plus, payez moins
        </h3>

        {/* 3 Dynamic Pricing Tier Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          
          {/* Tier 1: 1 piece */}
          <button
            type="button"
            onClick={() => handleSelectTier(1)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedTier === 1
                ? 'border-white bg-white/10 ring-1 ring-white/50 shadow-lg'
                : 'border-white/15 bg-black/40 hover:border-white/40 hover:bg-white/5'
            }`}
          >
            <div className="text-sm sm:text-base font-black text-white font-heading">
              {formatPrice(tier1UnitPrice)}
            </div>
            <div className="text-xs text-white/60 font-medium mt-0.5">
              1 pièce
            </div>
          </button>

          {/* Tier 2: 2 pieces (5% off) */}
          <button
            type="button"
            onClick={() => handleSelectTier(2)}
            className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
              selectedTier === 2
                ? 'border-[#95d600] bg-[#95d600]/10 ring-1 ring-[#95d600] shadow-lg'
                : 'border-white/15 bg-black/40 hover:border-[#95d600]/60 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-black text-white font-heading">
                {formatPrice(tier2UnitPrice)}
              </span>
              <span className="text-[10px] font-black text-[#95d600] bg-[#95d600]/20 px-1.5 py-0.5 rounded">
                -5% remise
              </span>
            </div>
            <div className="text-xs text-white/60 font-medium mt-0.5">
              2 pièces
            </div>
          </button>

          {/* Tier 3: 3+ pieces (10% off) */}
          <button
            type="button"
            onClick={() => handleSelectTier(3)}
            className={`sm:col-span-2 p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
              selectedTier === 3
                ? 'border-[#95d600] bg-[#95d600]/15 ring-2 ring-[#95d600] shadow-lg'
                : 'border-white/15 bg-black/40 hover:border-[#95d600]/60 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-black text-white font-heading flex items-center gap-2">
                <span>{formatPrice(tier3UnitPrice)}</span>
                <span className="text-xs text-white/40 line-through">{formatPrice(basePrice)}</span>
              </span>
              <span className="text-[10px] font-black text-black bg-[#95d600] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Meilleure Offre (-10%)
              </span>
            </div>
            <div className="text-xs text-white/70 font-medium mt-0.5 flex items-center justify-between">
              <span>3+ pièces (Remise maximale quantitative)</span>
              <span className="text-[#95d600] font-bold">Économie max</span>
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

        {/* Lime Green Add to Cart Button (matching screenshot) */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 h-12 px-6 bg-[#95d600] hover:bg-[#85c000] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-xl hover:shadow-[#95d600]/30 flex items-center justify-center gap-2 active:scale-98"
        >
          <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
          <span>Ajouter au panier</span>
        </button>
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
        </div>
      </div>
    </div>
  );
}
