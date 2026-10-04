import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Cookie, 
  ShieldCheck, 
  Settings, 
  CheckCircle2, 
  Sliders, 
  ArrowLeft,
  Info,
  Laptop
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gestion des Cookies & Traceurs | NutriFitness.ch Genève',
  description: 'Politique d\'utilisation des cookies sur nutrifitness.ch. Découvrez le rôle de chaque cookie technique, analytique ou de confort et comment les configurer.',
  alternates: {
    canonical: 'https://nutrifitness.ch/cookies/',
  }
};

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-[#F80404] font-bold">Gestion des Cookies</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider mb-3 font-heading">
          <Cookie className="w-3.5 h-3.5" />
          Transparence & Vie Privée
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          Gestion des <span className="text-[#F80404]">Cookies</span> & Traceurs
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-2">
          Comprendre l&apos;utilisation des cookies sur le site nutrifitness.ch et gérer librement vos préférences de navigation.
        </p>
      </header>

      {/* Overview Intro */}
      <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 mb-8 space-y-3 text-xs sm:text-sm text-white/80 leading-relaxed">
        <div className="flex items-center gap-2 text-white font-heading font-black text-base uppercase">
          <Info className="w-4 h-4 text-[#95d600]" />
          <h3>Qu&apos;est-ce qu&apos;un cookie ?</h3>
        </div>
        <p>
          Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette ou smartphone) par le serveur du site web lors de votre visite. Il permet au site de mémoriser temporairement des données utiles à votre navigation, comme le contenu de votre panier d&apos;achat ou vos préférences d&apos;affichage.
        </p>
        <p className="text-xs text-white/60">
          Sur <strong>nutrifitness.ch</strong>, nous limitons strictement l&apos;usage des traceurs à ce qui est indispensable pour vous garantir un fonctionnement fluide, sécurisé et rapide.
        </p>
      </div>

      {/* Categories of Cookies */}
      <div className="space-y-6 mb-10 text-xs sm:text-sm text-white/80 leading-relaxed">
        
        {/* Type 1: Strictement nécessaires */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3 text-white font-heading font-black text-lg uppercase">
              <ShieldCheck className="w-5 h-5 text-[#95d600]" />
              <h2>1. Cookies Strictement Nécessaires (Fonctionnels)</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#95d600]/20 text-[#95d600] font-black text-[10px] uppercase font-heading">
              Toujours Actifs
            </span>
          </div>
          <p>
            Ces cookies sont indispensables au fonctionnement normal de la boutique en ligne. Sans eux, vous ne pourriez pas ajouter de produits à votre panier, valider votre commande ou vous connecter à votre espace client.
          </p>
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-xs border border-white/5 rounded-xl overflow-hidden">
              <thead className="bg-black/60 text-white/60 uppercase font-heading text-[10px]">
                <tr>
                  <th className="p-2.5">Nom du Cookie</th>
                  <th className="p-2.5">Finalité</th>
                  <th className="p-2.5">Durée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                <tr className="bg-black/20">
                  <td className="p-2.5 font-mono text-[#F80404]">nutrifitness_cart</td>
                  <td className="p-2.5">Mémorise les compléments alimentaires ajoutés à votre panier.</td>
                  <td className="p-2.5">Session / 30 jours</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-[#F80404]">nutrifitness_currency</td>
                  <td className="p-2.5">Conserve votre choix de devise (CHF ou EUR).</td>
                  <td className="p-2.5">1 an</td>
                </tr>
                <tr className="bg-black/20">
                  <td className="p-2.5 font-mono text-[#F80404]">nutrifitness_lang</td>
                  <td className="p-2.5">Mémorise votre langue de navigation préférée.</td>
                  <td className="p-2.5">1 an</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Type 2: Performance & Statistiques */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3 text-white font-heading font-black text-lg uppercase">
              <Sliders className="w-5 h-5 text-[#F80404]" />
              <h2>2. Cookies de Mesure d&apos;Audience & Performance</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/70 font-black text-[10px] uppercase font-heading">
              Optionnels
            </span>
          </div>
          <p>
            Ces cookies nous permettent de mesurer le nombre de visites, les pages les plus consultées et la vitesse de chargement afin d&apos;optimiser continuellement l&apos;expérience utilisateur.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-white/70">
            <li>Les adresses IP sont systématiquement <strong>anonymisées</strong>.</li>
            <li>Aucun profil publicitaire individuel n&apos;est constitué ni revendu.</li>
          </ul>
        </section>

        {/* How to configure in browser */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <Laptop className="w-5 h-5 text-blue-400" />
            <h2>3. Comment Configurer ou Bloquer les Cookies dans Votre Navigateur ?</h2>
          </div>
          <p>
            Vous pouvez à tout moment configurer votre logiciel de navigation pour autoriser ou refuser l&apos;enregistrement de cookies :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="font-bold text-white block">Apple Safari (Mac / iPhone)</span>
              <p className="text-white/60">Réglages &gt; Safari &gt; Confidentialité et sécurité &gt; « Bloquer tous les cookies » ou « Empêcher le suivi intersite ».</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="font-bold text-white block">Google Chrome</span>
              <p className="text-white/60">Menu Paramètres &gt; Confidentialité et sécurité &gt; Cookies tiers &gt; Bloquer ou autoriser au choix.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="font-bold text-white block">Mozilla Firefox</span>
              <p className="text-white/60">Paramètres &gt; Vie privée et sécurité &gt; Protection renforcée contre le pistage (Standard ou Stricte).</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="font-bold text-white block">Microsoft Edge</span>
              <p className="text-white/60">Paramètres &gt; Confidentialité, recherche et services &gt; Prévention du suivi &gt; Normal ou Strict.</p>
            </div>
          </div>
          <p className="text-xs text-white/50 pt-1">
            <em>Remarque :</em> La désactivation complète des cookies indispensables peut empêcher la mise au panier ou la finalisation de vos commandes sur notre site.
          </p>
        </section>

      </div>

      {/* Navigation Footer */}
      <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-4">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-bold">
          <Link href="/protection-donnees/" className="text-white/60 hover:text-white transition-colors">
            Protection des Données (nDSG)
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/mentions-legales/" className="text-[#F80404] hover:underline">
            Mentions Légales & Impressum →
          </Link>
        </div>
      </div>

    </div>
  );
}
