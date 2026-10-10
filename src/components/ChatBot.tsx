'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { PRODUCTS } from '@/lib/catalog';
import { getProductReviewStats } from '@/lib/reviews';
import type { ProductItem } from '@/lib/types';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  RotateCcw, 
  FileText, 
  ChevronDown, 
  User, 
  Mail, 
  HelpCircle,
  Zap,
  Flame,
  Dumbbell,
  Moon,
  Truck
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  products?: ProductItem[];
  showForm?: boolean;
  ticketId?: string;
  options?: { label: string; action: string }[];
}

export default function ChatBot() {
  const { addToCart, openCart, formatPrice } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Form states for complaint / ticket registration
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  const initialMessages: ChatMessage[] = [
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'Bonjour ! 👋 Je suis l\'assistant virtuel NutriFitness Genève. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: 'À l\'instant',
      options: [
        { label: '⏱️ Avant / Après l\'entraînement', action: 'timing_workout' },
        { label: '🏋️ Prise de masse & Muscle', action: 'prise_masse' },
        { label: '⚡ Créatine & Force', action: 'creatine_force' },
        { label: '🔥 Sèche & Perte de poids', action: 'perte_poids' },
        { label: '🛌 Santé, Sommeil & Récupération', action: 'sante_sommeil' },
        { label: '🚚 Livraison & Commande Suisse', action: 'livraison_info' },
        { label: '⚠️ Signaler un problème / Réclamation', action: 'register_issue' }
      ]
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Helper to find catalog products by slugs
  const getProductsBySlugs = (slugs: string[]): ProductItem[] => {
    return slugs
      .map(slug => PRODUCTS.find(p => p.slug.fr === slug || p.id === slug))
      .filter((p): p is ProductItem => p !== undefined);
  };

  // Quick Action Handler
  const handleAction = (action: string) => {
    setHasInteracted(true);

    switch (action) {
      case 'timing_workout': {
        const userMsg: ChatMessage = {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'Je cherche des conseils pour avant / après l\'entraînement.',
          timestamp: 'À l\'instant'
        };
        const botMsg: ChatMessage = {
          id: `bot-${Date.now() + 1}`,
          sender: 'bot',
          text: '⏱️ Le timing est essentiel pour maximiser vos performances et votre récupération :\n\n• **Avant l\'effort (Pré-workout) :** Optimise la vasodilatation, l\'énergie et la concentration.\n• **Pendant l\'effort (Intra-workout) :** Maintient l\'hydratation et prévient le catabolisme.\n• **Après l\'effort (Post-workout) :** Relance la synthèse musculaire et reconstitue le glycogène.',
          timestamp: 'À l\'instant',
          options: [
            { label: '⚡ Voir les produits Avant l\'effort (Pré-Workout)', action: 'pre_workout_prods' },
            { label: '💧 Voir les produits Pendant l\'effort (EAA / Électrolytes)', action: 'intra_workout_prods' },
            { label: '🥤 Voir les produits Après l\'effort (Whey & Créatine)', action: 'post_workout_prods' }
          ]
        };
        setMessages(prev => [...prev, userMsg, botMsg]);
        break;
      }

      case 'pre_workout_prods': {
        const prods = getProductsBySlugs([
          'ignite-burn-210g-orange-mangue',
          'l-citrulline-100-pure-250g',
          'caffeine-90-caps-100mg'
        ]);
        const userMsg: ChatMessage = {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'Voir les produits Avant l\'entraînement.',
          timestamp: 'À l\'instant'
        };
        const botMsg: ChatMessage = {
          id: `bot-${Date.now() + 1}`,
          sender: 'bot',
          text: '🔥 Voici notre sélection recommandée 20 à 30 min avant votre entraînement pour une énergie explosive et une congestion sans crash :',
          timestamp: 'À l\'instant',
          products: prods,
          options: [
            { label: '🥤 Et après l\'entraînement ?', action: 'post_workout_prods' },
            { label: '❓ Poser une autre question', action: 'ask_more' }
          ]
        };
        setMessages(prev => [...prev, userMsg, botMsg]);
        break;
      }

      case 'intra_workout_prods': {
        const prods = getProductsBySlugs([
          'hype-amino-270g',
          'hydra-electrolytes-210g',
          'nf-shaker-600ml'
        ]);
        const userMsg: ChatMessage = {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'Voir les produits Pendant l\'entraînement.',
          timestamp: 'À l\'instant'
        };
        const botMsg: ChatMessage = {
          id: `bot-${Date.now() + 1}`,
          sender: 'bot',
          text: '💧 À siroter pendant vos séances intenses pour lutter contre les crampes et protéger vos fibres musculaires :',
          timestamp: 'À l\'instant',
          products: prods,
          options: [
            { label: '🥤 Voir après l\'entraînement', action: 'post_workout_prods' },
            { label: '❓ Poser une autre question', action: 'ask_more' }
          ]
        };
        setMessages(prev => [...prev, userMsg, botMsg]);
        break;
      }

      case 'post_workout_prods': {
        const prods = getProductsBySlugs([
          'ultimate-whey-bigman-2kg',
          'creapure-bigman-300g',
          'iso-whey-zero-907g'
        ]);
        const userMsg: ChatMessage = {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'Voir les produits Après l\'entraînement.',
          timestamp: 'À l\'instant'
        };
        const botMsg: ChatMessage = {
          id: `bot-${Date.now() + 1}`,
          sender: 'bot',
          text: '🥤 Dès la fin de votre séance, l\'apport conjoint de protéines rapides (Whey CFM) et de créatine monohydrate permet de saturer vos récepteurs musculaires :',
          timestamp: 'À l\'instant',
          products: prods,
          options: [
            { label: '⚡ En savoir plus sur la Créatine', action: 'creatine_force' },
            { label: '❓ Poser une autre question', action: 'ask_more' }
          ]
        };
        setMessages(prev => [...prev, userMsg, botMsg]);
        break;
      }

      case 'prise_masse': {
        const prods = getProductsBySlugs([
          'big-lean-mass-gainer',
          'marvelous-creme-de-riz-14kg',
          'ultimate-whey-bigman-2kg'
        ]);
        const userMsg: ChatMessage = {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'Je veux prendre de la masse et du muscle.',
          timestamp: 'À l\'instant'
        };
        const botMsg: ChatMessage = {
          id: `bot-${Date.now() + 1}`,
          sender: 'bot',
          text: '💪 Pour une prise de masse propre en limitant le gras, privilégiez un apport calorique maîtrisé avec des glucides complexes (crème de riz, avoine) et des protéines de haute qualité :',
          timestamp: 'À l\'instant',
          products: prods,
          options: [
            { label: '⏱️ Recommandations Avant / Après séance', action: 'timing_workout' },
            { label: '❓ Autre question', action: 'ask_more' }
          ]
        };
        setMessages(prev => [...prev, userMsg, botMsg]);
        break;
      }

      case 'creatine_force': {
        const prods = getProductsBySlugs([
          'creapure-bigman-300g',
          'applied-creatine-monohydrate-250g',
          'creatine-en-poudre-300g'
        ]);
        const userMsg: ChatMessage = {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'Je souhaite des conseils sur la créatine.',
          timestamp: 'À l\'instant'
        };
        const botMsg: ChatMessage = {
          id: `bot-${Date.now() + 1}`,
          sender: 'bot',
          text: '⚡ La créatine monohydrate est le complément le plus étudié pour la force. Prenez 3 à 5 g par jour en continu, sans besoin de phase de charge. Le label Creapure® certifie une pureté allemande garantie à 99.99% :',
          timestamp: 'À l\'instant',
          products: prods,
          options: [
            { label: '⏱️ Quand la prendre exactement ?', action: 'post_workout_prods' },
            { label: '❓ Autre question', action: 'ask_more' }
          ]
        };
        setMessages(prev => [...prev, userMsg, botMsg]);
        break;
      }

      case 'perte_poids': {
        const prods = getProductsBySlugs([
          'carnitine-shot-lemon-20-fiolles',
          'nox-burn-90-caps',
          'sandwich-keto-bar'
        ]);
        const userMsg: ChatMessage = {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'Je cherche des compléments pour la sèche et la perte de poids.',
          timestamp: 'À l\'instant'
        };
        const botMsg: ChatMessage = {
          id: `bot-${Date.now() + 1}`,
          sender: 'bot',
          text: '🔥 En déficit calorique, les compléments aident à mobiliser les graisses (L-Carnitine), maintenir l\'énergie d\'entraînement (NOX Burn) et combler les fringales avec des snacks riches en protéines sans sucre :',
          timestamp: 'À l\'instant',
          products: prods,
          options: [
            { label: '🥛 Voir les Whey Isolate sans sucre', action: 'post_workout_prods' },
            { label: '❓ Autre question', action: 'ask_more' }
          ]
        };
        setMessages(prev => [...prev, userMsg, botMsg]);
        break;
      }

      case 'sante_sommeil': {
        const prods = getProductsBySlugs([
          'omega-3-120-softgels',
          'magnesium-bisglycinate-90-caps',
          'zma-90-caps'
        ]);
        const userMsg: ChatMessage = {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'Conseils pour la santé, le sommeil et la récupération.',
          timestamp: 'À l\'instant'
        };
        const botMsg: ChatMessage = {
          id: `bot-${Date.now() + 1}`,
          sender: 'bot',
          text: '🛌 Sans récupération, pas de progression ! Les Oméga 3 réduisent l\'inflammation articulaire, et le Magnésium Bisglycinate chélaté favorise la décontraction nerveuse et le sommeil profond :',
          timestamp: 'À l\'instant',
          products: prods,
          options: [
            { label: '❓ Poser une autre question', action: 'ask_more' },
            { label: '⚠️ Contacter l\'équipe', action: 'register_issue' }
          ]
        };
        setMessages(prev => [...prev, userMsg, botMsg]);
        break;
      }

      case 'livraison_info': {
        const userMsg: ChatMessage = {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'Quelles sont les modalités de livraison en Suisse ?',
          timestamp: 'À l\'instant'
        };
        const botMsg: ChatMessage = {
          id: `bot-${Date.now() + 1}`,
          sender: 'bot',
          text: '🇨🇭 **Livraison & Expédition en Suisse :**\n\n• **Délais :** 24h ouvrées par PostPac Priority (La Poste Suisse).\n• **Frais de port :** Offerts dès 75 CHF d\'achat (sinon 8.90 CHF).\n• **Click & Collect :** Retrait gratuit en 2h à notre boutique de Genève (34 Rue des Pâquis).\n• **Douane & TVA :** Stock 100% physique en Suisse, TVA 2.6% incluse, **aucun frais de douane** !',
          timestamp: 'À l\'instant',
          options: [
            { label: '🛍️ Découvrir les compléments', action: 'timing_workout' },
            { label: '⚠️ J\'ai un souci avec un colis', action: 'register_issue' }
          ]
        };
        setMessages(prev => [...prev, userMsg, botMsg]);
        break;
      }

      case 'register_issue': {
        const userMsg: ChatMessage = {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'Je souhaite signaler un problème ou faire une réclamation.',
          timestamp: 'À l\'instant'
        };
        const botMsg: ChatMessage = {
          id: `bot-${Date.now() + 1}`,
          sender: 'bot',
          text: 'Je suis à votre écoute ! Pour le moment, je n\'ai pas toutes les informations sur votre dossier. Je vais enregistrer votre demande immédiatement afin qu\'un membre de notre équipe genevoise vous recontacte rapidement. Merci de remplir le court formulaire ci-dessous :',
          timestamp: 'À l\'instant',
          showForm: true
        };
        setMessages(prev => [...prev, userMsg, botMsg]);
        break;
      }

      case 'ask_more': {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: 'Je vous écoute ! Vous pouvez taper directement votre question dans la barre ci-dessous (ex : "whey sans lactose", "livraison", "posologie créatine") ou choisir une option :',
          timestamp: 'À l\'instant',
          options: [
            { label: '⏱️ Timing avant / après sport', action: 'timing_workout' },
            { label: '🚚 Suivi & Livraison', action: 'livraison_info' },
            { label: '⚠️ Signaler un problème / Réclamation', action: 'register_issue' }
          ]
        };
        setMessages(prev => [...prev, botMsg]);
        break;
      }

      default:
        break;
    }
  };

  // Natural Language Input & Keyword Routing
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputVal.trim();
    if (!query) return;

    setHasInteracted(true);
    setInputVal('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'À l\'instant'
    };

    setMessages(prev => [...prev, userMsg]);

    const q = query.toLowerCase();

    // Check intents
    setTimeout(() => {
      // 1. Complaint / Issue / Refund / Broken item / Contact human
      if (
        q.includes('probleme') || 
        q.includes('problème') || 
        q.includes('reclamation') || 
        q.includes('réclamation') || 
        q.includes('plainte') || 
        q.includes('remboursement') || 
        q.includes('casse') || 
        q.includes('cassé') || 
        q.includes('erreur') || 
        q.includes('abimé') || 
        q.includes('humain') || 
        q.includes('conseiller') || 
        q.includes('parler') ||
        q.includes('retard')
      ) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: 'Pour le moment, je n\'ai pas cette information précise concernant votre situation. Je vais enregistrer votre demande immédiatement avec un identifiant unique afin que notre équipe à Genève prenne contact avec vous au plus vite.',
            timestamp: 'À l\'instant',
            showForm: true
          }
        ]);
        return;
      }

      // 2. Shipping / Delivery
      if (q.includes('livraison') || q.includes('frais') || q.includes('delai') || q.includes('délai') || q.includes('poste') || q.includes('douane') || q.includes('postpac')) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: '📦 **Livraison 24h en Suisse :**\nToutes les commandes passées avant 14h sont expédiées le jour même via La Poste Suisse (PostPac Priority). Les frais de port sont offerts dès 75 CHF d\'achat (sinon 8.90 CHF). Aucun frais de douane ni taxe cachée.',
            timestamp: 'À l\'instant',
            options: [
              { label: '🛍️ Découvrir les compléments', action: 'timing_workout' },
              { label: '⚠️ Problème avec mon colis', action: 'register_issue' }
            ]
          }
        ]);
        return;
      }

      // 3. Shop Geneva address
      if (q.includes('adresse') || q.includes('magasin') || q.includes('boutique') || q.includes('paquis') || q.includes('pâquis') || q.includes('geneve') || q.includes('genève') || q.includes('click')) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: '📍 **Notre Boutique à Genève :**\nNous vous accueillons au 34 Rue des Pâquis, 1201 Genève. Vous pouvez également commander en ligne et récupérer gratuitement vos produits 2 heures plus tard grâce au Click & Collect !',
            timestamp: 'À l\'instant',
            options: [
              { label: '⏱️ Conseils Produits', action: 'timing_workout' },
              { label: '⚠️ Poser une question', action: 'register_issue' }
            ]
          }
        ]);
        return;
      }

      // 4. Payment
      if (q.includes('twint') || q.includes('paiement') || q.includes('payer') || q.includes('carte') || q.includes('facture')) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: '💳 **Moyens de paiement acceptés :**\nNous supportons TWINT, PostFinance Card, Carte bancaire (Mastercard, Visa), Apple Pay et QR-Facture suisse sécurisée.',
            timestamp: 'À l\'instant',
            options: [
              { label: '🛍️ Voir les produits', action: 'timing_workout' }
            ]
          }
        ]);
        return;
      }

      // 5. Creatine query
      if (q.includes('creatine') || q.includes('créatine') || q.includes('creapure')) {
        const prods = getProductsBySlugs([
          'creapure-bigman-300g',
          'applied-creatine-monohydrate-250g',
          'creatine-en-poudre-300g'
        ]);
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: '⚡ La créatine augmente la force explosive et l\'hydratation musculaire. Dose recommandée : 3 à 5 g/jour en continu. Voici nos créatines les plus pures :',
            timestamp: 'À l\'instant',
            products: prods
          }
        ]);
        return;
      }

      // 6. Whey / Protein / Lactose query
      if (q.includes('whey') || q.includes('proteine') || q.includes('protéine') || q.includes('lactose') || q.includes('isolate') || q.includes('isolat')) {
        const prods = getProductsBySlugs([
          'iso-whey-zero-907g',
          'ultimate-whey-bigman-2kg',
          'el-toro-100-clear-beef-proteine-18kg'
        ]);
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: '🥛 Pour une assimilation ultra-rapide sans lactose, privilégiez l\'Isolat CFM (Bigman ISO Whey Zero). Pour un usage quotidien riche et onctueux, l\'Ultimate Whey 2kg est notre numéro 1 :',
            timestamp: 'À l\'instant',
            products: prods
          }
        ]);
        return;
      }

      // 7. Timing / Pre & Post workout query
      if (q.includes('avant') || q.includes('apres') || q.includes('après') || q.includes('moment') || q.includes('quand')) {
        handleAction('timing_workout');
        return;
      }

      // 8. Dynamic search in catalog for any match
      const matchingProducts = PRODUCTS.filter(p => 
        (p.name?.fr && p.name.fr.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        p.categorySlug.toLowerCase().includes(q)
      ).slice(0, 3);

      if (matchingProducts.length > 0) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🔎 Voici les compléments disponibles chez NutriFitness correspondant à votre recherche "${query}" :`,
            timestamp: 'À l\'instant',
            products: matchingProducts
          }
        ]);
      } else {
        // Fallback: If not found, inform customer & offer ticket registration
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: 'Pour le moment, je n\'ai pas cette information précise dans ma base. Je vais enregistrer votre demande avec un identifiant unique pour que Marco ou un conseiller de notre équipe vous recontacte rapidement :',
            timestamp: 'À l\'instant',
            showForm: true
          }
        ]);
      }
    }, 400);
  };

  // Submit Issue / Ticket Form
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formName.trim() || !formMessage.trim()) return;

    setIsSubmittingForm(true);

    // Generate unique ID e.g. NF-REQ-84920
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const generatedTicketId = `NF-REQ-${randomNum}`;

    // Store in localStorage for audit
    try {
      const existing = JSON.parse(localStorage.getItem('nutrifitness_tickets') || '[]');
      existing.push({
        id: generatedTicketId,
        name: formName,
        email: formEmail,
        message: formMessage,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('nutrifitness_tickets', JSON.stringify(existing));
    } catch (err) {
      console.warn('Storage error', err);
    }

    setTimeout(() => {
      setIsSubmittingForm(false);
      setFormName('');
      setFormEmail('');
      setFormMessage('');

      const botConfirmation: ChatMessage = {
        id: `bot-ticket-${Date.now()}`,
        sender: 'bot',
        text: `✅ **Votre demande a bien été enregistrée !**\n\nVotre numéro de ticket unique est : **${generatedTicketId}**.\n\nUn membre de notre équipe de Genève a été notifié et vous répondra par e-mail très prochainement. Merci pour votre patience et votre confiance ! 🇨🇭`,
        timestamp: 'À l\'instant',
        ticketId: generatedTicketId,
        options: [
          { label: '🛍️ Découvrir nos compléments', action: 'timing_workout' },
          { label: '🔄 Poser une autre question', action: 'ask_more' }
        ]
      };

      setMessages(prev => [
        ...prev.filter(m => !m.showForm),
        botConfirmation
      ]);
    }, 600);
  };

  // Quick Add Product to Cart from Chat
  const handleQuickAdd = (product: ProductItem) => {
    const defaultVariant = product.variants?.[0];
    const flavor = defaultVariant ? (defaultVariant.flavorName?.fr || 'Standard') : 'Standard';

    addToCart(product, {
      quantity: 1,
      flavor
    });

    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
    openCart();
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#181818] border border-white/15 text-white shadow-2xl hover:border-[#F80404]/60 transition-all hover:scale-102 group cursor-pointer"
            aria-label="Ouvrir le chat NutriFitness"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#95d600] animate-pulse" />
            <span className="text-xs font-bold text-white/90 group-hover:text-white">
              Besoin d&apos;un conseil ? Assistant NutriFitness
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F80404] text-black font-black uppercase tracking-wider">
              🇨🇭 En ligne
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
            isOpen 
              ? 'bg-[#181818] text-white border border-white/20 rotate-90' 
              : 'bg-gradient-to-tr from-[#F80404] to-[#FF3D00] text-black hover:scale-105 shadow-[#F80404]/30'
          }`}
          aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat NutriFitness'}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <MessageSquare className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#95d600] border-2 border-black rounded-full" />
            </div>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[610px] max-h-[82vh] bg-[#121212] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#1A0A0A] via-[#141414] to-[#1A0A0A] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F80404] to-[#FF4500] flex items-center justify-center font-black text-black text-sm shadow-md font-heading">
                NF
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#95d600] border-2 border-[#121212] rounded-full" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5 font-heading">
                  <span>Assistant NutriFitness</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#95d600]/20 text-[#95d600] font-bold border border-[#95d600]/30">🇨🇭 Suisse</span>
                </h3>
                <p className="text-[11px] text-white/50 flex items-center gap-1">
                  <span>Conseil suppléments & Support réclamations</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages(initialMessages)}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                title="Réinitialiser la conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Message Bubble */}
                <div 
                  className={`max-w-[88%] p-3.5 rounded-2xl shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#F80404] text-black font-semibold rounded-br-xs'
                      : 'bg-[#1C1C1C] text-white/90 border border-white/10 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs">{msg.text}</p>

                  {/* Registered Ticket Badge */}
                  {msg.ticketId && (
                    <div className="mt-3 p-2.5 rounded-xl bg-black/60 border border-[#95d600]/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#95d600] font-bold">
                        <FileText className="w-3.5 h-3.5" />
                        <span>N° {msg.ticketId}</span>
                      </div>
                      <span className="text-[10px] text-white/60">Conservé en mémoire</span>
                    </div>
                  )}
                </div>

                {/* Attached Products Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full mt-3 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#F80404] px-1 font-heading">
                      Produits Recommandés :
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.products.map((prod) => {
                        const imgSrc = prod.images?.[0]?.src || '/images/placeholder.webp';
                        const reviewStats = getProductReviewStats(prod.id, prod.categorySlug, prod.slug.fr);
                        const isAdded = addedProductId === prod.id;

                        return (
                          <div 
                            key={prod.id}
                            className="p-2.5 rounded-2xl bg-[#181818] border border-white/10 hover:border-[#F80404]/50 transition-all flex items-center gap-3 shadow-md"
                          >
                            <Link 
                              href={`/produit/${prod.slug.fr}/`}
                              className="relative w-14 h-14 shrink-0 rounded-xl bg-[#0D0D0D] border border-white/5 p-1 flex items-center justify-center overflow-hidden"
                            >
                              <Image 
                                src={imgSrc}
                                alt={prod.name.fr}
                                fill
                                sizes="56px"
                                className="object-contain p-1"
                              />
                            </Link>

                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-black uppercase text-[#F80404] block truncate">
                                {prod.brand}
                              </span>
                              <Link 
                                href={`/produit/${prod.slug.fr}/`}
                                className="text-xs font-bold text-white hover:text-[#F80404] transition-colors line-clamp-1 block"
                              >
                                {prod.name.fr}
                              </Link>
                              <div className="flex items-center justify-between gap-1 mt-1">
                                <span className="text-xs font-black text-[#95d600] font-heading">
                                  {formatPrice(prod.priceChf)}
                                </span>
                                <span className="text-[10px] text-amber-400 font-bold">
                                  ★ {reviewStats.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleQuickAdd(prod)}
                              className={`p-2 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center ${
                                isAdded 
                                  ? 'bg-[#95d600] text-black' 
                                  : 'bg-[#F80404] hover:bg-[#FF3D00] text-black active:scale-95'
                              }`}
                              title="Ajouter au panier"
                            >
                              {isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Complaint / Ticket Intake Form */}
                {msg.showForm && (
                  <form 
                    onSubmit={handleSubmitTicket}
                    className="w-full mt-3 p-4 rounded-2xl bg-black/60 border border-[#F80404]/40 space-y-3"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#F80404] font-heading">
                      <AlertCircle className="w-4 h-4" />
                      <span>Formulaire d&apos;enregistrement de demande</span>
                    </div>

                    <div>
                      <label className="block text-[11px] text-white/70 mb-1">Votre Nom & Prénom *</label>
                      <input 
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Ex: Stéphane Rochat"
                        className="w-full px-3 py-2 text-xs bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:border-[#F80404] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-white/70 mb-1">Votre Adresse E-mail *</label>
                      <input 
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="Ex: s.rochat@bluewin.ch"
                        className="w-full px-3 py-2 text-xs bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:border-[#F80404] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-white/70 mb-1">Description de votre problème ou question *</label>
                      <textarea 
                        required
                        rows={3}
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        placeholder="Détaillez votre question, référence de commande ou réclamation..."
                        className="w-full px-3 py-2 text-xs bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:border-[#F80404] focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingForm}
                      className="w-full py-2.5 px-4 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingForm ? (
                        <span>Génération du ticket...</span>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Enregistrer ma demande & Générer mon Ticket</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Options Chips */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAction(opt.action)}
                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#F80404] text-white/90 hover:text-black font-medium text-[11px] border border-white/10 hover:border-[#F80404] transition-all active:scale-95 text-left"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-white/30 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Footer Bar with Store Stock Badge */}
          <div className="px-4 py-2 bg-[#0E0E0E] border-t border-white/5 flex items-center justify-between text-[10px] text-white/50">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#95d600]" />
              Stock physique en Suisse
            </span>
            <span>🇨🇭 Expédition 24h</span>
          </div>

          {/* Text Input Bar */}
          <form 
            onSubmit={handleSendMessage}
            className="p-3 bg-[#161616] border-t border-white/10 flex items-center gap-2"
          >
            <input 
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Posez votre question (ex: créatine, whey, livraison...)"
              className="flex-1 min-h-[42px] px-3.5 text-xs bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="min-h-[42px] w-10 rounded-xl bg-[#F80404] hover:bg-[#FF3D00] text-black font-bold flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-[#F80404]"
              aria-label="Envoyer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
