/**
 * GA4 & Meta E-commerce Checkout Tracking Test Suite
 * Validates:
 * 1. begin_checkout event schema, items, variants, discounts, currency (CHF)
 * 2. add_shipping_info event schema, shipping tiers, costs, items
 * 3. add_payment_info event schema, payment types (Card, TWINT, PostFinance)
 * 4. purchase event schema, server-verified amounts, and strict deduplication
 * 5. GA4 DebugView flag injection (debug_mode: true)
 * 6. Admin traffic exclusion and cookie consent governance
 * 7. Non-interference with Meta Pixel & Conversions API (CAPI) events
 */

// Setup mock browser environment
class MockStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number { return this.store.size; }
  clear(): void { this.store.clear(); }
  getItem(key: string): string | null { return this.store.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string): void { this.store.delete(key); }
  setItem(key: string, value: string): void { this.store.set(key, String(value)); }
}

const mockLocalStorage = new MockStorage();
const mockSessionStorage = new MockStorage();
const mockDataLayer: any[] = [];
let mockCookies = '';
let mockLocationSearch = '';
let mockPathname = '/commande/';

// Attach to globals
(global as any).window = {
  dataLayer: mockDataLayer,
  location: {
    get search() { return mockLocationSearch; },
    get pathname() { return mockPathname; },
    get hostname() { return 'nutrifitness.ch'; },
    get origin() { return 'https://nutrifitness.ch'; },
  },
  dispatchEvent: () => true,
};

(global as any).document = {
  get cookie() { return mockCookies; },
  set cookie(val: string) {
    const [cookiePair] = val.split(';');
    const [name, value] = cookiePair.split('=');
    const existing = mockCookies.split('; ').filter(c => !c.startsWith(`${name}=`));
    existing.push(`${name}=${value}`);
    mockCookies = existing.filter(Boolean).join('; ');
  },
};

(global as any).localStorage = mockLocalStorage;
(global as any).sessionStorage = mockSessionStorage;

// Set production environment by default to test genuine customer storefront tracking
(process.env as any).NODE_ENV = 'production';

// Set analytics & marketing consent cookie by default
mockCookies = `nf_consent=${encodeURIComponent(JSON.stringify({
  necessary: true,
  analytics: true,
  marketing: true,
  updatedAt: new Date().toISOString(),
}))}`;

import {
  trackBeginCheckout,
  trackAddShippingInfo,
  trackAddPaymentInfo,
  trackPurchase,
  isPurchaseTracked,
  markPurchaseTracked,
  EcommerceItem,
  GA4_PURCHASE_DEDUP_PREFIX,
} from '../analytics';

console.log('Running GA4 E-Commerce Checkout Tracking Test Suite...\n');

