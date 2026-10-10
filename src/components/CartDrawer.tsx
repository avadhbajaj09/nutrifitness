'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';

export default function CartDrawer() {
  const { 
    isCartOpen, 
    closeCart, 
    cart, 
    cartCount, 
    cartSubtotal, 
    freeShippingProgress, 
    updateQuantity, 
    removeFromCart, 
    addToCart,
    formatPrice,
    t,
    currency
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <aside 
        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#121212] text-white z-[90] shadow-2xl border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Panier d'achat"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F80404]/10 border border-[#F80404]/30 flex items-center justify-center text-[#F80404]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white font-heading">
                {t.nav.cart} ({cartCount})
              </h3>
              <p className="text-[10px] text-white/50">Expédié depuis la Suisse</p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={closeCart}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Fermer le panier"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="p-4 bg-[#181818] border-b border-white/10">
          <div className="flex justify-between items-center text-[11px] mb-2 font-medium">
            <span className="text-white/80">
              {freeShippingProgress.isFree ? (
                <span className="text-emerald-400 font-bold">{t.common.freeShippingUnlocked}</span>
              ) : (
                <>{t.common.freeShippingAbove.replace('{amount}', formatPrice(freeShippingProgress.remaining))}</>
              )}
            </span>
            <span className="text-[10px] font-bold text-[#F80404] uppercase">
              {formatPrice(75)}
            </span>
          </div>
          <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${freeShippingProgress.isFree ? 'bg-emerald-500' : 'bg-[#F80404]'}`}
              style={{ width: `${freeShippingProgress.percentage}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-3xl">
                🛒
              </div>
              <div>
                <h4 className="text-sm font-black uppercase text-white font-heading tracking-wide mb-1">
                  {t.nav.cart} est vide
                </h4>
                <p className="text-xs text-white/50 max-w-xs mx-auto">
                  Explorez nos protéines, créatines et formules de qualité certifiée.
                </p>
              </div>
              <Link 
                href="/boutique/"
                onClick={closeCart}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-full transition-all"
              >
                <span>{t.common.viewAll}</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.itemKey} className="flex gap-4 p-4 bg-[#181818] rounded-xl border border-white/10 group">
                <div className="relative w-16 h-16 rounded-lg bg-black/40 p-2 shrink-0 border border-white/5 flex items-center justify-center">
                  <Image src={item.image} alt={item.name} fill className="object-contain filter drop-shadow-sm p-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#F80404] tracking-wider">{item.brand}</p>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                      <p className="text-[11px] text-white/50">
                        {item.flavor} · {item.size}
                      </p>
                      {item.isEbook && (
                        <p className="text-[10px] text-[#95d600] font-bold pt-0.5">
                          ✓ Exemplaire unique (téléchargement PDF)
                        </p>
                      )}
                      {item.isPortugal ? (
                        <p className="text-[10px] text-blue-400 font-bold pt-0.5 flex items-center gap-1">
                          <span>🇵🇹</span>
                          <span>Expédié du Portugal · 3–5j</span>
                        </p>
                      ) : !item.isEbook && (
                        <p className="text-[10px] text-emerald-400 font-bold pt-0.5 flex items-center gap-1">
                          <span>🇨🇭</span>
                          <span>En stock en Suisse</span>
                        </p>
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeFromCart(item.itemKey)}
                      className="text-white/40 hover:text-red-400 transition-colors p-1"
                      aria-label="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                    <div className="flex items-center border border-white/20 rounded-lg bg-black/40">
                      <button 
                        type="button" 
                        onClick={() => updateQuantity(item.itemKey, -1)}
                        className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white font-bold"
                        title="Diminuer ou retirer"
                      >-</button>
                      <span className="w-7 text-center text-xs font-bold text-white">{item.quantity}</span>
                      <button 
                        type="button" 
                        disabled={item.isEbook}
                        onClick={() => updateQuantity(item.itemKey, 1)}
                        className={`w-7 h-7 flex items-center justify-center font-bold ${
                          item.isEbook 
                            ? 'opacity-20 cursor-not-allowed text-white/30' 
                            : 'text-white/70 hover:text-white'
                        }`}
                        title={item.isEbook ? 'Format numérique : limité à 1 exemplaire par commande' : 'Augmenter la quantité'}
                      >+</button>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-white font-heading">{formatPrice(item.price * item.quantity)}</span>
                      <span className="text-[10px] text-white/40 block">{t.common.vatIncluded}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-black/60 space-y-4">
            {/* Upsell Booster */}
            <div className="bg-[#181818] p-3 rounded-xl border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg bg-black/40 p-1 shrink-0 border border-white/10">
                  <Image src="/images/categories/categorie-accessoires.webp" alt="Shaker" fill className="object-contain p-1" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white leading-tight">Shaker Pro 700ml Sans BPA</p>
                  <div className="flex items-center gap-1 text-[10px] py-0.5">
                    <span className="text-amber-400">★★★★★</span>
                    <span className="text-white/50">4.9 (94 avis)</span>
                  </div>
                  <p className="text-[10px] text-white/50">+{formatPrice(8.90)} · Accessoire</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => addToCart({
                  id: 'nf-shaker-600ml',
                  slug: 'nf-shaker-600ml',
                  name: 'Shaker NutriFitness Pro 600ml',
                  brand: 'NutriFitness',
                  priceChf: 8.90,
                  flavor: 'Noir Mat',
                  size: '600 ml',
                  image: '/images/categories/categorie-accessoires.webp'
                })}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-[#F80404] hover:text-black text-white text-[10px] font-bold uppercase rounded-lg border border-white/10 transition-colors shrink-0"
              >
                + Ajouter
              </button>
            </div>

            {/* Subtotal */}
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">{t.common.subtotal} :</span>
                <span className="text-xl font-black text-white font-heading">{formatPrice(cartSubtotal)}</span>
              </div>
              <p className="text-[10px] text-white/40">
                {t.common.vatIncluded} · Frais de port calculés à l'étape suivante ({currency}).
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-2">
              <Link 
                href="/commande/"
                onClick={closeCart}
                className="w-full min-h-[48px] px-6 py-3.5 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg hover:shadow-[#F80404]/25 flex items-center justify-center gap-2 active:scale-98"
              >
                <span>{t.common.checkout} ({formatPrice(cartSubtotal)})</span>
                <span>→</span>
              </Link>

              <Link 
                href="/panier/"
                onClick={closeCart}
                className="w-full min-h-[42px] px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 flex items-center justify-center transition-colors"
              >
                {t.nav.cart}
              </Link>
            </div>

            {/* Swiss & European Payment Badges */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-3 opacity-60 text-[10px] uppercase font-bold text-white/70">
              <span>🇨🇭 TWINT</span>
              <span>•</span>
              <span>PostFinance</span>
              <span>•</span>
              <span>Visa / MC</span>
              <span>•</span>
              <span>Apple Pay</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
