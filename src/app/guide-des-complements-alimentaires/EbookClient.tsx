'use client';

import React, { useState } from 'react';
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
  Lock,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { formatChf } from '@/lib/tax';
import { getProductReviewStats } from '@/lib/reviews';

const ebookItem = {
  id: 'prod-25430',
  slug: { fr: 'le-guide-ultime-des-complements' },
  name: { fr: 'Le Guide Ultime des Compléments Alimentaires (Ebook PDF)' },
  brand: 'NutriFitness',
  categorySlug: 'guides-ebooks',
  priceChf: 29.90,
  price: 29.90,
  taxCategory: 'standard' as const,
  images: [{ src: '/images/store/e-book.webp', alt: { fr: 'Le Guide Ultime des Compléments Alimentaires - Ebook 66 Pages' }, width: 800, height: 1000 }]
};

export default function EbookClient() {
  const router = useRouter();
  const { addToCart, openCart, formatPrice } = useStore();
  const reviewStats = getProductReviewStats(ebookItem.id, ebookItem.categorySlug);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleInstantBuy = () => {
    addToCart(ebookItem, { quantity: 1, flavor: 'Format PDF Téléchargeable' });
    openCart();
  };

  const handleDirectCheckout = () => {
    addToCart(ebookItem, { quantity: 1, flavor: 'Format PDF Téléchargeable' });
    router.push('/commande/');
  };

  const chapters = [
    { title: '1. Les Fondations Essentielles', desc: 'Comprendre la biodisponibilité, le timing des prises et comment éviter les pièges industriels.' },
    { title: '2. Protéines (Whey, Isolat CFM, Caséine...)', desc: 'Whey concentrée, Isolat CFM natif, Caséine micellaire et protéines végétales bio : laquelle choisir selon vos besoins réels.' },
    { title: '3. Créatine Démystifiée', desc: 'Monohydrate micronisée 200 mesh vs Creapure®, protocole de prise, rétention intracellulaire et vérités scientifiques.' },
    { title: '4. Acides Aminés (EAAs, BCAAs, Glutamine)', desc: 'Ce que la science dit réellement sur la synthèse protéique, le seuil de leucine et l\'inutilité des mélanges surdosés.' },
    { title: '5. Brûleurs de Graisses & Thermogéniques', desc: 'Ce qui fonctionne cliniquement pour la sèche versus les stimulants dangereux et le gaspillage d\'argent.' },
    { title: '6. Vitamines & Minéraux Essentiels', desc: 'Magnésium bisglycinate chélaté, Vitamine D3/K2, Zinc picolinate, Oméga-3 haute concentration EPA/DHA.' },
    { title: '7. Les 10 Erreurs Courantes à Éviter', desc: 'Les pièges marketing qui vident inutilement votre portefeuille sans vous apporter le moindre gramme de muscle.' }
  ];

  const ebookFaqs = [
    {
      q: 'Sous quel format et dans quel délai le guide est-il délivré ?',
      a: 'Le guide est délivré instantanément au format numérique PDF haute définition dès la confirmation de votre commande. Vous recevez un lien de téléchargement direct par e-mail et sur la page de confirmation, lisible sur tous vos écrans (smartphone, tablette, Mac, PC).'
    },
    {
      q: 'Le contenu est-il adapté aux débutants ou aux sportifs avancés ?',
      a: 'Le guide a été conçu pour être simple, clair et progressif. Que vous débutiez la musculation ou que vous ayez des années de pratique, vous y trouverez les dosages précis, les critères de choix d\'étiquettes et les protocoles adaptés à chaque objectif (prise de muscle, perte de poids, santé).'
    },
    {
      q: 'Y a-t-il des marques ou des placements de produits sponsorisés dans le guide ?',
      a: 'Absolument aucun. Le guide est 100 % indépendant et basé sur 11 ans d\'expérience de terrain et la littérature scientifique. L\'auteur ne perçoit aucune commission de marque : les conseils sont francs, honnêtes et sans langue de bois.'
    },
    {
      q: 'Quels moyens de paiement sont acceptés ?',
      a: 'Vous pouvez régler en toute sécurité en Francs Suisses (CHF) via TWINT, PostFinance, cartes bancaires (Visa, Mastercard) et Apple Pay avec chiffrement bancaire SSL 256 bits.'
    }
  ];

  return (
    <div className="bg-[#1c1c1c] text-white min-h-screen py-6 px-4 sm:px-6 rounded-3xl -mx-4 sm:-mx-6">
      
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
              11 Ans d&apos;Expérience · Guide Pratique · 66 Pages
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-heading leading-tight">
              Le Guide Ultime des <span className="text-[#95d600]">Compléments</span>
            </h1>

            <p className="text-base sm:text-xl font-bold text-white/95 leading-snug">
              11 ans d&apos;expérience. Conseils pratiques. Ce qui marche vraiment, sans aucun bla-bla marketing.
            </p>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Simple, clair et directement applicable. Découvrez quels compléments sont réellement utiles, les doses exactes et comment économiser votre argent en évitant les arnaques de l&apos;industrie.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 py-2">
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                <span className="text-xl sm:text-2xl font-black text-[#95d600] font-heading block">66</span>
                <span className="text-[11px] text-white/60">Pages Synthétiques</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                <span className="text-xl sm:text-2xl font-black text-[#95d600] font-heading block">11 Ans</span>
                <span className="text-[11px] text-white/60">D&apos;Expérience Terrain</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                <span className="text-xl sm:text-2xl font-black text-[#95d600] font-heading block">100%</span>
                <span className="text-[11px] text-white/60">Sans Marketing</span>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="p-6 bg-black/50 rounded-2xl border border-[#95d600]/30 space-y-4">
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
                  Paiement 100% sécurisé (TWINT, PostFinance, CB)
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#95d600]" />
                  Téléchargement PDF immédiat
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Ebook Official Product Packshot */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[340px] aspect-[3/4] rounded-3xl overflow-hidden border-2 border-[#95d600]/40 shadow-2xl shadow-[#95d600]/15 bg-black/80 group">
              <Image
                src="/images/store/livre.webp"
                alt="Couverture officielle du Guide Ultime des Compléments Alimentaires NutriFitness"
                fill
                priority
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-[#95d600]/50 text-[#95d600] text-[10px] font-black uppercase px-3 py-1 rounded-full">
                Édition 66 Pages
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-[#95d600]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#95d600]" />
              ))}
              <span className="text-xs text-white/80 font-bold ml-2">
                4.9 / 5 (120+ avis lecteurs vérifiés)
              </span>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 bg-black/40 rounded-2xl border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#95d600]/10 border border-[#95d600]/30 flex items-center justify-center text-[#95d600] mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase text-white font-heading">Conseils Honnêtes, Zéro Marketing</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Aucun sponsor de marque, aucun lien affilié caché. Uniquement la réalité scientifique et ce qui produit des résultats concrets.
            </p>
          </div>

          <div className="p-6 bg-black/40 rounded-2xl border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#95d600]/10 border border-[#95d600]/30 flex items-center justify-center text-[#95d600] mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase text-white font-heading">Recommandations Éprouvées</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Des protocoles testés et validés auprès de centaines d&apos;athlètes et pratiquants en salle et en compétition.
            </p>
          </div>

          <div className="p-6 bg-black/40 rounded-2xl border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#95d600]/10 border border-[#95d600]/30 flex items-center justify-center text-[#95d600] mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase text-white font-heading">Adapté à Tous Vos Objectifs</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Que vous cherchiez à prendre du muscle sec, perdre du gras, exploser votre force ou optimiser votre santé quotidienne.
            </p>
          </div>
        </div>

        {/* Pain Points: "Vous reconnaissez-vous ?" & Wasted Money */}
        <div className="bg-black/50 rounded-3xl border border-white/10 p-8 sm:p-10 mb-16">
          <div className="text-center max-w-xl mx-auto mb-8">
            <p className="text-xs font-black uppercase tracking-widest text-[#95d600] mb-1 font-heading">
              Le Constat
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
              Vous Reconnaissez-Vous ?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-2xl">😵‍💫</span>
              <h4 className="text-xs font-bold text-white uppercase font-heading">Trop de choix, trop de marques</h4>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Des centaines de pots au design agressif sans savoir lesquels sont réellement efficaces.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-2xl">🚫</span>
              <h4 className="text-xs font-bold text-white uppercase font-heading">Produits Inefficaces</h4>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Des formules sous-dosées avec des mélanges propriétaires brevetés qui masquent le vide.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-2xl">💸</span>
              <h4 className="text-xs font-bold text-white uppercase font-heading">Argent Perdu</h4>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Des centaines de francs jetés chaque mois dans des poudres qui ne changent rien à votre physique.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-2xl">📉</span>
              <h4 className="text-xs font-bold text-white uppercase font-heading">Aucun Résultat</h4>
              <p className="text-[11px] text-white/60 leading-relaxed">
                La sensation de stagner malgré des efforts constants à l&apos;entraînement et à la table.
              </p>
            </div>
          </div>

          {/* Callout: Combient d'argent avez-vous déjà perdu ? */}
          <div className="p-6 rounded-2xl bg-[#F80404]/10 border border-[#F80404]/30 text-center space-y-2 max-w-2xl mx-auto">
            <h3 className="text-base sm:text-lg font-black uppercase text-white font-heading tracking-wide">
              Combien d&apos;Argent Avez-Vous Déjà Perdu en Compléments Inutiles ?
            </h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Vous achetez au hasard ? Vous croyez les influenceurs sur les réseaux sociaux ? 
              Vous gaspillez votre argent inutilement. Ce guide vous apprend à devenir totalement autonome et critique face au marketing.
            </p>
          </div>
        </div>

        {/* Founder Story / Transformation with Marco's Real Photo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-black/60 rounded-3xl border border-[#95d600]/30 p-8 sm:p-12 mb-16">
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-[#95d600] shadow-2xl shadow-[#95d600]/25 bg-black p-1 ring-4 ring-[#95d600]/20 flex items-center justify-center">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/images/store/marco1.webp"
                  alt="Marco Scarpantoni - Fondateur NutriFitness Genève"
                  fill
                  className="object-cover object-top scale-105"
                />
              </div>
            </div>
            <p className="text-sm font-black uppercase text-white font-heading mt-4 tracking-wide">Marco Scarpantoni</p>
            <p className="text-xs text-white/60 font-medium">Fondateur NutriFitness Genève</p>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-[#95d600] font-heading">
              L&apos;Histoire Derrière le Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
              Ma Transformation : De 54 kg à 88 kg
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed italic">
              « À 21 ans, je pesais <strong>54 kg pour 1m97</strong>. Grâce à l&apos;entraînement, la nutrition et les bons compléments, je suis passé de 54 à 88 kg de muscle sec. Aujourd&apos;hui, j&apos;aide des centaines de personnes à atteindre leurs objectifs. »
            </p>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              « Je suis propriétaire d&apos;un magasin de compléments alimentaires depuis le <strong>15 avril 2015</strong>. Mais mon histoire avec la musculation a commencé bien avant cela. Au début, j&apos;ai fait toutes les erreurs : j&apos;ai pris ce qu&apos;on me conseillait, j&apos;ai cru au marketing, j&apos;ai tout essayé. Mais rapidement, j&apos;ai voulu comprendre. Cette passion ne m&apos;a plus jamais quitté... »
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-lg font-black text-[#95d600] font-heading block">+34 kg</span>
                <span className="text-[10px] text-white/60">De Muscle Sec Pris Naturellement</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-lg font-black text-[#95d600] font-heading block">11 Ans</span>
                <span className="text-[10px] text-white/60">À Conseiller en Boutique à Genève</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Device Instant Access Showcase with 3D Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-black/80 via-[#141414] to-black rounded-3xl border border-[#95d600]/30 p-8 sm:p-12 mb-16 shadow-2xl">
          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 border border-white/10 p-4 flex items-center justify-center">
            <Image
              src="/images/store/e-book.webp"
              alt="Le Guide Ultime des Compléments sur tous vos écrans : Mobile, Tablette et Ordinateur"
              fill
              className="object-contain drop-shadow-2xl"
            />
          </div>

          <div className="lg:col-span-6 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#95d600] font-heading">
              <Zap className="w-4 h-4" />
              Accès Immédiat & Multi-Écrans
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
              Votre Guide Toujours Disponible, Partout avec Vous
            </h3>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              Dès la confirmation de votre commande, téléchargez instantanément votre exemplaire officiel de 66 pages au format PDF haute résolution.
            </p>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#95d600] shrink-0" />
                <span>Format universel PDF consultable sur smartphone (iOS / Android), tablette et ordinateur</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#95d600] shrink-0" />
                <span>Fiches d&apos;action pratiques à emporter en magasin ou en salle d&apos;entraînement</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#95d600] shrink-0" />
                <span>Mises à jour scientifiques futures gratuites envoyées directement par email</span>
              </li>
            </ul>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDirectCheckout}
                className="py-3 px-6 bg-[#95d600] hover:bg-[#85c000] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all flex items-center gap-2 active:scale-98 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Obtenir Mon Accès Immédiat (PDF)</span>
              </button>
            </div>
          </div>
        </div>

        {/* What You Will Discover (Chapters Breakdown) */}
        <div className="mb-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="text-xs font-black uppercase tracking-widest text-[#95d600] mb-1 font-heading">
              Au Sommaire des 66 Pages
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
              Un Contenu Complet & Structuré
            </h2>
            <p className="text-xs text-white/60 mt-1">
              Dans ce guide, vous découvrirez quels compléments sont vraiment utiles (et lesquels éviter), les bonnes doses, et les meilleurs choix selon vos objectifs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapters.map((chap, idx) => (
              <div key={idx} className="p-5 bg-black/40 rounded-2xl border border-white/10 hover:border-[#95d600]/40 transition-colors space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#95d600]/20 text-[#95d600] font-mono font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-white uppercase font-heading">{chap.title}</h4>
                </div>
                <p className="text-xs text-white/65 leading-relaxed pl-8">
                  {chap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-black via-[#111] to-black border-2 border-[#95d600]/40 text-center space-y-6 mb-16 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase font-heading">
            Prêt à Rentabiliser Votre Supplémentation ?
          </h2>
          <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto leading-relaxed">
            Évitez les erreurs coûteuses, optimisez votre récupération et vos performances physiques dès aujourd&apos;hui avec le guide de référence en Suisse.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleDirectCheckout}
              className="py-4 px-8 bg-[#95d600] hover:bg-[#85c000] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-xl hover:shadow-[#95d600]/30 flex items-center justify-center gap-2 active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le Guide ({formatPrice(29.90)})</span>
            </button>
          </div>

          <p className="text-[11px] text-white/50">
            Téléchargement immédiat en PDF · Paiement 100% sécurisé via TWINT ou Carte Bancaire
          </p>
        </div>

        {/* FAQ Section Dedicated to Ebook */}
        <section className="mb-12">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-[#95d600]" />
              FAQ Ebook
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
              Questions Fréquentes sur le Guide
            </h3>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {ebookFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen ? 'bg-black/60 border-[#95d600]/40' : 'bg-black/30 border-white/10'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white"
                  >
                    <span>{faq.q}</span>
                    <span className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-[#95d600]">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-white/70 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
