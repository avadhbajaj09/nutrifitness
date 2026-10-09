import { SupportedLocale } from './types';

export type SupportedCurrency = 'CHF' | 'EUR';

export interface LanguageOption {
  code: SupportedLocale;
  label: string;
  flag: string;
  shortName: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', shortName: 'FR' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', shortName: 'DE' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', shortName: 'IT' },
  { code: 'en', label: 'English', flag: '🇬🇧', shortName: 'EN' },
];

export const CURRENCY_OPTIONS: { code: SupportedCurrency; symbol: string; label: string }[] = [
  { code: 'CHF', symbol: 'CHF', label: 'CHF (Fr.)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
];

export interface TranslationDictionary {
  nav: {
    shop: string;
    brands: string;
    proteins: string;
    creatines: string;
    coaching: string;
    ebook: string;
    blog: string;
    search: string;
    account: string;
    cart: string;
    allProducts: string;
    filterByBrand: string;
  };
  topBar: {
    shipping24h: string;
    storeGeneva: string;
    stockSwiss: string;
    certified: string;
    twint: string;
  };
  common: {
    addToCart: string;
    viewAll: string;
    inStock: string;
    inStockGeneva: string;
    inStockPortugal: string;
    shippedFromPortugal: string;
    outOfStock: string;
    ruptureStock: string;
    onlyLeft: string;
    unitsInStock: string;
    quickView: string;
    freeShippingAbove: string;
    freeShippingUnlocked: string;
    securePayment: string;
    checkoutTwint: string;
    checkout: string;
    subtotal: string;
    shipping: string;
    total: string;
    free: string;
    vatIncluded: string;
    currency: string;
    language: string;
  };
  checkout: {
    title: string;
    subtitle: string;
    recipientDetails: string;
    shippingMode: string;
    paymentMode: string;
    orderSummary: string;
    confirmAndPay: string;
    thankYouTitle: string;
    thankYouSubtitle: string;
    thankYouMessage: string;
    orderNumber: string;
    estimatedDelivery: string;
    returnHome: string;
    trackOrder: string;
    stepOrderPlaced: string;
    stepPreparing: string;
    stepShipping: string;
    stepDelivered: string;
    celebrationBadge: string;
    paymentSuccess: string;
    expressDelivery: string;
    dispatchedFrom: string;
  };
}

export const TRANSLATIONS: Record<SupportedLocale, TranslationDictionary> = {
  fr: {
    nav: {
      shop: 'Boutique',
      brands: 'Marques',
      proteins: 'Protéines',
      creatines: 'Créatines',
      coaching: 'Coaching',
      ebook: 'Ebook',
      blog: 'Guides & Blog',
      search: 'Rechercher un produit...',
      account: 'Mon Compte',
      cart: 'Panier',
      allProducts: 'Tous nos compléments',
      filterByBrand: 'Filtrer par marque',
    },
    topBar: {
      shipping24h: '⚡ LIVRAISON 24H EN SUISSE (POSTPAC PRIORITY)',
      storeGeneva: '📍 BOUTIQUE PHYSIQUE À GENÈVE (34 RUE DES PÂQUIS)',
      stockSwiss: '🇨🇭 100% STOCK EN SUISSE – AUCUN FRAIS DE DOUANE',
      certified: '🛡️ COMPLÉMENTS ALIMENTAIRES CERTIFIÉS & TESTÉS',
      twint: '⚡ PAIEMENT INSTANTANÉ PAR TWINT & POSTFINANCE',
    },
    common: {
      addToCart: 'Ajouter au Panier',
      viewAll: 'Tout Voir',
      inStock: 'En stock à Genève (24h)',
      inStockGeneva: 'En stock à Genève',
      inStockPortugal: 'Expédié du Portugal',
      shippedFromPortugal: 'Expédié du Portugal',
      outOfStock: 'Rupture temporaire',
      ruptureStock: 'Rupture de stock',
      onlyLeft: 'Stock limité – vite épuisé',
      unitsInStock: 'En stock',
      quickView: 'Aperçu rapide',
      freeShippingAbove: 'Plus que {amount} pour la livraison offerte',
      freeShippingUnlocked: '🎉 Félicitations ! Livraison offerte partout en Suisse',
      securePayment: 'Paiement 100% sécurisé',
      checkoutTwint: 'Acheter en 1 clic avec TWINT',
      checkout: 'Valider la Commande',
      subtotal: 'Sous-total',
      shipping: 'Livraison',
      total: 'Total',
      free: 'OFFERT',
      vatIncluded: 'TVA suisse incluse',
      currency: 'Devise',
      language: 'Langue',
    },
    checkout: {
      title: 'Validation de votre Commande',
      subtitle: 'Paiement sécurisé SSL et expédition express depuis Genève',
      recipientDetails: 'Coordonnées du Destinataire',
      shippingMode: "Mode d'Expédition en Suisse",
      paymentMode: 'Moyen de Paiement Sécurisé',
      orderSummary: 'Récapitulatif de Commande',
      confirmAndPay: 'Confirmer et Payer',
      thankYouTitle: 'Commande Confirmée avec Succès !',
      thankYouSubtitle: 'Votre commande a été enregistrée et transmise à notre entrepôt de Genève.',
      thankYouMessage: 'Merci pour votre confiance. Votre colis est préparé avec le plus grand soin. Un numéro de suivi La Poste Suisse vous parviendra dans les prochaines minutes par SMS et e-mail.',
      orderNumber: 'Numéro de commande',
      estimatedDelivery: 'Livraison estimée : Sous 24h ouvrées (PostPac Priority)',
      returnHome: "Retour à l'Accueil",
      trackOrder: 'Suivre mon colis',
      stepOrderPlaced: 'Commande Enregistrée',
      stepPreparing: 'Préparation Genève',
      stepShipping: 'PostPac Priority 24h',
      stepDelivered: 'Livraison chez vous',
      celebrationBadge: '⚡ VALIDATION IMMÉDIATE',
      paymentSuccess: 'Paiement confirmé avec succès',
      expressDelivery: 'Expédition prioritaire 24h',
      dispatchedFrom: 'Expédié directement depuis 34 Rue des Pâquis, 1201 Genève',
    },
  },
  de: {
    nav: {
      shop: 'Shop',
      brands: 'Marken',
      proteins: 'Proteine',
      creatines: 'Kreatin',
      coaching: 'Coaching',
      ebook: 'E-Book',
      blog: 'Ratgeber & Blog',
      search: 'Produkt suchen...',
      account: 'Mein Konto',
      cart: 'Warenkorb',
      allProducts: 'Alle Sportnahrungsprodukte',
      filterByBrand: 'Nach Marke filtern',
    },
    topBar: {
      shipping24h: '⚡ 24H-LIEFERUNG IN DER SCHWEIZ (POSTPAC PRIORITY)',
      storeGeneva: '📍 STORE IN GENF (RUE DES PÂQUIS 34)',
      stockSwiss: '🇨🇭 100% SCHWEIZER LAGER – KEINE ZOLLGEBÜHREN',
      certified: '🛡️ GEPRÜFTE & ZERTIFIZIERTE SPORTNAHRUNG',
      twint: '⚡ SOFORTZAHLUNG MIT TWINT & POSTFINANCE',
    },
    common: {
      addToCart: 'In den Warenkorb',
      viewAll: 'Alle anzeigen',
      inStock: 'Auf Lager in Genf (24h)',
      inStockGeneva: 'Auf Lager in Genf',
      inStockPortugal: 'Versand aus Portugal',
      shippedFromPortugal: 'Versand aus Portugal',
      outOfStock: 'Vorübergehend vergriffen',
      ruptureStock: 'Nicht vorrätig',
      onlyLeft: 'Geringer Bestand – fast ausverkauft',
      unitsInStock: 'Auf Lager',
      quickView: 'Schnellansicht',
      freeShippingAbove: 'Noch {amount} bis zum kostenlosen Versand',
      freeShippingUnlocked: '🎉 Kostenloser Versand in der ganzen Schweiz',
      securePayment: '100% sichere Bezahlung',
      checkoutTwint: 'Mit 1 Klick per TWINT bestellen',
      checkout: 'Zur Kasse gehen',
      subtotal: 'Zwischensumme',
      shipping: 'Versand',
      total: 'Gesamtsumme',
      free: 'KOSTENLOS',
      vatIncluded: 'Inkl. Schweizer MwSt.',
      currency: 'Währung',
      language: 'Sprache',
    },
    checkout: {
      title: 'Bestellung abschliessen',
      subtitle: 'Sichere Bezahlung und Expressversand aus Genf',
      recipientDetails: 'Lieferadresse & Empfänger',
      shippingMode: 'Versandart in der Schweiz',
      paymentMode: 'Sichere Zahlungsmethode',
      orderSummary: 'Bestellübersicht',
      confirmAndPay: 'Jetzt verbindlich bestellen',
      thankYouTitle: 'Bestellung erfolgreich abgeschlossen!',
      thankYouSubtitle: 'Ihre Bestellung wurde erfasst und an unser Genfer Logistikzentrum übermittelt.',
      thankYouMessage: 'Vielen Dank für Ihr Vertrauen. Ihr Paket wird mit höchster Sorgfalt verpackt. Sie erhalten in Kürze Ihre Schweizer Post Tracking-Nummer per SMS und E-Mail.',
      orderNumber: 'Bestellnummer',
      estimatedDelivery: 'Voraussichtliche Zustellung: Innerhalb von 24h (PostPac Priority)',
      returnHome: 'Zurück zur Startseite',
      trackOrder: 'Sendung verfolgen',
      stepOrderPlaced: 'Bestellung erfasst',
      stepPreparing: 'Verpackung Genf',
      stepShipping: 'PostPac Priority 24h',
      stepDelivered: 'Erfolgreich zugestellt',
      celebrationBadge: '⚡ SOFORTIGE BESTÄTIGUNG',
      paymentSuccess: 'Zahlung erfolgreich bestätigt',
      expressDelivery: 'Prioritärer 24h-Versand',
      dispatchedFrom: 'Versand direkt ab Rue des Pâquis 34, 1201 Genf',
    },
  },
  it: {
    nav: {
      shop: 'Negozio',
      brands: 'Marchi',
      proteins: 'Proteine',
      creatines: 'Creatina',
      coaching: 'Coaching',
      ebook: 'Ebook',
      blog: 'Blog & Guide',
      search: 'Cerca un prodotto...',
      account: 'Il Mio Account',
      cart: 'Carrello',
      allProducts: 'Tutti gli integratori',
      filterByBrand: 'Filtra per marchio',
    },
    topBar: {
      shipping24h: '⚡ SPEDIZIONE 24H IN SVIZZERA (POSTPAC PRIORITY)',
      storeGeneva: '📍 NEGOZIO A GINEVRA (RUE DES PÂQUIS 34)',
      stockSwiss: '🇨🇭 100% STOCK IN SVIZZERA – NESSUN COSTO DOGANALE',
      certified: '🛡️ INTEGRATORI CERTIFICATI E TESTATI',
      twint: '⚡ PAGAMENTO ISTANTANEO CON TWINT & POSTFINANCE',
    },
    common: {
      addToCart: 'Aggiungi al Carrello',
      viewAll: 'Vedi Tutto',
      inStock: 'Disponibile a Ginevra (24h)',
      inStockGeneva: 'Disponibile a Ginevra',
      inStockPortugal: 'Spedito dal Portogallo',
      shippedFromPortugal: 'Spedito dal Portogallo',
      outOfStock: 'Momentaneamente esaurito',
      ruptureStock: 'Esaurito',
      onlyLeft: 'Disponibilità limitata – in rapido esaurimento',
      unitsInStock: 'Disponibile',
      quickView: 'Anteprima rapida',
      freeShippingAbove: 'Ancora {amount} per la spedizione gratuita',
      freeShippingUnlocked: '🎉 Spedizione gratuita sbloccata in Svizzera',
      securePayment: 'Pagamento sicuro al 100%',
      checkoutTwint: 'Acquista in 1 clic con TWINT',
      checkout: 'Concludi Ordine',
      subtotal: 'Subtotale',
      shipping: 'Spedizione',
      total: 'Totale',
      free: 'GRATIS',
      vatIncluded: 'IVA svizzera inclusa',
      currency: 'Valuta',
      language: 'Lingua',
    },
    checkout: {
      title: 'Completa il tuo Ordine',
      subtitle: 'Pagamento protetto SSL e spedizione espressa da Ginevra',
      recipientDetails: 'Dati del Destinatario',
      shippingMode: 'Metodo di Spedizione Svizzera',
      paymentMode: 'Metodo di Pagamento',
      orderSummary: "Riepilogo dell'Ordine",
      confirmAndPay: 'Conferma e Paga',
      thankYouTitle: 'Ordine Confermato con Successo!',
      thankYouSubtitle: 'Il tuo ordine è stato registrato ed inviato al nostro magazzino di Ginevra.',
      thankYouMessage: 'Grazie per la tua fiducia. Il tuo pacco viene preparato con massima cura. Riceverai il codice di tracciamento Posta Svizzera via SMS ed email a breve.',
      orderNumber: 'Numero ordine',
      estimatedDelivery: 'Consegna stimata: Entro 24 ore lavorative (PostPac Priority)',
      returnHome: 'Torna alla Home',
      trackOrder: 'Traccia la spedizione',
      stepOrderPlaced: 'Ordine Registrato',
      stepPreparing: 'Preparazione a Ginevra',
      stepShipping: 'PostPac Priority 24h',
      stepDelivered: 'Consegnato a domicilio',
      celebrationBadge: '⚡ CONFERMA IMMEDIATA',
      paymentSuccess: 'Pagamento confermato con successo',
      expressDelivery: 'Spedizione prioritaria 24h',
      dispatchedFrom: 'Spedito direttamente da Rue des Pâquis 34, 1201 Ginevra',
    },
  },
  en: {
    nav: {
      shop: 'Shop',
      brands: 'Brands',
      proteins: 'Proteins',
      creatines: 'Creatines',
      coaching: 'Coaching',
      ebook: 'Ebook',
      blog: 'Guides & Blog',
      search: 'Search products...',
      account: 'My Account',
      cart: 'Cart',
      allProducts: 'All Sports Nutrition',
      filterByBrand: 'Filter by Brand',
    },
    topBar: {
      shipping24h: '⚡ 24H DELIVERY IN SWITZERLAND (POSTPAC PRIORITY)',
      storeGeneva: '📍 FLAGSHIP STORE IN GENEVA (34 RUE DES PÂQUIS)',
      stockSwiss: '🇨🇭 100% SWISS STOCK – NO HIDDEN CUSTOMS FEES',
      certified: '🛡️ TESTED & CERTIFIED SPORTS NUTRITION',
      twint: '⚡ INSTANT CHECKOUT WITH TWINT & POSTFINANCE',
    },
    common: {
      addToCart: 'Add to Cart',
      viewAll: 'View All',
      inStock: 'In stock in Geneva (24h)',
      inStockGeneva: 'In stock in Geneva',
      inStockPortugal: 'Shipped from Portugal',
      shippedFromPortugal: 'Shipped from Portugal',
      outOfStock: 'Temporarily out of stock',
      ruptureStock: 'Out of stock',
      onlyLeft: 'Few items left – selling fast',
      unitsInStock: 'In stock',
      quickView: 'Quick view',
      freeShippingAbove: 'Add {amount} more for free Swiss delivery',
      freeShippingUnlocked: '🎉 Congratulations! Free Swiss shipping unlocked',
      securePayment: '100% Secure Payment',
      checkoutTwint: '1-Click Checkout with TWINT',
      checkout: 'Proceed to Checkout',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      total: 'Total',
      free: 'FREE',
      vatIncluded: 'Swiss VAT included',
      currency: 'Currency',
      language: 'Language',
    },
    checkout: {
      title: 'Secure Checkout',
      subtitle: '256-bit SSL encrypted checkout & priority dispatch from Geneva',
      recipientDetails: 'Shipping & Contact Details',
      shippingMode: 'Swiss Shipping Method',
      paymentMode: 'Secure Payment Option',
      orderSummary: 'Order Summary',
      confirmAndPay: 'Confirm & Place Order',
      thankYouTitle: 'Order Placed Successfully!',
      thankYouSubtitle: 'Your order has been confirmed and routed to our central Geneva depot.',
      thankYouMessage: 'Thank you for choosing NutriFitness Geneva! Your parcel is being carefully packed. You will receive Swiss Post tracking details via SMS and email within minutes.',
      orderNumber: 'Order Number',
      estimatedDelivery: 'Estimated delivery: Within 24 business hours (PostPac Priority)',
      returnHome: 'Back to Home',
      trackOrder: 'Track Parcel Live',
      stepOrderPlaced: 'Order Placed',
      stepPreparing: 'Geneva Fulfillment',
      stepShipping: 'PostPac Priority 24h',
      stepDelivered: 'Delivered at Doorstep',
      celebrationBadge: '⚡ INSTANT CONFIRMATION',
      paymentSuccess: 'Payment securely confirmed',
      expressDelivery: '24h Priority Shipping',
      dispatchedFrom: 'Dispatched directly from 34 Rue des Pâquis, 1201 Geneva',
    },
  },
};
