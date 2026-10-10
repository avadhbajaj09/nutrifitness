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

// 1. Geneva/Switzerland only product (ships ONLY to Switzerland / Liechtenstein)
assert(!isProductDeliverableToCountry('PT', 'GENEVA_ONLY', 'switzerland'), 'GENEVA_ONLY is blocked for Portugal (PT)');
assert(!isProductDeliverableToCountry('ES', 'GENEVA_ONLY', 'switzerland'), 'GENEVA_ONLY is blocked for Spain (ES)');
assert(!isProductDeliverableToCountry('IN', 'GENEVA_ONLY', 'switzerland'), 'GENEVA_ONLY is blocked for India (IN)');
assert(isProductDeliverableToCountry('CH', 'GENEVA_ONLY', 'switzerland'), 'GENEVA_ONLY is allowed for Switzerland (CH)');
assert(isProductDeliverableToCountry('LI', 'GENEVA_ONLY', 'switzerland'), 'GENEVA_ONLY is allowed for Liechtenstein (LI)');
assert(!isProductDeliverableToCountry('FR', 'GENEVA_ONLY', 'switzerland'), 'GENEVA_ONLY is blocked for France (FR)');
assert(!isProductDeliverableToCountry('DE', 'GENEVA_ONLY', 'switzerland'), 'GENEVA_ONLY is blocked for Germany (DE)');
assert(!isProductDeliverableToCountry('IT', 'GENEVA_ONLY', 'switzerland'), 'GENEVA_ONLY is blocked for Italy (IT)');
assert(!isProductDeliverableToCountry('AT', 'GENEVA_ONLY', 'switzerland'), 'GENEVA_ONLY is blocked for Austria (AT)');

// 2. Common product (stocked in both Switzerland and Portugal)
assert(isProductDeliverableToCountry('PT', 'COMMON', 'common'), 'COMMON is allowed for Portugal (PT)');
assert(isProductDeliverableToCountry('CH', 'COMMON', 'common'), 'COMMON is allowed for Switzerland (CH)');
assert(isProductDeliverableToCountry('ES', 'COMMON', 'common'), 'COMMON is allowed for Spain (ES)');
assert(isProductDeliverableToCountry('DE', 'COMMON', 'common'), 'COMMON is allowed for Germany (DE)');
assert(isProductDeliverableToCountry('FR', 'COMMON', 'common'), 'COMMON is allowed for France (FR)');
assert(!isProductDeliverableToCountry('IN', 'COMMON', 'common'), 'COMMON is blocked for non-supported destination (IN)');

// 3. Portugal only product (ships to Europe; blocked in Switzerland as Omar handles Europe)
assert(isProductDeliverableToCountry('PT', 'PORTUGAL_ONLY', 'portugal'), 'PORTUGAL_ONLY is allowed for Portugal (PT)');
assert(!isProductDeliverableToCountry('CH', 'PORTUGAL_ONLY', 'portugal'), 'PORTUGAL_ONLY is blocked for Switzerland (CH)');
assert(isProductDeliverableToCountry('ES', 'PORTUGAL_ONLY', 'portugal'), 'PORTUGAL_ONLY is allowed for Spain (ES)');
assert(isProductDeliverableToCountry('FR', 'PORTUGAL_ONLY', 'portugal'), 'PORTUGAL_ONLY is allowed for France (FR)');
assert(!isProductDeliverableToCountry('IN', 'PORTUGAL_ONLY', 'portugal'), 'PORTUGAL_ONLY is blocked for non-supported destination (IN)');

// 4. Stock-derived common product
assert(isProductDeliverableToCountry('PT', undefined, undefined, 10, 10), 'Stock-derived common (10 GE, 10 PT) is deliverable to Portugal');
assert(isProductDeliverableToCountry('CH', undefined, undefined, 10, 10), 'Stock-derived common (10 GE, 10 PT) is deliverable to Switzerland');
assert(!isProductDeliverableToCountry('PT', undefined, undefined, 10, 0), 'Stock-derived Geneva only (10 GE, 0 PT) is blocked for Portugal');
assert(!isProductDeliverableToCountry('CH', undefined, undefined, 0, 10), 'Stock-derived Portugal only (0 GE, 10 PT) is blocked for Switzerland');

console.log('\nAll storefront gating assertions passed successfully!');
