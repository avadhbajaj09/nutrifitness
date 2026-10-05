import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building, 
  Award, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Star, 
  HeartHandshake, 
  HelpCircle, 
  ArrowLeft,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'À Propos de NutriFitness Genève & Marco Scarpantoni | NutriFitness.ch',
  description: 'Découvrez l\'histoire de NutriFitness Genève, boutique fondée le 15 avril 2015 par Marco Scarpantoni. Plus de 20 ans d\'expertise en nutrition sportive, éthique et rigueur.',
  alternates: {
    canonical: 'https://nutrifitness.ch/a-propos/',
  }
};

export default function AProposPage() {
  const faqs = [
    {
      q: 'Qui est Nutrifitness ?',
      a: 'Nutrifitness est une enseigne indépendante de nutrition sportive fondée à Genève le 15 avril 2015 par Marco Scarpantoni. Nous opérons un magasin physique de référence au 34 Rue des Pâquis à Genève et une boutique en ligne livrant dans toute la Suisse en 24h ouvrées. Notre mission : fournir des compléments rigoureusement sélectionnés, purs et efficaces, accompagnés d\'un conseil transparent et personnalisé.'
    },
    {
      q: 'Qui conseille les clients en boutique et en ligne ?',
      a: 'Les clients sont directement conseillés par Marco Scarpantoni, fort de plus de 20 ans de pratique en musculation et de 11 ans de gestion spécialisée en nutrition sportive, ainsi que par notre équipe formée aux sciences de la nutrition. Nos recommandations portent sur l\'alimentation de base, le choix des nutriments et les dosages adaptés, dans le respect absolu de la législation suisse.'
    },
    {
      q: 'Quelle est votre approche de la supplémentation sportive ?',
      a: 'Nous prônons la franchise et la rigueur : l\'alimentation équilibrée, le sommeil et l\'entraînement régulier constituent le socle fondamental. Les compléments interviennent ensuite comme des catalyseurs ciblés. Nous refusons les promesses « miracles » et apprenons à nos athlètes à lire les étiquettes pour investir intelligemment dans leur santé.'
    },
    {
      q: 'Comment sélectionnez-vous les produits vendus chez NutriFitness ?',
      a: 'Chaque référence est soumise à un cahier des charges rigoureux : conformité totale aux ordonnances de l\'OSAV et du DFI en Suisse, transparence complète des ingrédients (refus des mélanges propriétaires opaques), présence de labels de qualité certifiés (Creapure®, Kyowa®, CFM) et digestibilité optimale.'
    },
    {
      q: 'Où peut-on consulter les avis de vos clients ?',
      a: 'Nos clients déposent leurs avis certifiés directement sur notre fiche officielle Google Maps / Google My Business (note moyenne de 4.9/5 sur plus de 120 avis vérifiés). Vous pouvez les consulter et laisser votre propre témoignage en toute transparence.'
    },
    {
      q: 'Puis-je proposer un partenariat ou travailler avec NutriFitness ?',
      a: 'Oui. Salles de sport, coachs sportifs certifiés, préparateurs physiques et athlètes de compétition basés en Suisse romande peuvent nous contacter via notre page contact ou passer nous voir à la boutique pour étudier des synergies professionnelles.'
    }
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'mainEntity': {
      '@type': 'Organization',
      'name': 'NutriFitness Genève',
      'founder': {
        '@type': 'Person',
        'name': 'Marco Scarpantoni',
        'jobTitle': 'Fondateur & Expert Nutrition Sportive'
      },
      'foundingDate': '2015-04-15',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Rue des Pâquis 34',
        'addressLocality': 'Genève',
        'postalCode': '1201',
        'addressCountry': 'CH'
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-[#F80404] font-bold">À Propos</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider mb-3 font-heading">
          <Award className="w-3.5 h-3.5" />
          Expertise Suisse Depuis 2015
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          L&apos;Histoire de <span className="text-[#F80404]">NutriFitness Genève</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-2">
          Une passion authentique pour la nutrition sportive, le dépassement de soi et le conseil de proximité en Suisse.
        </p>
      </header>

      {/* Founder Story Block */}
      <section className="p-6 sm:p-10 rounded-3xl bg-[#141414] border border-white/10 mb-12 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-[#F80404] shadow-2xl shadow-[#F80404]/25 bg-black p-1 ring-4 ring-[#F80404]/20 flex items-center justify-center">
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
            <p className="text-xs text-[#F80404] font-bold">Fondateur & Gérant</p>
          </div>

          <div className="md:col-span-7 space-y-4 text-xs sm:text-sm text-white/80 leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-heading">
              De 54 kg à 88 kg : Une Expérience Vécue de l&apos;Intérieur
            </h2>
            <p>
              À 21 ans, je mesurais 1m97 pour à peine 54 kg. Je me sentais faible et j&apos;ai cherché à transformer mon physique. Au départ, comme beaucoup, j&apos;ai cru au marketing agressif, acheté des poudres inutiles et fait toutes les erreurs classiques.
            </p>
            <p>
              C&apos;est en me plongeant dans la biochimie des nutriments, la rigueur de l&apos;entraînement de force et la régularité que j&apos;ai réussi à bâtir plus de <strong>34 kg de muscle sec</strong> naturellement.
            </p>
            <p className="text-white/90 font-medium">
              Le <strong>15 avril 2015</strong>, j&apos;ai ouvert les portes de NutriFitness au 34 Rue des Pâquis à Genève avec un objectif clair : <em>offrir aux sportifs suisses un lieu de confiance où l&apos;on ne vend que ce qui fonctionne réellement</em>.
            </p>
          </div>
        </div>
      </section>

      {/* Real Showroom Photos */}
      <section className="mb-14 space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-heading">
            Notre Boutique & Équipe à Genève
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Venez découvrir notre boutique physique au cœur du quartier des Pâquis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 shadow-lg">
            <Image
              src="/images/store/shop-front.jpeg"
              alt="Façade du magasin NutriFitness 34 Rue des Pâquis à Genève"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-black/80 px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10">
              Façade Rue des Pâquis 34
            </div>
          </div>

          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 shadow-lg">
            <Image
              src="/images/store/shop-inside.webp"
              alt="Intérieur et rayons de compléments alimentaires NutriFitness Genève"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-black/80 px-3 py-1 rounded-full text-[10px] font-bold text-[#95d600] border border-white/10">
              Rayons & Stock Physique Suisse
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-14">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ À Propos
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
            Questions Fréquentes
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
        <Link href="/contact/" className="text-[#F80404] hover:underline">
          Contacter notre équipe à Genève →
        </Link>
      </div>

    </div>
  );
}
