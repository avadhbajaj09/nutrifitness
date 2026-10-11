/**
 * GA4 & Consent Mode v2 helper for NutriFitness.ch
 * Strictly complies with Swiss nDSG and EU GDPR:
 * - Default all storage to denied
 * - Store choices in 12-month first-party cookie 'nf_consent'
 * - Only fire GA4 tracking events when user has consented to analytics
 */

export interface ConsentPreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

export const CONSENT_COOKIE_NAME = 'nf_consent';
export const CONSENT_COOKIE_DAYS = 365;

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Read current consent from cookie
 */
export function getConsent(): ConsentPreferences | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )nf_consent=([^;]*)/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as ConsentPreferences;
    }
  } catch {
    // Malformed cookie
  }
  return null;
}

/**
 * Check if visitor has accepted analytics cookies
 */
export function hasAnalyticsConsent(): boolean {
  const consent = getConsent();
  return Boolean(consent?.analytics);
}

/**
 * Set visitor consent choices, update cookie and Google Consent Mode v2
 */
export function saveConsent(choices: { analytics: boolean; marketing: boolean }): void {
  if (typeof document === 'undefined') return;

  const prefs: ConsentPreferences = {
    necessary: true,
    analytics: choices.analytics,
    marketing: choices.marketing,
    updatedAt: new Date().toISOString(),
  };

  const maxAge = CONSENT_COOKIE_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(prefs))}; path=/; max-age=${maxAge}; SameSite=Lax`;

  // Update Google Consent Mode v2
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: choices.analytics ? 'granted' : 'denied',
      ad_storage: choices.marketing ? 'granted' : 'denied',
      ad_user_data: choices.marketing ? 'granted' : 'denied',
      ad_personalization: choices.marketing ? 'granted' : 'denied',
    });
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nf_consent_updated', { detail: prefs }));
  }
}

// -------------------------------------------------------------
// GA4 Ecommerce Event Helpers
// -------------------------------------------------------------

export interface EcommerceItem {
  item_id: string; // SKU or product ID
  item_name: string;
  item_brand?: string;
  item_category?: string;
  price: number;
  quantity?: number;
}

export function trackViewItem(item: EcommerceItem, currency: string) {
  if (!hasAnalyticsConsent()) return;
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'view_item', {
      currency,
      value: item.price,
      items: [
        {
          item_id: item.item_id,
          item_name: item.item_name,
          item_brand: item.item_brand || 'NutriFitness',
          item_category: item.item_category || 'Nutrition Sportive',
          price: item.price,
          quantity: item.quantity || 1,
        },
      ],
    });
  }
}

export function trackAddToCart(item: EcommerceItem, currency: string, quantity = 1) {
  if (!hasAnalyticsConsent()) return;
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'add_to_cart', {
      currency,
      value: item.price * quantity,
      items: [
        {
          item_id: item.item_id,
          item_name: item.item_name,
          item_brand: item.item_brand || 'NutriFitness',
          item_category: item.item_category || 'Nutrition Sportive',
          price: item.price,
          quantity,
        },
      ],
    });
  }
}

export function trackBeginCheckout(items: EcommerceItem[], totalValue: number, currency: string) {
  if (!hasAnalyticsConsent()) return;
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      currency,
      value: totalValue,
      items: items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_brand: item.item_brand || 'NutriFitness',
        item_category: item.item_category || 'Nutrition Sportive',
        price: item.price,
        quantity: item.quantity || 1,
      })),
    });
  }
}

export function trackPurchase(params: {
  transaction_id: string;
  value: number;
  shipping: number;
  tax: number;
  currency: string;
  items: EcommerceItem[];
}) {
  if (!hasAnalyticsConsent()) return;
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: params.transaction_id,
      value: params.value,
      shipping: params.shipping,
      tax: params.tax,
      currency: params.currency,
      items: params.items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_brand: item.item_brand || 'NutriFitness',
        item_category: item.item_category || 'Nutrition Sportive',
        price: item.price,
        quantity: item.quantity || 1,
      })),
    });
  }
}
