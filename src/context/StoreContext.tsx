'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalized } from '@/lib/types';
import type { SupportedLocale } from '@/lib/types';
import { TRANSLATIONS, TranslationDictionary, SupportedCurrency } from '@/lib/translations';
import { formatPrice as taxFormatPrice, convertPrice as taxConvertPrice } from '@/lib/tax';
import { isEbookItem } from '@/lib/reviews';

export interface CartItem {
  itemKey: string;
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number; // in CHF
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
  t: TranslationDictionary;
  formatPrice: (amountChf: number) => string;
  convertPrice: (amountChf: number) => number;
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_KEY = 'nutrifitness_next_cart_v1';
const WISHLIST_KEY = 'nutrifitness_next_wishlist_v1';
const LOCALE_KEY = 'nutrifitness_locale_v1';
const CURRENCY_KEY = 'nutrifitness_currency_v1';
const FREE_SHIPPING_THRESHOLD_CHF = 75.0; // CHF

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([
    {
      itemKey: 'ultimate-whey-bigman-2kg-Chocolat Suisse-2 kg',
      id: 'ultimate-whey-bigman-2kg',
      slug: 'ultimate-whey-bigman-2kg',
      name: 'Ultimate Whey Protein (2 kg)',
      brand: 'BigMan Nutrition',
      image: '/images/fitrush/imgi_48_banner-h9-1.webp',
      price: 64.90,
      flavor: 'Chocolat Suisse',
      size: '2 kg',
      quantity: 1,
      vatRate: 2.6
    }
  ]);
  const [wishlist, setWishlist] = useState<string[]>(['creapure-bigman-300g']);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Default primary language: French ('fr')
  const [locale, setLocaleState] = useState<SupportedLocale>('fr');
  // Default primary currency: CHF
  const [currency, setCurrencyState] = useState<SupportedCurrency>('CHF');

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem(WISHLIST_KEY);
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedLocale = localStorage.getItem(LOCALE_KEY) as SupportedLocale;
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

      const savedCurrency = localStorage.getItem(CURRENCY_KEY) as SupportedCurrency;
      if (savedCurrency && ['CHF', 'EUR'].includes(savedCurrency)) {
        setCurrencyState(savedCurrency);
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
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem(CURRENCY_KEY, newCurrency);
    } catch (e) {}
  };

  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr;

  const formatPrice = (amountChf: number) => taxFormatPrice(amountChf, currency);
  const convertPrice = (amountChf: number) => taxConvertPrice(amountChf, currency);

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
    const flavor = options.flavor || product.flavor || 'Standard';
    const size = options.size || product.size || (isEbook ? 'Format PDF' : 'Format standard');
    const price = Number(options.price !== undefined ? options.price : (product.priceChf || product.price || 49.9));
    
    // Resolve specific flavor image if variant has packshot
    let image = options.image || product.image;
    if (!image && product.variants && flavor) {
      const matchedVariant = product.variants.find((v: any) => 
        (v.flavorName && (v.flavorName.fr === flavor || v.flavorName === flavor))
      );
      if (matchedVariant?.image) {
        image = matchedVariant.image;
      }
    }
    if (!image) {
      image = (product.images && product.images[0] ? product.images[0].src : '/images/placeholder.webp');
    }
    const slug = getLocalized(product.slug, locale) || product.id || 'produit';
    const name = getLocalized(product.name, locale) || 'Produit';
    const brand = product.brand || 'NutriFitness';
    const itemKey = `${product.id || slug}-${flavor}-${size}`;
    const isCommon = product.locationType === 'COMMON' || product.shippingOrigin === 'common';
    const isPortugal = Boolean(product.shippingOrigin === 'portugal' || (options as any).isPortugal || (product.locationType === 'PORTUGAL_ONLY' && !isCommon));
    const shippingOrigin = product.shippingOrigin || (isCommon ? 'common' : isPortugal ? 'portugal' : 'switzerland');
    const locationType = product.locationType || (isCommon ? 'COMMON' : isPortugal ? 'PORTUGAL_ONLY' : 'GENEVA_ONLY');

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

    showToast(
      locale === 'de' ? 'Warenkorb aktualisiert' : locale === 'it' ? 'Carrello aggiornato' : locale === 'en' ? 'Cart updated' : 'Panier mis à jour',
      `${name} (${quantity}x)`
    );
    setIsCartOpen(true);
  };

  const removeFromCart = (itemKey: string) => {
    setCart(prev => prev.filter(item => item.itemKey !== itemKey && item.id !== itemKey));
    showToast(
      locale === 'de' ? 'Warenkorb aktualisiert' : locale === 'it' ? 'Carrello aggiornato' : locale === 'en' ? 'Cart updated' : 'Panier mis à jour',
      locale === 'de' ? 'Artikel entfernt' : locale === 'it' ? 'Articolo rimosso' : locale === 'en' ? 'Item removed' : 'Article retiré du panier'
    );
  };

  const updateQuantity = (itemKey: string, delta: number) => {
    setCart(prev => {
      const target = prev.find(item => item.itemKey === itemKey || item.id === itemKey);
      if (target && (target.isEbook || isEbookItem(target))) {
        if (delta > 0) {
          showToast('Exemplaire unique', 'Le guide numérique est limité à 1 exemplaire par commande.');
          return prev;
        }
        if (delta < 0) {
          return prev.filter(item => item.itemKey !== itemKey && item.id !== itemKey);
        }
      }

      return prev
        .map(item => {
          if (item.itemKey === itemKey || item.id === itemKey) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
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

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
        t,
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
        freeShippingProgress
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
