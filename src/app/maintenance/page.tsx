'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ShieldCheck, KeyRound, ArrowRight, Sparkles } from 'lucide-react';

export default function MaintenancePage() {
  const [passcode, setPasscode] = useState('');
  const [showUnlock, setShowUnlock] = useState(false);
  const [error, setError] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim().toLowerCase();
    if (clean === 'nutrifit' || clean === 'nutrifitness' || clean === 'marco' || clean === '1201') {
      // Set bypass cookie for 30 days
      document.cookie = 'nf_maintenance_bypass=true; path=/; max-age=2592000; SameSite=Lax';
      window.location.href = '/?preview=active';
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden select-none">
      
      {/* Background ambient red glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F80404]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between z-10 pt-4">
        <div className="relative h-10 w-44">
          <Image
            src="/images/brand/logo.png"
            alt="NutriFitness.ch"
            fill
            className="object-contain object-left filter brightness-110"
            priority
          />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <span>🇨🇭</span>
          <span>Genève · Suisse</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto text-center my-auto py-12 z-10">
        
        {/* Pulsing Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F80404]/10 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-[#F80404] animate-ping" />
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ouverture Officielle Bientôt</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-heading leading-tight mb-4">
          NutriFitness fait <span className="text-[#F80404]">peau neuve</span>
        </h1>

        <p className="text-sm sm:text-base text-white/70 max-w-lg mx-auto leading-relaxed mb-10">
          Notre boutique en ligne finalise ses derniers préparatifs et réglages techniques.
          Nous serons de retour très rapidement avec notre catalogue complet de nutrition sportive !
        </p>

        {/* Physical Store Highlight Box */}
        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-8 text-left shadow-2xl backdrop-blur-md mb-8">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-white/10">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase text-white tracking-wide">
              Notre boutique physique reste 100% ouverte
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs text-white/80">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#F80404] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-bold">Adresse à Genève :</strong>
                <span>Rue des Pâquis 34, 1201 Genève</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#F80404] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-bold">Horaires d&apos;ouverture :</strong>
                <span>Lun – Sam : 10h00 – 19h00</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-bold">Téléphone / WhatsApp :</strong>
                <a href="tel:+41792503564" className="hover:text-white transition-colors">
                  +41 79 250 35 64
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-bold">Email :</strong>
                <a href="mailto:orders@nutrifitness.ch" className="hover:text-white transition-colors">
                  orders@nutrifitness.ch
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Team Unlock Panel */}
        {!showUnlock ? (
          <button
            type="button"
            onClick={() => setShowUnlock(true)}
            className="text-[11px] text-white/40 hover:text-white/80 transition-colors inline-flex items-center gap-1.5 underline decoration-white/20 underline-offset-4"
          >
            <KeyRound className="w-3 h-3" />
            <span>Accès privé équipe / Prévisualisation</span>
          </button>
        ) : (
          <form onSubmit={handleUnlock} className="max-w-xs mx-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 bg-[#1A1A1A] border border-white/20 rounded-2xl p-1.5 focus-within:border-[#F80404] transition-all">
              <input
                type="password"
                placeholder="Code d'accès équipe..."
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(false);
                }}
                autoFocus
                className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#F80404] hover:bg-[#FF3D00] text-black font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 transition-all shrink-0"
              >
                <span>Entrer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {error && (
              <span className="text-[11px] text-[#F80404] mt-1.5 block">
                Code incorrect. Essayez avec le mot de passe équipe.
              </span>
            )}
          </form>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-[11px] text-white/40 py-4 border-t border-white/5 z-10">
        NutriFitness Genève · Scarpantoni Nutrifit (IDE: CHE-177.751.159) · Tous droits réservés.
      </footer>

    </div>
  );
}
