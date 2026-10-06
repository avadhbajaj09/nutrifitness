'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, CATEGORIES } from '@/lib/catalog';
import type { ProductItem, ProductVariant, SupportedLocale } from '@/lib/types';
import { 
  Package, 
  Store, 
  Receipt, 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Printer, 
  LogOut, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ExternalLink, 
  Tag, 
  Percent, 
  Layers, 
  Info, 
  Clock, 
  Calendar, 
  Download, 
  AlertCircle,
  ShoppingBag,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const ADMIN_PASSWORD = 'Geneva@03564';

export interface PosTicketItem {
  id: string; // unique item key
  productId: string;
  variantId: string;
  name: string;
  brand: string;
  flavor: string;
  format: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  vatRate: number; // e.g. 2.6
}

export interface PosSaleRecord {
  id: string;
  ticketNumber: string;
  timestamp: string;
  items: PosTicketItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  vatAmount: number;
  total: number;
  paymentMethod: 'twint' | 'card' | 'cash_chf' | 'cash_eur' | 'invoice';
  paymentDetails: {
    reference?: string;
    cashReceived?: number;
    changeGiven?: number;
    cardType?: string;
    notes?: string;
  };
  seller: string;
  clientName?: string;
}

// Play pleasant POS beep when barcode is scanned or item added
function playScannerBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // Audio might be suppressed by browser policy if no user gesture
  }
}

