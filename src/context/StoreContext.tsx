'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalized } from '@/lib/types';
import type { SupportedLocale } from '@/lib/types';
import { TRANSLATIONS, TranslationDictionary, SupportedCurrency } from '@/lib/translations';
import { formatPrice as taxFormatPrice, convertPrice as taxConvertPrice } from '@/lib/tax';
import { isEbookItem } from '@/lib/reviews';
import { isProductDeliverableToCountry, isCountrySupported } from '@/lib/delivery/defaults';
import { trackAddToCart, trackRemoveFromCart, trackMetaAddToCart } from '@/lib/analytics';

export interface CartItem {
  itemKey: string;
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number; // resolved unit price
  priceChf?: number;
  priceEurSwiss?: number;
  priceEurEurope?: number;
  priceEur?: number;
  flavor: string;
  size: string;
  quantity: number;
  vatRate: number;
  isEbook?: boolean;
  isPortugal?: boolean;
  shippingOrigin?: 'switzerland' | 'portugal' | 'common';
  locationType?: 'COMMON' | 'GENEVA_ONLY' | 'PORTUGAL_ONLY';
}

interface ToastInfo {
  id: number;
  title: string;
  message: string;
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  isSearchOpen: boolean;
  quickViewProduct: any | null;
  toasts: ToastInfo[];
  locale: SupportedLocale;
  setLocale: (loc: SupportedLocale) => void;
  currency: SupportedCurrency;
  setCurrency: (curr: SupportedCurrency) => void;
  countryCode: string;
  setCountryCode: (code: string) => void;
  t: TranslationDictionary;
  getProductPricing: (product: any, variant?: any) => {
    price: number;
    compareAt?: number;
    formatted: string;
    formattedCompareAt?: string;
    currency: SupportedCurrency;
  };
  formatPrice: (amountChfOrProduct: any, amountEur?: number) => string;
  convertPrice: (amountChfOrProduct: any, amountEur?: number) => number;
  addToCart: (product: any, options?: { quantity?: number; flavor?: string; size?: string; price?: number; image?: string }) => void;
  removeFromCart: (itemKey: string) => void;
  updateQuantity: (itemKey: string, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: any) => void;
  isWishlisted: (slug: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
  openQuickView: (product: any) => void;
  closeQuickView: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  showToast: (title: string, message: string) => void;
  cartCount: number;
  cartSubtotal: number;
  freeShippingProgress: {
    isFree: boolean;
    remaining: number;
    percentage: number;
    threshold: number;
  };
  hiddenSlugs: Set<string>;
  isProductVisible: (itemOrSlug: any) => boolean;
  isProductDeliverable: (itemOrSlug: any, targetCountry?: string) => boolean;
  refreshHiddenProducts: () => Promise<void>;
  stockMap: Record<string, any>;
  getProductStock: (itemOrSlug: any, variantKey?: string) => { inStock: boolean; total: number; geneva: number; portugal: number } | null;
  refreshStock: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_KEY = 'nutrifitness_next_cart_v1';
const WISHLIST_KEY = 'nutrifitness_next_wishlist_v1';
const LOCALE_KEY = 'nutrifitness_locale_v1';
const CURRENCY_KEY = 'nutrifitness_currency_v1';
const COUNTRY_KEY = 'nutrifitness_country_v1';
const FREE_SHIPPING_THRESHOLD_CHF = 75.0; // CHF

function sanitizeCartItem(raw: any, loc: string = 'fr'): CartItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const name = typeof raw.name === 'object' && raw.name !== null
    ? (raw.name[loc] || raw.name.fr || 'Produit')
    : String(raw.name || 'Produit');
  const flavor = typeof raw.flavor === 'object' && raw.flavor !== null
    ? (raw.flavor[loc] || raw.flavor.fr || 'Standard')
    : String(raw.flavor || 'Standard');
  const size = typeof raw.size === 'object' && raw.size !== null
    ? (raw.size[loc] || raw.size.fr || 'Format standard')
    : String(raw.size || 'Format standard');
  const brand = typeof raw.brand === 'object' && raw.brand !== null
    ? (raw.brand[loc] || raw.brand.fr || 'NutriFitness')
    : String(raw.brand || 'NutriFitness');
  const price = Number.isFinite(Number(raw.price)) && Number(raw.price) > 0 ? Number(raw.price) : 29.90;
  const quantity = Number.isFinite(Number(raw.quantity)) && Number(raw.quantity) > 0 ? Math.floor(Number(raw.quantity)) : 1;
  const id = String(raw.id || raw.slug || 'item');
  const slug = String(raw.slug || raw.id || 'produit');
  const itemKey = String(raw.itemKey || `${id}-${flavor}-${size}`);

  return {
    ...raw,
    itemKey,
    id,
    slug,
    name,
    flavor,
    size,
    brand,
    image: typeof raw.image === 'string' && raw.image ? raw.image : '/images/placeholder.webp',
    price,
    quantity,
    vatRate: Number.isFinite(Number(raw.vatRate)) ? Number(raw.vatRate) : 2.6
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(['creapure-bigman-300g']);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Default primary language: French ('fr')
  const [locale, setLocaleState] = useState<SupportedLocale>('fr');
  // Default primary currency: CHF
  const [currency, setCurrencyState] = useState<SupportedCurrency>('CHF');
  // Default shipping destination country: Switzerland ('CH')
  const [countryCode, setCountryCodeState] = useState<string>('CH');

  // Track hidden/draft/deleted products to exclude them across the website
  const [hiddenSlugs, setHiddenSlugs] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const localDel = localStorage.getItem('nutrifitness_deleted_product_ids');
        if (localDel) {
          const arr = JSON.parse(localDel);
          if (Array.isArray(arr)) {
            const initialSet = new Set<string>();
            for (const item of arr) {
              if (item) {
                const s = String(item).toLowerCase().trim();
                initialSet.add(s);
                const c = s.replace(/^prod-/, '');
                initialSet.add(c);
                initialSet.add(`prod-${c}`);
              }
            }
            return initialSet;
          }
        }
      } catch {}
    }
    return new Set<string>();
  });

  const refreshHiddenProducts = async () => {
    try {
      const res = await fetch('/api/catalog/hidden/', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.hiddenSlugs)) {
          const set = new Set<string>();
          for (const s of data.hiddenSlugs) {
            if (s) {
              const lower = String(s).toLowerCase().trim();
              set.add(lower);
              const clean = lower.replace(/^prod-/, '');
              set.add(clean);
              set.add(`prod-${clean}`);
            }
          }

          // Also merge from localStorage
          try {
            const localDel = localStorage.getItem('nutrifitness_deleted_product_ids');
            if (localDel) {
              const arr = JSON.parse(localDel);
              if (Array.isArray(arr)) {
                for (const item of arr) {
                  if (item) {
                    const lower = String(item).toLowerCase().trim();
                    set.add(lower);
                    const clean = lower.replace(/^prod-/, '');
                    set.add(clean);
                    set.add(`prod-${clean}`);
                  }
                }
              }
            }
          } catch {}

          setHiddenSlugs(set);
          // Purge any deleted product from cart and wishlist immediately
          setCart(prev => prev.filter(item => {
            const slug = (item.slug || '').toLowerCase().trim();
            const id = (item.id || '').toLowerCase().trim();
            const cleanId = id.replace(/^prod-/, '');
            return !set.has(slug) && !set.has(id) && !set.has(cleanId) && !set.has(`prod-${cleanId}`);
          }));
          setWishlist(prev => prev.filter(slug => !set.has(String(slug).toLowerCase().trim())));
        }
      }
    } catch {}
  };

  const [stockMap, setStockMap] = useState<Record<string, any>>({});

  const refreshStock = async () => {
    try {
      let mergedStocks: Record<string, any> = {};
      const res = await fetch('/api/admin/stock/', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.stocks) mergedStocks = data.stocks;
      }
      try {
        const localStock = localStorage.getItem('nutrifitness_stock_overrides');
        if (localStock) {
          const parsed = JSON.parse(localStock);
          mergedStocks = { ...mergedStocks, ...parsed };
        }
      } catch {}
      setStockMap(mergedStocks);
    } catch {}
  };

  const getProductStock = (itemOrSlug: any, variantKey?: string): { inStock: boolean; total: number; geneva: number; portugal: number } | null => {
    if (!itemOrSlug) return null;
    let slug = '';
    let id = '';
    let sku = '';
    if (typeof itemOrSlug === 'string') {
      slug = itemOrSlug.toLowerCase().trim();
      id = slug;
    } else {
      slug = (itemOrSlug.slug?.fr || itemOrSlug.slug || '').toLowerCase().trim();
      id = (itemOrSlug.id || '').toLowerCase().trim();
      sku = (itemOrSlug.sku || itemOrSlug.variants?.[0]?.sku || '').toLowerCase().trim();
    }
    const cleanId = id.replace(/^prod-/, '');
    const entry = stockMap[id] || stockMap[cleanId] || stockMap[`prod-${cleanId}`] || (slug ? stockMap[slug] : null) || (sku ? stockMap[sku] : null);
    if (!entry) return null;

    if (variantKey && entry.variants) {
      const vK = variantKey.toLowerCase().trim();
      const vStock = entry.variants[vK];
      if (vStock) return vStock;
    }

    return entry;
  };

  useEffect(() => {
    refreshHiddenProducts();
    refreshStock();
  }, []);

  const isProductDeliverable = (itemOrSlug: any, targetCountry: string = countryCode): boolean => {
    if (!itemOrSlug) return false;
    if (typeof itemOrSlug === 'object') {
      if (itemOrSlug.isEbook || itemOrSlug.categorySlug === 'guides-ebooks') return true;
      const stockCheck = getProductStock(itemOrSlug);
      const effectiveGen = stockCheck ? stockCheck.geneva : itemOrSlug.stockGeneva;
      const effectivePt = stockCheck ? stockCheck.portugal : itemOrSlug.stockPortugal;
      return isProductDeliverableToCountry(
        targetCountry || 'CH',
        itemOrSlug.locationType,
        itemOrSlug.shippingOrigin,
        effectiveGen,
        effectivePt
      );
    }
    return true;
  };

  const isProductVisible = (itemOrSlug: any): boolean => {
    if (!itemOrSlug) return false;
    let slug = '';
    let id = '';
    let sku = '';
    if (typeof itemOrSlug === 'string') {
      slug = itemOrSlug.toLowerCase().trim();
      id = slug;
    } else {
      slug = (itemOrSlug.slug?.fr || itemOrSlug.slug || '').toLowerCase().trim();
      id = (itemOrSlug.id || '').toLowerCase().trim();
      sku = (itemOrSlug.variants?.[0]?.sku || itemOrSlug.sku || '').toLowerCase().trim();
    }
    const cleanId = id.replace(/^prod-/, '');
    if (slug && hiddenSlugs.has(slug)) return false;
    if (id && (hiddenSlugs.has(id) || hiddenSlugs.has(cleanId) || hiddenSlugs.has(`prod-${cleanId}`))) return false;
    if (sku && hiddenSlugs.has(sku)) return false;
    return true;
  };

  // Load from localStorage & detect country on client mount
  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem(LOCALE_KEY) as SupportedLocale;
      const initialLoc = savedLocale && ['fr', 'de', 'it', 'en'].includes(savedLocale) ? savedLocale : 'fr';

      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.map(it => sanitizeCartItem(it, initialLoc)).filter(Boolean) as CartItem[];
            setCart(cleaned);
          }
        } catch {}
      }

      const savedWishlist = localStorage.getItem(WISHLIST_KEY);
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const hasTransCookie = typeof document !== 'undefined' && document.cookie.includes('googtrans=/fr/');
      if (savedLocale && ['fr', 'de', 'it', 'en'].includes(savedLocale)) {
        if (savedLocale !== 'fr' && !hasTransCookie) {
          setLocaleState('fr');
          localStorage.setItem(LOCALE_KEY, 'fr');
        } else {
          setLocaleState(savedLocale);
        }
      } else {
        setLocaleState('fr');
      }

      // Country initialization & auto-detection
      const savedCountry = localStorage.getItem(COUNTRY_KEY);
      const cookieMatch = typeof document !== 'undefined'
        ? document.cookie.match(/(?:^|;\s*)nf_country=([^;]*)/)
        : null;
      const cookieCountry = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
      const initialCountry = savedCountry || cookieCountry;

      if (initialCountry && /^[A-Z]{2}$/i.test(initialCountry)) {
        const rawUpper = initialCountry.toUpperCase();
        const upper = isCountrySupported(rawUpper) ? rawUpper : 'CH';
        setCountryCodeState(upper);
        const autoCurrency: SupportedCurrency = (upper === 'CH' || upper === 'LI') ? 'CHF' : 'EUR';
        setCurrencyState(autoCurrency);
        try {
          localStorage.setItem(COUNTRY_KEY, upper);
          localStorage.setItem(CURRENCY_KEY, autoCurrency);
          document.cookie = `nf_country=${upper}; path=/; max-age=2592000; SameSite=Lax`;
        } catch (_) {}
      } else {
        // Auto-detect country via IP header
        fetch('/api/fulfillment/availability/?detect=1')
          .then(r => r.json())
          .then(data => {
            if (data?.country && typeof data.country === 'string' && /^[A-Z]{2}$/i.test(data.country)) {
              const rawDetected = data.country.toUpperCase();
              const detected = isCountrySupported(rawDetected) ? rawDetected : 'CH';
              setCountryCodeState(detected);
              const autoCurrency: SupportedCurrency = (detected === 'CH' || detected === 'LI') ? 'CHF' : 'EUR';
              setCurrencyState(autoCurrency);
              try {
                localStorage.setItem(COUNTRY_KEY, detected);
                localStorage.setItem(CURRENCY_KEY, autoCurrency);
                document.cookie = `nf_country=${detected}; path=/; max-age=2592000; SameSite=Lax`;
              } catch (_) {}
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
  }, []);

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCALE_KEY, newLocale);
    } catch (e) {}
  };

  const setCurrency = (newCurrency: SupportedCurrency) => {
    // Automated rule: Switzerland = CHF, Rest of Europe = EUR
    const isSwiss = countryCode === 'CH' || countryCode === 'LI';
    const targetCurrency: SupportedCurrency = isSwiss ? 'CHF' : 'EUR';
    setCurrencyState(targetCurrency);
    try {
      localStorage.setItem(CURRENCY_KEY, targetCurrency);
    } catch (e) {}
  };

  const setCountryCode = (newCode: string) => {
    const upper = (newCode || 'CH').toUpperCase().trim();
    setCountryCodeState(upper);
    const targetCurrency: SupportedCurrency = (upper === 'CH' || upper === 'LI') ? 'CHF' : 'EUR';
    setCurrencyState(targetCurrency);
    try {
      localStorage.setItem(COUNTRY_KEY, upper);
      localStorage.setItem(CURRENCY_KEY, targetCurrency);
      document.cookie = `nf_country=${upper}; path=/; max-age=2592000; SameSite=Lax`;
    } catch (e) {}
  };

  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr;

  const getProductPricing = (product: any, variant?: any) => {
    const isSwiss = countryCode === 'CH' || countryCode === 'LI';
    const rawChf = variant?.priceChf ?? product?.priceChf ?? 29.90;
    const baseChf = Number.isFinite(Number(rawChf)) ? Number(rawChf) : 29.90;

    const rawCompareChf = variant?.compareAtPriceChf ?? product?.compareAtPriceChf;
    const baseCompareChf = rawCompareChf !== undefined && Number.isFinite(Number(rawCompareChf)) ? Number(rawCompareChf) : undefined;

    let currentPrice: number;
    let currentCompareAt: number | undefined;
    let activeCurrency: SupportedCurrency;

    if (isSwiss) {
      // For Swiss visitors: ALWAYS CHF whether the product is from Portugal or Switzerland
      currentPrice = baseChf;
      currentCompareAt = baseCompareChf;
      activeCurrency = 'CHF';
    } else {
      // Outside Switzerland -> Whole Europe price in EUR
      const rawEur = variant?.priceEurEurope ?? product?.priceEurEurope ?? variant?.priceEur ?? product?.priceEur;
      currentPrice = (rawEur !== undefined && Number.isFinite(Number(rawEur))) ? Number(rawEur) : Math.round(baseChf * 0.95 * 100) / 100;

      const rawCompareEur = variant?.compareAtPriceEurEurope ?? product?.compareAtPriceEurEurope ?? variant?.compareAtPriceEur ?? product?.compareAtPriceEur;
      currentCompareAt = (rawCompareEur !== undefined && Number.isFinite(Number(rawCompareEur))) ? Number(rawCompareEur) : undefined;
      activeCurrency = 'EUR';
    }

    const safePrice = Number.isFinite(currentPrice) && currentPrice >= 0 ? currentPrice : 29.90;
    const formatted = activeCurrency === 'EUR' ? `€ ${safePrice.toFixed(2)}` : `CHF ${safePrice.toFixed(2)}`;
    const formattedCompareAt = currentCompareAt !== undefined && Number.isFinite(currentCompareAt)
      ? (activeCurrency === 'EUR' ? `€ ${currentCompareAt.toFixed(2)}` : `CHF ${currentCompareAt.toFixed(2)}`)
      : undefined;

    return {
      price: safePrice,
      compareAt: currentCompareAt,
      formatted,
      formattedCompareAt,
      currency: activeCurrency
    };
  };

  const formatPrice = (amountChfOrProduct: any, amountEur?: number) => {
    if (amountChfOrProduct && typeof amountChfOrProduct === 'object') {
      return getProductPricing(amountChfOrProduct).formatted;
    }
    const isSwiss = countryCode === 'CH' || countryCode === 'LI';
    const rawVal = Number(amountChfOrProduct);
    const num = Number.isFinite(rawVal) ? Math.max(0, rawVal) : 0;
    if (isSwiss) {
      return `CHF ${num.toFixed(2)}`;
    } else {
      if (typeof amountEur === 'number' && Number.isFinite(amountEur) && amountEur > 0) {
        return `€ ${amountEur.toFixed(2)}`;
      }
      const eurVal = Math.round(num * 0.95 * 100) / 100;
      return `€ ${eurVal.toFixed(2)}`;
    }
  };

  const convertPrice = (amountChfOrProduct: any, amountEur?: number) => {
    if (amountChfOrProduct && typeof amountChfOrProduct === 'object') {
      return getProductPricing(amountChfOrProduct).price;
    }
    const isSwiss = countryCode === 'CH' || countryCode === 'LI';
    const rawVal = Number(amountChfOrProduct);
    const num = Number.isFinite(rawVal) ? Math.max(0, rawVal) : 0;
    if (isSwiss) {
      return num;
    } else {
      if (typeof amountEur === 'number' && Number.isFinite(amountEur) && amountEur > 0) {
        return amountEur;
      }
      return Math.round(num * 0.95 * 100) / 100;
    }
  };

  const showToast = (title: string, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const addToCart = (product: any, options: { quantity?: number; flavor?: string; size?: string; price?: number; image?: string } = {}) => {
    const isEbook = isEbookItem(product);
    const quantity = isEbook ? 1 : (options.quantity || 1);
    // Resolve flavor intelligently if product has variants
    let resolvedFlavor = options.flavor || product.flavor;
    if ((!resolvedFlavor || resolvedFlavor === 'Standard') && Array.isArray(product.variants) && product.variants.length > 0) {
      const hasActualStandard = product.variants.some((v: any) => {
        const fn = typeof v.flavorName === 'object' && v.flavorName !== null
          ? (v.flavorName[locale] || v.flavorName.fr || v.flavorName.en)
          : v.flavorName;
        return fn === 'Standard' || fn === 'standard';
      });
      if (!hasActualStandard) {
        const candidate = product.variants.find((v: any) => v.inStock && (v.stockGeneva > 0 || v.stockPortugal > 0)) || product.variants[0];
        if (candidate?.flavorName) {
          const fn = typeof candidate.flavorName === 'object' && candidate.flavorName !== null
            ? (candidate.flavorName[locale] || candidate.flavorName.fr || candidate.flavorName.en)
            : candidate.flavorName;
          if (fn) resolvedFlavor = fn;
        }
      }
    }

    const rawFlavor = resolvedFlavor || 'Standard';
    const flavor = typeof rawFlavor === 'object' && rawFlavor !== null
      ? (rawFlavor[locale] || rawFlavor.fr || rawFlavor.en || 'Standard')
      : String(rawFlavor || 'Standard');

    const rawSize = options.size || product.size || (isEbook ? 'Format PDF' : 'Format standard');
    const size = typeof rawSize === 'object' && rawSize !== null
      ? (rawSize[locale] || rawSize.fr || rawSize.en || 'Format standard')
      : String(rawSize || 'Format standard');

    const resolvedPriceInfo = getProductPricing(product);
    const price = Number(options.price !== undefined ? options.price : resolvedPriceInfo.price);
    
    // Resolve specific flavor image if variant has packshot
    let image = options.image || product.image;
    if (!image && product.variants && flavor) {
      const matchedVariant = product.variants.find((v: any) => {
        const vFlav = typeof v.flavorName === 'object' && v.flavorName !== null
          ? (v.flavorName[locale] || v.flavorName.fr || v.flavorName.en)
          : v.flavorName;
        return vFlav === flavor;
      });
      if (matchedVariant?.image) {
        image = matchedVariant.image;
      }
    }
    if (!image) {
      image = (product.images && product.images[0] ? product.images[0].src : '/images/placeholder.webp');
    }
    const rawSlug = getLocalized(product.slug, locale) || product.id || 'produit';
    const slug = typeof rawSlug === 'object' && rawSlug !== null ? (rawSlug[locale] || rawSlug.fr || 'produit') : String(rawSlug || 'produit');

    const rawName = getLocalized(product.name, locale) || product.name || 'Produit';
    const name = typeof rawName === 'object' && rawName !== null ? (rawName[locale] || rawName.fr || 'Produit') : String(rawName || 'Produit');

    const rawBrand = product.brand || 'NutriFitness';
    const brand = typeof rawBrand === 'object' && rawBrand !== null ? (rawBrand[locale] || rawBrand.fr || 'NutriFitness') : String(rawBrand || 'NutriFitness');

    const itemKey = `${product.id || slug}-${flavor}-${size}`;
    const isCommon = product.locationType === 'COMMON' || product.shippingOrigin === 'common';
    const isPortugal = Boolean(product.shippingOrigin === 'portugal' || (options as any).isPortugal || (product.locationType === 'PORTUGAL_ONLY' && !isCommon));
    const shippingOrigin = product.shippingOrigin || (isCommon ? 'common' : isPortugal ? 'portugal' : 'switzerland');
    const locationType = product.locationType || (isCommon ? 'COMMON' : isPortugal ? 'PORTUGAL_ONLY' : 'GENEVA_ONLY');

    const stockCheck = !isEbook ? getProductStock(product, flavor) : null;
    const effectiveStockGeneva = stockCheck ? stockCheck.geneva : product.stockGeneva;
    const effectiveStockPortugal = stockCheck ? stockCheck.portugal : product.stockPortugal;

    // Hard stock check: block out of stock items
    if (!isEbook && stockCheck && stockCheck.total <= 0) {
      showToast(
        'Rupture de stock',
        `Cet article (${name}${flavor && flavor !== 'Standard' ? ` - ${flavor}` : ''}) est actuellement en rupture de stock.`
      );
      return;
    }

    // Hard deliverability check: block non-deliverable items for selected country
    if (!isEbook && !isProductDeliverableToCountry(countryCode || 'CH', locationType, shippingOrigin, effectiveStockGeneva, effectiveStockPortugal)) {
      showToast(
        'Non livrable dans votre pays',
        `Cet article (${name}) n'est pas disponible pour la livraison en ${countryCode}.`
      );
      return;
    }

    let blockedDuplicateEbook = false;

    setCart(prev => {
      if (isEbook) {
        const alreadyHasEbook = prev.some(item => item.isEbook || isEbookItem(item));
        if (alreadyHasEbook) {
          blockedDuplicateEbook = true;
          return prev;
        }
      }

      const index = prev.findIndex(item => item.itemKey === itemKey);
      if (index > -1) {
        if (isEbook) {
          blockedDuplicateEbook = true;
          return prev;
        }
        const next = [...prev];
        next[index] = { ...next[index], quantity: next[index].quantity + quantity };
        return next;
      } else {
        return [
          ...prev,
          {
            itemKey,
            id: product.id || slug,
            slug,
            name,
            brand,
            image,
            price,
            priceChf: product.priceChf,
            priceEurSwiss: product.priceEurSwiss,
            priceEurEurope: product.priceEurEurope,
            priceEur: product.priceEurEurope || product.priceEur,
            flavor,
            size,
            quantity,
            vatRate: product.vatRate || 2.6,
            isEbook,
            isPortugal,
            shippingOrigin,
            locationType
          }
        ];
      }
    });

    if (blockedDuplicateEbook) {
      showToast(
        'Exemplaire unique',
        'Le guide numérique est déjà dans votre panier (limité à 1 exemplaire par commande).'
      );
      setIsCartOpen(true);
      return;
    }

    const matchedVariant = product.variants?.find((v: any) => 
      (v.flavorName && (v.flavorName.fr === flavor || v.flavorName === flavor))
    );
    const sku = matchedVariant?.sku || product.variants?.[0]?.sku || product.id || slug;
    const activeCurr = currency || 'CHF';
    const itemData = {
      item_id: sku,
      item_name: name,
      item_brand: brand,
      item_category: product.categorySlug || 'Nutrition Sportive',
      price,
    };
    trackAddToCart(itemData, activeCurr, quantity);
    trackMetaAddToCart({ item: itemData, currency: activeCurr, quantity });

    showToast(
      locale === 'de' ? 'Warenkorb aktualisiert' : locale === 'it' ? 'Carrello aggiornato' : locale === 'en' ? 'Cart updated' : 'Panier mis à jour',
      `${name} (${quantity}x)`
    );
    setIsCartOpen(true);
  };

  const removeFromCart = (itemKey: string) => {
    const target = cart.find(item => item.itemKey === itemKey || item.id === itemKey);
    if (target) {
      trackRemoveFromCart(
        {
          item_id: (target as any).sku || target.id || target.itemKey || target.slug,
          item_name: target.name,
          item_brand: (target as any).brand || 'NutriFitness',
          price: target.price,
          quantity: target.quantity || 1,
        },
        currency || 'CHF',
        target.quantity || 1
      );
    }
    setCart(prev => prev.filter(item => item.itemKey !== itemKey && item.id !== itemKey));
    showToast(
      locale === 'de' ? 'Warenkorb aktualisiert' : locale === 'it' ? 'Carrello aggiornato' : locale === 'en' ? 'Cart updated' : 'Panier mis à jour',
      locale === 'de' ? 'Artikel entfernt' : locale === 'it' ? 'Articolo rimosso' : locale === 'en' ? 'Item removed' : 'Article retiré du panier'
    );
  };

  const updateQuantity = (itemKey: string, delta: number) => {
    if (!itemKey) return;
    const numDelta = Number(delta) || 0;
    if (numDelta === 0) return;

    setCart(prev => {
      const target = prev.find(item => item && (item.itemKey === itemKey || item.id === itemKey));
      if (target && (target.isEbook || isEbookItem(target))) {
        if (numDelta > 0) {
          showToast('Exemplaire unique', 'Le guide numérique est limité à 1 exemplaire par commande.');
          return prev;
        }
        if (numDelta < 0) {
          return prev.filter(item => item && item.itemKey !== itemKey && item.id !== itemKey);
        }
      }

      return prev
        .map(item => {
          if (!item) return null;
          if (item.itemKey === itemKey || item.id === itemKey) {
            const currentQty = Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0
              ? Math.floor(Number(item.quantity))
              : 1;
            const nextQty = currentQty + numDelta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((it): it is CartItem => it !== null && it !== undefined);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product: any) => {
    const slug = typeof product === 'string' ? product : (getLocalized(product.slug, locale) || product.id || String(product));
    const name = typeof product === 'string' ? product : (getLocalized(product.name, locale) || slug);

    setWishlist(prev => {
      const exists = prev.includes(slug);
      if (exists) {
        showToast('Favoris', `${name} retiré`);
        return prev.filter(s => s !== slug);
      } else {
        showToast('Favoris', `${name} ❤️`);
        return [...prev, slug];
      }
    });
  };

  const isWishlisted = (slug: string) => wishlist.includes(slug);

  const cartCount = cart.reduce((sum, item) => {
    const qty = Number.isFinite(Number(item?.quantity)) ? Math.max(1, Math.floor(Number(item.quantity))) : 1;
    return sum + qty;
  }, 0);

  const cartSubtotal = cart.reduce((sum, item) => {
    if (!item) return sum;
    const rawPrice = (item.priceChf !== undefined || item.priceEurEurope !== undefined)
      ? getProductPricing(item).price
      : item.price;
    const numPrice = Number.isFinite(Number(rawPrice)) ? Number(rawPrice) : 29.90;
    const qty = Number.isFinite(Number(item.quantity)) ? Math.max(1, Math.floor(Number(item.quantity))) : 1;
    return sum + (numPrice * qty);
  }, 0);

  const freeShippingProgress = {
    isFree: cartSubtotal >= FREE_SHIPPING_THRESHOLD_CHF,
    remaining: Math.max(0, FREE_SHIPPING_THRESHOLD_CHF - cartSubtotal),
    percentage: Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD_CHF) * 100)),
    threshold: FREE_SHIPPING_THRESHOLD_CHF
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        isSearchOpen,
        quickViewProduct,
        toasts,
        locale,
        setLocale,
        currency,
        setCurrency,
        countryCode,
        setCountryCode,
        t,
        getProductPricing,
        formatPrice,
        convertPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isWishlisted,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        openQuickView: (p) => setQuickViewProduct(p),
        closeQuickView: () => setQuickViewProduct(null),
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
        showToast,
        cartCount,
        cartSubtotal,
        freeShippingProgress,
        hiddenSlugs,
        isProductVisible,
        isProductDeliverable,
        refreshHiddenProducts,
        stockMap,
        getProductStock,
        refreshStock
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
