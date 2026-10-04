'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Truck, 
  Dumbbell, 
  Flame, 
  HeartPulse, 
  CreditCard, 
  Store,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  CheckCircle2
} from 'lucide-react';

export interface FAQItem {
  id: string;
  category: 'store' | 'proteins' | 'creatine' | 'weightloss' | 'health' | 'orders';
  categoryLabel: string;
  question: string;
  answer: string;
  keywords?: string[];
}

export const FAQ_DATA: FAQItem[] = [
  // 1. From nutrifitness.ch
  {
    id: 'faq-1',
    category: 'proteins',
    categoryLabel: 'Protéines & Nutrition',
    question: 'Quels compléments sportifs propose NutriFitness.ch ?',
    answer: 'NutriFitness.ch propose une gamme complète de nutrition sportive de haute qualité : protéines whey (classique, isolat natif CFM, ISO Bulk biologique, caséine et protéines végétales bio), créatine monohydrate 200 mesh (label Creapure), acides aminés BCAA et EAA, gainers de masse propre, boosters pré-entraînement sans crash, brûleurs de graisses thermogéniques, oméga-3, collagène marin et bovin, vitamines & minéraux (vitamine C 1000mg, magnésium bisglycinate, ashwagandha KSM-66), et snacks protéinés / keto-friendly. Tous nos produits sont rigoureusement sélectionnés pour leur biodisponibilité, leur pureté certifiée et leur conformité stricte aux normes suisses.',
    keywords: ['produits', 'catalogue', 'gamme', 'whey', 'creatine', 'complements', 'boutique']
  },
  {
    id: 'faq-2',
    category: 'proteins',
    categoryLabel: 'Protéines & Nutrition',
    question: 'Quelle est la différence entre la whey concentrée, l\'isolat et la caséine ?',
    answer: 'La whey concentrée est obtenue après ultrafiltration du lactosérum : elle est absorbée rapidement (1 à 2 heures) après l\'effort, ce qui en fait la référence pour la récupération immédiate et la prise de masse musculaire générale. L\'isolat de whey (ou ISO Whey) subit une microfiltration à flux croisé (CFM) poussée : il affiche plus de 90 % de protéines pures, avec une teneur quasi nulle en graisses et en lactose (< 0.5 %), idéal en période de sèche ou pour les personnes intolérantes au lactose. Enfin, la caséine micellaire est une protéine à digestion lente (6 à 8 heures), parfaite avant le coucher ou lors de périodes de jeûne pour diffuser en continu des acides aminés et éviter le catabolisme musculaire nocturne.',
    keywords: ['whey', 'isolat', 'caseine', 'difference', 'digestion', 'lactose', 'cfm']
  },
  {
    id: 'faq-3',
    category: 'creatine',
    categoryLabel: 'Créatine & Performance',
    question: 'Pourquoi la créatine monohydrate est-elle l\'un de vos meilleures ventes ?',
    answer: 'La créatine monohydrate est le complément nutritionnel le plus documenté et validé par la recherche scientifique mondiale. Elle permet de régénérer l\'adénosine triphosphate (ATP), fournissant une énergie explosive immédiate lors des séries lourdes ou des sprints. NutriFitness.ch distribue de la créatine monohydrate micronisée 200 mesh ultra-fine et du label Creapure®, d\'une pureté pharmaceutique garantie à 99.9 % sans solvants ni sous-produits toxiques. Elle accélère le gain de force, le volume cellulaire musculaire et la récupération après chaque séance d\'entraînement.',
    keywords: ['creatine', 'creapure', 'force', 'monohydrate', 'performance', 'atp']
  },
  {
    id: 'faq-4',
    category: 'weightloss',
    categoryLabel: 'Perte de Poids & Définition',
    question: 'Vendez-vous des compléments adaptés à la perte de poids et à la sèche ?',
    answer: 'Oui, tout à fait. NutriFitness.ch propose une sélection ciblée pour soutenir la perte de masse grasse tout en protégeant le muscle acquis : des brûleurs de graisses thermogéniques de pointe stimulant le métabolisme de base, de la L-carnitine pour favoriser l\'oxydation des acides gras pendant l\'effort aérobie, des isolats de whey ultra-purs sans glucides ni lipides, des acides aminés BCAA/EAA pour empêcher la fonte musculaire en déficit calorique, ainsi que des coupe-faims naturels et snacks keto pauvres en sucres. Un service de coaching nutritionnel personnalisé avec bilan complet est également disponible en ligne et dans notre boutique de Genève.',
    keywords: ['seche', 'perte de poids', 'bruleur', 'graisse', 'carnitine', 'regime']
  },
  // 2. Shipping & Geneva Store
  {
    id: 'faq-5',
    category: 'store',
    categoryLabel: 'Livraison & Boutique Genève',
    question: 'Quels sont les délais et frais de livraison pour la Suisse et le Liechtenstein ?',
    answer: 'Toutes les commandes validées du lundi au vendredi avant 14h00 sont préparées et confiées à La Poste Suisse le jour même. La livraison s\'effectue par PostPac Priority en 24h ouvrées directement à votre domicile ou en point relais PickPost. La livraison est GRATUITE dès CHF 75.– d\'achats. Pour les commandes inférieures à 75 CHF, une participation forfaitaire de CHF 7.90 est appliquée. Nos stocks étant basés à Genève, aucun frais de douane ni taxe imprévue ne s\'applique.',
    keywords: ['livraison', 'poste suisse', 'delai', 'frais', 'postpac', 'priority', '24h', 'gratuit']
  },
  {
    id: 'faq-6',
    category: 'store',
    categoryLabel: 'Livraison & Boutique Genève',
    question: 'Où se situe la boutique physique et proposez-vous le Click & Collect ?',
    answer: 'Notre magasin de nutrition sportive est situé au 34 Rue des Pâquis, 1201 Genève, à 5 minutes de la gare Cornavin. Nous proposons un service Click & Collect 100 % gratuit : vous passez votre commande sur nutrifitness.ch et vous venez la retirer 2 heures plus tard en boutique. Horaires : Lundi au Vendredi de 12h30 à 19h00, et le Samedi de 12h00 à 17h00. Marco Scarpantoni est sur place pour vous conseiller personnellement.',
    keywords: ['boutique', 'magasin', 'geneve', 'click and collect', 'paquis', 'horaires', 'adresse']
  },
  // 3. Orders, Payments & Legal
  {
    id: 'faq-7',
    category: 'orders',
    categoryLabel: 'Commandes & Paiements',
    question: 'Quels moyens de paiement suisses acceptez-vous ?',
    answer: 'Nous acceptons l\'ensemble des solutions de paiement plébiscitées en Suisse : TWINT (règlement instantané par QR code ou notification mobile), cartes PostFinance Card et E-Finance, cartes de crédit/débit sécurisées (Visa, Mastercard, American Express via 3D Secure), ainsi qu\'Apple Pay et Google Pay. Toutes les transactions bénéficient d\'un cryptage SSL 256 bits conforme aux standards bancaires.',
    keywords: ['twint', 'postfinance', 'carte', 'paiement', 'apple pay', 'securise']
  },
  {
    id: 'faq-8',
    category: 'orders',
    categoryLabel: 'Commandes & Paiements',
    question: 'Comment fonctionne la politique de retour de 14 jours ?',
    answer: 'Vous bénéficiez de 14 jours calendaires à compter de la date de réception de votre colis pour demander un retour. Pour des impératifs sanitaires et d\'hygiène, les compléments alimentaires doivent être impérativement neufs, non ouverts, non utilisés, avec leur opercule de scellé intact. Une fois le colis retourné réceptionné et validé à notre adresse de Genève, le remboursement est émis sous 7 jours ouvrés sur votre méthode de paiement d\'origine.',
    keywords: ['retour', 'remboursement', 'delai', 'retractation', '14 jours', 'renvoi']
  },
  // 4. Health, Vitamins & Lifestyle
  {
    id: 'faq-9',
    category: 'health',
    categoryLabel: 'Santé, Articulations & Bien-être',
    question: 'Vos compléments alimentaires sont-ils conformes à la législation suisse ?',
    answer: 'Oui, à 100 %. Tous les compléments alimentaires vendus par NutriFitness répondent scrupuleusement aux ordonnances du Département fédéral de l\'intérieur (DFI) et aux contrôles de l\'Office fédéral de la sécurité alimentaire et des affaires vétérinaires (OSAV). Nos formules sont exemptes de substances interdites, métaux lourds et agents dopants, et appliquent le taux de TVA suisse réduit de 2.6 % réservé aux denrées alimentaires.',
    keywords: ['suisse', 'osav', 'dfi', 'legislation', 'qualite', 'securite', 'dopage']
  },
  {
    id: 'faq-10',
    category: 'health',
    categoryLabel: 'Santé, Articulations & Bien-être',
    question: 'Quels sont les bienfaits du collagène en poudre pour les sportifs ?',
    answer: 'Le collagène est la protéine structurelle majeure des tendons, ligaments, cartilages et de la peau. Avec l\'intensité des entraînements de musculation et de crossfit, le renouvellement collagénique est mis à rude épreuve. Notre poudre de collagène hydrolysé (peptides de haute biodisponibilité) favorise la régénération du cartilage articulaire, prévient les tendinites, améliore la flexibilité des tissus conjonctifs et favorise une récupération plus sereine chez les athlètes de force et d\'endurance.',
    keywords: ['collagene', 'tendons', 'articulations', 'blessure', 'peptides', 'cartilage']
  },
  {
    id: 'faq-11',
    category: 'creatine',
    categoryLabel: 'Créatine & Performance',
    question: 'Dois-je faire une « phase de charge » avec la créatine ?',
    answer: 'Non, la phase de charge (consommer 20g par jour pendant 5 jours) n\'est pas obligatoire et peut occasionner de légers troubles digestifs chez certaines personnes. Les études scientifiques récentes démontrent qu\'une prise quotidienne constante de 3g à 5g de créatine monohydrate micronisée permet de saturer les réserves musculaires en 3 à 4 semaines de façon tout aussi efficace et beaucoup plus douce pour l\'organisme. La régularité de la prise (de préférence avec un repas contenant des glucides ou votre shake post-entraînement) est la clé principale.',
    keywords: ['creatine', 'charge', 'prise', 'dosage', 'grammes', 'timing']
  },
  // 5. Hub Specific Questions (PAGE 14)
  {
    id: 'faq-hub-1',
    category: 'orders',
    categoryLabel: 'Compte & Commandes',
    question: 'Comment créer un compte client ou le supprimer ?',
    answer: 'Vous pouvez créer un compte en quelques clics via notre page Mon Compte pour enregistrer vos adresses et retrouver vos commandes passées. La commande en tant qu\'invité sans création de compte est également possible. Pour supprimer votre compte ou vos données, il vous suffit de nous envoyer une simple demande via notre page Contact.',
    keywords: ['compte', 'inscription', 'suppression', 'donnees', 'espace client', 'invité']
  },
  {
    id: 'faq-hub-2',
    category: 'orders',
    categoryLabel: 'Compte & Commandes',
    question: 'Comment me désabonner de la newsletter ?',
    answer: 'Chaque email de newsletter NutriFitness comporte un lien de désinscription sécurisé en pied de page. Un simple clic vous désabonne instantanément. Vous pouvez également nous contacter pour retirer votre adresse de notre liste de diffusion.',
    keywords: ['newsletter', 'email', 'desabonnement', 'courriel', 'optout']
  },
  {
    id: 'faq-hub-3',
    category: 'health',
    categoryLabel: 'Santé, Données & Sécurité',
    question: 'Mes données personnelles sont-elles protégées selon la loi suisse ?',
    answer: 'Oui. Nous appliquons scrupuleusement la nouvelle loi fédérale sur la protection des données (nDSG suisse). Vos coordonnées et informations de commande ne sont jamais vendues ni cédées à des tiers. Tous les détails figurent sur notre page Protection des données.',
    keywords: ['donnees', 'ndsg', 'rgpd', 'confidentialite', 'securite', 'suisse', 'protection']
  },
  {
    id: 'faq-hub-4',
    category: 'orders',
    categoryLabel: 'Boutique & Services',
    question: 'Proposez-vous des cartes cadeaux ou bons d\'achat ?',
    answer: 'Oui, des bons d\'achat et cartes cadeaux personnalisées sont disponibles sur demande en boutique à Genève et en ligne, valables sur l\'ensemble du catalogue (protéines, créatine, barres, vêtements et accessoires).',
    keywords: ['carte cadeau', 'bon d achat', 'cadeau', 'voucher', 'cheque cadeau']
  },
  {
    id: 'faq-hub-5',
    category: 'store',
    categoryLabel: 'Boutique & Services',
    question: 'Proposez-vous des tarifs pour les clubs, salles de sport ou entraîneurs ?',
    answer: 'Oui, nous proposons des conditions partenaires spécifiques pour les coachs sportifs certifiés, préparateurs physiques, salles de sport et clubs sportifs en Suisse. Écrivez-nous via notre formulaire de Contact en précisant votre statut pour recevoir nos tarifs préférentiels.',
    keywords: ['coach', 'club', 'salle de sport', 'tarifs pro', 'partenariat', 'b2b', 'remise']
  },
  {
    id: 'faq-hub-6',
    category: 'orders',
    categoryLabel: 'Retours & Remboursements',
    question: 'Les compléments alimentaires ouverts peuvent-ils être repris ?',
    answer: 'Pour des impératifs stricts de sécurité sanitaire et d\'hygiène alimentaire (normes suisses OSAV), les compléments alimentaires dont l\'opercule de sécurité ou le scellé a été brisé ou ouvert ne peuvent pas être repris ni échangés, sauf défaut de fabrication avéré constaté.',
    keywords: ['retours', 'produit ouvert', 'securite', 'hygiene', 'opercule', 'osav']
  }
];

