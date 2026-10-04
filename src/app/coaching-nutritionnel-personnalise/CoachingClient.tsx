'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ShieldCheck 
} from 'lucide-react';

export default function CoachingClient() {
  const { showToast } = useStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Bilan Réservé', 'Votre demande de bilan gratuit a été envoyée ! Un coach vous contacte sous 24h.');
    }, 800);
  };

  const steps = [
    {
      step: '01',
      title: 'Bilan Nutritionnel Initial',
      desc: 'Une analyse complète de vos besoins, métabolisme, habitudes alimentaires et antécédents pour bâtir une stratégie réaliste et efficace.',
      icon: <Target className="w-5 h-5 text-[#F80404]" />
    },
    {
      step: '02',
      title: 'Plan Alimentaire Sur-Mesure',
      desc: 'Une diète personnalisée calculée au gramme près qui respecte vos préférences alimentaires, votre budget et votre rythme de travail.',
      icon: <Flame className="w-5 h-5 text-[#F80404]" />
    },
    {
      step: '03',
      title: 'Coaching & Programmation Sportive',
      desc: 'Un programme d\'entraînement précis adapté à votre niveau (salle, domicile ou extérieur) avec vidéos d\'exécution et charges recommandées.',
      icon: <Activity className="w-5 h-5 text-[#F80404]" />
    },
    {
      step: '04',
      title: 'Suivi & Ajustements Réguliers',
      desc: 'Un accompagnement continu chaque semaine avec pesées, mensurations et ajustements caloriques pour éviter tout palier de stagnation.',
      icon: <HeartHandshake className="w-5 h-5 text-[#F80404]" />
    },
    {
      step: '05',
      title: 'Performance, Sommeil & Énergie',
      desc: 'Optimisation de votre récupération, gestion du stress et conseils de supplémentation ciblée pour décupler votre vitalité quotidienne.',
      icon: <Sparkles className="w-5 h-5 text-[#F80404]" />
    },
    {
      step: '06',
      title: 'Résultats Pérennes & Autonomie',
      desc: 'Ancrage de saines habitudes nutritionnelles pour maintenir vos résultats sur le long terme sans jamais reprendre le poids perdu.',
      icon: <ShieldCheck className="w-5 h-5 text-[#F80404]" />
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

      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-black via-[#141414] to-black border border-white/10 p-6 sm:p-12 mb-14 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F80404]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F80404]/10 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider rounded-full mb-4">
            <Award className="w-3.5 h-3.5" />
            SUR-MESURE & RÉSULTATS GARANTIS
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-heading leading-tight mb-4">
            Coaching Nutritionnel <span className="text-[#F80404]">Personnalisé</span>
          </h1>

          <p className="text-base sm:text-lg text-[#F80404] font-bold mb-4 font-heading uppercase tracking-wide">
            Plus de 20 ans d'expertise en nutrition et transformation physique en Suisse
          </p>

          <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-8">
            Chez <strong>NutriFitness Genève</strong>, nous accompagnons chaque personne avec une approche personnalisée basée sur la science nutritionnelle, l'expérience terrain et un suivi humain de qualité. 
            Que votre objectif soit de perdre du poids, de prendre de la masse musculaire, d'améliorer vos performances athlétiques ou de trouver un meilleur équilibre de vie, nous créons un plan sur-mesure adapté à vos besoins spécifiques. 
            Notre mission est simple : <em>vous aider à obtenir des résultats durables sans régimes extrêmes ni méthodes miracles.</em>
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
              <span>Programmes d'entraînement sur-mesure</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/90">
              <CheckCircle2 className="w-4 h-4 text-[#F80404] shrink-0" />
              <span>Accompagnement direct par un coach expert</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/90">
              <CheckCircle2 className="w-4 h-4 text-[#F80404] shrink-0" />
              <span>Optimisation des performances et récupération</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/90">
              <CheckCircle2 className="w-4 h-4 text-[#F80404] shrink-0" />
              <span>Méthodes éprouvées et résultats pérennes</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#formulaire-bilan"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg hover:shadow-[#F80404]/30 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              Réserver mon bilan gratuit
            </a>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-2xl font-black text-white font-heading">20+</span>
              <span className="text-xs text-white/60 leading-tight">Années d'expérience<br />à Genève</span>
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
            Un accompagnement structuré pas-à-pas pour atteindre vos objectifs de santé et de physique de manière durable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((st) => (
            <div 
              key={st.step} 
              className="bg-[#141414] rounded-2xl border border-white/10 p-6 hover:border-[#F80404]/50 transition-all group relative overflow-hidden"
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
            Fondé et dirigé par <strong>Marco Scarpantoni</strong>, préparateur physique et spécialiste en nutrition sportive fort de plus de 20 ans d'expertise sur le terrain à Genève, NutriFitness vous garantit un accompagnement sérieux, scientifique et axé sur vos résultats durables.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="p-4 bg-black/40 rounded-xl border border-white/5">
            <h3 className="text-xs font-black uppercase text-white font-heading mb-1.5">
              100% Personnalisé
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Chaque programme est conçu selon vos horaires, contraintes et goûts pour garantir des résultats adaptés à votre réalité.
            </p>
          </div>
          <div className="p-4 bg-black/40 rounded-xl border border-white/5">
            <h3 className="text-xs font-black uppercase text-white font-heading mb-1.5">
              Expertise & Expérience
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Bénéficiez de 20+ ans de pratique en nutrition sportive, sèche, prise de masse et bien-être général.
            </p>
          </div>
          <div className="p-4 bg-black/40 rounded-xl border border-white/5">
            <h3 className="text-xs font-black uppercase text-white font-heading mb-1.5">
              Suivi Humain Continu
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Échanges réguliers, conseils personnalisés et réajustements permanents pour garder votre motivation au sommet.
            </p>
          </div>
          <div className="p-4 bg-black/40 rounded-xl border border-white/5">
            <h3 className="text-xs font-black uppercase text-white font-heading mb-1.5">
              Résultats Pérennes
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Priorité absolue à l'équilibre et aux habitudes solides plutôt qu'aux régimes drastiques voués à l'échec.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Form Section */}
      <div id="formulaire-bilan" className="max-w-3xl mx-auto bg-[#141414] rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl mb-16 scroll-mt-24">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 bg-[#F80404]/10 border border-[#F80404]/30 text-[#F80404] text-[10px] font-black uppercase tracking-wider rounded-full mb-2">
            Première Étape Sans Engagement
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
            Réservez Votre Bilan Nutritionnel Gratuit
          </h2>
          <p className="text-xs sm:text-sm text-white/65 mt-2">
            Remplissez ce formulaire confidentiel. Un coach nutritionnel NutriFitness analyse vos réponses et vous recontacte sous 24h pour fixer votre premier rendez-vous.
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Merci pour votre demande !</h3>
            <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
              Votre demande de bilan gratuit a été enregistrée avec succès. Notre équipe de coachs analyse votre profil et vous appellera sous 24h ouvrées.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Envoyer une autre demande
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                  Nom et Prénom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Marc Dupont"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                  Adresse E-mail *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex : marc@exemple.ch"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                  Téléphone (Suisse ou Mobile) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+41 79 000 00 00"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                  Objectif Principal *
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#F80404] focus:outline-none"
                >
                  <option value="perte-de-poids">Perte de Poids & Définition (Sèche)</option>
                  <option value="prise-de-masse">Prise de Masse Musculaire Propre</option>
                  <option value="performance">Performance Sportive & Compétition</option>
                  <option value="sante-vitalite">Remise en Forme, Santé & Énergie</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                  Mode d'Accompagnement Souhaité
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#F80404] focus:outline-none"
                >
                  <option value="geneve">En présentiel à Genève (34 Rue des Pâquis)</option>
                  <option value="en-ligne">100% En Ligne & À Distance (Suisse / Monde)</option>
                  <option value="mixte">Formule Mixte (Présentiel + Suivi en ligne)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                  Niveau d'Expérience Actuel
                </label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#F80404] focus:outline-none"
                >
                  <option value="debutant">Débutant (Reprise en main totale)</option>
                  <option value="intermediaire">Intermédiaire (1 à 3 ans de pratique)</option>
                  <option value="avance">Avancé / Athlète de compétition</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                Précisions, contraintes ou questions (optionnel)
              </label>
              <textarea
                rows={3}
                placeholder="Indiquez vos éventuelles allergies, blessures ou contraintes de travail..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-xl hover:shadow-[#F80404]/30 active:scale-98 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer ma demande de bilan gratuit</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 text-[11px] text-white/50 text-center">
              <span>✓ 100% Confidentiel</span>
              <span>✓ Aucun engagement</span>
              <span>✓ Réponse sous 24h ouvrées</span>
              <span>🇨🇭 Équipe basée à Genève</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
