import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldAlert, 
  HelpCircle, 
  ArrowLeft, 
  AlertTriangle, 
  HeartHandshake, 
  CheckCircle2, 
  FileText
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Santé, Sécurité & Mises en Garde Légales | NutriFitness.ch Genève',
  description: 'Informations médicales, précautions d\'emploi, contre-indications et sécurité d\'utilisation des compléments alimentaires selon le droit suisse.',
  alternates: {
    canonical: 'https://nutrifitness.ch/sante-securite/',
  }
};

export default function SanteSecuritePage() {
  const faqs = [
    {
      q: 'Les compléments alimentaires sont-ils des médicaments ?',
      a: 'Non. En Suisse comme au niveau international, les compléments alimentaires sont des denrées alimentaires destinées à compléter le régime alimentaire normal. Ils ne sont en aucun cas des médicaments et ne sont pas destinés à diagnostiquer, traiter, guérir ou prévenir une maladie.'
    },
    {
      q: 'Puis-je consommer des compléments si je suis enceinte ou si j\'allaite ?',
      a: 'Demandez impérativement l\'avis préalable de votre médecin traitant ou de votre gynécologue. Les compléments contenant des stimulants (caféine, théine, guarana, synéphrine), des plantes actives, des thermogéniques ou des dosages élevés en certaines vitamines lipophiles sont formellement déconseillés pendant la grossesse et l\'allaitement.'
    },
    {
      q: 'Les compléments sont-ils adaptés aux enfants et adolescents de moins de 18 ans ?',
      a: 'Non, sauf prescription ou recommandation formelle d\'un pédiatre ou médecin. Les pré-workouts, stimulants énergétiques, créatines et brûleurs de graisses sont strictement réservés à un public adulte en bonne santé.'
    },
    {
      q: 'Puis-je combiner des compléments avec un traitement médicamenteux ?',
      a: 'Consultez systématiquement votre médecin ou pharmacien avant toute prise. Certaines plantes, minéraux (comme le fer ou le calcium) et acides aminés peuvent modifier l\'absorption ou interagir avec des médicaments anticoagulants, antidiabétiques ou hypotenseurs.'
    },
    {
      q: 'Quels effets indésirables peuvent éventuellement se manifester ?',
      a: 'Selon les sensibilités individuelles et le respect des doses, des désagréments passagers peuvent survenir : légers troubles digestifs en cas de prise excessive de protéines, nervosité ou insomnie en cas de consommation tardive de caféine, ou picotements cutanés bénins (paresthésie) tout à fait normaux liés à la bêta-alanine. En cas d\'effet gênant prolongé, cessez la prise et consultez un professionnel de santé.'
    },
    {
      q: 'Peut-on dépasser la dose journalière indiquée sur l\'étiquette ?',
      a: 'Non, en aucun cas. Doubler ou tripler une dose n\'accélère pas la prise de muscle et peut saturer inutilement vos organes d\'élimination (foie, reins). Veillez également à additionner vos apports si vous consommez plusieurs produits contenant le même ingrédient (ex : zinc, vitamine D ou caféine).'
    },
    {
      q: 'Les conseils et articles publiés sur NutriFitness remplacent-ils un avis médical ?',
      a: 'Non. L\'ensemble des contenus, guides, articles de blog et conseils dispensés sur nutrifitness.ch ont une vocation purement informative et sportive générale. Ils ne constituent en aucun cas une consultation médicale personnalisée ni un diagnostic de santé.'
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
        <span className="text-[#F80404] font-bold">Santé & Sécurité</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-6 border-b border-white/10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-3 font-heading">
          <ShieldAlert className="w-3.5 h-3.5" />
          Sécurité & Prévention Sanitaire
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          Santé, Sécurité & <span className="text-[#F80404]">Mises en Garde</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-2 leading-relaxed">
          Pour une pratique sportive responsable : règles d&apos;usage, respect des dosages et informations médicales essentielles.
        </p>
      </header>

      {/* Warning Box */}
      <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 mb-12 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase font-heading">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Avertissement Général Important</span>
        </div>
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
          Les compléments alimentaires doivent être utilisés dans le cadre d&apos;un mode de vie sain et ne pas être utilisés comme substituts d&apos;un régime alimentaire varié et équilibré. Ne pas dépasser la dose journalière recommandée. Tenir hors de la portée des jeunes enfants.
        </p>
      </div>

      {/* FAQ Section */}
      <section className="mb-14">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ Santé & Sécurité
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
            Questions Fréquentes de Précaution
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
        <Link href="/mentions-legales/" className="text-[#F80404] hover:underline">
          Consulter les Mentions Légales & Impressum →
        </Link>
      </div>

    </div>
  );
}
