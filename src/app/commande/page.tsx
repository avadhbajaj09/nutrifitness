'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import ThankYouAnimation from '@/components/ThankYouAnimation';
import { ShieldCheck, Truck, CreditCard, Sparkles } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, cartCount, cartSubtotal, freeShippingProgress, clearCart, formatPrice, t, currency, setCurrency, locale } = useStore();
  const [shippingMethod, setShippingMethod] = useState<'postpac' | 'clickcollect'>('postpac');
  const [paymentMethod, setPaymentMethod] = useState<'twint' | 'postfinance' | 'card' | 'invoice'>('twint');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [finalTotalFormatted, setFinalTotalFormatted] = useState('');

  const shippingCost = shippingMethod === 'clickcollect' ? 0 : (freeShippingProgress.isFree ? 0 : 7.90);
  const vatEst = (cartSubtotal * 0.026) / 1.026;
  const total = cartSubtotal + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedOrderNum = `#NF-CH-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(generatedOrderNum);
    setFinalTotalFormatted(formatPrice(total));
    clearCart();
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isSuccess) {
    return (
      <ThankYouAnimation
        orderNumber={orderNumber}
        totalFormatted={finalTotalFormatted}
        paymentMethod={paymentMethod}
        shippingMethod={shippingMethod}
        customerEmail={customerEmail}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-[#F80404] tracking-widest block mb-1">
            🔒 SSL 256 bits · {currency} Active
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
            {t.checkout.title}
          </h1>
          <p className="text-xs text-white/60 mt-1">
            {t.checkout.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/60">
          <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <span>🇨🇭</span> 100% Stock Suisse
          </span>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-full">
            <span className="text-[11px] text-white/50 pl-2">Devise :</span>
            <button
              type="button"
              onClick={() => setCurrency('CHF')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-black transition-all ${
                currency === 'CHF' ? 'bg-[#F80404] text-black shadow-sm' : 'text-white/70 hover:text-white'
              }`}
            >
              🇨🇭 CHF
            </button>
            <button
              type="button"
              onClick={() => setCurrency('EUR')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-black transition-all ${
                currency === 'EUR' ? 'bg-[#F80404] text-black shadow-sm' : 'text-white/70 hover:text-white'
              }`}
            >
              🇪🇺 EUR (€)
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1: Coordonnées */}
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white font-heading flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#F80404] text-black text-xs font-black flex items-center justify-center">1</span>
              {t.checkout.recipientDetails}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">Adresse e-mail (confirmation) *</label>
                <input 
                  type="email" 
                  required 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="nom@exemple.ch" 
                  className="w-full min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white focus:border-[#F80404] focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">Téléphone mobile (suivi SMS) *</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="+41 79 123 45 67" 
                  className="w-full min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white focus:border-[#F80404] focus:outline-none" 
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping */}
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white font-heading flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#F80404] text-black text-xs font-black flex items-center justify-center">2</span>
              {t.checkout.shippingMode}
            </h2>
            <div className="space-y-3">
              <label 
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  shippingMethod === 'postpac' ? 'border-[#F80404] bg-[#F80404]/10' : 'border-white/15 bg-white/5'
                }`}
              >
                <input 
                  type="radio" 
                  name="shipping" 
                  checked={shippingMethod === 'postpac'} 
                  onChange={() => setShippingMethod('postpac')}
                  className="mt-1 text-[#F80404] focus:ring-[#F80404]" 
                />
                <div className="flex-1 text-xs">
                  <div className="flex justify-between font-bold text-white mb-0.5">
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#F80404]" />
                      <span>PostPac Priority (La Poste Suisse)</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">24h Express</span>
                    </span>
                    <span>{freeShippingProgress.isFree ? t.common.free : formatPrice(7.90)}</span>
                  </div>
                  <p className="text-white/50">Remise avec suivi en ligne Poste Suisse par SMS & e-mail.</p>
                </div>
              </label>

              <label 
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  shippingMethod === 'clickcollect' ? 'border-[#F80404] bg-[#F80404]/10' : 'border-white/15 bg-white/5'
                }`}
              >
                <input 
                  type="radio" 
                  name="shipping" 
                  checked={shippingMethod === 'clickcollect'} 
                  onChange={() => setShippingMethod('clickcollect')}
                  className="mt-1 text-[#F80404] focus:ring-[#F80404]" 
                />
                <div className="flex-1 text-xs">
                  <div className="flex justify-between font-bold text-white mb-0.5">
                    <span className="flex items-center gap-2">
                      <span>📍 Click & Collect Boutique Genève</span>
                      <span className="text-[10px] bg-[#F80404]/20 text-[#F80404] px-2 py-0.5 rounded font-bold">Disponible en 2h</span>
                    </span>
                    <span className="text-emerald-400 font-bold">{t.common.free}</span>
                  </div>
                  <p className="text-white/50">34 Rue des Pâquis, 1201 Genève (Lun-Ven 12h30-19h / Sam 12h-17h).</p>
                </div>
              </label>
            </div>
          </div>

          {/* Step 3: Address */}
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white font-heading flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#F80404] text-black text-xs font-black flex items-center justify-center">3</span>
              Adresse de Livraison
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">Prénom *</label>
                <input type="text" required placeholder="Alexandre" className="w-full min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white focus:border-[#F80404] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">Nom *</label>
                <input type="text" required placeholder="Favre" className="w-full min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white focus:border-[#F80404] focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-white/80 mb-1.5">Rue et numéro *</label>
                <input type="text" required placeholder="Rue du Rhône 42" className="w-full min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white focus:border-[#F80404] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">NPA (Code Postal) *</label>
                <input type="text" required placeholder="1204" className="w-full min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white focus:border-[#F80404] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">Ville *</label>
                <input type="text" required placeholder="Genève" className="w-full min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white focus:border-[#F80404] focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Step 4: Payments */}
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white font-heading flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#F80404] text-black text-xs font-black flex items-center justify-center">4</span>
              {t.checkout.paymentMode} ({currency})
            </h2>
            <div className="space-y-3">
              {/* TWINT */}
              <label 
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'twint' ? 'border-[#F80404] bg-[#F80404]/10' : 'border-white/15 bg-white/5'
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'twint'} 
                  onChange={() => setPaymentMethod('twint')}
                  className="mt-1 text-[#F80404] focus:ring-[#F80404]" 
                />
                <div className="flex-1 text-xs">
                  <div className="flex justify-between font-bold text-white mb-0.5">
                    <span className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-white text-black font-black text-[10px]">TWINT</span>
                      <span>TWINT Suisse (Recommandé)</span>
                    </span>
                    <span className="text-[#F80404] font-bold">Instantané</span>
                  </div>
                  <p className="text-white/50">Payez en 1 clic avec l&apos;application TWINT de votre banque suisse.</p>
                </div>
              </label>

              {/* PostFinance */}
              <label 
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'postfinance' ? 'border-[#F80404] bg-[#F80404]/10' : 'border-white/15 bg-white/5'
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'postfinance'} 
                  onChange={() => setPaymentMethod('postfinance')}
                  className="mt-1 text-[#F80404] focus:ring-[#F80404]" 
                />
                <div className="flex-1 text-xs">
                  <div className="flex justify-between font-bold text-white mb-0.5">
                    <span className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-yellow-400 text-black font-black text-[10px]">PF</span>
                      <span>PostFinance Card & E-Finance</span>
                    </span>
                    <span className="text-white/70">Sécurisé</span>
                  </div>
                  <p className="text-white/50">Débit direct sur votre compte postal ou carte PostFinance.</p>
                </div>
              </label>

              {/* Credit Card */}
              <label 
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'card' ? 'border-[#F80404] bg-[#F80404]/10' : 'border-white/15 bg-white/5'
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'card'} 
                  onChange={() => setPaymentMethod('card')}
                  className="mt-1 text-[#F80404] focus:ring-[#F80404]" 
                />
                <div className="flex-1 text-xs">
                  <div className="flex justify-between font-bold text-white mb-0.5">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-white" />
                      <span>Carte Bancaire (Visa, Mastercard, Amex)</span>
                    </span>
                    <span className="text-white/70">3D Secure</span>
                  </div>
                  <p className="text-white/50">Protocole de sécurité SSL 256 bits conforme nDSG.</p>
                </div>
              </label>

              {/* Invoice QR */}
              <label 
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'invoice' ? 'border-[#F80404] bg-[#F80404]/10' : 'border-white/15 bg-white/5'
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'invoice'} 
                  onChange={() => setPaymentMethod('invoice')}
                  className="mt-1 text-[#F80404] focus:ring-[#F80404]" 
                />
                <div className="flex-1 text-xs">
                  <div className="flex justify-between font-bold text-white mb-0.5">
                    <span className="flex items-center gap-2">
                      <span>📄 Facture QR Suisse</span>
                    </span>
                    <span className="text-white/70">30 jours</span>
                  </div>
                  <p className="text-white/50">Bulletin de versement QR joint au colis (sous réserve de solvabilité).</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary (5 cols) */}
        <div className="lg:col-span-5 bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-6 sticky top-24">
          <h2 className="text-lg font-black uppercase text-white font-heading pb-3 border-b border-white/10 flex items-center justify-between">
            <span>{t.checkout.orderSummary}</span>
            <span className="text-xs text-[#F80404] bg-[#F80404]/10 px-2.5 py-0.5 rounded-full">
              {cartCount} articles
            </span>
          </h2>

          {/* Devise Switcher */}
          <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <span>Devise de facturation</span>
              </div>
              <div className="text-[10px] text-white/50">
                Commandez en CHF ou en EUR (€)
              </div>
            </div>
            <div className="inline-flex rounded-lg bg-black border border-white/15 p-1 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setCurrency('CHF')}
                className={`px-3 py-1 rounded-md text-xs font-black transition-all ${
                  currency === 'CHF'
                    ? 'bg-[#F80404] text-black shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Payer en CHF (Franc Suisse)"
              >
                CHF 🇨🇭
              </button>
              <button
                type="button"
                onClick={() => setCurrency('EUR')}
                className={`px-3 py-1 rounded-md text-xs font-black transition-all ${
                  currency === 'EUR'
                    ? 'bg-[#F80404] text-black shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Payer en EUR (Euro)"
              >
                EUR (€) 🇪🇺
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cart.map(item => (
              <div key={item.itemKey} className="flex items-center gap-3 py-2 border-b border-white/5">
                <div className="relative w-12 h-12 bg-black/40 rounded-lg p-1 shrink-0 border border-white/10 flex items-center justify-center">
                  <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                  <p className="text-[10px] text-white/50">{item.flavor} · Qte: {item.quantity}</p>
                </div>
                <span className="text-xs font-black text-white font-heading">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 text-xs text-white/70 pt-4 border-t border-white/10">
            <div className="flex justify-between">
              <span>{t.common.subtotal} ({currency}) :</span>
              <span className="font-bold text-white">{formatPrice(cartSubtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>{t.common.shipping} ({shippingMethod === 'clickcollect' ? 'Click & Collect Genève' : 'PostPac Priority'}) :</span>
              <span className="font-bold text-white">{shippingCost === 0 ? t.common.free : formatPrice(shippingCost)}</span>
            </div>

            <div className="flex justify-between text-white/40 text-[11px]">
              <span>{t.common.vatIncluded} (2.6% / 8.1%) :</span>
              <span>{formatPrice(vatEst)}</span>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-baseline text-white">
              <span className="text-sm font-black uppercase font-heading">{t.common.total} ({currency}) :</span>
              <span className="text-2xl font-black text-white font-heading">{formatPrice(total)}</span>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full min-h-[52px] px-6 py-4 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-xl hover:shadow-[#F80404]/30 flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{t.checkout.confirmAndPay} ({formatPrice(total)})</span>
            <span>→</span>
          </button>

          <p className="text-[10px] text-white/40 text-center leading-relaxed">
            En validant votre commande, vous acceptez nos CGV et notre politique de confidentialité conforme à la nDSG suisse.
          </p>
        </div>
      </form>
    </div>
  );
}
