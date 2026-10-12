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
  Clock,
  Tag,
  X,
  Percent,
  Loader2
} from 'lucide-react';
import { FlagIcon } from '@/components/delivery/FlagIcon';
import { useDeliveryEstimates } from '@/hooks/useDeliveryEstimate';
import { isProductDeliverableToCountry } from '@/lib/delivery/defaults';
import { 
  trackBeginCheckout, 
  trackPurchase, 
  trackAddPaymentInfo, 
  trackMetaInitiateCheckout, 
  trackMetaPurchase 
} from '@/lib/analytics';

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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'twint' | 'postfinance'>('card');

  // Submission & Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [finalTotalFormatted, setFinalTotalFormatted] = useState('');
  const [confirmedCountry, setConfirmedCountry] = useState('CH');
  const [confirmedDeliveryDate, setConfirmedDeliveryDate] = useState('');
  const [confirmedProducts, setConfirmedProducts] = useState<Array<{ gtin?: string }>>([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [countryAutoSwitchedNotice, setCountryAutoSwitchedNotice] = useState<string | null>(null);
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Coupon / Promo Code state
  const [couponCode, setCouponCode] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    rate: number;
    percentOff?: number;
    amountOff?: number;
    discountType?: 'percent' | 'amount';
    description?: string;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Restore coupon from localStorage if applied in cart
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nf_applied_coupon');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.code && (parsed.rate !== undefined || parsed.amountOff !== undefined)) {
          setCouponCode(parsed.code);
          setDiscountRate(parsed.rate || 0);
          setAppliedCoupon(parsed);
          setCouponMessage({
            text: `✓ Code "${parsed.code}" actif (${parsed.description || `-${Math.round((parsed.rate || 0) * 100)}%`})`,
            isError: false,
          });
        }
      }
    } catch {}
  }, []);

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) {
      setCouponMessage({ text: 'Veuillez saisir un code promotionnel.', isError: true });
      return;
    }

    setIsApplyingCoupon(true);
    setCouponMessage(null);

    try {
      const res = await fetch('/api/coupons/validate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        const couponData = {
          code: data.code,
          rate: data.rate || 0,
          amountOff: data.amountOff,
          discountType: (data.discountType || 'percent') as 'percent' | 'amount',
          description: data.description,
        };
        setAppliedCoupon(couponData);
        setDiscountRate(couponData.rate);
        setCouponCode(data.code);
        setCouponMessage({
          text: `✓ Code "${data.code}" appliqué avec succès (${data.description}) !`,
          isError: false,
        });
        try {
          localStorage.setItem('nf_applied_coupon', JSON.stringify(couponData));
        } catch {}
      } else {
        setCouponMessage({
          text: data.error || `Le code promo "${clean}" est invalide ou expiré.`,
          isError: true,
        });
      }
    } catch {
      setCouponMessage({
        text: 'Erreur de connexion lors de la vérification du code. Réessayez.',
        isError: true,
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountRate(0);
    setCouponCode('');
    setCouponMessage(null);
    try {
      localStorage.removeItem('nf_applied_coupon');
    } catch {}
  };

  // Sync countryCode from store context on mount
  useEffect(() => {
    if (countryCode && SUPPORTED_COUNTRIES.some(c => c.code === countryCode)) {
      setCustomerCountry(countryCode);
    }
  }, [countryCode]);

  // Check for return from Stripe Checkout
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const orderIdParam = urlParams.get('order_id');
    const canceled = urlParams.get('canceled');

    if (canceled) {
      setStripeError('Le paiement a été interrompu. Votre panier est conservé, vous pouvez réessayer ci-dessous.');
      return;
    }

    if (sessionId) {
      setIsProcessingStripe(true);
      fetch(`/api/checkout/session/?session_id=${encodeURIComponent(sessionId)}`)
        .then((res) => res.json())
        .then(async (data) => {
          setIsProcessingStripe(false);
          if (data.payment_status === 'paid' || data.status === 'complete') {
            const finalOrderNum = data.order_id || orderIdParam || `CMD-${Math.floor(100000 + Math.random() * 900000)}`;
            setOrderNumber(finalOrderNum);
            setFinalTotalFormatted(formatPrice(data.amount_total || cartSubtotal));
            setConfirmedCountry(data.metadata?.shipping_country || countryCode || 'CH');
            setConfirmedDeliveryDate('1–3 jours ouvrables');

            // Retrieve pending order if stored in session
            let pendingOrder: any = null;
            try {
              const raw = sessionStorage.getItem('nf_pending_order');
              if (raw) pendingOrder = JSON.parse(raw);
              sessionStorage.removeItem('nf_pending_order');
            } catch {}

            const paidOrderPayload = {
              ticketNumber: finalOrderNum,
              id: finalOrderNum,
              timestamp: new Date().toISOString(),
              items: pendingOrder?.items || (cart || []).map(it => ({
                id: it.id,
                name: it.name,
                price: it.price,
                quantity: it.quantity,
                image: it.image,
                flavor: it.flavor,
                size: it.size,
                shippingOrigin: it.shippingOrigin,
                locationType: it.locationType
              })),
              subtotal: data.amount_total || cartSubtotal,
              total: data.amount_total || cartSubtotal,
              discountPercent: 0,
              discountAmount: 0,
              vatAmount: (data.amount_total || cartSubtotal) * 0.026,
              paymentMethod: (data.metadata?.payment_selected || 'CARD').toUpperCase(),
              paymentDetails: {
                reference: sessionId,
                notes: `Paiement en ligne Stripe validé (${data.currency || 'CHF'})`
              },
              clientName: data.customer_name || data.metadata?.customer_name || 'Client',
              client: {
                name: data.customer_name || data.metadata?.customer_name || 'Client',
                email: data.customer_email || data.metadata?.customer_email || '',
                phone: data.metadata?.customer_phone || '',
                address: data.metadata?.shipping_street || '',
                city: data.metadata?.shipping_city || '',
                postalCode: data.metadata?.shipping_postal_code || ''
              },
              shipping: pendingOrder?.shipping || {
                method: 'post_priority',
                label: 'PostPac Priority (La Poste Suisse 24h)',
                cost: 0
              },
              status: 'in_processing'
            };

            // Post confirmed paid order to database
            try {
              await fetch('/api/orders/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paidOrderPayload)
              });
            } catch {}

            // Save to POS sales local cache
            try {
              const stored = localStorage.getItem('nutrifitness_pos_sales');
              const currentList = stored ? JSON.parse(stored) : [];
              const updatedList = [paidOrderPayload, ...currentList.filter((o: any) => o.ticketNumber !== finalOrderNum)];
              localStorage.setItem('nutrifitness_pos_sales', JSON.stringify(updatedList));
              window.dispatchEvent(new Event('storage'));
            } catch {}

            // Fire Purchase tracking events
            const purchaseItems = (paidOrderPayload.items || []).map((item: any) => ({
              item_id: item.sku || item.itemKey || item.id || item.name,
              item_name: item.name,
              item_brand: item.brand || 'NutriFitness',
              item_category: item.categorySlug || 'Nutrition Sportive',
              price: item.price,
              quantity: item.quantity,
            }));

            trackPurchase({
              transaction_id: finalOrderNum,
              value: data.amount_total || cartSubtotal,
              shipping: 0,
              tax: (data.amount_total || cartSubtotal) * 0.026,
              currency: data.currency || currency || 'CHF',
              items: purchaseItems,
            });

            trackMetaPurchase({
              transaction_id: finalOrderNum,
              eventId: finalOrderNum,
              value: data.amount_total || cartSubtotal,
              currency: data.currency || currency || 'CHF',
              items: purchaseItems,
            });

            clearCart();
            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setStripeError('Le statut du paiement n\'a pas pu être validé. Veuillez réessayer.');
          }
        })
        .catch(() => {
          setIsProcessingStripe(false);
          setStripeError('Erreur de validation de la transaction Stripe.');
        });
    }
  }, []);

  // Track GA4 begin_checkout and Meta InitiateCheckout
  useEffect(() => {
    if (cart && cart.length > 0) {
      const items = cart.map(item => ({
        item_id: (item as any).sku || item.itemKey || item.name,
        item_name: item.name,
        item_brand: (item as any).brand || 'NutriFitness',
        item_category: (item as any).categorySlug || 'Nutrition Sportive',
        price: item.price,
        quantity: item.quantity,
      }));
      const activeCurr = currency || 'CHF';
      trackBeginCheckout(items, cartSubtotal, activeCurr);
      trackMetaInitiateCheckout({ items, totalValue: cartSubtotal, currency: activeCurr });
    }
  }, []);

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

  const discountAmount = useMemo(() => {
    if (!appliedCoupon && discountRate === 0) return 0;
    if (appliedCoupon && appliedCoupon.discountType === 'amount' && appliedCoupon.amountOff) {
      return Math.min(cartSubtotal, appliedCoupon.amountOff);
    }
    const effRate = appliedCoupon?.rate ?? discountRate;
    return cartSubtotal * effRate;
  }, [cartSubtotal, appliedCoupon, discountRate]);

  const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const vatEst = (discountedSubtotal * 0.026) / 1.026;
  const grandTotal = discountedSubtotal + totalShippingCost;

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
      ? `Expédition Multi-Origine (Colis 1: ${genevaShippingMethod === 'clickcollect' ? 'Click & Collect' : 'Swiss Fulfillment'} + Colis 2: Portugal Fulfillment)`
      : genevaItems.length > 0
      ? (genevaShippingMethod === 'clickcollect' ? 'Click & Collect (Boutique)' : 'Swiss Fulfillment (La Poste Suisse 24h)')
      : 'Portugal Fulfillment (3-5j)';

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
      discountPercent: appliedCoupon?.percentOff ?? Math.round(discountRate * 100),
      discountAmount: discountAmount,
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
        promised_date_formatted: isMixedCart ? `${genevaPromiseFormatted} (Swiss Fulfillment) / ${ptPromiseFormatted} (Portugal Fulfillment)` : (portugalItems.length > 0 ? ptPromiseFormatted : genevaPromiseFormatted),
        fulfilment_location: isMixedCart ? 'MIXED' : (portugalItems.length > 0 ? 'PORTUGAL' : 'GENEVA'),
        shipments: [
          ...(genevaItems.length > 0 ? [{
            origin: 'GENEVA',
            fulfilment_location: 'GENEVA',
            promised_date: genevaPromiseDate,
            promised_date_formatted: genevaPromiseFormatted,
            cost: genevaShippingCost,
            carrier: genevaShippingMethod === 'clickcollect' ? 'Click & Collect Boutique' : 'Swiss Fulfillment (La Poste Suisse)',
            items: genevaItems.map(it => ({ id: it.id, name: it.name, quantity: it.quantity }))
          }] : []),
          ...(portugalItems.length > 0 ? [{
            origin: 'PORTUGAL',
            fulfilment_location: 'PORTUGAL',
            promised_date: ptPromiseDate,
            promised_date_formatted: ptPromiseFormatted,
            cost: portugalShippingCost,
            carrier: 'Portugal Fulfillment Express',
            requires_customs: ['CH', 'LI', 'GB', 'NO', 'IS'].includes(customerCountry),
            items: portugalItems.map(it => ({ id: it.id, name: it.name, quantity: it.quantity }))
          }] : [])
        ]
      },
      status: 'in_processing',
      clientName: clientFullName
    };

    // 1. Save draft order to session so it can be committed to database upon Stripe return
    try {
      sessionStorage.setItem('nf_pending_order', JSON.stringify(newOrder));
    } catch {}

    // 2. Track GA4 add_payment_info
    const activeCurr = currency || 'CHF';
    const purchaseItems = (cart || []).map(item => ({
      item_id: (item as any).sku || item.itemKey || item.name,
      item_name: item.name,
      item_brand: (item as any).brand || 'NutriFitness',
      item_category: (item as any).categorySlug || 'Nutrition Sportive',
      price: item.price,
      quantity: item.quantity,
    }));

    trackAddPaymentInfo({
      items: purchaseItems,
      totalValue: grandTotal,
      currency: activeCurr,
      paymentType: paymentMethod,
    });

    // 3. ALL online payments (Card, TWINT, PostFinance) redirect to live Stripe Hosted Checkout
    setIsRedirectingToStripe(true);
    setStripeError(null);
    try {
      const res = await fetch('/api/checkout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          items: cart,
          currency: activeCurr,
          customerEmail,
          customerName: clientFullName,
          customerPhone,
          shippingCost: totalShippingCost,
          paymentMethod,
          couponCode: appliedCoupon?.code || (discountRate > 0 ? couponCode : undefined),
          shippingAddress: {
            street: customerAddress,
            city: customerCity,
            postalCode: customerPostalCode,
            country: customerCountry,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Erreur lors de l\'initialisation du terminal de paiement.');
      }

      // Redirect user to Stripe secure hosted checkout
      window.location.href = data.url;
      return;
    } catch (err: any) {
      setIsRedirectingToStripe(false);
      setStripeError(err?.message || 'Erreur de connexion avec le terminal de paiement sécurisé Stripe.');
      return;
    }
  };

  if (isProcessingStripe) {
    return (
      <div className="max-w-md mx-auto min-h-[60vh] flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-12 h-12 border-4 border-[#F80404] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-black uppercase text-white font-heading">Validation du paiement Stripe...</h2>
        <p className="text-xs text-white/60 mt-2">Veuillez patienter un instant pendant la confirmation de votre transaction sécurisée.</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <ThankYouAnimation
        orderNumber={orderNumber}
        totalFormatted={finalTotalFormatted}
        paymentMethod={paymentMethod}
        shippingMethod={genevaShippingMethod}
        customerEmail={customerEmail}
        deliveryCountry={confirmedCountry}
        estimatedDeliveryDate={confirmedDeliveryDate}
        products={confirmedProducts}
      />
    );
  }

  const renderCouponSection = () => (
    <div className="bg-black/60 border border-white/15 rounded-2xl p-4 space-y-3 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#F80404]" />
          <span className="text-xs font-black uppercase tracking-wider text-white">
            Code Promo / Réduction
          </span>
        </div>
        {appliedCoupon && (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            ✓ Actif
          </span>
        )}
      </div>

      {appliedCoupon ? (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs font-black text-emerald-300 uppercase tracking-wide truncate">
                {appliedCoupon.code}
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80">
              {appliedCoupon.description || `-${Math.round((appliedCoupon.rate || 0) * 100)}%`}
              {' '}(économie : <span className="font-bold text-white">-{formatPrice(discountAmount)}</span>)
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemoveCoupon}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-white/70 text-xs font-bold rounded-lg transition-colors border border-white/10 flex items-center gap-1 shrink-0"
            title="Supprimer ce code promo"
          >
            <X className="w-3.5 h-3.5" />
            <span>Retirer</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                if (couponMessage) setCouponMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyCoupon();
                }
              }}
              placeholder="Code promo (ex: TEST95)"
              className="flex-1 min-h-[42px] px-3.5 text-xs bg-black/80 border border-white/20 rounded-xl text-white uppercase placeholder-white/30 focus:outline-none focus:border-[#F80404] font-mono tracking-wider transition-all"
            />
            <button
              type="button"
              onClick={() => handleApplyCoupon()}
              disabled={isApplyingCoupon || !couponCode.trim()}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all border shrink-0 flex items-center gap-1.5 ${
                couponCode.trim() && !isApplyingCoupon
                  ? 'bg-[#F80404] hover:bg-[#FF3D00] text-black border-[#F80404] cursor-pointer shadow-md'
                  : 'bg-white/10 text-white/40 border-white/10 cursor-not-allowed'
              }`}
            >
              {isApplyingCoupon ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Vérification...</span>
                </>
              ) : (
                <span>Appliquer</span>
              )}
            </button>
          </div>

          {couponMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
                couponMessage.isError
                  ? 'bg-red-950/60 border border-red-500/40 text-red-300'
                  : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
              }`}
            >
              {couponMessage.isError ? (
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="font-semibold text-[11px]">{couponMessage.text}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] text-white/40 pt-0.5">
            <span>💡 Code d&apos;essai disponible :</span>
            <button
              type="button"
              onClick={() => {
                setCouponCode('TEST95');
              }}
              className="text-[#F80404] hover:underline font-mono font-bold"
            >
              TEST95 (-95%)
            </button>
            <span>ou</span>
            <button
              type="button"
              onClick={() => {
                setCouponCode('SWISS10');
              }}
              className="text-[#F80404] hover:underline font-mono font-bold"
            >
              SWISS10 (-10%)
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-3xl">
          🛒
        </div>
        <h1 className="text-2xl font-black uppercase text-white font-heading">
          Votre panier est vide
        </h1>
        <p className="text-sm text-white/60">
          Vous n&apos;avez aucun article dans votre panier. Ajoutez des produits avant de passer commande.
        </p>
        <Link
          href="/boutique/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-sm rounded-full transition-all shadow-lg shadow-[#F80404]/20"
        >
          <span>Découvrir la boutique</span>
          <span>→</span>
        </Link>
      </div>
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
          <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <span>{currency === 'CHF' ? '🇨🇭' : '🇪🇺'}</span> Facturation en {currency}
          </span>
        </div>
      </div>

      {/* Mobile Summary & Promo Code Box (Mobile Only) */}
      <div className="lg:hidden mb-6 bg-[#141414] border border-white/10 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Tag className="w-4 h-4 text-[#F80404]" />
            <span>Code Promo &amp; Réduction</span>
          </div>
          <span className="text-sm font-black text-white font-heading">
            Total : {formatPrice(grandTotal)}
          </span>
        </div>
        {renderCouponSection()}
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
              Les articles suivants sont disponibles en Swiss Fulfillment uniquement et ne peuvent pas être expédiés vers {customerCountry} :
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
                  placeholder="Prénom" 
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
                  placeholder="Nom" 
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
                  placeholder="Ville" 
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
                    Boutique locale (Click &amp; Collect éligible)
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
                          <span className="font-bold text-white text-xs">Colis 1 — Swiss Fulfillment</span>
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
                                  <span>📍 Click &amp; Collect Boutique</span>
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
                          <span className="font-bold text-white text-xs">Colis 2 — Portugal Fulfillment</span>
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
                            <span>Portugal Fulfillment Express</span>
                            <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                              <FlagIcon countryCode="PT" className="w-3 h-3" />
                              <span>{ptPromiseFormatted}</span>
                            </span>
                          </span>
                          <span>{portugalSubtotal >= 120 ? t.common.free : formatPrice(9.90)}</span>
                        </div>
                        <p className="text-[11px] text-white/50 mt-0.5">
                          Expédition directe via Portugal Fulfillment. Suivi complet par e-mail.
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
                                  <span>📍 Click &amp; Collect Boutique</span>
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
                            <span>Portugal Fulfillment Express</span>
                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                              <FlagIcon countryCode="PT" className="w-3 h-3" />
                              <span>{ptPromiseFormatted}</span>
                            </span>
                          </span>
                          <span>{portugalSubtotal >= 120 ? t.common.free : formatPrice(9.90)}</span>
                        </div>
                        <p className="text-white/50">
                          Colis expédié via Portugal Fulfillment avec suivi en ligne.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Code Promo / Bon de Réduction */}
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-white font-heading flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-[#F80404]" />
                <span>Code Promo / Bon d&apos;Achat</span>
              </h2>
              {appliedCoupon && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ✓ {appliedCoupon.code} Actif
                </span>
              )}
            </div>
            <p className="text-xs text-white/60">
              Saisissez un code promotionnel pour appliquer instantanément une remise sur votre panier.
            </p>
            {renderCouponSection()}
          </div>

          {/* STEP 4: Mode de Paiement */}
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white font-heading flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#F80404] text-black text-xs font-black flex items-center justify-center">4</span>
              {t.checkout.paymentMode} ({currency})
            </h2>
            <div className="space-y-3">
              {/* Credit Card / Apple Pay / Google Pay */}
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
                      <CreditCard className="w-4 h-4 text-[#F80404]" />
                      <span>Carte Bancaire (Visa, Mastercard, Amex, Apple Pay, Google Pay)</span>
                    </span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">Stripe 3D-Secure</span>
                  </div>
                  <p className="text-white/60">Paiement en ligne sécurisé avec validation par votre banque (conforme nDSG suisse).</p>
                </div>
              </label>

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
                      <span>TWINT Suisse</span>
                    </span>
                    <span className="text-[#F80404] font-bold">Instantané</span>
                  </div>
                  <p className="text-white/60">Payez en 1 clic avec l&apos;application TWINT de votre banque suisse via notre passerelle bancaire.</p>
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
                  <p className="text-white/60">Débit direct sur votre compte postal ou carte PostFinance.</p>
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

          {/* Cart items list with Origin Badges */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-white/5">
            {cart.map(item => {
              const isCommon = item.locationType === 'COMMON' || item.shippingOrigin === 'common';
              const isPt = (item.shippingOrigin === 'portugal' && !isCommon) || (!customerCountry.includes('CH') && isCommon);
              const flavorObj = item.flavor as unknown as Record<string, string> | null | undefined;
              const flavorStr = typeof item.flavor === 'object' && item.flavor !== null
                ? (flavorObj?.[locale] || flavorObj?.fr || 'Standard')
                : String(item.flavor || 'Standard');

              return (
                <div key={item.itemKey} className="flex items-center gap-3 pt-2">
                  <div className="relative w-12 h-12 bg-black/40 rounded-lg p-1 shrink-0 border border-white/10 flex items-center justify-center">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider bg-white/10 text-white/80">
                        {isPt ? '🇵🇹 Portugal Fulfillment' : '🇨🇭 Swiss Fulfillment'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate mt-0.5">{item.name}</h4>
                    <p className="text-[10px] text-white/50">{flavorStr} · Qte: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black text-white font-heading">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Coupon / Promo Code Section */}
          {renderCouponSection()}

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-xs text-white/70 pt-4 border-t border-white/10">
            <div className="flex justify-between">
              <span>{t.common.subtotal} ({currency}) :</span>
              <span className="font-bold text-white">{formatPrice(cartSubtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 text-xs font-bold">
                <span>Remise ({couponCode}) :</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            {/* Split Shipping charges breakdown */}
            {isMixedCart ? (
              <div className="space-y-1.5 bg-black/40 p-2.5 rounded-xl border border-white/5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/80 flex items-center gap-1">
                    <span>🇨🇭</span> Frais Colis 1 (Swiss Fulfillment) :
                  </span>
                  <span className="font-bold text-white">
                    {genevaShippingCost === 0 ? t.common.free : formatPrice(genevaShippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/80 flex items-center gap-1">
                    <span>🇵🇹</span> Frais Colis 2 (Portugal Fulfillment) :
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
                    ? (genevaShippingMethod === 'clickcollect' ? 'Click & Collect' : 'Swiss Fulfillment')
                    : 'Portugal Fulfillment'}
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

          {stripeError && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{stripeError}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={!isAddressCompleted || !postalValidation.isValid || hasBlockedItems || isRedirectingToStripe}
            className={`w-full min-h-[52px] px-6 py-4 font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 ${
              isAddressCompleted && postalValidation.isValid && !hasBlockedItems && !isRedirectingToStripe
                ? 'bg-[#F80404] hover:bg-[#FF3D00] text-black hover:shadow-[#F80404]/30 cursor-pointer active:scale-98'
                : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
            }`}
          >
            {isRedirectingToStripe ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Connexion sécurisée à Stripe...</span>
              </>
            ) : (
              <>
                <span>
                  {paymentMethod === 'twint'
                    ? 'Payer avec TWINT'
                    : paymentMethod === 'postfinance'
                    ? 'Payer avec PostFinance'
                    : 'Payer par Carte Bancaire'} ({formatPrice(grandTotal)})
                </span>
                <span>→</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-white/40 text-center leading-relaxed">
            En validant votre commande, vous acceptez nos CGV et notre politique de confidentialité conforme à la nDSG suisse.
          </p>
        </div>
      </form>
    </div>
  );
}
