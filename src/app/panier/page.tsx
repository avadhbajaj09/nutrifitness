'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { isProductDeliverableToCountry } from '@/lib/delivery/defaults';

import CartShipmentGroups from '@/components/fulfillment/CartShipmentGroups';
import { trackBeginCheckout, trackMetaInitiateCheckout } from '@/lib/analytics';

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
    currency, 
    countryCode,
    locale 
  } = useStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentCc = (countryCode || 'CH').toUpperCase();
  const blockedItems = cart.filter(item => {
    if (item.isEbook) return false;
    return !isProductDeliverableToCountry(currentCc, item.locationType, item.shippingOrigin);
  });
  const hasBlockedItems = blockedItems.length > 0;

  const [couponCode, setCouponCode] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    rate: number;
    amountOff?: number;
    discountType?: 'percent' | 'amount';
    description?: string;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nf_applied_coupon');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.code && (parsed.rate !== undefined || parsed.amountOff !== undefined)) {
          setCouponCode(parsed.code);
          setDiscountRate(parsed.rate || 0);
          setAppliedCoupon(parsed);
          setCouponMessage({
            text: `✓ Code "${parsed.code}" actif (${parsed.description || `-${Math.round((parsed.rate || 0) * 100)}%`})`,
            isError: false,
          });
        }
      }
    } catch {}
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) {
      setCouponMessage({ text: 'Veuillez saisir un code promo.', isError: true });
      return;
    }

    setIsApplyingCoupon(true);
    setCouponMessage(null);

    try {
      const res = await fetch('/api/coupons/validate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        const couponData = {
          code: data.code,
          rate: data.rate || 0,
          amountOff: data.amountOff,
          discountType: (data.discountType || 'percent') as 'percent' | 'amount',
          description: data.description,
        };
        setAppliedCoupon(couponData);
        setDiscountRate(couponData.rate);
        setCouponCode(data.code);
        setCouponMessage({
          text: `✓ Code "${data.code}" appliqué (${data.description}) !`,
          isError: false,
        });
        showToast('Code Promo Appliqué', data.description);
        try {
          localStorage.setItem('nf_applied_coupon', JSON.stringify(couponData));
        } catch {}
      } else {
        setCouponMessage({
          text: data.error || `Le code promo "${clean}" est invalide ou expiré.`,
          isError: true,
        });
      }
    } catch {
      setCouponMessage({
        text: 'Erreur lors de la vérification du code. Réessayez.',
        isError: true,
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountRate(0);
    setCouponCode('');
    setCouponMessage(null);
    try {
      localStorage.removeItem('nf_applied_coupon');
    } catch {}
    showToast('Code Retiré', 'Le code promotionnel a été supprimé.');
  };

  const discountAmount = useMemo(() => {
    if (!appliedCoupon && discountRate === 0) return 0;
    if (appliedCoupon && appliedCoupon.discountType === 'amount' && appliedCoupon.amountOff) {
      return Math.min(cartSubtotal, appliedCoupon.amountOff);
    }
    const effRate = appliedCoupon?.rate ?? discountRate;
    return cartSubtotal * effRate;
  }, [cartSubtotal, appliedCoupon, discountRate]);

  const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);
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

          {/* Blocked Items Warning for Selected Destination */}
          {hasBlockedItems && (
            <div className="p-4 rounded-2xl border border-red-500/40 bg-red-950/40 text-red-200 text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="font-bold flex items-center gap-2 text-red-300">
                  <span>⚠️</span>
                  <span>Articles non livrables vers votre pays ({currentCc}) :</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    blockedItems.forEach(b => removeFromCart(b.itemKey));
                    showToast('Panier mis à jour', 'Articles non livrables retirés du panier.');
                  }}
                  className="px-3 py-1 bg-red-800/60 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                >
                  Retirer ces articles
                </button>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-red-200/90 pl-1">
                {blockedItems.map((b) => (
                  <li key={b.itemKey}>
                    <span className="font-semibold text-white">{b.name}</span>
                    <span className="text-red-300/80"> — non expédiable vers {currentCc}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-white/70 pt-0.5">
                Veuillez retirer ces articles de votre panier ou choisir un autre pays de livraison dans l&apos;en-tête pour pouvoir finaliser votre commande.
              </p>
            </div>
          )}

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
                      <Image 
                        src={typeof item.image === 'string' && item.image ? item.image : '/images/placeholder.webp'} 
                        alt={typeof item.name === 'object' && item.name !== null ? ((item.name as any)[locale] || (item.name as any).fr || 'Produit') : String(item.name || 'Produit')} 
                        fill 
                        className="object-contain filter drop-shadow-sm p-1" 
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#F80404] tracking-wider font-heading">{item.brand}</p>
                      <h3 className="text-sm font-bold text-white line-clamp-1">
                        {typeof item.name === 'object' && item.name !== null ? ((item.name as any)[locale] || (item.name as any).fr || 'Produit') : String(item.name || 'Produit')}
                      </h3>
                      {(() => {
                        const flavorObj = item.flavor as unknown as Record<string, string> | null | undefined;
                        const flavorStr = typeof item.flavor === 'object' && item.flavor !== null
                          ? (flavorObj?.[locale] || flavorObj?.fr || 'Standard')
                          : String(item.flavor || 'Standard');
                        const isDistinct = flavorStr && !['standard', 'neutre', 'format standard', 'default'].includes(flavorStr.toLowerCase());
                        const sizeStr = typeof item.size === 'object' && item.size !== null
                          ? ((item.size as Record<string, string>)[locale] || (item.size as Record<string, string>).fr || 'Format standard')
                          : String(item.size || 'Format standard');

                        return (
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                              isDistinct 
                                ? 'bg-[#95d600]/15 border-[#95d600]/40 text-[#95d600]' 
                                : 'bg-white/10 border-white/15 text-white/80'
                            }`}>
                              <span>{isDistinct ? '⚡' : '🏷️'}</span>
                              <span className="text-white/60 text-[10px] uppercase font-semibold">Saveur :</span>
                              <span className="font-black text-white">{flavorStr}</span>
                            </span>
                            {sizeStr && sizeStr !== 'Format standard' && (
                              <span className="text-[10px] text-white/60 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                                {sizeStr}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                      {item.isEbook ? (
                        <p className="text-[11px] text-[#95d600] font-bold mt-1">✓ Exemplaire unique (téléchargement immédiat)</p>
                      ) : (
                        <p className="text-[11px] text-emerald-400 font-bold mt-1">✓ En stock · Livraison suivie</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="flex items-center border border-white/20 rounded-xl bg-black/40 overflow-hidden">
                      <button 
                        type="button" 
                        onClick={() => updateQuantity(item.itemKey, -1)}
                        className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:w-9 sm:h-9 flex items-center justify-center text-white/70 hover:text-white font-bold text-base sm:text-xs active:bg-white/10"
                        title="Diminuer ou retirer"
                        aria-label="Diminuer la quantité"
                      >-</button>
                      <span className="w-9 text-center text-xs font-bold text-white">
                        {Number.isFinite(Number(item.quantity)) ? Math.max(1, Math.floor(Number(item.quantity))) : 1}
                      </span>
                      <button 
                        type="button" 
                        disabled={item.isEbook}
                        onClick={() => updateQuantity(item.itemKey, 1)}
                        className={`min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:w-9 sm:h-9 flex items-center justify-center font-bold text-base sm:text-xs active:bg-white/10 ${
                          item.isEbook 
                            ? 'opacity-20 cursor-not-allowed text-white/30' 
                            : 'text-white/70 hover:text-white'
                        }`}
                        title={item.isEbook ? 'Format numérique limité à 1 exemplaire par commande' : 'Augmenter la quantité'}
                        aria-label="Augmenter la quantité"
                      >+</button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <span className="text-base font-black text-white font-heading">
                        {formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                      </span>
                      <p className="text-[10px] text-white/40">{t.common.vatIncluded}</p>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => removeFromCart(item.itemKey)}
                      className="text-white/40 hover:text-red-400 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-sm"
                      title="Supprimer"
                      aria-label="Supprimer du panier"
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
          {appliedCoupon ? (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-black text-emerald-300 uppercase tracking-wide">
                  ✓ {appliedCoupon.code}
                </span>
                <p className="text-[11px] text-emerald-200/80">
                  {appliedCoupon.description || `-${Math.round((appliedCoupon.rate || 0) * 100)}%`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-white/70 text-xs font-bold rounded-lg transition-colors border border-white/10"
              >
                Retirer
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                Code Promo ou Bon d&apos;Achat :
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Code promo" 
                  className="flex-1 min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white uppercase focus:border-[#F80404] focus:outline-none"
                />
                <button 
                  type="submit"
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className="px-5 py-2.5 min-h-[44px] bg-white/10 hover:bg-[#F80404] hover:text-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shrink-0 disabled:opacity-50 flex items-center justify-center"
                >
                  {isApplyingCoupon ? '...' : 'Appliquer'}
                </button>
              </div>
              {couponMessage && (
                <p className={`text-[11px] font-bold ${couponMessage.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                  {couponMessage.text}
                </p>
              )}
            </form>
          )}

          {/* Financial Breakdown */}
          <div className="space-y-2.5 text-xs text-white/70 pt-2 border-t border-white/10">
            <div className="flex justify-between">
              <span>{t.common.subtotal} :</span>
              <span className="font-bold text-white">{formatPrice(cartSubtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Remise ({appliedCoupon?.code || couponCode}) :</span>
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
          {hasBlockedItems ? (
            <div className="w-full min-h-[48px] px-6 py-3.5 bg-red-950/60 border border-red-500/50 text-red-200 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center text-center gap-2">
              <span>⚠️</span>
              <span>Retirez les articles non livrables pour commander</span>
            </div>
          ) : (
            <Link 
              href="/commande/"
              onClick={() => {
                const items = cart.map(item => ({
                  item_id: (item as any).sku || item.itemKey || item.name,
                  item_name: item.name,
                  item_brand: (item as any).brand || 'NutriFitness',
                  item_category: (item as any).categorySlug || 'Nutrition Sportive',
                  price: item.price,
                  quantity: item.quantity,
                }));
                const activeCurr = currency || 'CHF';
                trackBeginCheckout(items, cartSubtotal, activeCurr);
                trackMetaInitiateCheckout({ items, totalValue: cartSubtotal, currency: activeCurr });
              }}
              className="w-full min-h-[48px] px-6 py-3.5 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg hover:shadow-[#F80404]/25 flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{t.common.checkout}</span>
              <span>→</span>
            </Link>
          )}

          <p className="text-[10px] text-white/40 text-center pt-2">
            En commandant, vous acceptez nos{' '}
            <Link href="/cgv/" className="text-white/60 hover:text-white underline underline-offset-2">
              CGV
            </Link>{' '}
            et nos{' '}
            <Link href="/mentions-legales/" className="text-white/60 hover:text-white underline underline-offset-2">
              Mentions Légales
            </Link>.
          </p>

          {/* Trust strip */}
          <div className="pt-4 border-t border-white/10 space-y-2 text-[11px] text-white/50">
            <p className="flex items-center gap-2">
              <span>📍</span> <Link href="/click-and-collect/" className="hover:text-white underline font-bold text-white/80">Click & Collect gratuit en 2h en Suisse</Link>
            </p>
            <p className="flex items-center gap-2">
              <span>🇨🇭</span> <strong>Stock physique en Suisse :</strong> aucun frais de douane.
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

      {/* Mobile Sticky Checkout Bar (Above Bottom Tab Bar, lg:hidden) */}
      {cart.length > 0 && (
        <div className="fixed bottom-[calc(56px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/10 p-3 lg:hidden shadow-2xl">
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Total TTC</p>
              <p className="text-lg font-black text-white font-heading">{formatPrice(totalCost)}</p>
            </div>

            {hasBlockedItems ? (
              <span className="shrink-0 min-h-[44px] px-4 py-2 bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-bold rounded-xl flex items-center">
                ⚠️ Articles bloqués
              </span>
            ) : (
              <Link
                href="/commande/"
                onClick={() => {
                  const items = cart.map(item => ({
                    item_id: (item as any).sku || item.itemKey || item.name,
                    item_name: item.name,
                    item_brand: (item as any).brand || 'NutriFitness',
                    item_category: (item as any).categorySlug || 'Nutrition Sportive',
                    price: item.price,
                    quantity: item.quantity,
                  }));
                  const activeCurr = currency || 'CHF';
                  trackBeginCheckout(items, cartSubtotal, activeCurr);
                  trackMetaInitiateCheckout({ items, totalValue: cartSubtotal, currency: activeCurr });
                }}
                className="shrink-0 min-h-[44px] px-6 py-2.5 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <span>Commander</span>
                <span>→</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
