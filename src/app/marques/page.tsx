import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ALL_BRANDS } from '@/lib/brands';
import { 
  Award, 
  HelpCircle, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Toutes les Marques de Nutrition Sportive | NutriFitness.ch Genève',
  description: 'Découvrez notre catalogue de marques de référence en Suisse : Optimum Nutrition, Applied Nutrition, Dymatize, Marvelous, Ghost, Pronutrition. Stock physique à Genève.',
  alternates: {
    canonical: 'https://nutrifitness.ch/marques/',
  }
};

export default function MarquesPage() {
  const faqs = [
    {
      q: 'Quelles marques de nutrition sportive trouve-t-on chez Nutrifitness ?',
      a: 'Nous distribuons les marques de nutrition sportive les plus réputées mondialement et européennes : Optimum Nutrition, Applied Nutrition, Dymatize, Marvelous, Pronutrition, Ghost Lifestyle, Bigman Nutrition, Dirty Squads, ainsi que notre marque propre d\'accessoires sportifs NutriFit. Tous les produits sont rigoureusement sélectionnés pour leur traçabilité et leur pureté.'
    },
    {
      q: 'D\'où viennent ces marques et fabricants ?',
      a: 'Nos partenaires proviennent de pays dotés de réglementations sanitaires très strictes : Optimum Nutrition et Dymatize (États-Unis), Applied Nutrition (Royaume-Uni), Ghost Lifestyle (États-Unis), Marvelous (Portugal) et Bigman Nutrition (Espagne). Tous les lots importés en Suisse sont contrôlés et conformes aux normes fédérales de l\'OSAV et du DFI.'
    },
    {
      q: 'Comment choisir entre deux marques de compléments ?',
      a: 'Ne vous fiez pas uniquement au design ou à la renommée marketing. Comparez trois éléments clés : la quantité de principe actif par portion (ex : 24g de protéine pure), le profil d\'acides aminés (aminogramme complet riche en leucine), la présence de labels reconnus (Creapure®, Kyowa Quality®, DigeZyme®) et le prix réel par portion journalière.'
    },
    {
      q: 'Les produits sont-ils testés par des laboratoires indépendants ?',
      a: 'Plusieurs de nos marques phares soumettent volontairement leurs productions à des contrôles tiers reconnus par les sportifs professionnels (comme Informed-Choice ou Informed-Sport). Cela garantit des formules sans métaux lourds, sans substances dopantes et avec une concentration exacte en nutriments.'
    },
    {
      q: 'Nutrifitness possède-t-il une marque propre ?',
      a: 'Oui, nous développons des shakers, gourdes isothermes, accessoires d\'entraînement et guides nutritionnels exclusifs sous notre marque officielle NutriFit (NF), testés et approuvés au quotidien par nos athlètes genevois.'
    },
    {
      q: 'Les marques sont-elles disponibles en boutique à Genève comme en ligne ?',
      a: 'Oui, l\'ensemble des marques présentées sur le site est physiquement disponible dans notre magasin de Genève (34 Rue des Pâquis). Vous pouvez venir les examiner, demander conseil à Marco Scarpantoni ou commander en Click & Collect pour un retrait en 2 heures.'
    },
    {
      q: 'Pourquoi une marque ou une référence est-elle temporairement indisponible ?',
      a: 'Certaines références de haute qualité sont victimes de leur succès ou subissent des délais d\'approvisionnement stricts auprès des distributeurs officiels. Nous renouvelons nos stocks chaque semaine pour limiter au maximum les ruptures.'
    },
    {
      q: 'Puis-je suggérer l\'ajout d\'une nouvelle marque ou d\'un produit spécifique ?',
      a: 'Absolument ! Nous sommes constamment à l\'écoute de notre communauté. Si vous cherchez un produit introuvable en Suisse, écrivez-nous via notre formulaire de contact ou passez à la boutique des Pâquis : nous étudierons sa faisabilité et sa conformité réglementaire suisse avec plaisir.'
    }
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }))
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-[#F80404] font-bold">Toutes les Marques</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-6 border-b border-white/10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider mb-3 font-heading">
          <Award className="w-3.5 h-3.5" />
          Distributeur Officiel en Suisse
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          Nos Marques de <span className="text-[#F80404]">Nutrition Sportive</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-2 leading-relaxed">
          Sélection rigoureuse des leaders mondiaux de la nutrition : traçabilité garantie, formules conformes aux normes suisses et stock physique à Genève.
        </p>
      </header>

      {/* Brand Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
        {ALL_BRANDS.map((brand) => (
          <Link
            key={brand.slug}
            href={`/boutique/?brand=${encodeURIComponent(brand.name)}`}
            className="p-5 rounded-3xl bg-[#141414] border border-white/10 hover:border-[#F80404]/50 transition-all duration-300 flex flex-col items-center text-center justify-between group hover:-translate-y-1 shadow-lg"
          >
            <div className="relative w-full h-20 mb-4 bg-black/40 rounded-2xl p-2 border border-white/5 flex items-center justify-center">
              <Image
                src={brand.logo}
                alt={`Logo officiel marque ${brand.displayName}`}
                fill
                className="object-contain p-2 filter brightness-110 group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="space-y-1 w-full">
              <h3 className="text-sm font-bold text-white group-hover:text-[#F80404] transition-colors truncate">
                {brand.displayName}
              </h3>
              <p className="text-[11px] text-white/50">
                {brand.count} produits disponibles
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#F80404] uppercase font-heading">
              <span>Voir le catalogue</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* FAQ Section */}
      <section className="mb-14 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ Marques
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
            Questions Fréquentes sur Nos Marques
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group bg-[#141414] rounded-2xl border border-white/10 p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
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

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-4 text-xs font-bold">
        <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>
        <Link href="/boutique/" className="text-[#F80404] hover:underline">
          Parcourir Tous les Produits en Boutique →
        </Link>
      </div>

    </div>
  );
}
