/**
 * GA4, Meta & Consent Mode v2 helper for NutriFitness.ch
 * Strictly complies with Swiss nDSG and EU GDPR:
 * - Default all storage to denied
 * - Store choices in 12-month first-party cookie 'nf_consent'
 * - Only fire GA4 tracking events when user has consented to analytics
 * - Only fire Meta & Ads marketing events when user has consented to marketing
 * - Pushes all events to window.dataLayer for Google Tag Manager (GTM)
 * - Includes dev-only debug logger for all dataLayer events
 */

export interface ConsentPreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

export const CONSENT_COOKIE_NAME = 'nf_consent';
export const CONSENT_COOKIE_DAYS = 365;

export interface EcommerceItem {
  item_id: string; // SKU or product ID
  item_name: string;
  item_brand?: string;
  item_category?: string;
  price: number;
  quantity?: number;
}

export type MetaStandardEvent =
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase';

export interface MetaEventPayload {
  eventName: MetaStandardEvent;
  eventId: string;
  currency: string;
  value: number;
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
  contents?: { id: string; quantity: number; item_price: number }[];
  numItems?: number;
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

// -------------------------------------------------------------
// Dev-only Debug Logger
// -------------------------------------------------------------

function logDataLayerDebug(payload: Record<string, unknown>): void {
  const isDev = process.env.NODE_ENV !== 'production';
  const hasDebugQuery =
    typeof window !== 'undefined' &&
    (window.location.search.includes('gtm_debug') || window.location.search.includes('debug_dl=1'));

  if (isDev || hasDebugQuery) {
    const eventName = (payload.event as string) || 'dataLayer_push';
    console.groupCollapsed(
      `%c[dataLayer] %c${eventName}`,
      'background: #141414; color: #95d600; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #ffffff; font-weight: bold;'
    );
    console.log('Payload:', payload);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
}

/**
 * Universal safe dataLayer pusher (auto-syncs to window.gtag for direct GA4 feed)
 */
export function pushDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  logDataLayerDebug(payload);
  window.dataLayer.push(payload);

  try {
    if (typeof window.gtag === 'function' && payload.event && typeof payload.event === 'string' && payload.event !== 'dataLayer_push') {
      const eventName = payload.event;
      if (payload.ecommerce && typeof payload.ecommerce === 'object') {
        window.gtag('event', eventName, payload.ecommerce as Record<string, any>);
      } else {
        const { event, ...rest } = payload;
        window.gtag('event', eventName, rest);
      }
    }
  } catch {
    // ignore
  }
}

/**
 * 0. Search term tracking (GA4 search event)
 */
export function trackSearch(searchTerm: string): void {
  if (!searchTerm || !searchTerm.trim()) return;
  pushDataLayer({
    event: 'search',
    search_term: searchTerm.trim(),
  });
}

/**
 * Generate a shared event_id for browser and server deduplication (e.g. Meta Pixel + Conversions API)
 */
export function generateEventId(prefix = 'evt'): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return `${prefix}_${window.crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// -------------------------------------------------------------
// Consent Mode v2 Helpers
// -------------------------------------------------------------

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

export function hasAnalyticsConsent(): boolean {
  const consent = getConsent();
  return Boolean(consent?.analytics);
}

export function hasMarketingConsent(): boolean {
  const consent = getConsent();
  return Boolean(consent?.marketing);
}

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

  // Push consent update to GTM dataLayer
  pushDataLayer({
    event: 'consent_update',
    consent: {
      analytics_storage: choices.analytics ? 'granted' : 'denied',
      ad_storage: choices.marketing ? 'granted' : 'denied',
      ad_user_data: choices.marketing ? 'granted' : 'denied',
      ad_personalization: choices.marketing ? 'granted' : 'denied',
    },
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nf_consent_updated', { detail: prefs }));
  }
}

// -------------------------------------------------------------
// GA4 Ecommerce Event Helpers (window.dataLayer)
// -------------------------------------------------------------

function sanitizeItem(item: EcommerceItem): Record<string, unknown> {
  return {
    item_id: item.item_id,
    item_name: item.item_name,
    item_brand: item.item_brand || 'NutriFitness',
    item_category: item.item_category || 'Nutrition Sportive',
    price: Number(item.price) || 0,
    quantity: item.quantity !== undefined ? Number(item.quantity) : 1,
  };
}

/**
 * 1. view_item_list (Catalog / Category / Search views)
 */
export function trackViewItemList(params: {
  items: EcommerceItem[];
  item_list_id?: string;
  item_list_name?: string;
  currency?: string;
}): void {
  if (!hasAnalyticsConsent()) return;
  const currency = params.currency || 'CHF';
  const value = params.items.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0);

  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: 'view_item_list',
    ecommerce: {
      item_list_id: params.item_list_id,
      item_list_name: params.item_list_name,
      currency,
      value: Math.round(value * 100) / 100,
      items: params.items.map(sanitizeItem),
    },
  });
}

/**
 * 2. view_item (Product detail page view)
 */
export function trackViewItem(item: EcommerceItem, currency: string): void {
  if (!hasAnalyticsConsent()) return;

  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: 'view_item',
    ecommerce: {
      currency,
      value: Number(item.price) || 0,
      items: [sanitizeItem(item)],
    },
  });
}

/**
 * 3. add_to_cart
 */
export function trackAddToCart(item: EcommerceItem, currency: string, quantity = 1): void {
  if (!hasAnalyticsConsent()) return;
  const itemWithQty = { ...item, quantity };

  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: 'add_to_cart',
    ecommerce: {
      currency,
      value: Math.round(item.price * quantity * 100) / 100,
      items: [sanitizeItem(itemWithQty)],
    },
  });
}

/**
 * 4. remove_from_cart
 */
export function trackRemoveFromCart(item: EcommerceItem, currency: string, quantity = 1): void {
  if (!hasAnalyticsConsent()) return;
  const itemWithQty = { ...item, quantity };

  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: 'remove_from_cart',
    ecommerce: {
      currency,
      value: Math.round(item.price * quantity * 100) / 100,
      items: [sanitizeItem(itemWithQty)],
    },
  });
}

/**
 * 5. begin_checkout
 */
export function trackBeginCheckout(items: EcommerceItem[], totalValue: number, currency: string): void {
  if (!hasAnalyticsConsent()) return;

  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: 'begin_checkout',
    ecommerce: {
      currency,
      value: Math.round(totalValue * 100) / 100,
      items: items.map(sanitizeItem),
    },
  });
}

/**
 * 6. add_payment_info
 */
export function trackAddPaymentInfo(params: {
  items: EcommerceItem[];
  totalValue: number;
  currency: string;
  paymentType?: string;
}): void {
  if (!hasAnalyticsConsent()) return;

  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: 'add_payment_info',
    ecommerce: {
      currency: params.currency,
      value: Math.round(params.totalValue * 100) / 100,
      payment_type: params.paymentType,
      items: params.items.map(sanitizeItem),
    },
  });
}

/**
 * 7. purchase
 */
export function trackPurchase(params: {
  transaction_id: string;
  value: number;
  shipping: number;
  tax: number;
  currency: string;
  items: EcommerceItem[];
  coupon?: string;
}): void {
  if (!hasAnalyticsConsent()) return;

  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: 'purchase',
    ecommerce: {
      transaction_id: params.transaction_id,
      value: Math.round(params.value * 100) / 100,
      shipping: Math.round(params.shipping * 100) / 100,
      tax: Math.round(params.tax * 100) / 100,
      currency: params.currency,
      coupon: params.coupon,
      items: params.items.map(sanitizeItem),
    },
  });
}

// -------------------------------------------------------------
// Meta Pixel & Conversions API (Browser dataLayer Helpers)
// Only fire when marketing consent is granted!
// -------------------------------------------------------------

/**
 * Generic Meta event pusher with shared event_id for CAPI deduplication
 */
export function trackMetaEvent(payload: MetaEventPayload): void {
  if (!hasMarketingConsent()) return;

  pushDataLayer({
    event: `meta_${payload.eventName}`,
    meta_event_name: payload.eventName,
    event_id: payload.eventId,
    ecommerce_event_id: payload.eventId,
    meta_data: {
      currency: payload.currency,
      value: payload.value,
      content_name: payload.contentName,
      content_category: payload.contentCategory,
      content_ids: payload.contentIds,
      content_type: 'product',
      contents: payload.contents,
      num_items: payload.numItems,
    },
  });
}

export function trackMetaViewContent(params: {
  item: EcommerceItem;
  currency: string;
  eventId?: string;
}): string {
  const eventId = params.eventId || generateEventId('vc');
  if (!hasMarketingConsent()) return eventId;

  trackMetaEvent({
    eventName: 'ViewContent',
    eventId,
    currency: params.currency,
    value: params.item.price,
    contentName: params.item.item_name,
    contentCategory: params.item.item_category,
    contentIds: [params.item.item_id],
    contents: [{ id: params.item.item_id, quantity: 1, item_price: params.item.price }],
    numItems: 1,
  });

  return eventId;
}

export function trackMetaAddToCart(params: {
  item: EcommerceItem;
  currency: string;
  quantity?: number;
  eventId?: string;
}): string {
  const eventId = params.eventId || generateEventId('atc');
  if (!hasMarketingConsent()) return eventId;
  const qty = params.quantity || 1;

  trackMetaEvent({
    eventName: 'AddToCart',
    eventId,
    currency: params.currency,
    value: Math.round(params.item.price * qty * 100) / 100,
    contentName: params.item.item_name,
    contentCategory: params.item.item_category,
    contentIds: [params.item.item_id],
    contents: [{ id: params.item.item_id, quantity: qty, item_price: params.item.price }],
    numItems: qty,
  });

  return eventId;
}

export function trackMetaInitiateCheckout(params: {
  items: EcommerceItem[];
  totalValue: number;
  currency: string;
  eventId?: string;
}): string {
  const eventId = params.eventId || generateEventId('ic');
  if (!hasMarketingConsent()) return eventId;

  trackMetaEvent({
    eventName: 'InitiateCheckout',
    eventId,
    currency: params.currency,
    value: Math.round(params.totalValue * 100) / 100,
    contentIds: params.items.map(i => i.item_id),
    contents: params.items.map(i => ({
      id: i.item_id,
      quantity: i.quantity || 1,
      item_price: i.price,
    })),
    numItems: params.items.reduce((acc, i) => acc + (i.quantity || 1), 0),
  });

  return eventId;
}

export function trackMetaPurchase(params: {
  transaction_id: string;
  value: number;
  currency: string;
  items: EcommerceItem[];
  eventId?: string;
}): string {
  const eventId = params.eventId || params.transaction_id;
  if (!hasMarketingConsent()) return eventId;

  trackMetaEvent({
    eventName: 'Purchase',
    eventId,
    currency: params.currency,
    value: Math.round(params.value * 100) / 100,
    contentIds: params.items.map(i => i.item_id),
    contents: params.items.map(i => ({
      id: i.item_id,
      quantity: i.quantity || 1,
      item_price: i.price,
    })),
    numItems: params.items.reduce((acc, i) => acc + (i.quantity || 1), 0),
  });

  return eventId;
}
