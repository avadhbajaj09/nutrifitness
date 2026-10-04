import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Target, 
  Dumbbell, 
  Flame, 
  Zap, 
  HeartHandshake, 
  Leaf, 
  BadgePercent, 
  HelpCircle, 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Quel Complément Alimentaire Choisir Selon Votre Objectif ? | NutriFitness.ch',
  description: 'Guide comparatif honnête pour choisir vos compléments : prise de masse, perte de poids, force, récupération, petit budget ou débutant. Conseils de terrain à Genève.',
  alternates: {
    canonical: 'https://nutrifitness.ch/quel-complement-choisir/',
  }
};

export default function QuelComplementChoisirPage() {
  const objectives = [
    {
      icon: <Dumbbell className="w-5 h-5 text-[#F80404]" />,
      title: 'Prise de Masse Musculaire',
      desc: 'Privilégiez la créatine monohydrate (Creapure®) et un apport régulier en protéines (whey concentrée ou gainer riche en glucides complexes) en complément d\'un léger surplus calorique.',
      link: '/categorie/prendre-du-muscle/',
      linkText: 'Voir les compléments prise de masse'
    },
    {
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      title: 'Perte de Poids & Sèche Musculaire',
      desc: 'Maintenez un déficit calorique contrôlé et protégez vos fibres avec un isolat de whey (0 % glucides/lipides), des BCAA/EAA et des brûleurs thermogéniques stimulant la dépense énergétique.',
      link: '/categorie/perte-de-poids/',
      linkText: 'Voir les compléments sèche & minceur'
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      title: 'Force & Puissance Explosive',
      desc: 'La créatine monohydrate 200 mesh (3g à 5g/jour) saturera vos réserves en ATP pour des barres plus lourdes, complétée par un booster pré-workout dosé en caféine et citrulline.',
      link: '/categorie/creatine-premium/',
      linkText: 'Voir les créatines haute pureté'
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-[#95d600]" />,
      title: 'Récupération & Articulations',
      desc: 'Du collagène hydrolysé pour régénérer tendons et cartilages, des oméga-3 pour limiter l\'inflammation chronique et du magnésium bisglycinate pour apaiser le système nerveux la nuit.',
      link: '/categorie/vitamines-mineraux/',
      linkText: 'Voir la gamme récupération & santé'
    },
    {
      icon: <Leaf className="w-5 h-5 text-emerald-400" />,
      title: 'Végétarien & Vegan',
      desc: 'Misez sur des mélanges de protéines végétales bio (pois, riz brun, chanvre) pour un aminogramme complet et surveillez vos apports en vitamine B12, fer et zinc chélaté.',
      link: '/boutique/?cat=vegan',
      linkText: 'Voir les options végétales'
    },
    {
      icon: <BadgePercent className="w-5 h-5 text-blue-400" />,
      title: 'Optimisation Petit Budget',
      desc: 'Inutile d\'acheter 5 pots. Deux fondamentaux suffisent : une whey concentrée de qualité pour vos collations et une créatine monohydrate pure. Coût mensuel : moins de CHF 40.–.',
      link: '/boutique/',
      linkText: 'Découvrir nos meilleurs rapports qualité/prix'
    }
  ];

  const faqs = [
    {
      q: 'Quel complément choisir en priorité pour prendre de la masse musculaire ?',
      a: 'La prise de masse repose d\'abord sur un apport suffisant en calories et en protéines (1.6g à 2.2g par kilo de poids corporel), l\'entraînement de force progressif et le sommeil réparateur. En complément, la créatine monohydrate micronisée est le produit n°1 pour décupler la force, accompagnée d\'une whey concentrée ou d\'un gainer si vous peinez à manger assez de calories solides.'
    },
    {
      q: 'Quel complément aide réellement à perdre du poids ?',
      a: 'Aucun complément ne fait fondre le tissu adipeux par magie. Le pilier absolu est le déficit calorique modéré. Les compléments utiles en sèche sont l\'isolat de whey (pour combler vos besoins en protéines tout en restant ultra-faible en calories), les acides aminés BCAA/EAA pour stopper le catabolisme musculaire à jeun, et la caféine pour soutenir votre énergie.'
    },
    {
      q: 'Quel complément choisir pour booster ses performances en musculation ?',
      a: 'La créatine monohydrate est le complément le plus étudié au monde : elle recharge l\'ATP cellulaire, permettant 1 à 2 répétitions supplémentaires par série lourde. Pour l\'énergie immédiate avant l\'entraînement, un pré-workout formulé avec 200mg à 300mg de caféine et de la L-citrulline malate offre une congestion et une concentration maximales sans crash.'
    },
    {
      q: 'Quel est le meilleur choix pour améliorer la récupération après l\'effort ?',
      a: 'La récupération dépend de l\'hydratation, du repos et des macronutriments. Après une séance intense, consommer un shaker associant protéines rapides (whey) et glucides permet de reconstituer le glycogène. Pour les courbatures et les articulations, une prise quotidienne de collagène marin et de magnésium bisglycinate le soir améliore grandement le sommeil et la flexibilité.'
    },
    {
      q: 'Que choisir pour un sport d\'endurance (course à pied, cyclisme, triathlon) ?',
      a: 'Pour les efforts dépassant 1 heure, la priorité absolue réside dans l\'hydratation cellulaire et l\'apport en glucides rapides : des poudres d\'électrolytes (sodium, potassium, magnésium) et des boissons isotoniques pendant l\'effort, suivies d\'un apport en acides aminés EAA pour réparer les microlésions musculaires.'
    },
    {
      q: 'Quels compléments privilégier avec un régime végétarien ou vegan ?',
      a: 'Les protéines végétales combinées (pois + riz brun germé) permettent d\'obtenir un aminogramme complet équivalent à la protéine de lactosérum. Pensez également à vous supplémenter en créatine monohydrate (naturellement absente des végétaux) et en oméga-3 d\'origine algale (DHA/EPA).'
    },
    {
      q: 'Quel complément choisir si j\'ai un budget limité ?',
      a: 'Calculez toujours le prix par portion plutôt que le prix brut du pot. Une créatine monohydrate 300g (environ CHF 31.50) dure 2 mois complets à raison de 5g par jour, soit à peine CHF 0.50 par jour pour des gains prouvés. C\'est le meilleur investissement possible avec une whey de base.'
    },
    {
      q: 'Par quoi commencer lorsque l\'on débute la musculation ?',
      a: 'Ne commencez pas par acheter 6 boîtes de pilules. Maîtrisez d\'abord 3 séances de sport régulières par semaine et apprenez à manger équilibré. Ensuite, intégrez un seul complément à la fois (par exemple un shaker de whey après vos entraînements) pour mesurer précisément sa tolérance et son impact sur votre progression.'
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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-[#F80404] font-bold">Quel Complément Choisir ?</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-6 border-b border-white/10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider mb-3 font-heading">
          <Target className="w-3.5 h-3.5" />
          Guide de Décision Nutrition Sportive
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          Quel Complément <span className="text-[#F80404]">Choisir ?</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-2 leading-relaxed">
          Conseils clairs, précis et sans promesse mensongère pour investir uniquement dans les compléments utiles à vos objectifs physiques.
        </p>
      </header>

      {/* Objectives Decision Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        {objectives.map((obj, idx) => (
          <div key={idx} className="p-6 rounded-3xl bg-[#141414] border border-white/10 hover:border-[#F80404]/40 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                {obj.icon}
              </div>
              <h2 className="text-base font-bold text-white font-heading uppercase">{obj.title}</h2>
              <p className="text-xs text-white/70 leading-relaxed">{obj.desc}</p>
            </div>
            <Link
              href={obj.link}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F80404] hover:text-[#FF3D00] transition-colors pt-2 border-t border-white/5"
            >
              <span>{obj.linkText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ Decision Section */}
      <section className="mb-14">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ Décision
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
            Questions Fréquentes — Choisir Selon Vos Besoins
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
        <Link href="/guide-des-complements-alimentaires/" className="text-[#95d600] hover:underline">
          Consulter le Guide Ebook Ultime (66 pages) →
        </Link>
      </div>

    </div>
  );
}