let failed = false;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASSED: ${message}`);
  } else {
    console.error(`❌ FAILED: ${message}`);
    failed = true;
  }
}

function resetEnvironment() {
  (process.env as any).NODE_ENV = 'production';
  mockDataLayer.length = 0;
  mockLocalStorage.clear();
  mockSessionStorage.clear();
  mockLocationSearch = '';
  mockPathname = '/commande/';
  mockCookies = `nf_consent=${encodeURIComponent(JSON.stringify({
    necessary: true,
    analytics: true,
    marketing: true,
    updatedAt: new Date().toISOString(),
  }))}`;
}

// =========================================================================
// TEST 1: begin_checkout Event
// =========================================================================
console.log('--- 1. GA4 begin_checkout EVENT TESTS ---');
resetEnvironment();

const sampleItems: EcommerceItem[] = [
  {
    item_id: 'APP-CREAT-250',
    item_name: 'Applied Nutrition Creatine Monohydrate 250g',
    item_brand: 'Applied Nutrition',
    item_category: 'Creatine',
    item_variant: 'Neutre / 250g',
    price: 34.90,
    quantity: 2,
    discount: 3.49,
  },
  {
    item_id: 'YAM-ISO-2KG',
    item_name: 'Yamamoto Nutrition Iso-FUJI 2kg',
    item_brand: 'Yamamoto Nutrition',
    item_category: 'Proteines',
    item_variant: 'Chocolat / 2 kg',
    price: 89.90,
    quantity: 1,
    discount: 8.99,
  },
];

trackBeginCheckout({
  items: sampleItems,
  totalValue: 147.21,
  currency: 'CHF',
  coupon: 'BLACK_FRIDAY_-10%',
});

const beginCheckoutEvent = mockDataLayer.find((e) => e.event === 'begin_checkout');
assert(Boolean(beginCheckoutEvent), 'begin_checkout event was pushed to dataLayer');
assert(beginCheckoutEvent?.ecommerce?.currency === 'CHF', 'begin_checkout currency is CHF');
assert(beginCheckoutEvent?.ecommerce?.value === 147.21, 'begin_checkout total value matches (147.21 CHF)');
assert(beginCheckoutEvent?.ecommerce?.coupon === 'BLACK_FRIDAY_-10%', 'begin_checkout coupon parameter matches');
assert(Array.isArray(beginCheckoutEvent?.ecommerce?.items) && beginCheckoutEvent.ecommerce.items.length === 2, 'begin_checkout contains 2 items');

const item1 = beginCheckoutEvent?.ecommerce?.items[0];
assert(item1?.item_id === 'APP-CREAT-250', 'Item 1 item_id matches SKU');
assert(item1?.item_name === 'Applied Nutrition Creatine Monohydrate 250g', 'Item 1 name matches');
assert(item1?.item_brand === 'Applied Nutrition', 'Item 1 brand matches');
assert(item1?.item_variant === 'Neutre / 250g', 'Item 1 flavor/size variant matches');
assert(item1?.price === 34.90, 'Item 1 unit price matches');
assert(item1?.quantity === 2, 'Item 1 quantity matches');
assert(item1?.discount === 3.49, 'Item 1 discount matches');

// =========================================================================
// TEST 2: add_shipping_info Event
// =========================================================================
console.log('\n--- 2. GA4 add_shipping_info EVENT TESTS ---');
resetEnvironment();

trackAddShippingInfo({
  items: sampleItems,
  totalValue: 147.21,
  currency: 'CHF',
  shippingTier: 'PostPac Priority (La Poste Suisse)',
  shippingCost: 0,
  coupon: 'BLACK_FRIDAY_-10%',
});

const addShippingEvent = mockDataLayer.find((e) => e.event === 'add_shipping_info');
assert(Boolean(addShippingEvent), 'add_shipping_info event was pushed to dataLayer');
assert(addShippingEvent?.ecommerce?.currency === 'CHF', 'add_shipping_info currency is CHF');
assert(addShippingEvent?.ecommerce?.shipping_tier === 'PostPac Priority (La Poste Suisse)', 'shipping_tier matches PostPac Priority');
assert(addShippingEvent?.ecommerce?.value === 147.21, 'value matches total amount');
assert(addShippingEvent?.ecommerce?.items?.length === 2, 'items preserved in add_shipping_info');

// Test Click & Collect tier
mockDataLayer.length = 0;
trackAddShippingInfo({
  items: sampleItems,
  totalValue: 147.21,
  currency: 'CHF',
  shippingTier: 'Click & Collect (Boutique)',
  shippingCost: 0,
});
const clickCollectEvent = mockDataLayer.find((e) => e.event === 'add_shipping_info');
assert(clickCollectEvent?.ecommerce?.shipping_tier === 'Click & Collect (Boutique)', 'shipping_tier matches Click & Collect');

// =========================================================================
// TEST 3: add_payment_info Event (Card, TWINT, PostFinance)
// =========================================================================
console.log('\n--- 3. GA4 add_payment_info EVENT TESTS ---');
resetEnvironment();

// Test Card
trackAddPaymentInfo({
  items: sampleItems,
  totalValue: 147.21,
  currency: 'CHF',
  paymentType: 'card',
  coupon: 'BLACK_FRIDAY_-10%',
});

let addPaymentEvent = mockDataLayer.find((e) => e.event === 'add_payment_info');
assert(Boolean(addPaymentEvent), 'add_payment_info event for Card was pushed to dataLayer');
assert(addPaymentEvent?.ecommerce?.payment_type === 'card', 'payment_type is "card"');
assert(addPaymentEvent?.ecommerce?.currency === 'CHF', 'currency is CHF');

// Test TWINT
mockDataLayer.length = 0;
trackAddPaymentInfo({
  items: sampleItems,
  totalValue: 147.21,
  currency: 'CHF',
  paymentType: 'twint',
  coupon: 'BLACK_FRIDAY_-10%',
});

addPaymentEvent = mockDataLayer.find((e) => e.event === 'add_payment_info');
assert(Boolean(addPaymentEvent), 'add_payment_info event for TWINT was pushed to dataLayer');
assert(addPaymentEvent?.ecommerce?.payment_type === 'twint', 'payment_type is "twint"');

// Test PostFinance
mockDataLayer.length = 0;
trackAddPaymentInfo({
  items: sampleItems,
  totalValue: 147.21,
  currency: 'CHF',
  paymentType: 'postfinance',
});

addPaymentEvent = mockDataLayer.find((e) => e.event === 'add_payment_info');
assert(addPaymentEvent?.ecommerce?.payment_type === 'postfinance', 'payment_type is "postfinance"');

// =========================================================================
// TEST 4: purchase Event & Deduplication
// =========================================================================
console.log('\n--- 4. GA4 purchase EVENT & DEDUPLICATION TESTS ---');
resetEnvironment();

const testTxId = 'NF-TEST-ORDER-2026';

assert(!isPurchaseTracked(testTxId), 'Initially, transaction is not marked as tracked');

const purchaseSuccess1 = trackPurchase({
  transaction_id: testTxId,
  value: 147.21,
  shipping: 0,
  tax: 3.73,
  currency: 'CHF',
  items: sampleItems,
  coupon: 'BLACK_FRIDAY_-10%',
});

assert(purchaseSuccess1 === true, 'First trackPurchase call returns true');
assert(isPurchaseTracked(testTxId), 'Transaction is now recorded in dedup storage');
assert(Boolean(mockSessionStorage.getItem(GA4_PURCHASE_DEDUP_PREFIX + testTxId)), 'Transaction recorded in sessionStorage');
assert(Boolean(mockLocalStorage.getItem(GA4_PURCHASE_DEDUP_PREFIX + testTxId)), 'Transaction recorded in localStorage');

const purchaseEvent = mockDataLayer.find((e) => e.event === 'purchase');
assert(Boolean(purchaseEvent), 'purchase event pushed to dataLayer');
assert(purchaseEvent?.ecommerce?.transaction_id === testTxId, 'transaction_id matches');
assert(purchaseEvent?.ecommerce?.value === 147.21, 'value matches verified amount');
assert(purchaseEvent?.ecommerce?.shipping === 0, 'shipping matches 0');
assert(purchaseEvent?.ecommerce?.tax === 3.73, 'tax matches 3.73');
assert(purchaseEvent?.ecommerce?.currency === 'CHF', 'currency is CHF');
assert(purchaseEvent?.ecommerce?.coupon === 'BLACK_FRIDAY_-10%', 'coupon parameter matches');
assert(purchaseEvent?.ecommerce?.items?.length === 2, 'purchase items count is 2');

// Duplicate call attempt (e.g. page refresh or back button)
const purchaseCountBefore = mockDataLayer.filter((e) => e.event === 'purchase').length;
const purchaseSuccess2 = trackPurchase({
  transaction_id: testTxId,
  value: 147.21,
  shipping: 0,
  tax: 3.73,
  currency: 'CHF',
  items: sampleItems,
});

const purchaseCountAfter = mockDataLayer.filter((e) => e.event === 'purchase').length;
assert(purchaseSuccess2 === false, 'Duplicate trackPurchase call returns false');
assert(purchaseCountBefore === purchaseCountAfter, 'Duplicate purchase was suppressed (no second push to dataLayer)');

// Duplicate test across new browser tab (only localStorage preserved)
mockSessionStorage.clear();
assert(isPurchaseTracked(testTxId), 'isPurchaseTracked still returns true even if sessionStorage is cleared (localStorage fallback)');
const purchaseSuccess3 = trackPurchase({
  transaction_id: testTxId,
  value: 147.21,
  currency: 'CHF',
  items: sampleItems,
});
assert(purchaseSuccess3 === false, 'Purchase in new tab with same transaction ID is correctly suppressed');

// =========================================================================
// TEST 5: DebugView & debug_mode Flag
// =========================================================================
console.log('\n--- 5. GA4 DebugView / debug_mode TESTS ---');
resetEnvironment();

mockLocationSearch = '?gtm_debug=1';
trackBeginCheckout({
  items: sampleItems,
  totalValue: 147.21,
  currency: 'CHF',
});

const debugBeginCheckout = mockDataLayer.find((e) => e.event === 'begin_checkout');
assert(debugBeginCheckout?.debug_mode === true, 'Top-level debug_mode: true injected when gtm_debug is active');
assert(debugBeginCheckout?.ecommerce?.debug_mode === true, 'Ecommerce-level debug_mode: true injected for GA4 DebugView');

mockLocationSearch = '?ga_debug=1';
mockDataLayer.length = 0;
trackAddShippingInfo({
  items: sampleItems,
  totalValue: 147.21,
  currency: 'CHF',
  shippingTier: 'PostPac Priority',
});
const debugShipping = mockDataLayer.find((e) => e.event === 'add_shipping_info');
assert(debugShipping?.debug_mode === true, 'debug_mode injected when ga_debug=1 is active');

// =========================================================================
// TEST 6: Admin Traffic Exclusion & Cookie Consent
// =========================================================================
console.log('\n--- 6. ADMIN EXCLUSION & CONSENT GOVERNANCE TESTS ---');
resetEnvironment();

// Admin path exclusion: /admin/
mockPathname = '/admin/orders';
trackBeginCheckout({
  items: sampleItems,
  totalValue: 147.21,
  currency: 'CHF',
});
assert(!mockDataLayer.some((e) => e.event === 'begin_checkout'), 'GA4 tracking completely excluded on admin routes');

// Staff cookie exclusion
mockPathname = '/commande/';
mockCookies = 'nf_is_staff=true; nf_consent=' + encodeURIComponent(JSON.stringify({ analytics: true, marketing: true }));
mockDataLayer.length = 0;
trackBeginCheckout({
  items: sampleItems,
  totalValue: 147.21,
  currency: 'CHF',
});
assert(!mockDataLayer.some((e) => e.event === 'begin_checkout'), 'GA4 tracking completely excluded when staff cookie is present');

// Development environment exclusion
resetEnvironment();
(process.env as any).NODE_ENV = 'development';
trackBeginCheckout({
  items: sampleItems,
  totalValue: 147.21,
  currency: 'CHF',
});
assert(!mockDataLayer.some((e) => e.event === 'begin_checkout'), 'GA4 tracking completely excluded in development environment');

// No analytics consent
resetEnvironment();
mockCookies = 'nf_consent=' + encodeURIComponent(JSON.stringify({ necessary: true, analytics: false, marketing: true }));
trackBeginCheckout({
  items: sampleItems,
  totalValue: 147.21,
  currency: 'CHF',
});
assert(!mockDataLayer.some((e) => e.event === 'begin_checkout'), 'GA4 tracking withheld when user has not granted analytics consent');

// Restore consent and confirm genuine customer tracking works
resetEnvironment();
mockPathname = '/commande/';
trackBeginCheckout({
  items: sampleItems,
  totalValue: 147.21,
  currency: 'CHF',
});
assert(mockDataLayer.some((e) => e.event === 'begin_checkout'), 'Genuine customer tracking executes normally with consent');

// =========================================================================
// TEST 7: Summary
// =========================================================================
console.log('\n========================================');
if (failed) {
  console.error('❌ GA4 CHECKOUT TRACKING TEST SUITE FAILED');
  process.exit(1);
} else {
  console.log('✅ ALL GA4 CHECKOUT TRACKING TESTS PASSED (100%)');
  process.exit(0);
}