export default function FAQView({ canonicalUrl }: { canonicalUrl?: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ 'faq-1': true, 'faq-2': true });

  const toggleAccordion = (id: string) => {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    { key: 'all', label: 'Toutes les Questions' },
    { key: 'store', label: '🇨🇭 Livraison & Magasin Genève' },
    { key: 'proteins', label: 'Protéines & Whey' },
    { key: 'creatine', label: 'Créatine & Performance' },
    { key: 'weightloss', label: 'Perte de Poids & Sèche' },
    { key: 'health', label: 'Santé & Sécurité (OSAV)' },
    { key: 'orders', label: 'Commandes, Paiement & Retours' }
  ];

  // Filtered Questions
  const filteredFaqs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return FAQ_DATA.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;
      if (!term) return true;

      const inQuestion = item.question.toLowerCase().includes(term);
      const inAnswer = item.answer.toLowerCase().includes(term);
      const inKeywords = item.keywords?.some(k => k.toLowerCase().includes(term));
      return inQuestion || inAnswer || inKeywords;
    });
  }, [searchTerm, activeCategory]);

  // Schema.org FAQPage Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': FAQ_DATA.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer
      }
    }))
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Schema.org FAQPage structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-[#F80404] font-bold">Foire Aux Questions (FAQ)</span>
      </nav>

      {/* Page Header */}
      <header className="mb-8 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider mb-3 font-heading">
          <HelpCircle className="w-3.5 h-3.5" />
          Centre d&apos;Aide & Conseils Experts
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          Questions Fréquentes <span className="text-[#F80404]">& FAQ</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-2xl">
          Compléments alimentaires, protéines whey, créatine Creapure, livraison en 24h par La Poste Suisse et retrait Click & Collect à notre boutique de Genève.
        </p>
      </header>

      {/* Interactive Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une question (ex: whey isolat, créatine, livraison TWINT, boutique)..."
          className="w-full bg-[#141414] border border-white/10 focus:border-[#F80404] text-white placeholder-white/40 text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-3.5 transition-colors focus:outline-none"
        />
        {searchTerm && (
          <button 
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white bg-white/5 px-2 py-1 rounded-lg"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider font-heading ${
              activeCategory === cat.key
                ? 'bg-[#F80404] text-black shadow-md'
                : 'bg-[#141414] text-white/70 hover:text-white border border-white/5 hover:border-white/20'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      {filteredFaqs.length > 0 ? (
        <div className="space-y-4 mb-14">
          {filteredFaqs.map((faq) => {
            const isOpen = !!openIds[faq.id];
            return (
              <div 
                key={faq.id}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                  isOpen 
                    ? 'bg-[#141414] border-[#F80404]/40 shadow-lg' 
                    : 'bg-[#141414]/70 border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1 pr-2">
                    <span className="text-[10px] font-bold text-[#F80404] uppercase tracking-wider font-heading block">
                      {faq.categoryLabel}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {faq.question}
                    </h3>
                  </div>
                  <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-[#F80404] text-black' : 'bg-white/5 text-white/70'
                  }`}>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-white/80 leading-relaxed border-t border-white/5 pt-4">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-[#141414] border border-white/10 text-center space-y-3 mb-14">
          <p className="text-white font-bold text-sm">Aucune question ne correspond à votre recherche « {searchTerm} ».</p>
          <p className="text-xs text-white/50">Essayez avec d&apos;autres mots-clés ou parcourez nos catégories ci-dessus.</p>
          <button
            type="button"
            onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider"
          >
            Réinitialiser la recherche
          </button>
        </div>
      )}

      {/* 8 Thematic Pillars Cards */}
      <section className="mb-14">
        <h2 className="text-base sm:text-lg font-black uppercase text-white font-heading mb-4">
          Consulter Nos Dossiers Détaillés par Thématique
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/livraison/" className="p-4 bg-[#141414] hover:bg-[#1a1a1a] rounded-2xl border border-white/10 hover:border-[#F80404]/40 transition-all group">
            <p className="text-xs font-black uppercase text-white group-hover:text-[#F80404] transition-colors">📦 Livraison 24h</p>
            <p className="text-[11px] text-white/60 mt-1">PostPac Priority, tarifs et seuil franco dès 75 CHF.</p>
          </Link>
          <Link href="/paiement/" className="p-4 bg-[#141414] hover:bg-[#1a1a1a] rounded-2xl border border-white/10 hover:border-[#F80404]/40 transition-all group">
            <p className="text-xs font-black uppercase text-white group-hover:text-[#F80404] transition-colors">💳 Paiement Sécurisé</p>
            <p className="text-[11px] text-white/60 mt-1">TWINT, PostFinance, CB 3D Secure, Apple Pay.</p>
          </Link>
          <Link href="/retours/" className="p-4 bg-[#141414] hover:bg-[#1a1a1a] rounded-2xl border border-white/10 hover:border-[#F80404]/40 transition-all group">
            <p className="text-xs font-black uppercase text-white group-hover:text-[#F80404] transition-colors">↩️ Retours 14 Jours</p>
            <p className="text-[11px] text-white/60 mt-1">Délai 14 jours, scellés de sécurité et procédure.</p>
          </Link>
          <Link href="/magasin-geneve/" className="p-4 bg-[#141414] hover:bg-[#1a1a1a] rounded-2xl border border-white/10 hover:border-[#F80404]/40 transition-all group">
            <p className="text-xs font-black uppercase text-white group-hover:text-[#F80404] transition-colors">📍 Boutique Genève</p>
            <p className="text-[11px] text-white/60 mt-1">34 Rue des Pâquis, horaires, tram et Click & Collect.</p>
          </Link>
          <Link href="/quel-complement-choisir/" className="p-4 bg-[#141414] hover:bg-[#1a1a1a] rounded-2xl border border-white/10 hover:border-[#F80404]/40 transition-all group">
            <p className="text-xs font-black uppercase text-white group-hover:text-[#F80404] transition-colors">🎯 Quel Choix Choisir ?</p>
            <p className="text-[11px] text-white/60 mt-1">Masse, sèche, force, récupération ou vegan.</p>
          </Link>
          <Link href="/qualite-conservation/" className="p-4 bg-[#141414] hover:bg-[#1a1a1a] rounded-2xl border border-white/10 hover:border-[#F80404]/40 transition-all group">
            <p className="text-xs font-black uppercase text-white group-hover:text-[#F80404] transition-colors">🛡️ Qualité & DDM</p>
            <p className="text-[11px] text-white/60 mt-1">Normes OSAV/DFI, authenticité et conservation.</p>
          </Link>
          <Link href="/sante-securite/" className="p-4 bg-[#141414] hover:bg-[#1a1a1a] rounded-2xl border border-white/10 hover:border-[#F80404]/40 transition-all group">
            <p className="text-xs font-black uppercase text-white group-hover:text-[#F80404] transition-colors">🩺 Santé & Sécurité</p>
            <p className="text-[11px] text-white/60 mt-1">Contre-indications, caféine, jeunesse et grossesse.</p>
          </Link>
          <Link href="/contact/" className="p-4 bg-[#141414] hover:bg-[#1a1a1a] rounded-2xl border border-white/10 hover:border-[#F80404]/40 transition-all group">
            <p className="text-xs font-black uppercase text-white group-hover:text-[#F80404] transition-colors">💬 Contact & Conseil</p>
            <p className="text-[11px] text-white/60 mt-1">Téléphone +41 79 250 35 64 et formulaire direct.</p>
          </Link>
        </div>
      </section>

      {/* Expert Advice CTA Box */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/15 relative overflow-hidden mb-12">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-[#95d600] uppercase tracking-wider font-heading">
              <Sparkles className="w-3.5 h-3.5" />
              Conseil Personnalisé par Marco Scarpantoni
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-heading">
              Une Question Spécifique sur Vos Objectifs ?
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Passez nous rendre visite à la boutique des Pâquis à Genève ou contactez-nous directement pour un plan de supplémentation sur-mesure.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/coaching-nutritionnel-personnalise/"
              className="px-5 py-3 rounded-2xl bg-[#F80404] hover:bg-[#FF3D00] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <span>Bilan Coaching Gratuit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="tel:+41792503564"
              className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition-colors"
            >
              <Phone className="w-4 h-4 text-[#95d600]" />
              <span>+41 79 250 35 64</span>
            </a>
          </div>
        </div>
      </section>

      {/* Quick Links Back */}
      <div className="pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-4 text-xs font-bold">
        <Link href="/" className="text-white/60 hover:text-white transition-colors">
          ← Retour à l&apos;accueil
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/boutique/" className="text-white/60 hover:text-white transition-colors">
            Voir la Boutique
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/guide-des-complements-alimentaires/" className="text-[#95d600] hover:underline">
            Guide Ebook Ultime →
          </Link>
        </div>
      </div>

    </div>
  );
}
