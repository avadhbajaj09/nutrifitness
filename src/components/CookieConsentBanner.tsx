'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getConsent, saveConsent, ConsentPreferences } from '@/lib/analytics';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);
  const [marketingAllowed, setMarketingAllowed] = useState(false);

  useEffect(() => {
    // Check if consent cookie already exists
    const current = getConsent();
    if (!current) {
      setIsVisible(true);
    } else {
      setAnalyticsAllowed(current.analytics);
      setMarketingAllowed(current.marketing);
    }

    // Listen for manual reopen trigger from footer or other links
    const handleReopen = () => {
      const existing = getConsent();
      if (existing) {
        setAnalyticsAllowed(existing.analytics);
        setMarketingAllowed(existing.marketing);
      }
      setIsVisible(true);
      setIsCustomizing(true);
    };

    window.addEventListener('openCookieConsent', handleReopen);
    return () => {
      window.removeEventListener('openCookieConsent', handleReopen);
    };
  }, []);

  const handleAcceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    setIsVisible(false);
    setIsCustomizing(false);
  };

  const handleRejectAll = () => {
    saveConsent({ analytics: false, marketing: false });
    setIsVisible(false);
    setIsCustomizing(false);
  };

  const handleSaveCustom = () => {
    saveConsent({ analytics: analyticsAllowed, marketing: marketingAllowed });
    setIsVisible(false);
    setIsCustomizing(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Gestion des cookies"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-[#0E0E0E]/95 backdrop-blur-md border-t border-white/15 text-white shadow-2xl transition-all duration-300"
    >
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Top Info Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F80404]/10 border border-[#F80404]/30 flex items-center justify-center shrink-0 text-[#F80404]">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase text-white font-heading">
                Respect de votre vie privée & Cookies (nDSG Suisse)
              </h3>
              <p className="text-xs text-white/70 leading-relaxed max-w-3xl">
                NutriFitness utilise des cookies nécessaires au fonctionnement de la boutique et de votre panier d&apos;achat. Avec votre accord, nous utilisons également des cookies de mesure d&apos;audience pour améliorer votre expérience d&apos;achat en Suisse.{' '}
                <Link
                  href="/cookies/"
                  className="text-[#F80404] hover:underline font-semibold inline-flex items-center gap-1"
                >
                  En savoir plus
                </Link>
              </p>
            </div>
          </div>

          {/* Action Buttons (Accept, Reject, Customize) */}
          {!isCustomizing && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleRejectAll}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-all border border-white/10 focus-visible:ring-2 focus-visible:ring-white"
              >
                Tout refuser
              </button>
              <button
                type="button"
                onClick={() => setIsCustomizing(true)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/80 transition-all border border-white/10 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-white"
              >
                <Settings className="w-3.5 h-3.5 text-white/60" />
                Personnaliser
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-5 py-2.5 rounded-xl bg-[#F80404] hover:bg-[#FF3D00] text-xs font-black uppercase tracking-wider text-black transition-all shadow-md focus-visible:ring-2 focus-visible:ring-white"
              >
                Tout accepter
              </button>
            </div>
          )}
        </div>

        {/* Customization Drawer */}
        {isCustomizing && (
          <div className="pt-4 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Necessary (Always on) */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Techniques & Panier</span>
                  <span className="text-[10px] font-black uppercase text-[#95d600] px-2 py-0.5 rounded bg-[#95d600]/10 border border-[#95d600]/20">
                    Obligatoire
                  </span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Indispensables pour mémoriser votre panier, votre sélection de devise (CHF/EUR) et sécuriser vos commandes.
                </p>
              </div>

              {/* Analytics */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Mesure d&apos;audience</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsAllowed}
                      onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F80404]" />
                  </label>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Statistiques anonymisées sur l&apos;utilisation du site pour optimiser les performances de notre catalogue.
                </p>
              </div>

              {/* Marketing */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Personnalisation</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketingAllowed}
                      onChange={(e) => setMarketingAllowed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F80404]" />
                  </label>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Permet d&apos;adapter nos recommandations de compléments selon vos objectifs d&apos;entraînement.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleRejectAll}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-all border border-white/10"
              >
                Tout refuser
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-5 py-2 rounded-xl bg-[#F80404] hover:bg-[#FF3D00] text-xs font-black uppercase tracking-wider text-black transition-all shadow-md"
              >
                Enregistrer mes choix
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
