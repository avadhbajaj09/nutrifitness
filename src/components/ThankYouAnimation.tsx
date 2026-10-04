'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Check, Package, Truck, Home, Sparkles, Printer, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface ThankYouAnimationProps {
  orderNumber: string;
  totalFormatted: string;
  paymentMethod: string;
  shippingMethod: string;
  customerEmail: string;
}

export default function ThankYouAnimation({
  orderNumber,
  totalFormatted,
  paymentMethod,
  shippingMethod,
  customerEmail,
}: ThankYouAnimationProps) {
  const { t, locale, currency } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particlesActive, setParticlesActive] = useState(true);

  // Confetti Particle Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#F80404', '#FFD700', '#10B981', '#FFFFFF', '#FF3D00', '#38BDF8'];
    const particleCount = 120;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotSpeed: number;
      opacity: number;
      shape: 'rect' | 'circle' | 'ribbon';
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 3 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 9 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        shape: Math.random() > 0.5 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'ribbon',
      });
    }

    let startTime = Date.now();

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const elapsed = Date.now() - startTime;

      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.vx *= 0.985; // Air resistance
        p.rotation += p.rotSpeed;

        if (elapsed > 2500) {
          p.opacity = Math.max(0, p.opacity - 0.008);
        }

        if (p.opacity > 0 && p.y < height + 50) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
          } else if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size * 1.8, p.size / 2);
          }

          ctx.restore();
        }
      }

      if (alive) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        setParticlesActive(false);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const triggerConfettiAgain = () => {
    setParticlesActive(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    const colors = ['#F80404', '#FFD700', '#10B981', '#FFFFFF', '#FF3D00', '#38BDF8'];
    const particles: any[] = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: width / 2,
        y: height / 2.5,
        vx: (Math.random() - 0.5) * 20,
        vy: -Math.random() * 15 - 5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: 'rect',
      });
    }
    const startTime = Date.now();
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = false;
      const elapsed = Date.now() - startTime;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.38;
        p.rotation += p.rotSpeed;
        if (elapsed > 2000) p.opacity = Math.max(0, p.opacity - 0.015);
        if (p.opacity > 0 && p.y < height + 50) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
          ctx.restore();
        }
      }
      if (alive) requestAnimationFrame(render);
    };
    render();
  };

  const paymentLabels: Record<string, string> = {
    twint: 'TWINT Suisse (Instantané)',
    postfinance: 'PostFinance Card / E-Finance',
    card: 'Carte Bancaire Sécurisée (3D Secure)',
    invoice: 'Facture QR Suisse (Paiement 30 jours)',
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center py-10 px-4">
      {/* Background Interactive Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      <div className="max-w-2xl w-full bg-[#141414] border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center z-10 animate-in zoom-in-95 duration-300">
        
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#F80404]/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Animated Checkmark Badge */}
        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
          {/* Pulsing rings */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
          <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-emerald-500/30 to-[#F80404]/30 animate-spin duration-1000" />
          
          {/* Center glowing circle */}
          <div className="relative w-20 h-20 rounded-full bg-[#181818] border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30">
            <Check className="w-10 h-10 stroke-[3] animate-in zoom-in duration-300" />
          </div>
        </div>

        {/* Celebration pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F80404]/10 border border-[#F80404]/30 text-[#F80404] text-[11px] font-black uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.checkout.celebrationBadge}</span>
        </div>

        {/* Success Headings */}
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading mb-2">
          {t.checkout.thankYouTitle}
        </h1>
        <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto mb-6 leading-relaxed">
          {t.checkout.thankYouMessage}
        </p>

        {/* Interactive Delivery Tracker Timeline */}
        <div className="bg-[#1C1C1C] border border-white/10 rounded-2xl p-5 mb-6 text-left">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F80404]" />
              {t.checkout.estimatedDelivery}
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full">
              PostPac Priority 24h
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 relative">
            {/* Horizontal progress bar */}
            <div className="absolute top-4 left-4 right-4 h-1 bg-white/10 -z-0">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-[#F80404] w-1/3 rounded-full" />
            </div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-xs shadow-md">
                ✓
              </div>
              <span className="text-[10px] font-bold text-white mt-1.5 leading-tight">{t.checkout.stepOrderPlaced}</span>
              <span className="text-[9px] text-emerald-400 font-medium">Validé</span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-[#F80404] text-black flex items-center justify-center font-bold text-xs shadow-md animate-pulse">
                <Package className="w-4 h-4 text-black" />
              </div>
              <span className="text-[10px] font-bold text-white mt-1.5 leading-tight">{t.checkout.stepPreparing}</span>
              <span className="text-[9px] text-[#F80404] font-medium">En cours</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white/50 flex items-center justify-center font-bold text-xs">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-white/50 mt-1.5 leading-tight">{t.checkout.stepShipping}</span>
              <span className="text-[9px] text-white/30 font-medium">Demain</span>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white/50 flex items-center justify-center font-bold text-xs">
                <Home className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-white/50 mt-1.5 leading-tight">{t.checkout.stepDelivered}</span>
              <span className="text-[9px] text-white/30 font-medium">Sous 24h</span>
            </div>
          </div>
        </div>

        {/* Order Details Voucher Card */}
        <div className="bg-black/60 border border-white/10 rounded-2xl p-5 mb-6 text-xs text-left space-y-2.5">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-white/60">{t.checkout.orderNumber} :</span>
            <span className="font-black text-white font-mono text-sm tracking-wider bg-white/10 px-2 py-0.5 rounded">
              {orderNumber}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/60">Montant réglé ({currency}) :</span>
            <span className="font-black text-white font-heading text-base text-[#F80404]">
              {totalFormatted}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/60">{t.checkout.paymentMode} :</span>
            <span className="font-bold text-white">
              {paymentLabels[paymentMethod] || 'Paiement Sécurisé'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/60">Mode d'expédition :</span>
            <span className="font-bold text-white">
              {shippingMethod === 'clickcollect' ? '📍 Retrait Boutique Genève (Pâquis)' : '⚡ PostPac Priority 24h (La Poste Suisse)'}
            </span>
          </div>

          {customerEmail && (
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-white/60">Confirmation envoyée à :</span>
              <span className="font-mono text-white/90 truncate max-w-[240px]">{customerEmail}</span>
            </div>
          )}
        </div>

        {/* Origin and Trust Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-white/60 mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t.checkout.dispatchedFrom}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 min-h-[48px] px-6 py-3.5 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase text-xs rounded-xl transition-all shadow-xl hover:shadow-[#F80404]/30 flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{t.checkout.returnHome}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[48px] px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-white/70" />
            <span>Imprimer</span>
          </button>

          <button
            type="button"
            onClick={triggerConfettiAgain}
            className="min-h-[48px] px-4 py-3.5 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white font-bold text-xs rounded-xl border border-white/10 flex items-center justify-center transition-colors"
            title="Rejouer l'animation de fête"
          >
            🎉
          </button>
        </div>
      </div>
    </div>
  );
}
