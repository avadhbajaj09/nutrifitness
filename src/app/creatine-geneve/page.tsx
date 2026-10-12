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
  title: formatMetaTitle('Créatine en Suisse : Creapure® & Monohydrate | NutriFitness'),
  description: formatMetaDescription('Créatine monohydrate pure et label Creapure® en Suisse. Stock physique en Suisse, conseils d\'experts, retrait 2h et livraison 24h.'),
  alternates: {
    canonical: 'https://nutrifitness.ch/creatine-geneve/',
  },
  openGraph: {
    title: 'Créatine en Suisse : Creapure® & Monohydrate | NutriFitness',
    description: 'Créatines monohydrates micronisées 200 mesh et Creapure® allemande en stock en Suisse. Retrait 2h ou livraison 24h en Suisse.',
    url: 'https://nutrifitness.ch/creatine-geneve/',
    siteName: 'NutriFitness.ch',
    locale: 'fr_CH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Créatine à Genève : Creapure® & Monohydrate | NutriFitness',
    description: 'Créatine en poudre et gélules disponible en boutique à Genève. Stock suisse, retrait 2h et livraison 24h.',
  },
};

export default async function CreatineGenevePage() {
  const hiddenSlugs = await getHiddenProductSlugs();
  const creatineProducts = PRODUCTS.filter((p) => {
    const slug = (p.slug?.fr || '').toLowerCase().trim();
    const id = p.id || '';
    if (hiddenSlugs.has(slug) || hiddenSlugs.has(id)) return false;
    return p.categorySlug === 'creatine';
  }).slice(0, 8);

  const faqs = [
    {
      q: 'Où acheter de la créatine pure en Suisse ?',
      a: 'Dans notre boutique physique NutriFitness en Suisse. Nous stockons des créatines monohydrates micronisées 200 mesh et des créatines sous le label allemand Creapure® disponibles immédiatement au comptoir.'
    },
    {
      q: 'Quelle est la différence entre créatine monohydrate classique et Creapure® ?',
      a: 'La créatine monohydrate standard est la forme la plus testée et validée par la science avec un rapport efficacité/prix imbattable. Le label allemand Creapure® (synthétisé par Alzchem à Trostberg) garantit une pureté de 99.99% sans aucun sous-produit indésirable (dicyandiamide ou dihydrotriazine).'
    },
    {
      q: 'Faut-il faire une phase de charge avec la créatine ?',
      a: 'Non, les consensus scientifiques récents démontrent qu\'une dose stable de 3 à 5 g par jour sature pleinement les réserves intramusculaires de phosphocréatine en 3 à 4 semaines, sans provoquer d\'inconfort digestif.'
    },
    {
      q: 'Peut-on retirer sa créatine en Click & Collect le jour même ?',
      a: 'Oui. Passez commande sur nutrifitness.ch et choisissez le « Retrait Boutique Genève ». Votre pot de créatine est préparé en moins de 2 heures ouvrées au magasin des Pâquis, sans aucuns frais.'
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
        name: 'Créatine à Genève',
        item: 'https://nutrifitness.ch/creatine-geneve/'
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
        <Link href="/categorie/creatine/" className="hover:text-white transition-colors">Créatine Monohydrate</Link>
        <ChevronRight className="w-3 h-3 text-white/30" />
        <span className="text-[#F80404] font-bold">Genève</span>
      </nav>

      {/* Hero Header */}
      <header className="mb-12 p-6 sm:p-12 rounded-3xl bg-gradient-to-r from-black via-[#141414] to-black border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider font-heading">
              <Award className="w-3.5 h-3.5" />
              Référence Créatine à Genève
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#95d600]/10 border border-[#95d600]/25 text-[#95d600] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pureté Creapure® & 200 Mesh
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs">
              <Zap className="w-3.5 h-3.5 text-[#F80404]" />
              Click & Collect 2h
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
            Créatine Monohydrate et Creapure® à Genève : <span className="text-[#F80404]">Boutique & Conseils</span>
          </h1>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed pt-2">
            Décuplez votre force explosive, vos séries de répétitions et votre volumisation cellulaire grâce à notre sélection de créatines monohydrates de haute pureté. Situé en Suisse, notre magasin officiel dispose de stocks physiques permanents avec retrait gratuit en 2h ou expédition suisse 24h.
          </p>
        </div>
      </header>

      {/* Editorial Content (400+ words) */}
      <section className="mb-16 p-6 sm:p-10 rounded-3xl bg-[#141414] border border-white/10 shadow-2xl space-y-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F80404] font-heading block">
            Expertise Scientifique & Choix du Produit
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-heading">
            Comment Bien Choisir Sa Créatine en Suisse ?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-white/80 leading-relaxed">
          <div className="space-y-4">
            <p>
              Parmi les centaines de suppléments disponibles sur le marché, la créatine monohydrate est de loin la molécule ergogène la plus rigoureusement documentée au monde, avec plus de 500 études cliniques validant son efficacité et son innocuité. En augmentant les stocks intramusculaires de phosphocréatine, elle permet de régénérer plus vite l&apos;adénosine triphosphate (ATP) lors des efforts anaérobies de courte durée et haute intensité (séries lourdes de développé couché, squats, sprints, crossfit).
            </p>
            <p>
              Pour obtenir des résultats durables sans compromettre votre confort digestif, le choix de la forme de créatine est capital. Chez NutriFitness Suisse, nous trions les fabricants pour ne conserver que les standards les plus stricts :
            </p>
            <ul className="space-y-2 pl-4 list-disc text-white/70">
              <li>
                <strong className="text-white">Créatine Monohydrate Micronisée (200 Mesh) :</strong> broyée en micro-particules ultra-fines, elle se mélange immédiatement dans l&apos;eau ou un shaker de protéines sans laisser de dépôt sableux désagréable au fond du verre.
              </li>
              <li>
                <strong className="text-white">Label Breveté Creapure® :</strong> fabriquée en Allemagne (Alzchem Trostberg) selon des normes pharmaceutiques strictes, elle garantit une pureté de 99.99% certifiée exempte de dérivés toxiques de synthèse.
              </li>
              <li>
                <strong className="text-white">Formules en gélules :</strong> idéales pour les sportifs souvent en déplacement professionnel souhaitant une posologie précise sans manipulation de poudre.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase text-[#F80404] font-heading tracking-wider">
              Ce Que Nous Stockons en Suisse
            </h3>
            <p>
              Dans notre magasin officiel en Suisse, nous stockons exclusivement des marques réputées garantissant une traçabilité totale : BigMan Nutrition (Creapure® 300g), Marvelous Nutrition (Créatine 200 Mesh aromatisée et nature), Applied Nutrition (Créatine pure 250g) et Dirty Squads (DS Creapure).
            </p>
            <p>
              Tous les lots sont enregistrés et conformes aux ordonnances de l&apos;OSAV et du DFI en Suisse. Nous veillons à ce que chaque emballage soit scellé d&apos;origine, sans reconditionnement obscur.
            </p>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F80404]" />
                Protocole de Prise Conseillé par Nos Experts
              </h4>
              <p className="text-xs text-white/70">
                Prenez une dose constante de 3 à 5 grammes par jour avec votre petit-déjeuner ou votre collation post-effort. Associez-la à une source de glucides ou de protéines pour stimuler le transport médié par l&apos;insuline. La prise doit être quotidienne, y compris les jours de repos.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison: Click & Collect vs Delivery */}
        <div className="pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F80404]" />
              Click & Collect Gratuit 2h en Suisse
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Réservez votre créatine en ligne et venez la retirer sans frais 2h après en boutique officielle en Suisse.
            </p>
            <Link href="/click-and-collect/" className="text-xs text-[#F80404] hover:underline font-bold inline-block pt-1">
              Comment fonctionne le Click & Collect →
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#95d600]" />
              Livraison Suisse 24h par La Poste
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Expédition quotidienne PostPac Priority. Votre colis arrive le lendemain chez vous, avec livraison offerte dès 75 CHF.
            </p>
            <Link href="/livraison/" className="text-xs text-[#95d600] hover:underline font-bold inline-block pt-1">
              Informations d&apos;expédition suisse →
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
              Nos Créatines Disponibles
            </h2>
          </div>
          <Link href="/categorie/creatine/" className="text-xs font-bold text-[#F80404] hover:underline">
            Voir toute la catégorie Créatine ({PRODUCTS.filter(p => p.categorySlug === 'creatine').length}) →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {creatineProducts.map((p) => (
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
            Découvrez tous nos pots de créatine monohydrate pure, créatine Creapure® et formats gélules sur le catalogue complet :
          </p>
          <div className="pt-2">
            <Link
              href="/categorie/creatine/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-[#F80404] hover:text-black border border-white/10 text-xs font-bold text-white transition-all"
            >
              <span>Accéder à la catégorie Créatine Monohydrate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-[#F80404]">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase text-white font-heading">
              Guides d&apos;Experts Créatine
            </h3>
          </div>
          <p className="text-xs text-white/70">
            Consultez nos dossiers d&apos;analyse scientifique pour optimiser votre protocole de supplémentation :
          </p>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/blog/creatine-quand-comment-la-prendre/" className="text-white hover:text-[#F80404] underline">
                📖 Créatine : quand et comment la prendre ?
              </Link>
            </li>
            <li>
              <Link href="/blog/creatine-monohydrate-ou-creapure/" className="text-white hover:text-[#F80404] underline">
                📖 Créatine monohydrate ou Creapure® : quelle différence ?
              </Link>
            </li>
            <li>
              <Link href="/blog/creatine-phase-de-charge/" className="text-white hover:text-[#F80404] underline">
                📖 Créatine : faut-il faire une phase de charge ?
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Store Location & Transport Block */}
      <section className="mb-16">
        <GenevaStoreBlock categoryTopic="créatine" />
      </section>

      {/* FAQ Section */}
      <section className="mb-14 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ Créatine Genève
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
            Questions Fréquentes sur la Créatine à Genève
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
