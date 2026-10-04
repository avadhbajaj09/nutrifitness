'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { 
  BookOpen, 
  CheckCircle2, 
  Download, 
  Zap, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  Star, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Lock 
} from 'lucide-react';
import { formatChf } from '@/lib/tax';

const ebookItem = {
  id: 'prod-25430',
  slug: { fr: 'le-guide-ultime-des-complements' },
  name: { fr: 'Le Guide Ultime des Compléments Alimentaires (Ebook PDF)' },
  brand: 'NutriFitness',
  categorySlug: 'guides-ebooks',
  priceChf: 29.90,
  price: 29.90,
  taxCategory: 'standard' as const,
  images: [{ src: '/images/banners/mobile/imgi_10_guidebook.jpg', alt: { fr: 'Guide Ultime' }, width: 800, height: 1000 }]
};

export default function EbookClient() {
  const router = useRouter();
  const { addToCart, openCart, formatPrice } = useStore();

  const handleInstantBuy = () => {
    addToCart(ebookItem, { quantity: 1, flavor: 'Format PDF Téléchargeable' });
    openCart();
  };

  const handleDirectCheckout = () => {
    addToCart(ebookItem, { quantity: 1, flavor: 'Format PDF Téléchargeable' });
    router.push('/commande/');
  };

  const chapters = [
    { title: 'Les Fondations & Principes Clés', desc: 'Comprendre la biodisponibilité, le timing des prises et comment éviter les pièges industriels.' },
    { title: 'Les Protéines en Détail', desc: 'Whey concentrée, Isolat CFM, Caséine micellaire, Protéines de bœuf et végétales : laquelle choisir selon vos besoins.' },
    { title: 'La Créatine Démystifiée', desc: 'Monohydrate vs autres formes, Creapure®, charge ou continu, rétention d\'eau et vérités scientifiques.' },
    { title: 'Acides Aminés : EAA vs BCAA', desc: 'Ce que la science dit réellement sur la synthèse protéique, la leucine et la glutamine.' },
    { title: 'Brûleurs de Graisses & Thermogéniques', desc: 'Ce qui fonctionne vraiment (carnitine, caféine, synéphrine) versus le gaspillage d\'argent.' },
    { title: 'Vitamines & Minéraux Essentiels', desc: 'Magnésium bisglycinate, Vitamine D3/K2, Zinc picolinate, Oméga-3 haute concentration EPA/DHA.' },
    { title: 'Erreurs Courantes & Gaspillages', desc: 'Les 10 erreurs qui vident votre portefeuille sans vous apporter le moindre gramme de muscle.' }
  ];

  return (
    <div className="bg-[#2D2D2D] text-white min-h-screen py-6 px-4 sm:px-6 rounded-3xl -mx-4 sm:-mx-6">
      
      {/* Breadcrumbs */}
      <nav aria-label="Fil d'Ariane" className="max-w-5xl mx-auto text-xs text-white/50 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-[#95d600] font-medium">Guide des Compléments Alimentaires</span>
      </nav>

      <div className="max-w-5xl mx-auto">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16 pb-12 border-b border-white/10">
          
          {/* Left Column: Sales Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#95d600]/15 border border-[#95d600]/40 text-[#95d600] text-xs font-black uppercase tracking-wider font-heading">
              <BookOpen className="w-3.5 h-3.5" />
              Ebook PDF · 66 Pages D'Expertise Pure
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-heading leading-tight">
              Le Guide Ultime des <span className="text-[#95d600]">Compléments</span>
            </h1>

            <p className="text-base sm:text-xl font-bold text-white/90 leading-snug">
              11 ans d'expérience. Conseils pratiques. Ce qui marche vraiment, sans bla-bla marketing.
            </p>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Marre de dépenser des fortunes dans des poudres inutiles ? Ce guide de 66 pages est le fruit de 11 ans d'analyses, d'essais terrain et de gestion d'une boutique de nutrition à Genève. Tout y est décrypté avec franchise, clarté et précision scientifique.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 py-2">
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-center">
                <span className="text-xl sm:text-2xl font-black text-[#95d600] font-heading block">66</span>
                <span className="text-[11px] text-white/60">Pages Pratiques</span>
              </div>
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-center">
                <span className="text-xl sm:text-2xl font-black text-[#95d600] font-heading block">11 Ans</span>
                <span className="text-[11px] text-white/60">D'Expérience Terrain</span>
              </div>
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-center">
                <span className="text-xl sm:text-2xl font-black text-[#95d600] font-heading block">100%</span>
                <span className="text-[11px] text-white/60">Sans Marketing</span>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="p-6 bg-black/40 rounded-2xl border border-[#95d600]/30 space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#95d600] font-heading">
                  {formatPrice(29.90)}
                </span>
                <span className="text-sm text-white/40 line-through">
                  {formatPrice(49.90)}
                </span>
                <span className="ml-auto text-xs font-bold text-black bg-[#95d600] px-2.5 py-0.5 rounded-full uppercase">
                  Accès Immédiat
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleDirectCheckout}
                  className="flex-1 py-4 px-6 bg-[#95d600] hover:bg-[#85c000] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-xl hover:shadow-[#95d600]/25 flex items-center justify-center gap-2 active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger le guide maintenant (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={handleInstantBuy}
                  className="py-4 px-6 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all border border-white/10"
                >
                  Ajouter au Panier
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-white/60 pt-2 border-t border-white/10 gap-2">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#95d600]" />
                  Paiement 100% sécurisé (TWINT, Carte)
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#95d600]" />
                  Téléchargement PDF immédiat après commande
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Ebook Visual Mockup */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[360px] aspect-[4/5] rounded-3xl overflow-hidden border-2 border-[#95d600]/40 shadow-2xl shadow-[#95d600]/10 bg-black/60 group">
              <Image
                src="/images/banners/mobile/imgi_10_guidebook.jpg"
                alt="Couverture du Guide Ultime des Compléments Alimentaires"
                fill
                priority
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-[#95d600]/50 text-[#95d600] text-[10px] font-black uppercase px-3 py-1 rounded-full">
                Édition Numérique
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-[#95d600]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#95d600]" />
              ))}
              <span className="text-xs text-white/80 font-bold ml-2">4.9 / 5 (Avis lecteurs vérifiés)</span>
            </div>
          </div>
        </div>

        {/* 3 Core Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 bg-black/30 rounded-2xl border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#95d600]/10 border border-[#95d600]/30 flex items-center justify-center text-[#95d600] mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase text-white font-heading">Conseils Honnêtes, Zéro Marketing</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Aucun sponsor de marque, aucun lien affilié caché. Uniquement la réalité scientifique et ce qui produit des résultats concrets.
            </p>
          </div>

          <div className="p-6 bg-black/30 rounded-2xl border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#95d600]/10 border border-[#95d600]/30 flex items-center justify-center text-[#95d600] mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase text-white font-heading">Recommandations Éprouvées</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Des protocoles testés et validés auprès de centaines d'athlètes et pratiquants en salle et en compétition.
            </p>
          </div>

          <div className="p-6 bg-black/30 rounded-2xl border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#95d600]/10 border border-[#95d600]/30 flex items-center justify-center text-[#95d600] mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase text-white font-heading">Adapté à Tous Vos Objectifs</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Que vous cherchiez à prendre du muscle, perdre du gras, exploser votre force ou optimiser votre santé quotidienne.
            </p>
          </div>
        </div>

        {/* Pain Points: "Vous reconnaissez-vous ?" */}
        <div className="bg-black/40 rounded-3xl border border-white/10 p-8 sm:p-10 mb-16">
          <div className="text-center max-w-xl mx-auto mb-8">
            <p className="text-xs font-black uppercase tracking-widest text-[#95d600] mb-1 font-heading">
              Le Constat
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
              Vous Reconnaissez-Vous ?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <span className="text-xl">😵‍💫</span>
              <h4 className="text-xs font-bold text-white uppercase">Trop de choix, trop de marques</h4>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Des centaines de pots au design agressif sans savoir lesquels sont réellement efficaces.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <span className="text-xl">🚫</span>
              <h4 className="text-xs font-bold text-white uppercase">Produits Inefficaces</h4>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Des formules sous-dosées avec des mélanges propriétaires brevetés qui masquent le vide.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <span className="text-xl">💸</span>
              <h4 className="text-xs font-bold text-white uppercase">Argent Gaspillé</h4>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Des centaines de francs jetés chaque mois dans des poudres qui ne changent rien à votre physique.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <span className="text-xl">📉</span>
              <h4 className="text-xs font-bold text-white uppercase">Aucun Résultat Réel</h4>
              <p className="text-[11px] text-white/60 leading-relaxed">
                La sensation de stagner malgré des efforts constants à l'entraînement et à la table.
              </p>
            </div>
          </div>
        </div>

        {/* Founder Story / Transformation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-black/50 rounded-3xl border border-[#95d600]/30 p-8 sm:p-12 mb-16">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-[#95d600] font-heading">
              L'Histoire Derrière le Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
              Ma Transformation : De 54 kg à 88 kg
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              « À 21 ans, je pesais <strong>54 kg pour 1m97</strong>. Grâce à l'entraînement, la nutrition et les bons compléments, je suis passé de 54 à 88 kg de muscle sec. Aujourd'hui, j'aide des centaines de personnes à atteindre leurs objectifs. »
            </p>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              « Je suis propriétaire d'un magasin de compléments alimentaires depuis le <strong>15 avril 2015</strong>. Mais mon histoire avec la musculation a commencé bien avant cela. Au début, j'ai fait toutes les erreurs imaginables : j'ai pris ce que les vendeurs me conseillaient, j'ai cru au marketing outrancier, j'ai testé tous les produits à la mode. Très vite, j'ai voulu comprendre pourquoi certaines formules fonctionnaient et d'autres non. Cette passion de la rigueur ne m'a plus jamais quitté. »
            </p>
          </div>

          <div className="lg:col-span-4 p-6 bg-black/60 rounded-2xl border border-white/10 text-center space-y-3">
            <span className="text-3xl font-black text-[#95d600] font-heading block">+34 kg</span>
            <p className="text-xs font-bold text-white uppercase">De Muscle Sec Pris Naturellement</p>
            <p className="text-[11px] text-white/50">
              Sans produits dopants, uniquement avec les bases, le bon timing et les bons compléments.
            </p>
          </div>
        </div>

        {/* What You Will Discover (Chapters Breakdown) */}
        <div className="mb-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="text-xs font-black uppercase tracking-widest text-[#95d600] mb-1 font-heading">
              Au Sommaire des 66 Pages
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
              Ce Que Vous Allez Découvrir
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapters.map((ch, idx) => (
              <div key={idx} className="p-5 bg-black/30 rounded-2xl border border-white/10 space-y-1.5 hover:border-[#95d600]/40 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#95d600] font-heading">Chapitre {idx + 1}</span>
                  <span className="text-white/30 text-xs">·</span>
                  <h4 className="text-xs font-bold text-white uppercase font-heading">{ch.title}</h4>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">{ch.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Confronting Reality Box */}
        <div className="bg-gradient-to-r from-black via-[#1E1E1E] to-black rounded-3xl border border-[#95d600]/40 p-8 sm:p-12 text-center max-w-3xl mx-auto mb-16 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-[#95d600] mx-auto mb-4" />
          <h2 className="text-xl sm:text-3xl font-black uppercase text-white font-heading leading-tight mb-4">
            Combien d'Argent Avez-Vous Déjà Perdu en Compléments Inutiles ?
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-6">
            Vous achetez au hasard ? Vous croyez les influenceurs sponsorisés ? Vous gaspillez votre argent inutilement.<br />
            <strong>Le problème n'est pas votre entraînement. Le problème est ce que vous croyez savoir.</strong>
          </p>

          <p className="text-sm sm:text-base font-black uppercase tracking-wider text-[#95d600] font-heading mb-8">
            Prenez le contrôle de votre santé et atteignez enfin vos objectifs.
          </p>

          <button
            type="button"
            onClick={handleDirectCheckout}
            className="w-full sm:w-auto px-10 py-4 bg-[#95d600] hover:bg-[#85c000] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-xl hover:shadow-[#95d600]/30 active:scale-95 inline-flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger le guide maintenant – {formatChf(29.90)}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
