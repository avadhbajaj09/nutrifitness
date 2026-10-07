'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';

import { CartShipmentGroups } from '@/components/fulfillment/CartShipmentGroups';

export default function CartPage() {
  const { 
    cart, 
    cartSubtotal, 
    freeShippingProgress, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    showToast,
    formatPrice,
    t,
    currency
  } = useStore();

  const countryCode = 'CH'; // TODO: read from cookie

  const [couponCode, setCouponCode] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'SWISS10') {
      setDiscountRate(0.10);
      setCouponMessage({ text: '✓ Code SWISS10 appliqué (-10% sur votre commande)', isError: false });
      showToast('Code Promo', 'Remise de 10% appliquée !');
    } else {
      setCouponMessage({ text: 'Code promo invalide. Essayez "SWISS10"', isError: true });
    }
  };

  const discountAmount = cartSubtotal * discountRate;
  const discountedSubtotal = cartSubtotal - discountAmount;
  const shippingCost = freeShippingProgress.isFree ? 0 : 7.90;
  const estimatedVat = (discountedSubtotal * 0.026) / 1.026;
  const totalCost = discountedSubtotal + shippingCost;

  return (
    <div className="py-4">
      {/* Breadcrumbs */}
      <nav aria-label="Fil d'Ariane" className="py-2 text-xs text-white/50 mb-4 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-white font-medium">{t.nav.cart}</span>
      </nav>

      <div className="py-4 mb-4 border-b border-white/10 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
          {t.nav.cart}
        </h1>
        <span className="text-xs font-bold text-[#F80404] bg-[#F80404]/10 border border-[#F80404]/30 px-3 py-1 rounded-full">
          🇨🇭 Stock 100% en Suisse ({currency})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-6">
        
        {/* Left Column: Cart Items (8 cols) */}
        <div className="lg:col-span-8 bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-6">
          
          {/* Free Shipping Bar */}
          <div className="bg-[#181818] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
              <span>
                {freeShippingProgress.isFree ? (
                  <span className="text-emerald-400 font-bold">{t.common.freeShippingUnlocked}</span>
                ) : (
                  <>{t.common.freeShippingAbove.replace('{amount}', formatPrice(freeShippingProgress.remaining))}</>
                )}
              </span>
              <span className="text-[#F80404] uppercase font-black">{formatPrice(75)}</span>
            </div>
            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${freeShippingProgress.isFree ? 'bg-emerald-500' : 'bg-[#F80404]'}`}
                style={{ width: `${freeShippingProgress.percentage}%` }}
              />
            </div>
          </div>

          <CartShipmentGroups cartItems={cart} countryCode={countryCode} />

          {/* Items Container */}
          {cart.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-2xl">
                🛒
              </div>
              <h3 className="text-base font-black uppercase text-white font-heading">{t.nav.cart} est vide</h3>
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                Explorez nos protéines whey, créatines Creapure® et pré-workouts expédiés sous 24h en Suisse.
              </p>
              <Link 
                href="/boutique/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-full transition-all"
              >
                <span>{t.common.viewAll}</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.itemKey} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#181818] rounded-2xl border border-white/10">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-20 h-20 bg-black/40 rounded-xl p-2 shrink-0 border border-white/10 flex items-center justify-center">
                      <Image src={item.image} alt={item.name} fill className="object-contain filter drop-shadow-sm p-1" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#F80404] tracking-wider font-heading">{item.brand}</p>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-white/50">{item.flavor} · {item.size}</p>
                      {item.isEbook ? (
                        <p className="text-[11px] text-[#95d600] font-bold mt-1">✓ Exemplaire unique (téléchargement immédiat)</p>
                      ) : item.isPortugal ? (
                        <p className="text-[11px] text-emerald-400 font-bold mt-1">🇵🇹 Expédié depuis l'usine (Portugal) · 3–5 jours ouvrés</p>
                      ) : (
                        <p className="text-[11px] text-emerald-400 font-bold mt-1">● {t.common.inStock}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="flex items-center border border-white/20 rounded-xl bg-black/40">
                      <button 
                        type="button" 
                        onClick={() => updateQuantity(item.itemKey, -1)}
                        className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white font-bold"
                        title="Diminuer ou retirer"
                      >-</button>
                      <span className="w-9 text-center text-xs font-bold text-white">{item.quantity}</span>
                      <button 
                        type="button" 
                        disabled={item.isEbook}
                        onClick={() => updateQuantity(item.itemKey, 1)}
                        className={`w-9 h-9 flex items-center justify-center font-bold ${
                          item.isEbook 
                            ? 'opacity-20 cursor-not-allowed text-white/30' 
                            : 'text-white/70 hover:text-white'
                        }`}
                        title={item.isEbook ? 'Format numérique limité à 1 exemplaire par commande' : 'Augmenter la quantité'}
                      >+</button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <span className="text-base font-black text-white font-heading">{formatPrice(item.price * item.quantity)}</span>
                      <p className="text-[10px] text-white/40">{t.common.vatIncluded}</p>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => removeFromCart(item.itemKey)}
                      className="text-white/40 hover:text-red-400 p-2"
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Links */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <Link href="/boutique/" className="text-[#F80404] hover:underline font-bold flex items-center gap-1">
              <span>←</span> Continuer mes achats
            </Link>
            {cart.length > 0 && (
              <button 
                type="button" 
                onClick={clearCart}
                className="text-white/40 hover:text-red-400 transition-colors"
              >
                Vider le panier
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4 bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-5">
          <h2 className="text-lg font-black uppercase text-white font-heading pb-3 border-b border-white/10">
            {t.checkout.orderSummary}
          </h2>

          {/* Coupon Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
              Code Promo ou Bon d&apos;Achat :
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Ex: SWISS10" 
                className="flex-1 min-h-[42px] px-3 text-xs bg-black/60 border border-white/15 rounded-xl text-white uppercase focus:border-[#F80404] focus:outline-none"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-white/10 hover:bg-[#F80404] hover:text-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shrink-0"
              >
                Appliquer
              </button>
            </div>
            {couponMessage && (
              <p className={`text-[11px] font-bold ${couponMessage.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                {couponMessage.text}
              </p>
            )}
          </form>

          {/* Financial Breakdown */}
          <div className="space-y-2.5 text-xs text-white/70 pt-2 border-t border-white/10">
            <div className="flex justify-between">
              <span>{t.common.subtotal} :</span>
              <span className="font-bold text-white">{formatPrice(cartSubtotal)}</span>
            </div>

            {discountRate > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Remise Club (-10%) :</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>{t.common.shipping} (PostPac Priority) :</span>
              <span className="font-bold text-white">
                {freeShippingProgress.isFree ? t.common.free : formatPrice(shippingCost)}
              </span>
            </div>

            <div className="flex justify-between text-white/40 text-[11px]">
              <span>{t.common.vatIncluded} :</span>
              <span>{formatPrice(estimatedVat)}</span>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-baseline text-white">
              <span className="text-sm font-black uppercase font-heading">{t.common.total} :</span>
              <span className="text-2xl font-black text-white font-heading">{formatPrice(totalCost)}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <Link 
            href="/commande/"
            className="w-full min-h-[48px] px-6 py-3.5 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg hover:shadow-[#F80404]/25 flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{t.common.checkout}</span>
            <span>→</span>
          </Link>

          {/* Trust strip */}
          <div className="pt-4 border-t border-white/10 space-y-2 text-[11px] text-white/50">
            <p className="flex items-center gap-2">
              <span>🇨🇭</span> <strong>Stock physique à Genève :</strong> aucun frais de douane.
            </p>
            <p className="flex items-center gap-2">
              <span>⚡</span> <strong>PostPac Priority 24h :</strong> suivi en ligne Poste Suisse.
            </p>
            <p className="flex items-center gap-2">
              <span>💳</span> <strong>Paiements acceptés :</strong> TWINT, PostFinance, Cartes & Facture QR ({currency}).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
