'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { 
  Award, 
  CheckCircle2, 
  Flame, 
  Activity, 
  HeartHandshake, 
  Target, 
  Calendar, 
  Send, 
  UserCheck, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Phone,
  Mail,
  User
} from 'lucide-react';

export default function CoachingClient() {
  const { showToast } = useStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    goal: 'perte-de-poids',
    location: 'geneve',
    experience: 'intermediaire',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Bilan Réservé', 'Votre demande de bilan gratuit a été enregistrée avec succès ! Marco Scarpantoni vous contacte sous 24h.');
    }, 800);
  };

  const steps = [
    {
      step: '01',
      title: 'Bilan Nutritionnel Initial',
      desc: 'Une analyse complète de vos besoins, métabolisme de base, habitudes alimentaires et contraintes de vie pour bâtir une stratégie personnalisée.',
      icon: <Target className="w-5 h-5 text-[#F80404]" />
    },
    {
      step: '02',
      title: 'Plan Alimentaire Sur-Mesure',
      desc: 'Une diète équilibrée et réaliste, calculée selon vos besoins en macronutriments, qui s\'intègre harmonieusement dans votre rythme quotidien.',
      icon: <Flame className="w-5 h-5 text-[#F80404]" />
    },
    {
      step: '03',
      title: 'Coaching & Programmation Sportive',
      desc: 'Un entraînement personnalisé adapté à votre niveau, vos disponibilités et vos objectifs (salle de musculation, extérieur ou domicile).',
      icon: <Activity className="w-5 h-5 text-[#F80404]" />
    },
    {
      step: '04',
      title: 'Suivi & Ajustements Réguliers',
      desc: 'Un accompagnement continu avec bilans réguliers, conseils motivationnels et ajustements permanents pour garantir une progression constante.',
      icon: <HeartHandshake className="w-5 h-5 text-[#F80404]" />
    },
    {
      step: '05',
      title: 'Performance, Récupération & Énergie',
      desc: 'Optimisation de votre sommeil, de vos niveaux d\'énergie et conseils de supplémentation sportive ciblée pour décupler votre vitalité.',
      icon: <Sparkles className="w-5 h-5 text-[#F80404]" />
    },
    {
      step: '06',
      title: 'Résultats Durables & Autonomie',
      desc: 'Ancrage d\'habitudes saines et durables pour pérenniser vos résultats sur le long terme sans effet yoyo ni frustration.',
      icon: <ShieldCheck className="w-5 h-5 text-[#F80404]" />
    }
  ];

  const coachingFaqs = [
    {
      q: 'Comment se déroule le bilan nutritionnel gratuit ?',
      a: 'Le bilan gratuit dure environ 20 minutes (par téléphone, en visio ou directement à notre boutique de Genève). Nous faisons le point sur votre historique d\'entraînement, vos habitudes alimentaires actuelles, vos éventuelles blessures et votre objectif prioritaire pour définir la meilleure feuille de route.'
    },
    {
      q: 'Le coaching est-il disponible en ligne ou uniquement à Genève ?',
      a: 'Le suivi est disponible à la fois en ligne dans toute la Suisse (via WhatsApp, e-mail et rendez-vous visio réguliers) et en présentiel à notre boutique de Genève (34 Rue des Pâquis). Vous choisissez la formule qui s\'adapte le mieux à votre quotidien.'
    },
    {
      q: 'Imposez-vous des régimes restrictifs ou drastiques ?',
      a: 'Non, absolument pas. Notre philosophie repose sur la durabilité et l\'équilibre alimentaire. Pas de privation extrême ni de poudres miracles obligatoires : nous créons des plans alimentaires basés sur de vrais aliments que vous aimez, calculés au gramme près selon vos dépenses énergétiques réelles.'
    },
    {
      q: 'En combien de temps peut-on espérer des résultats visibles ?',
      a: 'Les premiers résultats sur l\'énergie, la digestion et le tour de taille sont généralement visibles dès les 2 à 3 premières semaines. Une transformation physique profonde et pérenne (perte de 5 à 15 kg de gras ou gain de 3 à 8 kg de muscle sec) s\'inscrit dans un cycle de 3 à 6 mois d\'accompagnement structuré.'
    },
    {
      q: 'Dois-je obligatoirement acheter des compléments alimentaires ?',
      a: 'Non. L\'alimentation solide et la régularité de l\'entraînement représentent 90 % de vos résultats. Si certains compléments peuvent accélérer votre progression (comme la créatine, les protéines whey ou les oméga-3), ils ne sont proposés que s\'ils répondent à un besoin réel et avéré.'
    }
  ];

  return (
    <div className="py-4">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="text-xs text-white/50 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-white font-medium">Coaching Nutritionnel Personnalisé</span>
      </nav>

      {/* Hero Header with Marco Scarpantoni Photo */}
      <div className="relative rounded-3xl bg-gradient-to-r from-black via-[#141414] to-black border border-white/10 p-6 sm:p-12 mb-14 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F80404]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F80404]/10 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider rounded-full mb-4 font-heading">
              <Award className="w-3.5 h-3.5" />
              SUR-MESURE & RÉSULTATS
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-heading leading-tight mb-4">
              Coaching Nutritionnel <span className="text-[#F80404]">Personnalisé</span>
            </h1>

            <p className="text-base sm:text-lg text-[#F80404] font-bold mb-4 font-heading uppercase tracking-wide">
              Plus de 20 ans d&apos;expertise en nutrition et transformation physique
            </p>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-6">
              Chez <strong>NutriFitness Genève</strong>, nous accompagnons chaque personne avec une approche personnalisée basée sur la science nutritionnelle, l&apos;expérience terrain et un suivi humain de qualité. 
              Que votre objectif soit de perdre du poids, de prendre de la masse musculaire, d&apos;améliorer vos performances sportives ou d&apos;atteindre un meilleur équilibre de vie, nous créons un plan sur-mesure adapté à vos besoins spécifiques.
            </p>

            <p className="text-xs sm:text-sm text-white/65 leading-relaxed mb-8 italic">
              « Notre mission est simple : vous aider à obtenir des résultats durables sans régimes extrêmes ni méthodes miracles. »
            </p>

            {/* Quick Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <CheckCircle2 className="w-4 h-4 text-[#F80404] shrink-0" />
                <span>100% coaching nutritionnel personnalisé</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <CheckCircle2 className="w-4 h-4 text-[#F80404] shrink-0" />
                <span>Plans alimentaires adaptés à votre mode de vie</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <CheckCircle2 className="w-4 h-4 text-[#F80404] shrink-0" />
                <span>Programmes d&apos;entraînement sur-mesure</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <CheckCircle2 className="w-4 h-4 text-[#F80404] shrink-0" />
                <span>Suivi régulier avec ajustements et conseils</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <CheckCircle2 className="w-4 h-4 text-[#F80404] shrink-0" />
                <span>Accompagnement direct par un coach expert</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <CheckCircle2 className="w-4 h-4 text-[#F80404] shrink-0" />
                <span>Résultats durables basés sur des méthodes éprouvées</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#formulaire-bilan"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg hover:shadow-[#F80404]/30 active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Réserver mon bilan gratuit</span>
              </a>
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-2xl font-black text-white font-heading">20+</span>
                <span className="text-xs text-white/60 leading-tight">Années d&apos;expérience<br />Genève & En Ligne</span>
              </div>
            </div>
          </div>

          {/* Coach Photo Card */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative w-60 sm:w-68 aspect-[3/4] rounded-3xl overflow-hidden border-2 border-[#F80404]/40 shadow-2xl bg-black">
              <Image
                src="/images/store/marco2.webp"
                alt="Marco Scarpantoni - Coach Nutritionnel NutriFitness Genève"
                fill
                priority
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-sm font-black uppercase text-white font-heading">Marco Scarpantoni</p>
                <p className="text-[11px] text-[#F80404] font-bold">Coach Expert Nutrition Sportive</p>
                <p className="text-[10px] text-white/60 mt-0.5">20+ ans d&apos;expérience · Genève</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Steps: Votre Transformation Commence Ici */}
      <div className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-2 font-heading">
            Méthodologie Éprouvée
          </p>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase font-heading">
            Votre Transformation Commence Ici
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-2">
            Un accompagnement personnalisé pour atteindre vos objectifs de façon durable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((st) => (
            <div 
              key={st.step} 
              className="bg-[#141414] rounded-3xl border border-white/10 p-6 hover:border-[#F80404]/50 transition-all group relative overflow-hidden"
            >
              <span className="absolute top-4 right-4 text-2xl font-black text-white/10 font-heading">
                {st.step}
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#F80404]/10 border border-[#F80404]/30 flex items-center justify-center mb-4">
                {st.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2 font-heading">
                {st.title}
              </h3>
              <p className="text-xs text-white/65 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Trust Us Strip */}
      <div className="mb-16 bg-[#121212] rounded-3xl border border-white/10 p-8 sm:p-10">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h2 className="text-xl sm:text-3xl font-black text-white uppercase font-heading">
            Pourquoi Nous Faire Confiance ?
          </h2>
          <p className="text-xs sm:text-sm text-white/65 mt-2 leading-relaxed">
            Depuis plus de 20 ans, nous accompagnons nos clients vers une meilleure santé, une transformation physique durable et des performances optimisées grâce à une approche personnalisée basée sur la science de la nutrition.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-1.5">
            <h3 className="text-xs font-black uppercase text-white font-heading">
              100% Personnalisé
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Chaque programme est conçu selon votre profil, vos habitudes, vos contraintes et vos objectifs pour garantir des résultats adaptés à votre réalité.
            </p>
          </div>
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-1.5">
            <h3 className="text-xs font-black uppercase text-white font-heading">
              Expertise & Expérience
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Bénéficiez de plus de 20 ans d&apos;expérience en nutrition sportive, perte de poids, prise de masse et bien-être général.
            </p>
          </div>
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-1.5">
            <h3 className="text-xs font-black uppercase text-white font-heading">
              Suivi Humain Continu
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Bénéficiez d&apos;un soutien régulier, de conseils personnalisés et d&apos;ajustements continus pour rester motivé et progresser durablement.
            </p>
          </div>
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-1.5">
            <h3 className="text-xs font-black uppercase text-white font-heading">
              Résultats Durables
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Notre approche privilégie l&apos;équilibre et les habitudes pérennes plutôt que les régimes restrictifs ou les solutions temporaires.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Form Section */}
      <div id="formulaire-bilan" className="max-w-3xl mx-auto bg-[#141414] rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl mb-16 scroll-mt-24">
        <div className="text-center mb-8">
          <span className="text-xs font-black uppercase tracking-wider text-[#F80404] font-heading">
            Prêt à Transformer Votre Santé et Votre Physique ?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading mt-1">
            Réservez Votre Bilan Gratuit
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-2">
            Bénéficiez d&apos;un accompagnement personnalisé, d&apos;un plan nutritionnel adapté à vos objectifs et d&apos;un suivi régulier avec un coach expert.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-[11px] text-[#95d600] font-bold">
            <span>✓ Coaching personnalisé</span>
            <span>·</span>
            <span>✓ Suivi continu</span>
            <span>·</span>
            <span>✓ Résultats durables</span>
            <span>·</span>
            <span>✓ En ligne & à Genève</span>
          </div>
        </div>

        {isSubmitted ? (
          <div className="p-8 rounded-2xl bg-black/60 border border-[#95d600]/40 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#95d600]/10 text-[#95d600] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black uppercase text-white font-heading">Demande de Bilan Reçue !</h3>
            <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
              Merci <strong>{formData.fullName}</strong>. Marco Scarpantoni a bien reçu votre demande et vous contactera par téléphone ou e-mail dans les 24 heures ouvrées pour planifier votre séance.
            </p>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="text-xs text-[#F80404] underline hover:text-[#FF3D00] font-bold"
            >
              Envoyer une autre demande
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-white/80 mb-1.5 uppercase tracking-wider text-[11px]">
                  Nom & Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-white/80 mb-1.5 uppercase tracking-wider text-[11px]">
                  Adresse E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jean@example.ch"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-white/80 mb-1.5 uppercase tracking-wider text-[11px]">
                  Téléphone Portable (Suisse) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+41 79 123 45 67"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-white/80 mb-1.5 uppercase tracking-wider text-[11px]">
                  Votre Objectif Principal *
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-[#F80404] focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="perte-de-poids">Perte de Poids & Sèche Musculaire</option>
                  <option value="prise-de-masse">Prise de Masse & Hypertrophie</option>
                  <option value="performance">Performance Sportive & Force</option>
                  <option value="sante-vitalite">Santé, Vitalité & Rééquilibrage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-white/80 mb-1.5 uppercase tracking-wider text-[11px]">
                Parlez-nous brièvement de votre routine actuelle et de vos attentes
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Ex : Je m'entraîne 3 fois par semaine mais je stagne sur mon poids depuis 6 mois..."
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg hover:shadow-[#F80404]/30 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Transmission en cours...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Envoyer ma demande de bilan gratuit</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-white/40 text-center pt-2">
              Confidentialité garantie sous la législation suisse (nDSG). Vos données ne seront jamais cédées.
            </p>
          </form>
        )}
      </div>

      {/* Coaching FAQ Accordion Section */}
      <section className="mb-14 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ Coaching
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
            Questions Fréquentes sur le Coaching
          </h3>
        </div>

        <div className="space-y-3">
          {coachingFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen ? 'bg-[#141414] border-[#F80404]/40 shadow-lg' : 'bg-[#141414]/70 border-white/10'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-[#F80404]">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-white/70 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
