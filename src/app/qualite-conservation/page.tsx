import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  ArrowLeft, 
  Lock, 
  Sparkles,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Qualité, Authenticité & Conservation des Compléments | NutriFitness.ch',
  description: 'Garanties d\'authenticité, traçabilité suisse OSAV/DFI, stockage optimal et règles de conservation de nos compléments alimentaires à Genève.',
  alternates: {
    canonical: 'https://nutrifitness.ch/qualite-conservation/',
  }
};

export default function QualiteConservationPage() {
  const faqs = [
    {
      q: 'Vos produits et marques sont-ils 100% authentiques ?',
      a: 'Oui, sans aucune exception. NutriFitness s\'approvisionne exclusivement auprès des fabricants officiels et de leurs importateurs agréés en Suisse et en Europe. Nous ne vendons que des produits neufs, scellés en usine avec leur bague de sécurité et opercule d\'origine intacts.'
    },
    {
      q: 'Où peut-on vérifier la date limite de consommation (DDM / DLUO) ?',
      a: 'La Date de Durabilité Minimale (DDM) est imprimée au laser de façon indélébile sous le pot ou sur le côté de l\'étiquette, accompagnée du numéro de lot de fabrication. Tous les produits expédiés disposent d\'une date de validité confortable (généralement 12 à 24 mois).'
    },
    {
      q: 'Comment bien conserver ses compléments alimentaires au quotidien ?',
      a: 'Conservez vos pots et géluliers dans un endroit frais et sec (idéalement entre 15°C et 22°C), strictement à l\'abri de l\'humidité, de la lumière directe du soleil et des sources de chaleur. Évitez de stocker vos compléments dans une salle de bain humide ou dans l\'habitacle d\'une voiture en été.'
    },
    {
      q: 'Combien de temps peut-on utiliser un pot de protéines ou de créatine une fois ouvert ?',
      a: 'Une fois l\'opercule de sécurité retiré, nous recommandons de consommer vos poudres dans les 3 à 6 mois. Refermez systématiquement le couvercle hermétiquement après chaque utilisation et manipulez la dosette doseuse avec des mains parfaitement sèches.'
    },
    {
      q: 'Que faire si un produit présente un aspect ou une odeur inhabituelle ?',
      a: 'Ne le consommez pas par précaution. Prenez des photos du produit et de l\'étiquette mentionnant le numéro de lot, puis contactez immédiatement notre service client à support@nutrifitness.ch ou passez à la boutique des Pâquis. Nous vérifierons le lot et procéderons à un échange immédiat.'
    },
    {
      q: 'Vos produits mentionnent-ils clairement les allergènes ?',
      a: 'Oui. Conformément à la législation helvétique sur les denrées alimentaires, tous les allergènes majeurs (lait/lactose, gluten, soja, œufs, arachides, fruits à coque, crustacés) sont clairement mis en évidence en gras dans la liste d\'ingrédients sur l\'étiquette et sur chaque fiche produit en ligne.'
    },
    {
      q: 'Les compléments sont-ils certifiés sans substances dopantes ?',
      a: 'La majorité de nos marques partenaires phares (telles qu\'Applied Nutrition ou Optimum Nutrition) font tester leurs lots de fabrication par des programmes antidopage indépendants de renommée mondiale comme Informed-Sport. Les athlètes soumis à des contrôles stricts peuvent vérifier la présence de ces labels sur les emballages.'
    },
    {
      q: 'Vos compléments alimentaires sont-ils conformes à la loi suisse ?',
      a: 'Oui, à 100 %. Tous les compléments alimentaires distribués par NutriFitness respectent scrupuleusement la Loi fédérale sur les denrées alimentaires (LDAp), les ordonnances du DFI sur les compléments alimentaires (OCAl) et les directives de l\'Office fédéral de la sécurité alimentaire et des affaires vétérinaires (OSAV).'
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
        <span className="text-[#F80404] font-bold">Qualité & Conservation</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-6 border-b border-white/10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#95d600]/15 border border-[#95d600]/30 text-[#95d600] text-xs font-black uppercase tracking-wider mb-3 font-heading">
          <ShieldCheck className="w-3.5 h-3.5" />
          Authenticité & Traçabilité Garantie
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          Qualité, Authenticité & <span className="text-[#F80404]">Conservation</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-2 leading-relaxed">
          Notre engagement sans compromis pour votre santé : approvisionnement direct certifié, conformité suisse OSAV et conseils de stockage pour préserver vos nutriments.
        </p>
      </header>

      {/* 3 Quality Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
        <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 space-y-2 text-center">
          <div className="w-10 h-10 rounded-2xl bg-[#95d600]/10 text-[#95d600] flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase font-heading">100% Neuf & Scellé</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Approvisionnement direct sans intermédiaire opaque, opercules scellés en usine.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 space-y-2 text-center">
          <div className="w-10 h-10 rounded-2xl bg-[#F80404]/10 text-[#F80404] flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase font-heading">Normes Suisses OSAV</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Toutes nos formules respectent les teneurs maximales autorisées par le DFI suisse.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 space-y-2 text-center">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase font-heading">DLUO Longue Durée</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Rotation constante de nos stocks à Genève pour vous garantir des dates fraîches.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="mb-14">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ Qualité & Authenticité
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
            Questions Fréquentes sur Nos Produits
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
        <Link href="/sante-securite/" className="text-[#F80404] hover:underline">
          Consulter les Règles de Santé & Sécurité →
        </Link>
      </div>

    </div>
  );
}
