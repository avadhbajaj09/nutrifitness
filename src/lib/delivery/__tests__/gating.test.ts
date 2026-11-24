import { isProductDeliverableToCountry, isCountrySupported, isGenevaAllowed } from '../defaults';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

console.log('Running Storefront Deliverability Gating Tests...\n');

// 1. Deliverable to Switzerland, Liechtenstein, and Europe from Portugal
assert(isProductDeliverableToCountry('CH', 'PORTUGAL_ONLY', 'portugal'), 'Deliverable to Switzerland (CH)');
assert(isProductDeliverableToCountry('LI', 'PORTUGAL_ONLY', 'portugal'), 'Deliverable to Liechtenstein (LI)');
assert(isProductDeliverableToCountry('PT', 'PORTUGAL_ONLY', 'portugal'), 'Deliverable to Portugal (PT)');
assert(isProductDeliverableToCountry('ES', 'PORTUGAL_ONLY', 'portugal'), 'Deliverable to Spain (ES)');
assert(isProductDeliverableToCountry('FR', 'PORTUGAL_ONLY', 'portugal'), 'Deliverable to France (FR)');
assert(isProductDeliverableToCountry('DE', 'PORTUGAL_ONLY', 'portugal'), 'Deliverable to Germany (DE)');
assert(isProductDeliverableToCountry('IT', 'PORTUGAL_ONLY', 'portugal'), 'Deliverable to Italy (IT)');

// 2. Blocked for non-supported destination (e.g. India)
assert(!isProductDeliverableToCountry('IN', 'PORTUGAL_ONLY', 'portugal'), 'Blocked for non-supported destination (IN)');

// 3. No stock gating needed: all products available
assert(isProductDeliverableToCountry('CH', undefined, undefined, 0, 0), 'Available in CH without stock restrictions');
assert(isProductDeliverableToCountry('FR', undefined, undefined, 0, 0), 'Available in FR without stock restrictions');
assert(isProductDeliverableToCountry('CH', 'GENEVA_ONLY', 'switzerland', 0, 0), 'Available in CH even when 0 stock (inventory check handles Out of Stock, not country restriction)');
assert(!isProductDeliverableToCountry('FR', 'GENEVA_ONLY', 'switzerland', 10, 0), 'Swiss-only product blocked for European destination (FR)');

console.log('\nAll storefront gating assertions passed successfully!');
