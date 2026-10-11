import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/catalog';
import { getHiddenProductSlugs } from '@/lib/hiddenProducts';
import { formatMetaTitle, formatMetaDescription } from '@/lib/seo';
import GenevaStoreBlock from '@/components/GenevaStoreBlock';
import ProductCard from '@/components/ProductCard';
import {
  Award,
  ShieldCheck,
  Truck,
  Zap,
  HelpCircle,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export const metadata: Metadata = {
  title: formatMetaTitle('Compléments Alimentaires à Genève : Magasin & Conseils | NutriFitness'),
  description: formatMetaDescription('Magasin de compléments alimentaires au 34 Rue des Pâquis à Genève. Protéines, créatine, vitamines et conseils nutritionnels certifiés. Retrait 2h.'),
  alternates: {
    canonical: 'https://nutrifitness.ch/complements-alimentaires-geneve/',
  },
  openGraph: {
    title: 'Compléments Alimentaires à Genève : Magasin & Conseils | NutriFitness',
    description: 'Boutique spécialisée de compléments alimentaires et nutrition sportive à Genève. Stock physique 34 Rue des Pâquis, conseils de Marco Scarpantoni.',
    url: 'https://nutrifitness.ch/complements-alimentaires-geneve/',
    siteName: 'NutriFitness.ch',
    locale: 'fr_CH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compléments Alimentaires à Genève : Magasin & Conseils | NutriFitness',
    description: 'Magasin physique au 34 Rue des Pâquis à Genève. Protéines, vitamines et créatines certifiées. Retrait 2h ou livraison 24h.',
  },
};

export default async function ComplementsAlimentairesGenevePage() {
  const hiddenSlugs = await getHiddenProductSlugs();
  const featuredProducts = PRODUCTS.filter((p) => {
    const slug = (p.slug?.fr || '').toLowerCase().trim();
    const id = p.id || '';
    if (hiddenSlugs.has(slug) || hiddenSlugs.has(id)) return false;
    return p.categorySlug !== 'guides-ebooks' && p.id !== 'prod-25430';
  }).slice(0, 8);

  const faqs = [
    {
      q: 'Où se situe le magasin de compléments alimentaires NutriFitness à Genève ?',
      a: 'Notre boutique physique est située au 34 Rue des Pâquis, 1201 Genève, à 400 mètres (5 minutes à pied) de la Gare Centrale de Genève-Cornavin. Nous vous accueillons du lundi au vendredi de 12h30 à 19h00 et le samedi de 12h00 à 17h00.'
    },
    {
      q: 'Quels types de compléments alimentaires trouve-t-on en boutique ?',
      a: 'Nous disposons d\'un assortiment complet de nutrition sportive et de santé fonctionnelle : protéines whey, créatines Creapure®, acides aminés BCAA/EAA, pré-workouts, magnésium bisglycinate chélaté, zinc, vitamines D3 K2, oméga-3 sauvages, ashwagandha KSM-66® et snacks sans sucres.'
    },
    {
      q: 'Bénéficie-t-on de conseils personnalisés en magasin à Genève ?',
      a: 'Oui. Marco Scarpantoni (plus de 20 ans de pratique et 11 ans de gestion en nutrition sportive) et son équipe vous orientent en fonction de votre alimentation réelle, de votre pratique physique et de vos objectifs personnels, sans incitation commerciale superflue.'
    },
    {
      q: 'Puis-je commander en ligne et retirer mes compléments gratuitement ?',
      a: 'Oui, grâce à notre service Click & Collect : votre commande passée sur nutrifitness.ch est préparée en 2 heures ouvrées et conservée à la boutique des Pâquis. Le retrait est 100% gratuit, sans aucun minimum d\'achat.'
    }
  ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://nutrifitness.ch/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Compléments Alimentaires à Genève',
        item: 'https://nutrifitness.ch/complements-alimentaires-geneve/'
      }
    ]
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }))
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <ChevronRight className="w-3 h-3 text-white/30" />
        <Link href="/boutique/" className="hover:text-white transition-colors">Boutique</Link>
        <ChevronRight className="w-3 h-3 text-white/30" />
        <span className="text-[#F80404] font-bold">Compléments Genève</span>
      </nav>

      {/* Hero Header */}
      <header className="mb-12 p-6 sm:p-12 rounded-3xl bg-gradient-to-r from-black via-[#141414] to-black border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider font-heading">
              <Award className="w-3.5 h-3.5" />
              Magasin Référence à Genève (Depuis 2015)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#95d600]/10 border border-[#95d600]/25 text-[#95d600] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Conforme DFI & OSAV Suisse
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs">
              <Zap className="w-3.5 h-3.5 text-[#F80404]" />
              Click & Collect 2h
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
            Magasin de Compléments Alimentaires à Genève : <span className="text-[#F80404]">Nutrition & Santé</span>
          </h1>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed pt-2">
            Installé au cœur du quartier des Pâquis au 34 Rue des Pâquis, NutriFitness est le magasin indépendant de nutrition sportive et de micronutrition de référence à Genève. Venez bénéficier de conseils personnalisés, découvrir nos poudres et gélules en stock physique ou commander en ligne avec retrait gratuit en 2 heures.
          </p>
        </div>
      </header>

      {/* Editorial Content (400+ words) */}
      <section className="mb-16 p-6 sm:p-10 rounded-3xl bg-[#141414] border border-white/10 shadow-2xl space-y-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F80404] font-heading block">
            Expertise & Rigueur Scientifique
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-heading">
            Pourquoi Choisir NutriFitness pour Vos Compléments à Genève ?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-white/80 leading-relaxed">
          <div className="space-y-4">
            <p>
              Fondée le 15 avril 2015 par Marco Scarpantoni, notre enseigne s&apos;est construite sur une éthique intransigeante : refuser le sensationnalisme commercial et les promesses « miracles » pour se concentrer sur les molécules qui possèdent un solide niveau de preuves scientifiques. Une alimentation équilibrée, une hydratation adéquate et un sommeil réparateur constituent toujours les piliers de base ; les compléments alimentaires viennent catalyser vos efforts et combler les déficits nutritionnels ciblés.
            </p>
            <p>
              Dans notre showroom de la Rue des Pâquis à Genève, vous retrouvez un éventail exhaustif de solutions adaptées à chaque pratique :
            </p>
            <ul className="space-y-2 pl-4 list-disc text-white/70">
              <li>
                <strong className="text-white">Protéines & Masse musculaire :</strong> whey concentrées, isolates microfiltrées à froid (CFM) et protéines végétales biologiques pour optimiser la synthèse protéique.
              </li>
              <li>
                <strong className="text-white">Force & Performance :</strong> créatine monohydrate micronisée 200 mesh, label Creapure®, bêta-alanine et pré-workouts avec ou sans caféine.
              </li>
              <li>
                <strong className="text-white">Micronutrition & Immunité :</strong> magnésium bisglycinate chélaté sans effet laxatif, zinc bisglycinate, vitamine D3 + K2 MK7 et oméga-3 certifiés pour leur fraîcheur.
              </li>
              <li>
                <strong className="text-white">Équilibre & Confort digestif :</strong> Ashwagandha KSM-66®, enzymes digestives multi-spectre et électrolytes pour l&apos;endurance.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase text-[#F80404] font-heading tracking-wider">
              Une Sélection Rigoureuse Conforme aux Normes Suisses
            </h3>
            <p>
              En Suisse, la législation sur les denrées alimentaires et les compléments est l&apos;une des plus protectrices d&apos;Europe. Toutes les références proposées chez NutriFitness répondent scrupuleusement aux critères fixés par l&apos;Office fédéral de la sécurité alimentaire et des affaires vétérinaires (OSAV) et le Département fédéral de l&apos;intérieur (DFI).
            </p>
            <p>
              Nous excluons systématiquement les marques aux formules opaques (« mélanges propriétaires ») au profit d&apos;étiquettes transparentes détaillant précisément chaque principe actif par portion journalière.
            </p>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F80404]" />
                L&apos;Accompagnement Terrain par Marco Scarpantoni
              </h4>
              <p className="text-xs text-white/70">
                Fort de plus de 20 ans d&apos;expérience pratique en musculation et de 11 ans d&apos;expertise dans la gestion de boutiques spécialisées, Marco Scarpantoni vous guide au comptoir pour construire une routine de supplémentation sur mesure en fonction de votre morphologie et de votre budget.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison: Click & Collect vs Delivery */}
        <div className="pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F80404]" />
              Click & Collect Gratuit 2h aux Pâquis
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Commandez en quelques clics sur nutrifitness.ch et retirez vos compléments sans frais au magasin 2h après.
            </p>
            <Link href="/click-and-collect/" className="text-xs text-[#F80404] hover:underline font-bold inline-block pt-1">
              Consulter la page Click & Collect →
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#95d600]" />
              Expédition Poste Suisse 24h Prioritaire
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Livraison rapide dans tout le canton de Genève et partout en Suisse. Frais de port offerts dès 75 CHF d&apos;achat.
            </p>
            <Link href="/livraison/" className="text-xs text-[#95d600] hover:underline font-bold inline-block pt-1">
              Voir nos conditions de livraison →
            </Link>
          </div>
        </div>
      </section>

      {/* Real Product Grid */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F80404] font-heading block">
              En Stock Immédiat à Genève
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-heading">
              Sélection Coup de Cœur en Boutique
            </h2>
          </div>
          <Link href="/boutique/" className="text-xs font-bold text-[#F80404] hover:underline">
            Parcourir toute la boutique en ligne →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Internal Links to Categories and Guides */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-[#F80404]">
            <ShoppingBag className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase text-white font-heading">
              Nos Principaux Rayons en Ligne
            </h3>
          </div>
          <p className="text-xs text-white/70">
            Explorez notre catalogue par familles de produits :
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/categorie/proteines/" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#F80404] hover:text-black border border-white/10 text-xs font-bold text-white transition-all">
              Protéines & Whey →
            </Link>
            <Link href="/categorie/creatine/" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#F80404] hover:text-black border border-white/10 text-xs font-bold text-white transition-all">
              Créatine Pure →
            </Link>
            <Link href="/categorie/vitamines-mineraux/" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#F80404] hover:text-black border border-white/10 text-xs font-bold text-white transition-all">
              Vitamines & Minéraux →
            </Link>
            <Link href="/categorie/pre-workout-energie/" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#F80404] hover:text-black border border-white/10 text-xs font-bold text-white transition-all">
              Pré-Workout & Énergie →
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-[#F80404]">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase text-white font-heading">
              Guides d&apos;Experts & Ouvrages
            </h3>
          </div>
          <p className="text-xs text-white/70">
            Formez-vous aux principes d&apos;une supplémentation efficace et sans danger :
          </p>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/guide-des-complements-alimentaires/" className="text-white hover:text-[#95d600] font-bold underline">
                📘 Le Guide Ultime des Compléments Alimentaires (Ebook 66p PDF)
              </Link>
            </li>
            <li>
              <Link href="/blog/premiers-complements-guide-debutant-suisse/" className="text-white hover:text-[#F80404] underline">
                📖 Premiers compléments : le guide du débutant en Suisse
              </Link>
            </li>
            <li>
              <Link href="/blog/magnesium-bisglycinate-comment-choisir/" className="text-white hover:text-[#F80404] underline">
                📖 Magnésium bisglycinate : comment bien le choisir ?
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Store Location & Transport Block */}
      <section className="mb-16">
        <GenevaStoreBlock categoryTopic="compléments alimentaires" />
      </section>

      {/* FAQ Section */}
      <section className="mb-14 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ Compléments Genève
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
            Questions Fréquentes sur le Magasin de Genève
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-[#141414] rounded-2xl border border-white/10 p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer"
            >
              <summary className="flex justify-between items-center text-xs sm:text-sm font-bold text-white group-open:text-[#F80404] transition-colors">
                <span>{faq.q}</span>
                <span className="text-lg transition-transform group-open:rotate-45 shrink-0 ml-3">+</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-white/5 pt-3">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
