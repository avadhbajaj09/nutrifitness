'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore, CartItem } from '@/context/StoreContext';
import ThankYouAnimation from '@/components/ThankYouAnimation';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Package, 
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { FlagIcon } from '@/components/delivery/FlagIcon';
import { useDeliveryEstimates } from '@/hooks/useDeliveryEstimate';
import { isProductDeliverableToCountry } from '@/lib/delivery/defaults';

interface SupportedCountry {
  code: string;
  name: string;
  isEu: boolean;
  flag: string;
}

const SUPPORTED_COUNTRIES: SupportedCountry[] = [
  { code: 'CH', name: 'Suisse', isEu: false, flag: '🇨🇭' },
  { code: 'LI', name: 'Liechtenstein', isEu: false, flag: '🇱🇮' },
  { code: 'FR', name: 'France', isEu: true, flag: '🇫🇷' },
  { code: 'DE', name: 'Allemagne', isEu: true, flag: '🇩🇪' },
  { code: 'IT', name: 'Italie', isEu: true, flag: '🇮🇹' },
  { code: 'AT', name: 'Autriche', isEu: true, flag: '🇦🇹' },
  { code: 'ES', name: 'Espagne', isEu: true, flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', isEu: true, flag: '🇵🇹' },
  { code: 'BE', name: 'Belgique', isEu: true, flag: '🇧🇪' },
  { code: 'LU', name: 'Luxembourg', isEu: true, flag: '🇱🇺' },
  { code: 'NL', name: 'Pays-Bas', isEu: true, flag: '🇳🇱' },
  { code: 'PL', name: 'Pologne', isEu: true, flag: '🇵🇱' },
  { code: 'SE', name: 'Suède', isEu: true, flag: '🇸🇪' },
  { code: 'DK', name: 'Danemark', isEu: true, flag: '🇩🇰' },
  { code: 'FI', name: 'Finlande', isEu: true, flag: '🇫🇮' },
  { code: 'IE', name: 'Irlande', isEu: true, flag: '🇮🇪' },
  { code: 'GB', name: 'Royaume-Uni', isEu: false, flag: '🇬🇧' },
  { code: 'NO', name: 'Norvège', isEu: false, flag: '🇳🇴' },
  { code: 'IS', name: 'Islande', isEu: false, flag: '🇮🇸' },
];

export default function CheckoutPage() {
  const { 
    cart, 
    cartCount, 
    cartSubtotal, 
    clearCart, 
    formatPrice, 
    t, 
    currency, 
    setCurrency, 
    locale, 
    countryCode,
    setCountryCode
  } = useStore();

  // Step 1: Customer Contact
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Step 2: Delivery Address
  const [customerCountry, setCustomerCountry] = useState<string>(countryCode || 'CH');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPostalCode, setCustomerPostalCode] = useState('');
  const [customerCity, setCustomerCity] = useState('');

  // Step 3: Shipping Method Selection
  const [genevaShippingMethod, setGenevaShippingMethod] = useState<'postpac' | 'clickcollect'>('postpac');

  // Step 4: Payment
  const [paymentMethod, setPaymentMethod] = useState<'twint' | 'postfinance' | 'card' | 'invoice'>('twint');

  // Submission & Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [finalTotalFormatted, setFinalTotalFormatted] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [countryAutoSwitchedNotice, setCountryAutoSwitchedNotice] = useState<string | null>(null);

  // Sync countryCode from store context on mount
  useEffect(() => {
    if (countryCode && SUPPORTED_COUNTRIES.some(c => c.code === countryCode)) {
      setCustomerCountry(countryCode);
    }
  }, [countryCode]);

  // Keep StoreContext updated when user selects country in checkout
  const handleCountryChange = (newCountry: string) => {
    setCustomerCountry(newCountry);
    setCountryCode(newCountry);
    setCountryAutoSwitchedNotice(null);
  };

  // Auto-detect country based on city name or specific postal code format
  useEffect(() => {
    const rawCity = customerCity.trim().toLowerCase();
    const rawZip = customerPostalCode.trim();

    if (!rawCity && !rawZip) return;

    let targetCountry: string | null = null;
    let detectedPlaceName: string | null = null;

    // 1. Direct city check
    if (rawCity) {
      // Check Portuguese cities
      const ptCities = [
        'lisbon', 'lisboa', 'lisbonne', 'lissabon', 'porto', 'oporte', 'coimbra',
        'braga', 'setubal', 'setúbal', 'faro', 'aveiro', 'funchal', 'amadora',
        'almada', 'cascais', 'sintra', 'guimaraes', 'guimarães', 'evora', 'évora'
      ];
      if (ptCities.some(c => rawCity === c || rawCity.startsWith(c + ' '))) {
        targetCountry = 'PT';
        detectedPlaceName = 'Lisbonne / Portugal';
      }

      // Check French cities
      const frCities = [
        'paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes', 'strasbourg',
        'montpellier', 'bordeaux', 'lille', 'rennes', 'grenoble', 'annemasse', 'annecy'
      ];
      if (!targetCountry && frCities.some(c => rawCity === c || rawCity.startsWith(c + ' '))) {
        targetCountry = 'FR';
        detectedPlaceName = 'France';
      }

      // Check German cities
      const deCities = ['berlin', 'munich', 'münchen', 'hamburg', 'frankfurt', 'köln', 'cologne', 'stuttgart', 'düsseldorf', 'dusseldorf'];
      if (!targetCountry && deCities.some(c => rawCity === c || rawCity.startsWith(c + ' '))) {
        targetCountry = 'DE';
        detectedPlaceName = 'Allemagne';
      }

      // Check Italian cities
      const itCities = ['roma', 'rome', 'milano', 'milan', 'napoli', 'naples', 'torino', 'turin', 'firenze', 'florence', 'venezia', 'venice'];
      if (!targetCountry && itCities.some(c => rawCity === c || rawCity.startsWith(c + ' '))) {
        targetCountry = 'IT';
        detectedPlaceName = 'Italie';
      }

      // Check Spanish cities
      const esCities = ['madrid', 'barcelona', 'valencia', 'sevilla', 'seville', 'zaragoza', 'malaga', 'málaga', 'bilbao'];
      if (!targetCountry && esCities.some(c => rawCity === c || rawCity.startsWith(c + ' '))) {
        targetCountry = 'ES';
        detectedPlaceName = 'Espagne';
      }
    }

    // 2. Postal code pattern check (e.g. Portuguese 4-3 digits: 1000-001)
    if (!targetCountry && /^\d{4}-\d{3}$/.test(rawZip)) {
      targetCountry = 'PT';
      detectedPlaceName = 'Code postal portugais (XXXX-XXX)';
    }

    // 3. If targetCountry was identified and differs from customerCountry, auto-switch!
    if (targetCountry && targetCountry !== customerCountry) {
      setCustomerCountry(targetCountry);
      setCountryCode(targetCountry);
      const countryNames: Record<string, string> = {
        PT: 'Portugal',
        FR: 'France',
        DE: 'Allemagne',
        IT: 'Italie',
        ES: 'Espagne',
        CH: 'Suisse'
      };
      setCountryAutoSwitchedNotice(
        `Destination ajustée automatiquement à ${countryNames[targetCountry] || targetCountry} (${detectedPlaceName}). Les modes et frais d'expédition ont été actualisés.`
      );
    }
  }, [customerCity, customerPostalCode, customerCountry, setCountryCode]);

  // Postal code validation
  const postalValidation = useMemo(() => {
    const raw = customerPostalCode.trim();
    if (!raw) return { isValid: false, message: 'Code postal requis' };

    // 1. Check if user typed an unsupported international format (like 6-digit Indian pincode 451001)
    if (/^\d{6}$/.test(raw) && !['PL', 'RO'].includes(customerCountry)) {
      return {
        isValid: false,
        message: '❌ Code postal non desservi. NutriFitness livre exclusivement en Suisse, au Liechtenstein et dans l\'Union Européenne.'
      };
    }

    // 2. Switzerland validation
    if (customerCountry === 'CH') {
      const normCity = customerCity.trim().toLowerCase();
      const ptCities = ['lisbon', 'lisboa', 'lisbonne', 'lissabon', 'porto', 'coimbra', 'braga', 'faro', 'aveiro', 'funchal', 'setubal', 'setúbal'];
      if (ptCities.some(c => normCity === c || normCity.startsWith(c + ' '))) {
        return {
          isValid: false,
          message: '❌ Lisbonne se trouve au Portugal, pas en Suisse. Le pays a été automatiquement ajusté sur Portugal.'
        };
      }

      const is4Digits = /^\d{4}$/.test(raw);
      const val = parseInt(raw, 10);
      if (!is4Digits || val < 1000 || val > 9999) {
        return {
          isValid: false,
          message: '❌ Code postal suisse invalide. Le NPA suisse est composé de 4 chiffres (ex: 1204 Genève, 1003 Lausanne).'
        };
      }
      return { isValid: true, message: '' };
    }

    // 3. Liechtenstein validation
    if (customerCountry === 'LI') {
      const is4Digits = /^\d{4}$/.test(raw);
      const val = parseInt(raw, 10);
      if (!is4Digits || val < 9485 || val > 9499) {
        return {
          isValid: false,
          message: '❌ Code postal du Liechtenstein invalide (doit être entre 9485 et 9499, ex: 9490 Vaduz).'
        };
      }
      return { isValid: true, message: '' };
    }

    // 4. France, Germany, Italy, Spain (5 digits)
    if (['FR', 'DE', 'IT', 'ES'].includes(customerCountry)) {
      if (!/^\d{5}$/.test(raw)) {
        return {
          isValid: false,
          message: `❌ Code postal invalide. Il doit comporter 5 chiffres pour ce pays.`
        };
      }
      return { isValid: true, message: '' };
    }

    // 5. Portugal (4 digits or 0000-000)
    if (customerCountry === 'PT') {
      if (!/^\d{4}(-\d{3})?$/.test(raw)) {
        return {
          isValid: false,
          message: '❌ Code postal portugais invalide (ex: 3720-000 ou 3720).'
        };
      }
      return { isValid: true, message: '' };
    }

    // 6. Generic EU check
    if (!/^[a-zA-Z0-9 -]{3,10}$/.test(raw)) {
      return {
        isValid: false,
        message: '❌ Format de code postal invalide.'
      };
    }

    return { isValid: true, message: '' };
  }, [customerPostalCode, customerCountry]);

  // Is customer's address in Geneva canton?
  // Only Geneva residents (NPA 1200-1299 or city 'Genève') have access to Click & Collect
  const isGenevaAddress = useMemo(() => {
    if (customerCountry !== 'CH') return false;
    const npaNum = parseInt(customerPostalCode.trim(), 10);
    const hasGenevaNpa = !isNaN(npaNum) && npaNum >= 1200 && npaNum <= 1299;
    const hasGenevaCity = /gen[èe]ve/i.test(customerCity.trim());
    return hasGenevaNpa || hasGenevaCity;
  }, [customerCountry, customerPostalCode, customerCity]);

  // If customer is NOT in Geneva, always reset to standard postal delivery
  useEffect(() => {
    if (!isGenevaAddress && genevaShippingMethod === 'clickcollect') {
      setGenevaShippingMethod('postpac');
    }
  }, [isGenevaAddress, genevaShippingMethod]);

  // Address completeness
  const isAddressCompleted = Boolean(
    customerAddress.trim().length >= 3 &&
    customerPostalCode.trim().length >= 3 &&
    customerCity.trim().length >= 2 &&
    firstName.trim().length >= 1 &&
    lastName.trim().length >= 1 &&
    postalValidation.isValid
  );

  // Track non-deliverable items for selected customer destination
  const nonDeliverableItems = useMemo(() => {
    return cart.filter(item => {
      if (item.isEbook) return false;
      return !isProductDeliverableToCountry(customerCountry, item.locationType, item.shippingOrigin);
    });
  }, [cart, customerCountry]);
  const hasBlockedItems = nonDeliverableItems.length > 0;

  // Group cart items by origin based on destination country
  const { genevaItems, portugalItems, isMixedCart } = useMemo(() => {
    const destIsCH = customerCountry === 'CH' || customerCountry === 'LI';
    const geList: CartItem[] = [];
    const ptList: CartItem[] = [];

    for (const item of cart) {
      if (item.isEbook) continue;
      // If item cannot be delivered to customerCountry, do NOT group into valid shipments
      if (!isProductDeliverableToCountry(customerCountry, item.locationType, item.shippingOrigin)) {
        continue;
      }

      const isCommon = item.locationType === 'COMMON' || item.shippingOrigin === 'common';
      const isPtOnly = item.shippingOrigin === 'portugal' && !isCommon;
      const isGeOnly = item.locationType === 'GENEVA_ONLY' || (!isCommon && !isPtOnly);

      if (destIsCH) {
        if (isPtOnly) {
          ptList.push(item);
        } else {
          // Common and Geneva-only ship from Geneva for CH/LI customers
          geList.push(item);
        }
      } else {
        // EU customers
        if (isGeOnly) {
          geList.push(item);
        } else {
          // Common and Portugal-only ship from Portugal for EU
          ptList.push(item);
        }
      }
    }

    return {
      genevaItems: geList,
      portugalItems: ptList,
      isMixedCart: geList.length > 0 && ptList.length > 0
    };
  }, [cart, customerCountry]);

  // Dynamic delivery date estimates per shipment
  const estimateInputs = useMemo(() => {
    return cart.filter(it => !it.isEbook).map(it => ({
      productId: it.id || it.slug,
      shippingOriginHint: it.shippingOrigin,
      quantity: it.quantity
    }));
  }, [cart]);

  const { estimates } = useDeliveryEstimates(estimateInputs, customerCountry);

  const genevaEstimate = genevaItems[0] ? estimates.get(genevaItems[0].id || genevaItems[0].slug) : undefined;
  const ptEstimate = portugalItems[0] ? estimates.get(portugalItems[0].id || portugalItems[0].slug) : undefined;

  const genevaPromiseDate = genevaEstimate?.estimate?.displayDate || genevaEstimate?.estimate?.latestDate || '2026-10-13';
  const genevaPromiseFormatted = genevaEstimate?.displayDates?.fr || '1–2 jours ouvrables';

  const ptPromiseDate = ptEstimate?.estimate?.displayDate || ptEstimate?.estimate?.latestDate || '2026-10-16';
  const ptPromiseFormatted = ptEstimate?.displayDates?.fr || '3–5 jours ouvrables';

  // Calculate subtotals per origin
  const genevaSubtotal = useMemo(() => {
    return genevaItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  }, [genevaItems]);

  const portugalSubtotal = useMemo(() => {
    return portugalItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  }, [portugalItems]);

  // Calculate shipping cost per origin
  // Geneva: PostPac Priority 7.90 CHF (Free >= 75 CHF) or Click & Collect (0 CHF)
  const genevaShippingCost = useMemo(() => {
    if (genevaItems.length === 0) return 0;
    if (genevaShippingMethod === 'clickcollect' && isGenevaAddress) return 0;
    return genevaSubtotal >= 75 ? 0 : 7.90;
  }, [genevaItems.length, genevaShippingMethod, isGenevaAddress, genevaSubtotal]);

  // Portugal: Express Carrier 9.90 CHF (Free >= 120 CHF)
  const portugalShippingCost = useMemo(() => {
    if (portugalItems.length === 0) return 0;
    return portugalSubtotal >= 120 ? 0 : 9.90;
  }, [portugalItems.length, portugalSubtotal]);

  // Total shipping fee
  const totalShippingCost = useMemo(() => {
    if (isMixedCart) {
      return genevaShippingCost + portugalShippingCost;
    }
    if (genevaItems.length > 0) {
      return genevaShippingCost;
    }
    if (portugalItems.length > 0) {
      return portugalShippingCost;
    }
    return 0;
  }, [isMixedCart, genevaShippingCost, portugalShippingCost, genevaItems.length, portugalItems.length]);

  const vatEst = (cartSubtotal * 0.026) / 1.026;
  const grandTotal = cartSubtotal + totalShippingCost;

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (hasBlockedItems) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    if (!isAddressCompleted || !postalValidation.isValid) {
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    const generatedOrderNum = `WEB-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(generatedOrderNum);
    setFinalTotalFormatted(formatPrice(grandTotal));

    const clientFullName = `${firstName} ${lastName}`.trim() || 'Client NutriFitness';

    const shippingLabel = isMixedCart
      ? `Expédition Multi-Origine (Colis 1: ${genevaShippingMethod === 'clickcollect' ? 'Click & Collect Genève' : 'Poste Suisse 24h'} + Colis 2: Usine Portugal)`
      : genevaItems.length > 0
      ? (genevaShippingMethod === 'clickcollect' ? 'Click & Collect (Boutique Genève)' : 'PostPac Priority (La Poste Suisse 24h)')
      : 'Transporteur Express (Usine Portugal 3-5j)';

    const newOrder = {
      id: `order-web-${Date.now()}`,
      ticketNumber: generatedOrderNum,
      timestamp: new Date().toISOString(),
      items: cart.length > 0 ? cart.map(item => ({
        id: item.itemKey || `it-${item.id}-${Date.now()}`,
        productId: item.id,
        variantId: item.itemKey || item.id,
        name: item.name,
        brand: item.brand,
        flavor: item.flavor || 'Standard',
        format: item.size || '1 unité',
        sku: item.id,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '/images/placeholder.webp',
        vatRate: item.vatRate || 2.6,
        shippingOrigin: item.shippingOrigin || 'switzerland'
      })) : [],
      subtotal: cartSubtotal,
      discountPercent: 0,
      discountAmount: 0,
      vatAmount: vatEst,
      total: grandTotal,
      amountReceived: grandTotal,
      paymentMethod: paymentMethod === 'twint' ? 'twint' : paymentMethod === 'card' ? 'card' : paymentMethod === 'postfinance' ? 'card' : 'invoice',
      paymentDetails: {
        reference: `WEB-${paymentMethod.toUpperCase()}-${Date.now().toString().slice(-6)}`,
        cardType: paymentMethod === 'card' ? 'Carte Bancaire Web (3D Secure)' : paymentMethod === 'postfinance' ? 'PostFinance E-Finance' : undefined,
        notes: `Commande en ligne nutrifitness.ch · ${shippingLabel}`
      },
      seller: 'Site Web Public (nutrifitness.ch)',
      client: {
        name: clientFullName,
        phone: customerPhone.trim(),
        email: customerEmail.trim(),
        address: customerAddress.trim(),
        city: customerCity.trim(),
        postalCode: customerPostalCode.trim(),
        country: customerCountry
      },
      shipping: {
        method: isMixedCart ? 'multi_origin' : (genevaShippingMethod === 'clickcollect' ? 'store_pickup' : 'post_priority'),
        label: shippingLabel,
        cost: totalShippingCost,
        isMixedCart,
        genevaCost: genevaShippingCost,
        portugalCost: portugalShippingCost,
        promised_date: isMixedCart ? (ptPromiseDate > genevaPromiseDate ? ptPromiseDate : genevaPromiseDate) : (portugalItems.length > 0 ? ptPromiseDate : genevaPromiseDate),
        promised_date_formatted: isMixedCart ? `${genevaPromiseFormatted} (Genève) / ${ptPromiseFormatted} (Portugal)` : (portugalItems.length > 0 ? ptPromiseFormatted : genevaPromiseFormatted),
        fulfilment_location: isMixedCart ? 'MIXED' : (portugalItems.length > 0 ? 'PORTUGAL' : 'GENEVA'),
        shipments: [
          ...(genevaItems.length > 0 ? [{
            origin: 'GENEVA',
            fulfilment_location: 'GENEVA',
            promised_date: genevaPromiseDate,
            promised_date_formatted: genevaPromiseFormatted,
            cost: genevaShippingCost,
            carrier: genevaShippingMethod === 'clickcollect' ? 'Click & Collect Genève' : 'La Poste Suisse PostPac Priority',
            items: genevaItems.map(it => ({ id: it.id, name: it.name, quantity: it.quantity }))
          }] : []),
          ...(portugalItems.length > 0 ? [{
            origin: 'PORTUGAL',
            fulfilment_location: 'PORTUGAL',
            promised_date: ptPromiseDate,
            promised_date_formatted: ptPromiseFormatted,
            cost: portugalShippingCost,
            carrier: 'Transporteur Express Direct Fabricant',
            requires_customs: ['CH', 'LI', 'GB', 'NO', 'IS'].includes(customerCountry),
            items: portugalItems.map(it => ({ id: it.id, name: it.name, quantity: it.quantity }))
          }] : [])
        ]
      },
      status: 'in_processing',
      clientName: clientFullName
    };

    // 1. Immediately save to localStorage for POS sync
    try {
      const stored = localStorage.getItem('nutrifitness_pos_sales');
      const currentList = stored ? JSON.parse(stored) : [];
      const updatedList = [newOrder, ...currentList];
      localStorage.setItem('nutrifitness_pos_sales', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    // 2. Post to /api/orders
    try {
      await fetch('/api/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch {}

    clearCart();
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isSuccess) {
    return (
      <ThankYouAnimation
        orderNumber={orderNumber}
        totalFormatted={finalTotalFormatted}
        paymentMethod={paymentMethod}
        shippingMethod={genevaShippingMethod}
        customerEmail={customerEmail}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-[#F80404] tracking-widest block mb-1">
            🔒 SSL 256 bits · {currency} Active
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
            {t.checkout.title}
          </h1>
          <p className="text-xs text-white/60 mt-1">
            {t.checkout.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/60">
          <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <span>🇨🇭</span> Expédition Suisse &amp; Europe
          </span>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-full">
            <span className="text-[11px] text-white/50 pl-2">Devise :</span>
            <button
              type="button"
              onClick={() => setCurrency('CHF')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-black transition-all ${
                currency === 'CHF' ? 'bg-[#F80404] text-black shadow-xs' : 'text-white/70 hover:text-white'
              }`}
            >
              🇨🇭 CHF
            </button>
            <button
              type="button"
              onClick={() => setCurrency('EUR')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-black transition-all ${
                currency === 'EUR' ? 'bg-[#F80404] text-black shadow-xs' : 'text-white/70 hover:text-white'
              }`}
            >
              🇪🇺 EUR (€)
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Blocked Items Warning across entire width of checkout */}
        {hasBlockedItems && (
          <div className="lg:col-span-12 p-5 rounded-2xl border border-red-500/50 bg-red-950/60 text-red-200 text-xs space-y-2.5 animate-in fade-in duration-200 shadow-xl">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>Articles non livrables vers votre destination ({customerCountry})</span>
              </div>
              <Link
                href="/panier/"
                className="px-3.5 py-1.5 bg-red-800 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                Gérer le panier →
              </Link>
            </div>
            <p className="text-white/80">
              Les articles suivants sont stockés uniquement à Genève et ne peuvent pas être expédiés vers {customerCountry} :
            </p>
            <ul className="list-disc list-inside space-y-1 text-red-200/90 pl-1">
              {nonDeliverableItems.map(item => (
                <li key={item.itemKey}>
                  <span className="font-semibold text-white">{item.name}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-white/60 pt-1 border-t border-red-500/30">
              Veuillez retirer ces articles de votre panier pour pouvoir finaliser votre commande.
            </p>
          </div>
        )}

        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: Coordonnées de Contact */}
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white font-heading flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#F80404] text-black text-xs font-black flex items-center justify-center">1</span>
              {t.checkout.recipientDetails}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">Adresse e-mail (confirmation) *</label>
                <input 
                  type="email" 
                  required 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="nom@exemple.ch" 
                  className="w-full min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white focus:border-[#F80404] focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">Téléphone mobile (suivi SMS) *</label>
                <input 
                  type="tel" 
                  required 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+41 79 123 45 67" 
                  className="w-full min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white focus:border-[#F80404] focus:outline-none" 
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Adresse de Livraison (PLACED BEFORE SHIPPING METHOD) */}
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-white font-heading flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#F80404] text-black text-xs font-black flex items-center justify-center">2</span>
                Adresse de Livraison
              </h2>
              <span className="text-[11px] text-white/50 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F80404]" />
                Destination obligatoire
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Country Selector */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-white/80 mb-1.5">Pays de destination *</label>
                <select
                  value={customerCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white focus:border-[#F80404] focus:outline-none cursor-pointer"
                >
                  {SUPPORTED_COUNTRIES.map(c => (
                    <option key={c.code} value={c.code} className="bg-[#141414] text-white">
                      {c.flag} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">Prénom *</label>
                <input 
                  type="text" 
                  required 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Marco" 
                  className="w-full min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white focus:border-[#F80404] focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">Nom *</label>
                <input 
                  type="text" 
                  required 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Scarpantoni" 
                  className="w-full min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white focus:border-[#F80404] focus:outline-none" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-white/80 mb-1.5">Rue et numéro *</label>
                <input 
                  type="text" 
                  required 
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Rue du Rhône 42" 
                  className="w-full min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white focus:border-[#F80404] focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  NPA / Code Postal *
                </label>
                <input 
                  type="text" 
                  required 
                  value={customerPostalCode}
                  onChange={(e) => setCustomerPostalCode(e.target.value)}
                  placeholder={customerCountry === 'CH' ? '1204 (4 chiffres)' : 'Code postal'} 
                  className={`w-full min-h-[44px] px-3.5 text-xs bg-black/60 border rounded-xl text-white focus:outline-none ${
                    customerPostalCode.trim() && !postalValidation.isValid
                      ? 'border-red-500 bg-red-950/20 focus:border-red-500'
                      : 'border-white/15 focus:border-[#F80404]'
                  }`} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">Ville *</label>
                <input 
                  type="text" 
                  required 
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder={customerCountry === 'CH' ? 'Genève' : 'Ville'} 
                  className="w-full min-h-[44px] px-3.5 text-xs bg-black/60 border border-white/15 rounded-xl text-white focus:border-[#F80404] focus:outline-none" 
                />
              </div>
            </div>

            {/* Auto-detected Country Switch Notice */}
            {countryAutoSwitchedNotice && (
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-white">Détection automatique du pays</p>
                  <p className="text-[11px] text-blue-200 mt-0.5">{countryAutoSwitchedNotice}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCountryAutoSwitchedNotice(null)}
                  className="text-white/50 hover:text-white text-xs px-1"
                  aria-label="Fermer la notification"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Pincode & Destination Validation Message */}
            {customerPostalCode.trim().length > 0 && !postalValidation.isValid && (
              <div className="p-3.5 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Livraison non desservie pour cette destination</p>
                  <p className="text-[11px] text-red-200/90 mt-0.5">{postalValidation.message}</p>
                </div>
              </div>
            )}

            {isAddressCompleted && postalValidation.isValid && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Adresse vérifiée pour {customerCity} ({customerPostalCode}, {customerCountry})</span>
                </span>
                {isGenevaAddress && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    Zone Genève locale (Click &amp; Collect éligible)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* STEP 3: Mode de Livraison & Choix du Transporteur */}
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-white font-heading flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#F80404] text-black text-xs font-black flex items-center justify-center">3</span>
                Mode de Livraison &amp; Expéditions
              </h2>
              {isMixedCart && (
                <span className="text-[10px] uppercase font-black tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  📦 2 Colis Séparés
                </span>
              )}
            </div>

            {/* If address is not complete, show prompt */}
            {!isAddressCompleted ? (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-white/40 shrink-0" />
                <p>
                  Veuillez renseigner votre adresse de livraison complète ci-dessus pour calculer les options et tarifs d&apos;expédition exacts selon votre destination.
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* MIXED CART: 2 SEPARATE SHIPMENTS */}
                {isMixedCart ? (
                  <div className="space-y-4">
                    {/* Shipment 1: Geneva */}
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🇨🇭</span>
                          <span className="font-bold text-white text-xs">Colis 1 — Expédié depuis Genève (Marco)</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                            {genevaItems.length} article{genevaItems.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">
                          {genevaShippingCost === 0 ? 'Livraison Offerte' : formatPrice(genevaShippingCost)}
                        </span>
                      </div>

                      <div className="text-[11px] text-white/60">
                        {genevaItems.map(it => it.name).join(', ')}
                      </div>

                      {/* Options for Geneva shipment */}
                      <div className="space-y-2 pt-1">
                        <label 
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            genevaShippingMethod === 'postpac' ? 'border-[#F80404] bg-[#F80404]/10' : 'border-white/10 bg-black/40'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="geneva_shipping" 
                            checked={genevaShippingMethod === 'postpac'} 
                            onChange={() => setGenevaShippingMethod('postpac')}
                            className="mt-0.5 text-[#F80404] focus:ring-[#F80404]" 
                          />
                          <div className="flex-1 text-xs">
                            <div className="flex justify-between font-bold text-white">
                              <span className="flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-[#F80404]" />
                                <span>PostPac Priority (La Poste Suisse)</span>
                                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                  <FlagIcon countryCode="CH" className="w-3 h-3" />
                                  <span>{genevaPromiseFormatted}</span>
                                </span>
                              </span>
                              <span>{genevaSubtotal >= 75 ? t.common.free : formatPrice(7.90)}</span>
                            </div>
                            <p className="text-[11px] text-white/50 mt-0.5">Livraison directe à votre domicile avec numéro de suivi SMS.</p>
                          </div>
                        </label>

                        {/* Click & Collect ONLY visible if Geneva resident */}
                        {isGenevaAddress && (
                          <label 
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              genevaShippingMethod === 'clickcollect' ? 'border-[#F80404] bg-[#F80404]/10' : 'border-white/10 bg-black/40'
                            }`}
                          >
                            <input 
                              type="radio" 
                              name="geneva_shipping" 
                              checked={genevaShippingMethod === 'clickcollect'} 
                              onChange={() => setGenevaShippingMethod('clickcollect')}
                              className="mt-0.5 text-[#F80404] focus:ring-[#F80404]" 
                            />
                            <div className="flex-1 text-xs">
                              <div className="flex justify-between font-bold text-white">
                                <span className="flex items-center gap-1.5">
                                  <span>📍 Click &amp; Collect Boutique Genève</span>
                                  <span className="text-[10px] text-[#F80404] font-bold">Prêt en 2h</span>
                                </span>
                                <span className="text-emerald-400 font-bold">{t.common.free}</span>
                              </div>
                              <p className="text-[11px] text-white/50 mt-0.5">34 Rue des Pâquis, 1201 Genève (Lun-Ven 12h30-19h / Sam 12h-17h).</p>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Shipment 2: Portugal */}
                    <div className="rounded-xl border border-blue-500/30 bg-blue-950/10 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
                        <div className="flex items-center gap-2">
                          <FlagIcon countryCode="PT" className="w-4 h-4 shrink-0" />
                          <span className="font-bold text-white text-xs">Colis 2 — Expédié depuis le Portugal (Omar)</span>
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold">
                            {portugalItems.length} article{portugalItems.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-blue-400">
                          {portugalShippingCost === 0 ? 'Livraison Offerte' : formatPrice(portugalShippingCost)}
                        </span>
                      </div>

                      <div className="text-[11px] text-white/60">
                        {portugalItems.map(it => it.name).join(', ')}
                      </div>

                      <div className="p-3 rounded-lg border border-white/10 bg-black/40 text-xs">
                        <div className="flex justify-between font-bold text-white">
                          <span className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-blue-400" />
                            <span>Transporteur Express Usine Portugal</span>
                            <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                              <FlagIcon countryCode="PT" className="w-3 h-3" />
                              <span>{ptPromiseFormatted}</span>
                            </span>
                          </span>
                          <span>{portugalSubtotal >= 120 ? t.common.free : formatPrice(9.90)}</span>
                        </div>
                        <p className="text-[11px] text-white/50 mt-0.5">
                          Expédition directe depuis l&apos;usine fabricant. Suivi complet par e-mail.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* SINGLE ORIGIN SHIPMENT */
                  <div className="space-y-3">
                    {/* Geneva only items */}
                    {genevaItems.length > 0 && (
                      <>
                        <label 
                          className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                            genevaShippingMethod === 'postpac' ? 'border-[#F80404] bg-[#F80404]/10' : 'border-white/15 bg-white/5'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="single_shipping" 
                            checked={genevaShippingMethod === 'postpac'} 
                            onChange={() => setGenevaShippingMethod('postpac')}
                            className="mt-1 text-[#F80404] focus:ring-[#F80404]" 
                          />
                          <div className="flex-1 text-xs">
                            <div className="flex justify-between font-bold text-white mb-0.5">
                              <span className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#F80404]" />
                                <span>PostPac Priority (La Poste Suisse)</span>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                  <FlagIcon countryCode="CH" className="w-3 h-3" />
                                  <span>{genevaPromiseFormatted}</span>
                                </span>
                              </span>
                              <span>{genevaSubtotal >= 75 ? t.common.free : formatPrice(7.90)}</span>
                            </div>
                            <p className="text-white/50">Remise avec suivi en ligne Poste Suisse par SMS &amp; e-mail.</p>
                          </div>
                        </label>

                        {/* Click & Collect ONLY visible if Geneva resident */}
                        {isGenevaAddress && (
                          <label 
                            className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                              genevaShippingMethod === 'clickcollect' ? 'border-[#F80404] bg-[#F80404]/10' : 'border-white/15 bg-white/5'
                            }`}
                          >
                            <input 
                              type="radio" 
                              name="single_shipping" 
                              checked={genevaShippingMethod === 'clickcollect'} 
                              onChange={() => setGenevaShippingMethod('clickcollect')}
                              className="mt-1 text-[#F80404] focus:ring-[#F80404]" 
                            />
                            <div className="flex-1 text-xs">
                              <div className="flex justify-between font-bold text-white mb-0.5">
                                <span className="flex items-center gap-2">
                                  <span>📍 Click &amp; Collect Boutique Genève</span>
                                  <span className="text-[10px] bg-[#F80404]/20 text-[#F80404] px-2 py-0.5 rounded font-bold">Disponible en 2h</span>
                                </span>
                                <span className="text-emerald-400 font-bold">{t.common.free}</span>
                              </div>
                              <p className="text-white/50">34 Rue des Pâquis, 1201 Genève (Lun-Ven 12h30-19h / Sam 12h-17h).</p>
                            </div>
                          </label>
                        )}
                      </>
                    )}

                    {/* Portugal only items */}
                    {portugalItems.length > 0 && genevaItems.length === 0 && (
                      <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/10 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-white">
                          <span className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-blue-400" />
                            <span>Transporteur Express Usine Portugal</span>
                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                              <FlagIcon countryCode="PT" className="w-3 h-3" />
                              <span>{ptPromiseFormatted}</span>
                            </span>
                          </span>
                          <span>{portugalSubtotal >= 120 ? t.common.free : formatPrice(9.90)}</span>
                        </div>
                        <p className="text-white/50">
                          Colis expédié directement depuis l&apos;usine du fabricant au Portugal avec suivi en ligne.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 4: Mode de Paiement */}
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white font-heading flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#F80404] text-black text-xs font-black flex items-center justify-center">4</span>
              {t.checkout.paymentMode} ({currency})
            </h2>
            <div className="space-y-3">
              {/* TWINT */}
              <label 
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'twint' ? 'border-[#F80404] bg-[#F80404]/10' : 'border-white/15 bg-white/5'
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'twint'} 
                  onChange={() => setPaymentMethod('twint')}
                  className="mt-1 text-[#F80404] focus:ring-[#F80404]" 
                />
                <div className="flex-1 text-xs">
                  <div className="flex justify-between font-bold text-white mb-0.5">
                    <span className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-white text-black font-black text-[10px]">TWINT</span>
                      <span>TWINT Suisse (Recommandé)</span>
                    </span>
                    <span className="text-[#F80404] font-bold">Instantané</span>
                  </div>
                  <p className="text-white/50">Payez en 1 clic avec l&apos;application TWINT de votre banque suisse.</p>
                </div>
              </label>

              {/* PostFinance */}
              <label 
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'postfinance' ? 'border-[#F80404] bg-[#F80404]/10' : 'border-white/15 bg-white/5'
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'postfinance'} 
                  onChange={() => setPaymentMethod('postfinance')}
                  className="mt-1 text-[#F80404] focus:ring-[#F80404]" 
                />
                <div className="flex-1 text-xs">
                  <div className="flex justify-between font-bold text-white mb-0.5">
                    <span className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-yellow-400 text-black font-black text-[10px]">PF</span>
                      <span>PostFinance Card &amp; E-Finance</span>
                    </span>
                    <span className="text-white/70">Sécurisé</span>
                  </div>
                  <p className="text-white/50">Débit direct sur votre compte postal ou carte PostFinance.</p>
                </div>
              </label>

              {/* Credit Card */}
              <label 
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'card' ? 'border-[#F80404] bg-[#F80404]/10' : 'border-white/15 bg-white/5'
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'card'} 
                  onChange={() => setPaymentMethod('card')}
                  className="mt-1 text-[#F80404] focus:ring-[#F80404]" 
                />
                <div className="flex-1 text-xs">
                  <div className="flex justify-between font-bold text-white mb-0.5">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-white" />
                      <span>Carte Bancaire (Visa, Mastercard, Amex)</span>
                    </span>
                    <span className="text-white/70">3D Secure</span>
                  </div>
                  <p className="text-white/50">Protocole de sécurité SSL 256 bits conforme nDSG.</p>
                </div>
              </label>

              {/* Invoice QR */}
              <label 
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'invoice' ? 'border-[#F80404] bg-[#F80404]/10' : 'border-white/15 bg-white/5'
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'invoice'} 
                  onChange={() => setPaymentMethod('invoice')}
                  className="mt-1 text-[#F80404] focus:ring-[#F80404]" 
                />
                <div className="flex-1 text-xs">
                  <div className="flex justify-between font-bold text-white mb-0.5">
                    <span className="flex items-center gap-2">
                      <span>📄 Facture QR Suisse</span>
                    </span>
                    <span className="text-white/70">30 jours</span>
                  </div>
                  <p className="text-white/50">Bulletin de versement QR joint au colis (réservé aux résidents suisses).</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary (5 cols) */}
        <div className="lg:col-span-5 bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-6 sticky top-24">
          <h2 className="text-lg font-black uppercase text-white font-heading pb-3 border-b border-white/10 flex items-center justify-between">
            <span>{t.checkout.orderSummary}</span>
            <span className="text-xs text-[#F80404] bg-[#F80404]/10 px-2.5 py-0.5 rounded-full">
              {cartCount} article{cartCount > 1 ? 's' : ''}
            </span>
          </h2>

          {/* Devise Switcher */}
          <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <span>Devise de facturation</span>
              </div>
              <div className="text-[10px] text-white/50">
                Commandez en CHF ou en EUR (€)
              </div>
            </div>
            <div className="inline-flex rounded-lg bg-black border border-white/15 p-1 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setCurrency('CHF')}
                className={`px-3 py-1 rounded-md text-xs font-black transition-all ${
                  currency === 'CHF'
                    ? 'bg-[#F80404] text-black shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Payer en CHF (Franc Suisse)"
              >
                CHF 🇨🇭
              </button>
              <button
                type="button"
                onClick={() => setCurrency('EUR')}
                className={`px-3 py-1 rounded-md text-xs font-black transition-all ${
                  currency === 'EUR'
                    ? 'bg-[#F80404] text-black shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Payer en EUR (Euro)"
              >
                EUR (€) 🇪🇺
              </button>
            </div>
          </div>

          {/* Cart items list with Origin Badges */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-white/5">
            {cart.map(item => {
              const isCommon = item.locationType === 'COMMON' || item.shippingOrigin === 'common';
              const isPt = (item.shippingOrigin === 'portugal' && !isCommon) || (!customerCountry.includes('CH') && isCommon);

              return (
                <div key={item.itemKey} className="flex items-center gap-3 pt-2">
                  <div className="relative w-12 h-12 bg-black/40 rounded-lg p-1 shrink-0 border border-white/10 flex items-center justify-center">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider bg-white/10 text-white/80">
                        {isPt ? '🇵🇹 Portugal' : '🇨🇭 Genève'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate mt-0.5">{item.name}</h4>
                    <p className="text-[10px] text-white/50">{item.flavor} · Qte: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black text-white font-heading">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-xs text-white/70 pt-4 border-t border-white/10">
            <div className="flex justify-between">
              <span>{t.common.subtotal} ({currency}) :</span>
              <span className="font-bold text-white">{formatPrice(cartSubtotal)}</span>
            </div>

            {/* Split Shipping charges breakdown */}
            {isMixedCart ? (
              <div className="space-y-1.5 bg-black/40 p-2.5 rounded-xl border border-white/5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/80 flex items-center gap-1">
                    <span>🇨🇭</span> Frais Colis 1 (Genève) :
                  </span>
                  <span className="font-bold text-white">
                    {genevaShippingCost === 0 ? t.common.free : formatPrice(genevaShippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/80 flex items-center gap-1">
                    <span>🇵🇹</span> Frais Colis 2 (Portugal) :
                  </span>
                  <span className="font-bold text-white">
                    {portugalShippingCost === 0 ? t.common.free : formatPrice(portugalShippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-white/10 text-white font-bold">
                  <span>Total Frais de port :</span>
                  <span>{totalShippingCost === 0 ? t.common.free : formatPrice(totalShippingCost)}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between">
                <span>
                  {t.common.shipping} (
                  {genevaItems.length > 0
                    ? (genevaShippingMethod === 'clickcollect' ? 'Click & Collect Genève' : 'PostPac Priority')
                    : 'Transporteur Portugal'}
                  ) :
                </span>
                <span className="font-bold text-white">
                  {totalShippingCost === 0 ? t.common.free : formatPrice(totalShippingCost)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-white/40 text-[11px]">
              <span>{t.common.vatIncluded} (2.6% / 8.1%) :</span>
              <span>{formatPrice(vatEst)}</span>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-baseline text-white">
              <span className="text-sm font-black uppercase font-heading">{t.common.total} ({currency}) :</span>
              <span className="text-2xl font-black text-white font-heading">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {/* Validation Notice if address incomplete, postal invalid or items blocked */}
          {hasBlockedItems ? (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>Articles non livrables vers {customerCountry} dans le panier. Retirez-les pour commander.</span>
            </div>
          ) : !isAddressCompleted ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Complétez une adresse valide pour débloquer le paiement.</span>
            </div>
          ) : null}

          <button 
            type="submit"
            disabled={!isAddressCompleted || !postalValidation.isValid || hasBlockedItems}
            className={`w-full min-h-[52px] px-6 py-4 font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 ${
              isAddressCompleted && postalValidation.isValid && !hasBlockedItems
                ? 'bg-[#F80404] hover:bg-[#FF3D00] text-black hover:shadow-[#F80404]/30 cursor-pointer active:scale-98'
                : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
            }`}
          >
            <span>{t.checkout.confirmAndPay} ({formatPrice(grandTotal)})</span>
            <span>→</span>
          </button>

          <p className="text-[10px] text-white/40 text-center leading-relaxed">
            En validant votre commande, vous acceptez nos CGV et notre politique de confidentialité conforme à la nDSG suisse.
          </p>
        </div>
      </form>
    </div>
  );
}
