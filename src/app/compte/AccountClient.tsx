'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Package, MapPin, CreditCard, Shield, LogOut, CheckCircle2, Truck, Clock } from 'lucide-react';
import { formatChf } from '@/lib/tax';

export default function AccountClient() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'addresses' | 'security'>('dashboard');

  const mockOrders = [
    {
      id: 'NF-2026-8941',
      date: '02 Octobre 2026',
      total: 119.80,
      status: 'Expédié (PostPac Priority)',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      tracking: '99.00.123456.78901234',
      items: [
        { name: 'BigMan Ultimate Whey Isolate 2kg - Chocolat Suisse', qty: 1, price: 74.90 },
        { name: 'Créatine Creapure® Monohydrate 500g', qty: 1, price: 44.90 }
      ]
    },
    {
      id: 'NF-2026-7812',
      date: '14 Septembre 2026',
      total: 54.90,
      status: 'Retiré en Boutique Genève',
      statusColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      tracking: 'Click & Collect Rue des Pâquis',
      items: [
        { name: 'Pre-Workout Rush Extreme 300g - Citron Givré', qty: 1, price: 54.90 }
      ]
    }
  ];

  return (
    <div className="py-6">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="text-xs text-white/50 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-white font-medium">Mon Espace Client</span>
      </nav>

      {/* Account Header */}
      <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#F80404]/10 border border-[#F80404]/30 flex items-center justify-center text-[#F80404] text-xl font-black">
            NF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase font-heading">
                Espace Athlète
              </h1>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#F80404] text-black">
                VIP Club -10%
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/60 mt-0.5">client@nutrifitness.ch • Membre depuis 2026</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/boutique/"
            className="px-5 py-2.5 bg-[#F80404] hover:bg-[#FF3D00] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
          >
            Nouvelle commande
          </Link>
        </div>
      </div>

      {/* Main 2-Column Tabs & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-[#141414] rounded-2xl border border-white/10 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'dashboard'
                ? 'bg-[#F80404] text-black font-black'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Tableau de bord
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'orders'
                ? 'bg-[#F80404] text-black font-black'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            Mes commandes ({mockOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'addresses'
                ? 'bg-[#F80404] text-black font-black'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Adresses suisses
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'security'
                ? 'bg-[#F80404] text-black font-black'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            Protection & Données nDSG
          </button>
        </div>

        {/* Tab Content Panel (8 cols) */}
        <div className="lg:col-span-8 bg-[#141414] rounded-2xl border border-white/10 p-6 sm:p-8">
          
          {/* 1. DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase text-white font-heading">
                Vue d'ensemble de votre compte
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-[10px] text-white/50 uppercase font-black tracking-wider block mb-1">Points Fidélité</span>
                  <p className="text-2xl font-black text-[#F80404]">340 pts</p>
                  <span className="text-[11px] text-white/60">Équivalent 17.00 CHF</span>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-[10px] text-white/50 uppercase font-black tracking-wider block mb-1">Livraison Gratuite</span>
                  <p className="text-2xl font-black text-emerald-400">Dès 75 CHF</p>
                  <span className="text-[11px] text-white/60">PostPac Priority Suisse</span>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-[10px] text-white/50 uppercase font-black tracking-wider block mb-1">Retrait Express</span>
                  <p className="text-2xl font-black text-white">Genève 2h</p>
                  <span className="text-[11px] text-white/60">34 Rue des Pâquis</span>
                </div>
              </div>

              {/* Latest Order Summary */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase text-white">Dernière commande active</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-[#F80404] hover:underline font-bold">
                    Voir toutes
                  </button>
                </div>
                <div className="p-4 bg-[#181818] rounded-xl border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-white/60 block">{mockOrders[0].id}</span>
                      <p className="text-xs text-white/40">{mockOrders[0].date}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mockOrders[0].statusColor}`}>
                      {mockOrders[0].status}
                    </span>
                  </div>
                  <div className="text-xs text-white/80 space-y-1">
                    {mockOrders[0].items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="truncate max-w-[280px]">{item.qty}x {item.name}</span>
                        <span className="font-bold">{formatChf(item.price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs">
                    <span className="text-white/60">Numéro de suivi : <span className="font-mono text-white">{mockOrders[0].tracking}</span></span>
                    <span className="font-black text-white">{formatChf(mockOrders[0].total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase text-white font-heading">
                Historique des commandes
              </h2>
              <div className="space-y-4">
                {mockOrders.map(order => (
                  <div key={order.id} className="p-5 bg-black/40 rounded-xl border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white font-mono">{order.id}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${order.statusColor}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 mt-0.5">{order.date}</p>
                      </div>
                      <span className="text-base font-black text-white">{formatChf(order.total)}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex justify-between items-center text-white/80">
                          <span>{it.qty} × {it.name}</span>
                          <span className="font-bold text-white">{formatChf(it.price)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-white/60">
                      <span>Suivi: <span className="text-white font-mono">{order.tracking}</span></span>
                      <button className="text-[#F80404] hover:underline font-bold self-start sm:self-auto">
                        Télécharger la facture QR (PDF)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black uppercase text-white font-heading">
                  Adresses de livraison en Suisse
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Default Address */}
                <div className="p-5 bg-black/40 rounded-xl border border-[#F80404]/40 relative">
                  <span className="absolute top-4 right-4 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#F80404]/20 text-[#F80404] border border-[#F80404]/30">
                    Par défaut
                  </span>
                  <p className="text-xs font-black uppercase text-white mb-2">Adresse Principale</p>
                  <p className="text-sm font-bold text-white">Athlète NutriFitness</p>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Rue du Rhône 42<br />
                    1204 Genève (GE)<br />
                    Suisse
                  </p>
                  <p className="text-xs text-white/50 mt-3">Tél : +41 79 123 45 67</p>
                </div>

                {/* Geneva Click & Collect Hub */}
                <div className="p-5 bg-black/40 rounded-xl border border-white/10">
                  <p className="text-xs font-black uppercase text-white/60 mb-2">Point de Retrait Préféré</p>
                  <p className="text-sm font-bold text-white">Boutique NutriFitness Genève</p>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    34 Rue des Pâquis<br />
                    1201 Genève<br />
                    Retrait express gratuit en 2h
                  </p>
                  <p className="text-xs text-emerald-400 mt-3 font-bold">✓ Ouvert Lun-Sam 10h-19h</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. SECURITY & nDSG */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase text-white font-heading">
                Confidentialité & Données nDSG Suisse
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Conformément à la nouvelle loi fédérale sur la protection des données (nDSG suisse), vos données personnelles et historiques de commande sont hébergées dans un centre de données sécurisé et ne sont jamais revendues à des tiers.
              </p>

              <div className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Données conformes nDSG Suisse & RGPD
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Paiement sécurisé tokenisé (TWINT / Stripe / PostFinance)
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Aucune traceur publicitaire intrusif par défaut
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap gap-4">
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors">
                  Exporter mes données personnelles
                </button>
                <button className="px-4 py-2 bg-red-950/40 hover:bg-red-950/80 text-red-400 text-xs font-bold rounded-lg border border-red-500/20 transition-colors">
                  Demander la suppression du compte
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