export default function AdminDashboardClient() {
  // -------------------------------------------------------------
  // 1. AUTHENTICATION STATE
  // -------------------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nf_admin_auth');
      if (stored === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
      }
    } catch {
      // localStorage unavailable
    }
    setAuthChecking(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(null);
      try {
        localStorage.setItem('nf_admin_auth', ADMIN_PASSWORD);
      } catch {
        // ignore
      }
    } else {
      setAuthError('Mot de passe administrateur incorrect. Veuillez vérifier la clé.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    try {
      localStorage.removeItem('nf_admin_auth');
    } catch {
      // ignore
    }
  };

  // -------------------------------------------------------------
  // 2. DASHBOARD NAVIGATION & TIME
  // -------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<'catalog' | 'pos' | 'sales'>('pos');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('fr-CH', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // -------------------------------------------------------------
  // 3. CATALOG TAB STATE & INSPECTOR DRAWER
  // -------------------------------------------------------------
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogOriginFilter, setCatalogOriginFilter] = useState<'all' | 'geneva' | 'portugal'>('all');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('all');
  const [catalogBrandFilter, setCatalogBrandFilter] = useState<string>('all');
  const [catalogSort, setCatalogSort] = useState<'name_asc' | 'price_asc' | 'price_desc' | 'brand'>('brand');

  const [inspectingProduct, setInspectingProduct] = useState<ProductItem | null>(null);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string>('');
  const [inspectorLang, setInspectorLang] = useState<SupportedLocale>('fr');

  useEffect(() => {
    if (inspectingProduct) {
      setSelectedGalleryImg(inspectingProduct.images[0]?.src || '/images/placeholder.webp');
    }
  }, [inspectingProduct]);

  const brandsList = useMemo(() => {
    return Array.from(new Set(PRODUCTS.map(p => p.brand))).sort();
  }, []);

  const filteredCatalog = useMemo(() => {
    return PRODUCTS.filter(p => {
      // Origin filter
      if (catalogOriginFilter === 'geneva' && p.shippingOrigin === 'portugal') return false;
      if (catalogOriginFilter === 'portugal' && p.shippingOrigin !== 'portugal') return false;

      // Category filter
      if (catalogCategoryFilter !== 'all' && p.categorySlug !== catalogCategoryFilter) return false;

      // Brand filter
      if (catalogBrandFilter !== 'all' && p.brand !== catalogBrandFilter) return false;

      // Search
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase();
        const inName = p.name.fr?.toLowerCase().includes(q) || p.name.en?.toLowerCase().includes(q);
        const inBrand = p.brand.toLowerCase().includes(q);
        const inSku = p.variants?.some(v => v.sku.toLowerCase().includes(q));
        const inSlug = p.slug.fr?.toLowerCase().includes(q);
        if (!inName && !inBrand && !inSku && !inSlug) return false;
      }

      return true;
    }).sort((a, b) => {
      if (catalogSort === 'price_asc') return a.priceChf - b.priceChf;
      if (catalogSort === 'price_desc') return b.priceChf - a.priceChf;
      if (catalogSort === 'name_asc') return a.name.fr.localeCompare(b.name.fr);
      return a.brand.localeCompare(b.brand);
    });
  }, [catalogOriginFilter, catalogCategoryFilter, catalogBrandFilter, catalogSearch, catalogSort]);

  // -------------------------------------------------------------
  // 4. POS (POINT OF SALE) STATE — GENEVA STOCK ONLY
  // -------------------------------------------------------------
  // CRITICAL RULE: ONLY products from Geneva store (NOT from Portugal manufacturer)
  const posProducts = useMemo(() => {
    return PRODUCTS.filter(p => p.shippingOrigin !== 'portugal');
  }, []);

  const [posSearch, setPosSearch] = useState<string>('');
  const [posCategoryFilter, setPosCategoryFilter] = useState<string>('all');
  const [posBrandFilter, setPosBrandFilter] = useState<string>('all');

  // Barcode / Quick scan field
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [scanFeedback, setScanFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Variant selector modal for POS
  const [variantPickerProduct, setVariantPickerProduct] = useState<ProductItem | null>(null);

  // Current POS Ticket
  const [ticketItems, setTicketItems] = useState<PosTicketItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [clientName, setClientName] = useState<string>('');
  const [ticketNumber, setTicketNumber] = useState<string>('');

  // Initialize ticket number
  useEffect(() => {
    generateNewTicketNumber();
  }, []);

  const generateNewTicketNumber = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    setTicketNumber(`NF-${dateStr}-${rand}`);
  };

  const filteredPosProducts = useMemo(() => {
    return posProducts.filter(p => {
      if (posCategoryFilter !== 'all' && p.categorySlug !== posCategoryFilter) return false;
      if (posBrandFilter !== 'all' && p.brand !== posBrandFilter) return false;
      if (posSearch.trim()) {
        const q = posSearch.toLowerCase();
        const inName = p.name.fr?.toLowerCase().includes(q);
        const inBrand = p.brand.toLowerCase().includes(q);
        const inSku = p.variants?.some(v => v.sku.toLowerCase().includes(q));
        if (!inName && !inBrand && !inSku) return false;
      }
      return true;
    });
  }, [posProducts, posCategoryFilter, posBrandFilter, posSearch]);

  // Add an item to POS Ticket
  const addToPosTicket = (product: ProductItem, variant: ProductVariant) => {
    playScannerBeep();
    const itemKey = `${product.id}-${variant.id || variant.sku}`;

    setTicketItems(prev => {
      const existing = prev.find(item => item.id === itemKey);
      if (existing) {
        return prev.map(item => 
          item.id === itemKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          productId: product.id,
          variantId: variant.id || variant.sku,
          name: product.name.fr,
          brand: product.brand,
          flavor: variant.flavorName.fr || 'Standard',
          format: variant.format || 'Standard',
          sku: variant.sku,
          price: variant.priceChf || product.priceChf,
          quantity: 1,
          image: variant.image || product.images[0]?.src || '/images/placeholder.webp',
          vatRate: product.taxCategory === 'standard' ? 8.1 : 2.6
        }
      ];
    });

    setScanFeedback({
      message: `Ajouté : ${product.name.fr} (${variant.flavorName.fr || 'Standard'})`,
      type: 'success'
    });
    setTimeout(() => setScanFeedback(null), 3000);
  };

  // Barcode / SKU scan submit handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim().toLowerCase();
    if (!query) return;

    // Search in Geneva products
    let foundProduct: ProductItem | null = null;
    let foundVariant: ProductVariant | null = null;

    for (const prod of posProducts) {
      const v = prod.variants?.find(
        variant => 
          variant.sku.toLowerCase() === query || 
          variant.gtin13?.toLowerCase() === query ||
          variant.sku.toLowerCase().includes(query)
      );
      if (v) {
        foundProduct = prod;
        foundVariant = v;
        break;
      }
      // Check product ID or exact slug
      if (prod.id.toLowerCase() === query || prod.slug.fr.toLowerCase() === query) {
        foundProduct = prod;
        foundVariant = prod.variants?.[0] || {
          id: 'def',
          sku: 'STD',
          flavorName: { fr: 'Standard', de: 'Standard', it: 'Standard', en: 'Standard' },
          format: '1 unité',
          priceChf: prod.priceChf,
          inventoryQuantity: 20,
          inStock: true
        };
        break;
      }
    }

    if (foundProduct && foundVariant) {
      addToPosTicket(foundProduct, foundVariant);
      setBarcodeInput('');
    } else {
      // Check if product exists in Portugal instead
      const isPortugal = PRODUCTS.some(p => 
        p.shippingOrigin === 'portugal' && 
        (p.variants?.some(v => v.sku.toLowerCase() === query) || p.slug.fr.toLowerCase() === query)
      );

      if (isPortugal) {
        setScanFeedback({
          message: 'Article usine Portugal : non disponible en stock physique Genève pour encaissement direct.',
          type: 'error'
        });
      } else {
        setScanFeedback({
          message: `Code "${query}" non trouvé dans le stock magasin de Genève.`,
          type: 'error'
        });
      }
      setTimeout(() => setScanFeedback(null), 4000);
    }
  };

  const updateTicketQty = (id: string, delta: number) => {
    setTicketItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = item.quantity + delta;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    }).filter(Boolean) as PosTicketItem[]);
  };

  const removeTicketItem = (id: string) => {
    setTicketItems(prev => prev.filter(item => item.id !== id));
  };

  const clearTicket = () => {
    if (ticketItems.length === 0) return;
    if (confirm('Voulez-vous réinitialiser le ticket de caisse en cours ?')) {
      setTicketItems([]);
      setDiscountPercent(0);
      setClientName('');
      generateNewTicketNumber();
    }
  };

  // Ticket calculations
  const rawSubtotal = useMemo(() => {
    return ticketItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [ticketItems]);

  const discountAmount = useMemo(() => {
    return (rawSubtotal * discountPercent) / 100;
  }, [rawSubtotal, discountPercent]);

  const subtotalAfterDiscount = useMemo(() => {
    return Math.max(0, rawSubtotal - discountAmount);
  }, [rawSubtotal, discountAmount]);

  const vatTotal = useMemo(() => {
    // Swiss VAT 2.6% included in price for foods
    return subtotalAfterDiscount * 0.026;
  }, [subtotalAfterDiscount]);

  const totalToPay = subtotalAfterDiscount;

  // -------------------------------------------------------------
  // 5. PAYMENT & RECEIPT MODAL
  // -------------------------------------------------------------
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'twint' | 'card' | 'cash_chf' | 'cash_eur' | 'invoice'>('twint');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [cardTerminalType, setCardTerminalType] = useState<string>('Terminal SumUp / PostFinance');

  // Completed sale receipt view
  const [completedSale, setCompletedSale] = useState<PosSaleRecord | null>(null);

  // Sales journal history (saved to localStorage)
  const [salesHistory, setSalesHistory] = useState<PosSaleRecord[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nutrifitness_pos_sales');
      if (stored) {
        setSalesHistory(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveSalesHistory = (updated: PosSaleRecord[]) => {
    setSalesHistory(updated);
    try {
      localStorage.setItem('nutrifitness_pos_sales', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const cashNumeric = parseFloat(cashTendered) || 0;
  const cashChangeDue = paymentMethod === 'cash_chf' && cashNumeric >= totalToPay 
    ? cashNumeric - totalToPay 
    : 0;

  const handleValidateSale = () => {
    if (ticketItems.length === 0) return;
    if (paymentMethod === 'cash_chf' && cashNumeric < totalToPay) {
      alert(`Montant en espèces insuffisant. Total à payer : CHF ${totalToPay.toFixed(2)}, reçu : CHF ${cashNumeric.toFixed(2)}`);
      return;
    }

    const newSale: PosSaleRecord = {
      id: `sale-${Date.now()}`,
      ticketNumber,
      timestamp: new Date().toISOString(),
      items: [...ticketItems],
      subtotal: rawSubtotal,
      discountPercent,
      discountAmount,
      vatAmount: vatTotal,
      total: totalToPay,
      paymentMethod,
      paymentDetails: {
        reference: paymentReference || undefined,
        cashReceived: paymentMethod === 'cash_chf' ? cashNumeric : undefined,
        changeGiven: paymentMethod === 'cash_chf' ? cashChangeDue : undefined,
        cardType: paymentMethod === 'card' ? cardTerminalType : undefined,
        notes: paymentNotes || undefined
      },
      seller: 'Marco (Rue des Pâquis 34)',
      clientName: clientName || 'Client Comptoir'
    };

    // Save sale
    const updatedHistory = [newSale, ...salesHistory];
    saveSalesHistory(updatedHistory);

    // Show receipt
    setCompletedSale(newSale);
    setIsPaymentModalOpen(false);

    // Clear ticket for next customer
    setTicketItems([]);
    setDiscountPercent(0);
    setClientName('');
    setCashTendered('');
    setPaymentReference('');
    setPaymentNotes('');
    generateNewTicketNumber();
  };

  // Print receipt function
  const handlePrintReceipt = () => {
    window.print();
  };

  // Export sales to CSV
  const handleExportCsv = () => {
    if (salesHistory.length === 0) {
      alert('Aucune vente enregistrée à exporter.');
      return;
    }
    const headers = ['Date', 'Ticket', 'Vendeur', 'Client', 'Total_CHF', 'Methode_Paiement', 'Reference', 'Articles'];
    const rows = salesHistory.map(s => [
      `"${new Date(s.timestamp).toLocaleString('fr-CH')}"`,
      `"${s.ticketNumber}"`,
      `"${s.seller}"`,
      `"${s.clientName || 'Passager'}"`,
      s.total.toFixed(2),
      `"${s.paymentMethod}"`,
      `"${s.paymentDetails.reference || ''}"`,
      `"${s.items.map(i => `${i.quantity}x ${i.name} (${i.flavor})`).join(' | ')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ventes_pos_nutrifitness_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------
  // RENDER 1: AUTHENTICATION LOCK SCREEN (Shopify / WP Style)
  // -------------------------------------------------------------
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-sm">Chargement du panneau NutriFitness OS...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 text-white mb-4 shadow-md">
              <span className="text-2xl font-black tracking-tight font-heading">NF</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-3">
              <span>🇨🇭</span>
              <span>Boutique Genève (Rue des Pâquis 34)</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 font-heading">
              NutriFitness OS
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Administration & Caisse Enregistreuse POS
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mot de passe Administrateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Entrez le mot de passe..."
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Ouvrir la Caisse & le Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            <p>Accès sécurisé pour le personnel de la boutique NutriFitness.</p>
            <p className="mt-1 font-mono text-[11px] text-slate-400">Route active : /wp-admin/</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 2: AUTHENTICATED DASHBOARD (Spacious, Clean, Light Theme)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      
      {/* =========================================================
          TOP NAV BAR (Light, spacious, Shopify/WP Admin Style)
          ========================================================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Brand & Store Badge */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black font-heading text-lg shrink-0 shadow-xs">
              NF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-slate-900 font-heading">
                  NutriFitness OS
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Boutique Genève
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate hidden sm:block">
                Rue des Pâquis 34, 1201 Genève · {currentTime}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Large & High Contrast) */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'pos'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Caisse POS (Magasin)</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                {posProducts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4 text-blue-600" />
              <span>Catalogue Global</span>
              <span className="px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700 text-[10px] font-black">
                {PRODUCTS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'sales'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Journal des Ventes</span>
              <span className="sm:hidden">Ventes</span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black">
                {salesHistory.length}
              </span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Voir la boutique en ligne"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Site Web</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN BODY: TAB 1 — IN-STORE POS SYSTEM (GENEVA STOCK ONLY)
          ========================================================= */}
      {activeTab === 'pos' && (
        <div className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
          
          {/* LEFT 65%: PRODUCT BROWSER & SCANNER */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            
            {/* 1. BARCODE / SKU QUICK SCANNER INPUT */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <form onSubmit={handleBarcodeSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                    <Barcode className="w-6 h-6" />
                  </div>
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scanner un code-barres / SKU ou taper le nom... (Appuyez sur Entrée)"
                    className="w-full pl-12 pr-4 py-3 bg-emerald-50/50 border-2 border-emerald-300 rounded-xl text-slate-900 placeholder-slate-500 font-medium text-sm sm:text-base focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-inner"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Scanner / Ajouter</span>
                </button>
              </form>

              {/* Feedback Alert for Scanning */}
              {scanFeedback && (
                <div className={`mt-3 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
                  scanFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {scanFeedback.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{scanFeedback.message}</span>
                </div>
              )}

              {/* POS Origin Notice */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-700">Stock Magasin Genève</span>
                  <span>({posProducts.length} articles disponibles en rayon)</span>
                </div>
                <span className="text-[11px] text-slate-400 hidden md:inline">
                  🛡️ Articles de l'usine Portugal exclus de la caisse magasin
                </span>
              </div>
            </div>

            {/* 2. CATEGORY & BRAND CHIPS FILTER */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setPosCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
                    posCategoryFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tous ({posProducts.length})
                </button>
                {CATEGORIES.map(cat => {
                  const count = posProducts.filter(p => p.categorySlug === cat.id).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPosCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        posCategoryFilter === cat.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.name.fr} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Search + Brand Filter */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    placeholder="Filtrer par nom ou marque..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  {posSearch && (
                    <button
                      type="button"
                      onClick={() => setPosSearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={posBrandFilter}
                  onChange={(e) => setPosBrandFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">Toutes les marques</option>
                  {brandsList.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. PRODUCT GRID FOR POS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 overflow-y-auto max-h-[calc(100vh-360px)] pr-1">
              {filteredPosProducts.map(product => {
                const img = product.images[0]?.src || '/images/placeholder.webp';
                const hasMultipleVariants = (product.variants?.length || 0) > 1;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (hasMultipleVariants) {
                        setVariantPickerProduct(product);
                      } else {
                        const defaultVariant = product.variants?.[0] || {
                          id: 'def',
                          sku: product.id,
                          flavorName: { fr: 'Standard', de: 'Standard', it: 'Standard', en: 'Standard' },
                          format: '1 unité',
                          priceChf: product.priceChf,
                          inventoryQuantity: 20,
                          inStock: true
                        };
                        addToPosTicket(product, defaultVariant);
                      }
                    }}
                    className="bg-white rounded-2xl border border-slate-200 p-3 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-97 select-none"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative aspect-square w-full rounded-xl bg-slate-50 border border-slate-100 p-2 mb-2 flex items-center justify-center overflow-hidden">
                        <Image
                          src={img}
                          alt={product.name.fr}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-contain p-1 group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black">
                          🇨🇭 Rayon
                        </span>
                      </div>

                      {/* Brand & Name */}
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-heading truncate">
                        {product.brand}
                      </p>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                        {product.name.fr}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900 font-heading">
                        CHF {product.priceChf.toFixed(2)}
                      </span>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white transition-colors">
                        <Plus className="w-4 h-4 font-bold" />
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredPosProducts.length === 0 && (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
                  <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-sm">Aucun produit trouvé dans le rayon Genève.</p>
                  <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche ou réinitialisez les filtres.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 35%: LIVE TICKET & TOTALS */}
          <div className="w-full lg:w-[460px] flex flex-col gap-4 shrink-0">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-5 flex flex-col h-full justify-between">
              
              {/* Ticket Header */}
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      Ticket de Caisse
                    </span>
                    <h2 className="text-base font-black text-slate-900 font-heading">
                      {ticketNumber}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={clearTicket}
                      disabled={ticketItems.length === 0}
                      className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-30 rounded-xl hover:bg-red-50 transition-colors"
                      title="Vider la caisse"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Client Name Input (Optional) */}
                <div className="mt-3">
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nom ou remarque client (optionnel)..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                </div>

                {/* Ticket Items List */}
                <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {ticketItems.map(item => (
                    <div 
                      key={item.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-slate-900 truncate">
                            {item.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {item.flavor} · {item.format} · <span className="font-mono text-slate-400">{item.sku}</span>
                        </p>
                        <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                          CHF {item.price.toFixed(2)} / u.
                        </p>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateTicketQty(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateTicketQty(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right shrink-0">
                        <span className="font-black text-slate-900 text-sm font-heading">
                          CHF {(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTicketItem(item.id)}
                          className="block ml-auto text-[10px] text-slate-400 hover:text-red-500 mt-0.5"
                        >
                          retirer
                        </button>
                      </div>
                    </div>
                  ))}

                  {ticketItems.length === 0 && (
                    <div className="py-12 text-center text-slate-400">
                      <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-xs">La caisse est vide</p>
                      <p className="text-[11px] mt-0.5">Scannez un code-barres ou sélectionnez un produit.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Footer / Summary */}
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
                
                {/* Discount selector */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Remise fidélité / promo :</span>
                  <div className="flex items-center gap-1">
                    {[0, 5, 10, 15].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDiscountPercent(pct)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                          discountPercent === pct
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {pct === 0 ? '0%' : `-${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtotal lines */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Sous-total brut</span>
                    <span className="font-semibold text-slate-900">CHF {rawSubtotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Remise accordée ({discountPercent}%)</span>
                      <span>- CHF {discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>TVA suisse 2.6% (incluse)</span>
                    <span>CHF {vatTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Total Net TTC
                    </span>
                    <p className="text-xs text-slate-500 font-medium">Devise : Franc suisse (CHF)</p>
                  </div>
                  <span className="text-3xl font-black text-emerald-700 font-heading">
                    CHF {totalToPay.toFixed(2)}
                  </span>
                </div>

                {/* Big Checkout Button */}
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={ticketItems.length === 0}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-base uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Encaisser (CHF {totalToPay.toFixed(2)})</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN BODY: TAB 2 — GLOBAL PRODUCT CATALOG (SHOPIFY/WP STYLE)
          ========================================================= */}
      {activeTab === 'catalog' && (
        <div className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Catalogue</span>
              <p className="text-2xl font-black text-slate-900 font-heading mt-1">{PRODUCTS.length} articles</p>
              <p className="text-xs text-slate-500 mt-1">100% fiches multilingues complètes</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Stock Rayon Genève</span>
              <p className="text-2xl font-black text-emerald-800 font-heading mt-1">
                {PRODUCTS.filter(p => p.shippingOrigin !== 'portugal').length} articles
              </p>
              <p className="text-xs text-emerald-600 mt-1">Disponibles en caisse POS immédiate</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Expédition Portugal</span>
              <p className="text-2xl font-black text-blue-800 font-heading mt-1">
                {PRODUCTS.filter(p => p.shippingOrigin === 'portugal').length} articles
              </p>
              <p className="text-xs text-blue-600 mt-1">Livraison directe d'usine (3–5 jours)</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marques & Catégories</span>
              <p className="text-2xl font-black text-slate-900 font-heading mt-1">
                {brandsList.length} marques · {CATEGORIES.length} cats
              </p>
              <p className="text-xs text-slate-500 mt-1">Optimisé SEO, AEO & GEO</p>
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Rechercher par titre, marque, SKU, description, ingrédient..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              {/* Origin Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setCatalogOriginFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    catalogOriginFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tous ({PRODUCTS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogOriginFilter('geneva')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    catalogOriginFilter === 'geneva'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  <span>🇨🇭 Genève ({PRODUCTS.filter(p => p.shippingOrigin !== 'portugal').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogOriginFilter('portugal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    catalogOriginFilter === 'portugal'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-blue-700'
                  }`}
                >
                  <span>🇵🇹 Portugal ({PRODUCTS.filter(p => p.shippingOrigin === 'portugal').length})</span>
                </button>
              </div>

              {/* Dropdowns */}
              <div className="flex items-center gap-2.5 shrink-0">
                <select
                  value={catalogCategoryFilter}
                  onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">Toutes les catégories</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name.fr}</option>
                  ))}
                </select>

                <select
                  value={catalogBrandFilter}
                  onChange={(e) => setCatalogBrandFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">Toutes les marques</option>
                  {brandsList.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                <select
                  value={catalogSort}
                  onChange={(e) => setCatalogSort(e.target.value as typeof catalogSort)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="brand">Trier par Marque</option>
                  <option value="name_asc">Trier par Nom A-Z</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                </select>
              </div>

            </div>
          </div>

          {/* Products Table (Shopify/WooCommerce Style) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Photo</th>
                    <th className="py-3.5 px-4">Article & Marque</th>
                    <th className="py-3.5 px-4">Catégorie</th>
                    <th className="py-3.5 px-4">Origine & Expédition</th>
                    <th className="py-3.5 px-4">Variantes & Saveurs</th>
                    <th className="py-3.5 px-4">Prix Public</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCatalog.map(product => {
                    const primaryImg = product.images[0]?.src || '/images/placeholder.webp';
                    const isPortugal = product.shippingOrigin === 'portugal';
                    const variantsCount = product.variants?.length || 1;

                    return (
                      <tr 
                        key={product.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setInspectingProduct(product)}
                      >
                        {/* Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="relative w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            <Image
                              src={primaryImg}
                              alt={product.name.fr}
                              fill
                              sizes="56px"
                              className="object-contain p-0.5"
                            />
                            {product.images.length > 1 && (
                              <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-white text-[8px] font-bold">
                                +{product.images.length - 1}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Title & Brand */}
                        <td className="py-3 px-4 max-w-sm">
                          <span className="text-[10px] font-black uppercase text-slate-400 font-heading block">
                            {product.brand}
                          </span>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {product.name.fr}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">
                            ID: {product.id}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] inline-block">
                            {CATEGORIES.find(c => c.id === product.categorySlug)?.name.fr || product.categorySlug}
                          </span>
                        </td>

                        {/* Origin Badge */}
                        <td className="py-3 px-4">
                          {isPortugal ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px]">
                              <span>🇵🇹</span>
                              <span>Usine Portugal (3–5j)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]">
                              <span>🇨🇭</span>
                              <span>Stock Genève (POS dispo)</span>
                            </span>
                          )}
                        </td>

                        {/* Variants count */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-700">
                            {variantsCount} {variantsCount > 1 ? 'options' : 'format standard'}
                          </span>
                          {product.variants?.[0]?.flavorName?.fr && (
                            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                              {product.variants.map(v => v.flavorName.fr).slice(0, 2).join(', ')}...
                            </p>
                          )}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4">
                          <span className="font-black text-slate-900 text-sm font-heading">
                            CHF {product.priceChf.toFixed(2)}
                          </span>
                          {product.compareAtPriceChf && (
                            <span className="block text-[10px] text-slate-400 line-through">
                              CHF {product.compareAtPriceChf.toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setInspectingProduct(product)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                              title="Inspecter la fiche complète"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Fiche</span>
                            </button>

                            <Link
                              href={`/produit/${product.slug.fr}/`}
                              target="_blank"
                              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Voir sur le site web public"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN BODY: TAB 3 — POS SALES JOURNAL & METRICS
          ========================================================= */}
      {activeTab === 'sales' && (
        <div className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recette Totale Enregistrée</span>
              <p className="text-2xl font-black text-emerald-700 font-heading mt-1">
                CHF {salesHistory.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">{salesHistory.length} tickets validés</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paiements TWINT</span>
              <p className="text-2xl font-black text-slate-900 font-heading mt-1">
                CHF {salesHistory.filter(s => s.paymentMethod === 'twint').reduce((sum, s) => sum + s.total, 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Encaissements instantanés QR</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paiements Carte</span>
              <p className="text-2xl font-black text-slate-900 font-heading mt-1">
                CHF {salesHistory.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Terminaux de paiement</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Espèces (Cash)</span>
              <p className="text-2xl font-black text-slate-900 font-heading mt-1">
                CHF {salesHistory.filter(s => s.paymentMethod === 'cash_chf').reduce((sum, s) => sum + s.total, 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Fond de caisse boutique</p>
            </div>
          </div>

          {/* Sales History Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-heading">
                  Historique des Tickets de Caisse
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toutes les ventes réalisées physiquement au magasin NutriFitness Genève.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Exporter CSV (Comptabilité)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Date / Heure</th>
                    <th className="py-3 px-4">N° Ticket</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Articles</th>
                    <th className="py-3 px-4">Paiement</th>
                    <th className="py-3 px-4">Total CHF</th>
                    <th className="py-3 px-4 text-right">Reçu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesHistory.map(sale => (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {new Date(sale.timestamp).toLocaleString('fr-CH', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {sale.ticketNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {sale.clientName || 'Passager'}
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-600 truncate">
                        {sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px] uppercase">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900 text-sm font-heading">
                        CHF {sale.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setCompletedSale(sale)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-colors"
                        >
                          Voir Reçu
                        </button>
                      </td>
                    </tr>
                  ))}

                  {salesHistory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-xs">Aucune vente enregistrée pour le moment.</p>
                        <p className="text-[11px] mt-0.5">Les encaissements POS apparaîtront automatiquement ici.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL A: VARIANT SELECTOR FOR MULTI-FLAVOR PRODUCTS
          ========================================================= */}
      {variantPickerProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Sélectionner la saveur / option
                </span>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  {variantPickerProduct.name.fr}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVariantPickerProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {variantPickerProduct.variants?.map(v => (
                <button
                  key={v.id || v.sku}
                  type="button"
                  onClick={() => {
                    addToPosTicket(variantPickerProduct, v);
                    setVariantPickerProduct(null);
                  }}
                  className="w-full p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-xs text-slate-900 group-hover:text-emerald-800">
                      {v.flavorName.fr} · {v.format}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">SKU: {v.sku}</p>
                  </div>
                  <span className="font-black text-slate-900 text-sm font-heading group-hover:text-emerald-700">
                    CHF {(v.priceChf || variantPickerProduct.priceChf).toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL B: PAYMENT DETAILS MODAL ("how he received the amount")
          ========================================================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Règlement Caisse Magasin
                </span>
                <h3 className="text-lg font-black text-slate-900 font-heading">
                  Encaissement · {ticketNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Display */}
            <div className="my-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Montant total à percevoir
              </span>
              <div className="text-4xl font-black text-emerald-800 font-heading mt-1">
                CHF {totalToPay.toFixed(2)}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mode de paiement reçu :
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('twint')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'twint'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs">⚡ TWINT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-black shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-xs">💳 Carte / EFT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_chf')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'cash_chf'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 font-black shadow-xs ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-amber-600" />
                  <span className="text-xs">💵 Espèces CHF</span>
                </button>
              </div>

              {/* Dynamic Payment Details Section */}
              {paymentMethod === 'twint' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <p className="text-xs text-slate-600 font-medium">
                    Faites scanner le QR Code TWINT du comptoir au client ou validez via l'application.
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Numéro de transaction / Référence TWINT (facultatif) :
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Ex: TW-984321..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Terminal de paiement :
                    </label>
                    <select
                      value={cardTerminalType}
                      onChange={(e) => setCardTerminalType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                    >
                      <option value="Terminal SumUp / PostFinance">Terminal SumUp / PostFinance</option>
                      <option value="Visa / Mastercard">Visa / Mastercard</option>
                      <option value="Apple Pay / Google Pay">Apple Pay / Sans contact</option>
                      <option value="Maestro / Débit Suisse">Maestro / Débit Suisse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Code autorisation terminal (facultatif) :
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Ex: AUTH-8291..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'cash_chf' && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1.5">
                      Montant reçu du client (CHF) :
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-sm">CHF</span>
                      <input
                        type="number"
                        step="0.05"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        placeholder={totalToPay.toFixed(2)}
                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-amber-300 rounded-xl font-black text-lg text-slate-900 focus:outline-none"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Exact', val: totalToPay },
                      { label: 'CHF 20', val: 20 },
                      { label: 'CHF 50', val: 50 },
                      { label: 'CHF 100', val: 100 },
                      { label: 'CHF 200', val: 200 }
                    ].map(btn => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => setCashTendered(btn.val.toFixed(2))}
                        className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 transition-colors"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Change Calculator Output */}
                  <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Monnaie à rendre :</span>
                    <span className={`text-lg font-black font-heading ${
                      cashNumeric >= totalToPay ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {cashNumeric >= totalToPay 
                        ? `CHF ${cashChangeDue.toFixed(2)}` 
                        : `Manque CHF ${(totalToPay - cashNumeric).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Note interne / Vendeur :
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Ex: Servi par Marco au comptoir..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              {/* Complete sale button */}
              <button
                type="button"
                onClick={handleValidateSale}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 mt-4"
              >
                <Check className="w-5 h-5" />
                <span>Valider l'Encaissement & Émettre le Reçu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL C: PRINTABLE RECEIPT / TICKET DE CAISSE
          ========================================================= */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-black uppercase text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Vente Confirmée
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompletedSale(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thermal Receipt Paper Layout */}
            <div id="pos-receipt-print" className="my-4 p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-300 font-mono text-xs text-slate-800 space-y-3">
              {/* Header */}
              <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3">
                <h4 className="font-black text-sm text-slate-900">NUTRIFITNESS GENÈVE</h4>
                <p className="text-[11px] text-slate-600">Rue des Pâquis 34, 1201 Genève</p>
                <p className="text-[10px] text-slate-500">Tél: +41 22 731 12 34 · nutrifitness.ch</p>
                <p className="text-[10px] text-slate-400">CHE-123.456.789 TVA suisse</p>
              </div>

              {/* Meta */}
              <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>Ticket :</span>
                  <span className="font-bold">{completedSale.ticketNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date :</span>
                  <span>{new Date(completedSale.timestamp).toLocaleString('fr-CH')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vendeur :</span>
                  <span>{completedSale.seller}</span>
                </div>
                {completedSale.clientName && (
                  <div className="flex justify-between">
                    <span>Client :</span>
                    <span>{completedSale.clientName}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
                {completedSale.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="pr-2">
                      <p className="font-bold">{it.quantity}x {it.name}</p>
                      <p className="text-[10px] text-slate-500">{it.flavor} · {it.format}</p>
                    </div>
                    <span className="font-bold shrink-0">CHF {(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span>Sous-total brut :</span>
                  <span>CHF {completedSale.subtotal.toFixed(2)}</span>
                </div>
                {completedSale.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Remise ({completedSale.discountPercent}%) :</span>
                    <span>- CHF {completedSale.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>Dont TVA suisse (2.6%) :</span>
                  <span>CHF {completedSale.vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-1">
                  <span>TOTAL PAYÉ :</span>
                  <span>CHF {completedSale.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="text-[11px] space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>Mode de règlement :</span>
                  <span className="uppercase">{completedSale.paymentMethod}</span>
                </div>
                {completedSale.paymentDetails.cashReceived && (
                  <>
                    <div className="flex justify-between">
                      <span>Espèces reçues :</span>
                      <span>CHF {completedSale.paymentDetails.cashReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-700">
                      <span>Monnaie rendue :</span>
                      <span>CHF {(completedSale.paymentDetails.changeGiven || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
                {completedSale.paymentDetails.reference && (
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Réf :</span>
                    <span>{completedSale.paymentDetails.reference}</span>
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <div className="text-center pt-2 text-[10px] text-slate-400">
                <p>Merci pour votre confiance !</p>
                <p>À bientôt chez NutriFitness Genève.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCompletedSale(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors mt-2"
            >
              Fermer & Prêt pour la Prochaine Vente
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          SLIDE-OVER / DRAWER: PRODUCT FULL INSPECTOR ("it must show all images,
          titles and long and short description and everything we show on product page")
          ========================================================= */}
      {inspectingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-3xl h-full shadow-2xl border-l border-slate-200 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-900 animate-in slide-in-from-right duration-200">
            
            {/* Top Bar of Drawer */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-heading">
                    {inspectingProduct.brand}
                  </span>
                  {inspectingProduct.shippingOrigin === 'portugal' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[10px]">
                      <span>🇵🇹</span>
                      <span>Usine Portugal (3–5j)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                      <span>🇨🇭</span>
                      <span>Stock Genève (En rayon POS)</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-slate-900 font-heading leading-snug">
                  {inspectingProduct.name[inspectorLang] || inspectingProduct.name.fr}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {inspectingProduct.id}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/produit/${inspectingProduct.slug.fr}/`}
                  target="_blank"
                  className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  title="Voir sur le site public"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setInspectingProduct(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Language Selector for Multilingual View */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600">Langue d'affichage des textes :</span>
              <div className="flex items-center gap-1">
                {(['fr', 'de', 'it', 'en'] as SupportedLocale[]).map(lng => (
                  <button
                    key={lng}
                    type="button"
                    onClick={() => setInspectorLang(lng)}
                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all ${
                      inspectorLang === lng
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {lng}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 1: ALL IMAGES GALLERY */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-heading flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Galerie Photos Complète ({inspectingProduct.images.length} visuels)</span>
                </h3>
              </div>

              {/* Large Featured Image Preview */}
              <div className="relative aspect-video w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-center overflow-hidden">
                <Image
                  src={selectedGalleryImg || inspectingProduct.images[0]?.src || '/images/placeholder.webp'}
                  alt={inspectingProduct.name.fr}
                  fill
                  className="object-contain p-2"
                />
              </div>

              {/* Thumbnails of ALL Images */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {inspectingProduct.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedGalleryImg(img.src)}
                    className={`relative w-16 h-16 rounded-xl bg-slate-50 border overflow-hidden p-1 transition-all ${
                      selectedGalleryImg === img.src
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={`Photo ${i + 1}`}
                      fill
                      className="object-contain"
                    />
                  </button>
                ))}

                {/* Also include any flavor-specific images from variants */}
                {inspectingProduct.variants?.filter(v => v.image).map((v, i) => (
                  <button
                    key={`var-${i}`}
                    type="button"
                    onClick={() => setSelectedGalleryImg(v.image!)}
                    className={`relative w-16 h-16 rounded-xl bg-slate-50 border overflow-hidden p-1 transition-all ${
                      selectedGalleryImg === v.image
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                    title={`Visuel saveur : ${v.flavorName.fr}`}
                  >
                    <Image
                      src={v.image!}
                      alt={v.flavorName.fr}
                      fill
                      className="object-contain"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] text-center truncate">
                      {v.flavorName.fr}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 2: PRICING, VAT & INVENTORY */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Prix Vente</span>
                <p className="text-lg font-black text-slate-900 font-heading">
                  CHF {inspectingProduct.priceChf.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Prix Barré</span>
                <p className="text-lg font-bold text-slate-400 line-through">
                  {inspectingProduct.compareAtPriceChf 
                    ? `CHF ${inspectingProduct.compareAtPriceChf.toFixed(2)}` 
                    : 'Aucun'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Catégorie TVA</span>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {inspectingProduct.taxCategory === 'standard' ? 'Standard 8.1%' : 'Alimentaire 2.6%'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Origine Logistique</span>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {inspectingProduct.shippingOrigin === 'portugal' ? '🇵🇹 Usine Portugal' : '🇨🇭 Genève Stock'}
                </p>
              </div>
            </div>

            {/* SECTION 3: DESCRIPTIONS (SHORT, LONG & AEO) */}
            <div className="space-y-4">
              
              {/* Short Description */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-heading">
                  Description Courte ({inspectorLang.toUpperCase()})
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {inspectingProduct.shortDescription[inspectorLang] || inspectingProduct.shortDescription.fr}
                </p>
              </div>

              {/* Direct Answer AEO */}
              {inspectingProduct.directAnswerAeo && (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider font-heading flex items-center gap-1">
                    <span>⚡</span> Direct Answer AEO / GEO (Google & IA)
                  </span>
                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                    {inspectingProduct.directAnswerAeo[inspectorLang] || inspectingProduct.directAnswerAeo.fr}
                  </p>
                </div>
              )}

              {/* Long Description (Rich HTML preview) */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-heading">
                  Description Détaillée & Scientifique ({inspectorLang.toUpperCase()})
                </span>
                <div 
                  className="prose prose-sm max-w-none text-xs text-slate-700 prose-headings:font-black prose-headings:text-slate-900 prose-ul:list-disc prose-li:my-0.5"
                  dangerouslySetInnerHTML={{
                    __html: inspectingProduct.longDescription[inspectorLang] || inspectingProduct.longDescription.fr
                  }}
                />
              </div>

            </div>

            {/* SECTION 4: VARIANTS, FLAVORS & SKUs */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-heading">
                Options, Saveurs & Codes SKUs ({inspectingProduct.variants?.length || 1} variantes)
              </h3>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Saveur</th>
                      <th className="py-2.5 px-3">Format</th>
                      <th className="py-2.5 px-3">SKU / Code-barres</th>
                      <th className="py-2.5 px-3">Prix CHF</th>
                      <th className="py-2.5 px-3">Stock Dispo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspectingProduct.variants?.map((v, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {v.flavorName[inspectorLang] || v.flavorName.fr}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{v.format}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{v.sku}</td>
                        <td className="py-2 px-3 font-black text-slate-900 font-heading">
                          CHF {(v.priceChf || inspectingProduct.priceChf).toFixed(2)}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            v.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {v.inStock ? `${v.inventoryQuantity} en stock` : 'Rupture'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 5: INGREDIENTS, ALLERGENS & NUTRITION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <span className="font-bold text-slate-900">Ingrédients :</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {inspectingProduct.ingredients[inspectorLang] || inspectingProduct.ingredients.fr}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <span className="font-bold text-slate-900">Conseils d'utilisation & Posologie :</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {inspectingProduct.usageInstructions[inspectorLang] || inspectingProduct.usageInstructions.fr}
                </p>
              </div>
            </div>

            {/* Nutrition Facts Table */}
            {inspectingProduct.nutrition && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-900 font-heading">
                    Tableau des Valeurs Nutritionnelles
                  </span>
                  <span className="text-xs text-slate-500">
                    Portion : {inspectingProduct.nutrition.servingSize}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Énergie</span>
                    <span className="font-black text-slate-900">{inspectingProduct.nutrition.energyKcal} kcal</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Protéines</span>
                    <span className="font-black text-emerald-700">{inspectingProduct.nutrition.proteinG} g</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Glucides</span>
                    <span className="font-black text-slate-900">{inspectingProduct.nutrition.carbsG} g</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Dont sucres</span>
                    <span className="font-black text-slate-900">{inspectingProduct.nutrition.sugarsG} g</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Lipides</span>
                    <span className="font-black text-slate-900">{inspectingProduct.nutrition.fatG} g</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Sel</span>
                    <span className="font-black text-slate-900">{inspectingProduct.nutrition.saltG} g</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick POS action button if in Geneva stock */}
            {inspectingProduct.shippingOrigin !== 'portugal' && (
              <button
                type="button"
                onClick={() => {
                  const defaultVar = inspectingProduct.variants?.[0] || {
                    id: 'def',
                    sku: inspectingProduct.id,
                    flavorName: { fr: 'Standard', de: 'Standard', it: 'Standard', en: 'Standard' },
                    format: '1 unité',
                    priceChf: inspectingProduct.priceChf,
                    inventoryQuantity: 20,
                    inStock: true
                  };
                  addToPosTicket(inspectingProduct, defaultVar);
                  setActiveTab('pos');
                  setInspectingProduct(null);
                }}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4" />
                <span>Ajouter cet article à la Caisse POS</span>
              </button>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
