'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function ContactClient() {
  const { showToast } = useStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: 'conseil',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Message Envoyé', 'Votre message a bien été transmis à l\'équipe NutriFitness Genève. Nous vous répondrons sous 24h ouvrées.');
    }, 700);
  };

  const faqs = [
    {
      q: 'Comment contacter Nutrifitness ?',
      a: 'Vous pouvez nous joindre par téléphone au +41 79 250 35 64, par e-mail à info@nutrifitness.ch (ou support@nutrifitness.ch) ou en vous rendant directement à notre boutique de Genève (34 Rue des Pâquis). Pour toute demande relative à une commande, veillez à indiquer votre numéro de commande.'
    },
    {
      q: 'Quels sont vos horaires de réponse téléphonique et e-mail ?',
      a: 'Nous répondons par téléphone et e-mail du Lundi au Vendredi de 10h00 à 19h00 et le Samedi de 12h00 à 17h00. Les messages envoyés en dehors de ces plages horaires sont traités dès l\'ouverture le jour ouvré suivant.'
    },
    {
      q: 'Je souhaite modifier ou suivre ma commande : à qui m\'adresser ?',
      a: 'Écrivez-nous directement à support@nutrifitness.ch en indiquant votre numéro de commande et l\'adresse e-mail utilisée lors de l\'achat. Vous pouvez également consulter le statut de votre colis en temps réel sur la page Suivi de commande avec votre numéro de suivi La Poste Suisse.'
    },
    {
      q: 'Puis-je obtenir un conseil nutritionnel ou produit personnalisé par message ?',
      a: 'Oui, tout à fait. Précisez votre profil (âge, poids, niveau sportif, éventuelles intolérances au lactose ou allergies) et votre objectif principal (perte de poids, prise de masse, endurance). Notre équipe vous conseillera avec franchise et précision.'
    },
    {
      q: 'Comment signaler un problème sur un produit ou un colis endommagé ?',
      a: 'Prenez 2 ou 3 photos nettes du carton et du produit concerné, puis envoyez-les avec votre numéro de commande à support@nutrifitness.ch dans un délai de 14 jours suivant la livraison. Nous traiterons votre demande en priorité pour un renvoi immédiat ou un remboursement.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-[#F80404] font-bold">Contactez-nous</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider mb-3 font-heading">
          <MessageSquare className="w-3.5 h-3.5" />
          Service Client Genève
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          Contactez <span className="text-[#F80404]">NutriFitness Genève</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-2">
          Une question sur un produit, une commande en cours ou besoin d&apos;un conseil expert ? Nous sommes à votre écoute.
        </p>
      </header>

      {/* 2-Column Contact: Left Info, Right Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        
        {/* Left Column: Direct Coords */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 space-y-5">
            <h2 className="text-lg font-black uppercase text-white font-heading">Coordonnées Directes</h2>

            <a 
              href="tel:+41792503564"
              className="flex items-start gap-3 text-xs text-white/80 hover:text-white group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F80404]/10 text-[#F80404] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block uppercase text-[10px] text-white/50">Téléphone & WhatsApp</span>
                <span className="text-sm font-black text-white group-hover:text-[#F80404] transition-colors">+41 79 250 35 64</span>
                <p className="text-[11px] text-white/50 mt-0.5">Lun – Ven : 12h30–19h | Sam : 12h–17h</p>
              </div>
            </a>

            <a 
              href="mailto:info@nutrifitness.ch"
              className="flex items-start gap-3 text-xs text-white/80 hover:text-white group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#95d600]/10 text-[#95d600] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block uppercase text-[10px] text-white/50">Courrier électronique</span>
                <span className="text-sm font-black text-white group-hover:text-[#95d600] transition-colors">info@nutrifitness.ch</span>
                <p className="text-[11px] text-white/50 mt-0.5">support@nutrifitness.ch (commandes)</p>
              </div>
            </a>

            <div className="flex items-start gap-3 text-xs text-white/80 pt-2 border-t border-white/5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block uppercase text-[10px] text-white/50">Boutique physique à Genève</span>
                <span className="text-sm font-bold text-white">34 Rue des Pâquis, 1201 Genève</span>
                <p className="text-[11px] text-white/50 mt-0.5">À 400m de la Gare Cornavin · Tram 15 (Môle)</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-black/40 border border-white/5 text-xs text-white/60 space-y-2">
            <h3 className="font-bold text-white uppercase text-[11px] font-heading flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F80404]" />
              Délai Moyen de Réponse
            </h3>
            <p>
              Nous traitons l&apos;ensemble des messages sous <strong>24 heures ouvrées</strong>. Pour les urgences concernant une livraison en cours, privilégiez le téléphone.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-[#141414] rounded-3xl border border-white/10 p-6 sm:p-8">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#95d600]/10 text-[#95d600] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black uppercase text-white font-heading">Message Envoyé !</h3>
              <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                Merci <strong>{formData.name}</strong>. Votre message a bien été transmis à l&apos;équipe NutriFitness. Nous vous répondrons très rapidement par e-mail.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-[#F80404] underline hover:text-[#FF3D00] font-bold"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h2 className="text-lg font-black uppercase text-white font-heading mb-2">Formulaire de Message</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-white/80 mb-1.5 uppercase text-[10px]">
                    Votre Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white/80 mb-1.5 uppercase text-[10px]">
                    Adresse E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean@example.ch"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-white/80 mb-1.5 uppercase text-[10px]">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+41 79 123 45 67"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white/80 mb-1.5 uppercase text-[10px]">
                    Objet de Votre Message *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-[#F80404] focus:outline-none"
                  >
                    <option value="conseil">Conseil produit ou nutrition</option>
                    <option value="commande">Question sur une commande en cours</option>
                    <option value="retour">Demande de retour ou échange (14 jours)</option>
                    <option value="boutique">Renseignement boutique Genève / Click & Collect</option>
                    <option value="partenariat">Partenariat ou salle de sport</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-white/80 mb-1.5 uppercase text-[10px]">
                  Numéro de Commande (facultatif)
                </label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  placeholder="Ex : NF-10842"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-white/80 mb-1.5 uppercase text-[10px]">
                  Votre Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Écrivez votre message ici..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer mon message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>

      {/* FAQ Section */}
      <section className="mb-14 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80 uppercase font-heading mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#F80404]" />
            FAQ Contact
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
            Questions Fréquentes — Assistance
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
        <Link href="/boutique-geneve/" className="text-[#F80404] hover:underline">
          Voir la boutique physique des Pâquis →
        </Link>
      </div>

    </div>
  );
}
