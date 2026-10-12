import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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
  title: formatMetaTitle('Protéines Whey à Genève : Boutique & Retrait 2h | NutriFitness'),
  description: formatMetaDescription('Achetez vos protéines whey, isolate CFM et végétales à Genève. Stock physique Rue des Pâquis, retrait Click & Collect en 2h ou livraison 24h en Suisse.'),
  alternates: {
    canonical: 'https://nutrifitness.ch/proteines-geneve/',
  },
  openGraph: {
    title: 'Protéines Whey à Genève : Boutique & Retrait 2h | NutriFitness',
    description: 'Protéines whey concentrées, isolates CFM et végétales en stock au 34 Rue des Pâquis à Genève. Conseil d\'experts et livraison 24h suisse.',
    url: 'https://nutrifitness.ch/proteines-geneve/',
    siteName: 'NutriFitness.ch',
    locale: 'fr_CH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Protéines Whey à Genève : Boutique & Retrait 2h | NutriFitness',
    description: 'Whey isolate, concentré et végétales en stock à Genève. Retrait gratuit en 2h aux Pâquis ou livraison suisse 24h.',
  },
};

export default async function ProteinesGenevePage() {
  const hiddenSlugs = await getHiddenProductSlugs();
  const proteinProducts = PRODUCTS.filter((p) => {
    const slug = (p.slug?.fr || '').toLowerCase().trim();
    const id = p.id || '';
    if (hiddenSlugs.has(slug) || hiddenSlugs.has(id)) return false;
    return p.categorySlug === 'proteines';
  }).slice(0, 8);

  const faqs = [
    {
      q: 'Où acheter de la protéine whey en magasin à Genève ?',
      a: 'Notre boutique physique NutriFitness est située au 34 Rue des Pâquis, 1201 Genève (à 5 minutes à pied de la gare Cornavin). Vous y trouverez plus de 40 références de whey concentrée, isolate CFM et protéines végétales prêtes à l\'achat immédiat.'
    },
    {
      q: 'Quelle est la différence entre whey concentrée et whey isolate pour un sportif genevois ?',
      a: 'La whey concentrée offre 70 à 80% de protéines avec un goût crémeux très économique. La whey isolate CFM est microfiltrée à froid pour atteindre 85 à 90%+ de protéines pures avec une teneur quasi-nulle en lactose et lipides, idéale pour la sèche et les personnes à la digestion sensible.'
    },
    {
      q: 'Comment fonctionne le Click & Collect pour les protéines à Genève ?',
      a: 'Commandez votre pot de whey sur nutrifitness.ch en sélectionnant « Retrait Boutique Genève ». Votre commande est préparée sous 2 heures ouvrées et vous la retirez sans aucuns frais de livraison au magasin des Pâquis.'
    },
    {
      q: 'Les poudres de protéines vendues sont-elles conformes aux ordonnances suisses ?',
      a: 'Oui. Toutes nos protéines sont déclarées et conformes aux exigences strictes de l\'Office fédéral de la sécurité alimentaire et des affaires vétérinaires (OSAV) et du DFI, garantissant une absence totale de substances interdites et un aminogramme non frelaté.'
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
        name: 'Protéines à Genève',
        item: 'https://nutrifitness.ch/proteines-geneve/'
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
        <Link href="/categorie/proteines/" className="hover:text-white transition-colors">Protéines & Whey</Link>
        <ChevronRight className="w-3 h-3 text-white/30" />
        <span className="text-[#F80404] font-bold">Genève</span>
      </nav>

      {/* Hero Header */}
      <header className="mb-12 p-6 sm:p-12 rounded-3xl bg-gradient-to-r from-black via-[#141414] to-black border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider font-heading">
              <Award className="w-3.5 h-3.5" />
              Spécialiste Protéines à Genève
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#95d600]/10 border border-[#95d600]/25 text-[#95d600] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Normes OSAV / DFI
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs">
              <Zap className="w-3.5 h-3.5 text-[#F80404]" />
              Click & Collect 2h
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
            Protéines Whey et Isolates à Genève : <span className="text-[#F80404]">Stock en Boutique & Retrait 2h</span>
          </h1>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed pt-2">
            Que vous recherchiez une whey isolate microfiltrée CFM pour optimiser votre sèche, un concentré onctueux pour votre récupération quotidienne ou une protéine végétale biologique sans lactose, notre magasin situé au 34 Rue des Pâquis à Genève stocke les meilleures marques certifiées. Retrait express au comptoir en 2 heures ou livraison suisse 24h par La Poste.
          </p>
        </div>
      </header>

      {/* Editorial Content (400+ words) */}
      <section className="mb-16 p-6 sm:p-10 rounded-3xl bg-[#141414] border border-white/10 shadow-2xl space-y-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F80404] font-heading block">
            Guide d&apos;Achat Local
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-heading">
            Comment Choisir Sa Protéine en Poudre à Genève ?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-white/80 leading-relaxed">
          <div className="space-y-4">
            <p>
              Pour un pratiquant de musculation, de crossfit ou de course à pied dans le bassin genevois, l&apos;apport en protéines est le garant du maintien de la masse musculaire maigre et de la reconstruction tissulaire. Selon les recommandations de la Société Suisse de Nutrition (SSN) et de l&apos;ISSN, un athlète régulier a besoin de 1.4 à 2.0 grammes de protéines par kilo de poids corporel chaque jour.
            </p>
            <p>
              Si l&apos;alimentation solide (œufs, volailles, poissons, légumineuses) constitue le socle indispensable, la protéine en poudre intervient comme une solution pratique et économique pour compléter vos apports sans surcharger votre système digestif. À Genève, nous vous aidons à comparer les différentes familles :
            </p>
            <ul className="space-y-2 pl-4 list-disc text-white/70">
              <li>
                <strong className="text-white">Whey concentrée :</strong> issue du petit-lait avec 70 à 80% de protéines pures. Son tarif accessible et sa texture onctueuse en font le choix numéro un des débutants et sportifs polyvalents.
              </li>
              <li>
                <strong className="text-white">Whey Isolate CFM :</strong> microfiltrée à flux croisé sans solvants chimiques. Elle titre à plus de 85-90% de protéines avec une teneur quasi-nulle en graisses et en lactose, idéale en période de sèche stricte.
              </li>
              <li>
                <strong className="text-white">Protéines végétales :</strong> synergies de pois, riz brun ou chanvre conçues pour les sportifs végans ou intolérants au lactose, avec un aminogramme complet riche en leucine.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase text-[#F80404] font-heading tracking-wider">
              Ce Que Nous Stockons au 34 Rue des Pâquis
            </h3>
            <p>
              Contrairement aux sites expédiant depuis l&apos;étranger avec des frais de douane imprévus et des délais incertains, NutriFitness dispose d&apos;un entrepôt physique et d&apos;un magasin à Genève. Nous stockons en direct les références de réputation mondiale : Marvelous Nutrition, Dirty Squads, BigMan Nutrition, Optimum Nutrition (Gold Standard 100% Whey), Dymatize (ISO 100) et Applied Nutrition.
            </p>
            <p>
              Toutes les protéines vendues sont déclarées auprès des autorités fédérales suisses (DFI / OSAV), étiquetées en français avec leur aminogramme détaillé et vérifiées sans aminospiking.
            </p>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F80404]" />
                Conseils Personnalisés par Notre Équipe
              </h4>
              <p className="text-xs text-white/70">
                Passez au magasin pour échanger sur vos objectifs réels (prise de masse, tonification, sèche), calculer précisément vos besoins protidiques et déguster nos différents arômes (chocolat belge, vanille bourbon, mangue rafraîchissante).
              </p>
            </div>
          </div>
        </div>

        {/* Comparison: Click & Collect vs Delivery */}
        <div className="pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F80404]" />
              Option 1 : Click & Collect 2h à Genève
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Commandez sur le site et venez retirer votre pot de whey 2 heures plus tard au 34 Rue des Pâquis. 100% gratuit, sans montant minimum.
            </p>
            <Link href="/click-and-collect/" className="text-xs text-[#F80404] hover:underline font-bold inline-block pt-1">
              Détails du Click & Collect →
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#95d600]" />
              Option 2 : Livraison Suisse Express 24h
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Expédition quotidienne par La Poste Suisse (PostPac Priority). Livraison à domicile le lendemain matin, offerte dès 75 CHF d&apos;achat sans surprise douanière.
            </p>
            <Link href="/livraison/" className="text-xs text-[#95d600] hover:underline font-bold inline-block pt-1">
              Tarifs et délais d&apos;expédition →
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
              Nos Meilleures Ventes de Protéines
            </h2>
          </div>
          <Link href="/categorie/proteines/" className="text-xs font-bold text-[#F80404] hover:underline">
            Voir toute la catégorie Protéines ({PRODUCTS.filter(p => p.categorySlug === 'proteines').length}) →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {proteinProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Internal Links to Category and Guides */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-[#F80404]">
            <ShoppingBag className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase text-white font-heading">
              Catégorie Associée
            </h3>
          </div>
          <p className="text-xs text-white/70">
            Retrouvez toutes nos whey concentrées, isolates CFM, protéines végétales et formulations enrichies sur notre rayon officiel :
          </p>
          <div className="pt-2">
            <Link
              href="/categorie/proteines/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-[#F80404] hover:text-black border border-white/10 text-xs font-bold text-white transition-all"
            >
              <span>Accéder à la catégorie Protéines & Whey</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-[#F80404]">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase text-white font-heading">
              Guides d&apos;Experts Recommandés
            </h3>
          </div>
          <p className="text-xs text-white/70">
            Approfondissez votre stratégie nutritionnelle grâce aux dossiers scientifiques de nos préparateurs :
          </p>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/blog/whey-isolate-ou-concentree/" className="text-white hover:text-[#F80404] underline">
                📖 Whey isolate ou concentrée : laquelle choisir ?
              </Link>
            </li>
            <li>
              <Link href="/blog/comment-choisir-sa-whey-etiquette-prix/" className="text-white hover:text-[#F80404] underline">
                📖 Comment bien choisir sa whey : étiquette et prix par portion
              </Link>
            </li>
            <li>
              <Link href="/blog/combien-de-proteines-par-jour-sportif/" className="text-white hover:text-[#F80404] underline">
                📖 Combien de protéines par jour pour un sportif en Suisse ?
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Store Location & Transport Block */}
      <section className="mb-16">
        <GenevaStoreBlock categoryTopic="protéines" />
      </section>

      {/* FAQ Section */}
      <section className="mb-14 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ Protéines Genève
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
            Questions Fréquentes sur les Protéines à Genève
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
