import {
  calculateBlackFridayDiscount,
  isBlackFridayActive,
  DEFAULT_BLACK_FRIDAY_CONFIG,
  type BlackFridayConfig
} from '../black-friday';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
}

console.log('--- 1. SECTION 7 VERIFICATION TABLE TESTS ---');

const testCases = [
  { subtotal: 49.99, expectedPercent: 0, expectedFinal: 49.99, expectedDiscount: 0 },
  { subtotal: 50.00, expectedPercent: 10, expectedFinal: 45.00, expectedDiscount: 5.00 },
  { subtotal: 100.00, expectedPercent: 10, expectedFinal: 90.00, expectedDiscount: 10.00 },
  { subtotal: 110.00, expectedPercent: 15, expectedFinal: 93.50, expectedDiscount: 16.50 },
  { subtotal: 150.00, expectedPercent: 15, expectedFinal: 127.50, expectedDiscount: 22.50 },
  { subtotal: 200.00, expectedPercent: 25, expectedFinal: 150.00, expectedDiscount: 50.00 },
  { subtotal: 300.00, expectedPercent: 25, expectedFinal: 225.00, expectedDiscount: 75.00 },
];

for (const tc of testCases) {
  const result = calculateBlackFridayDiscount(tc.subtotal, DEFAULT_BLACK_FRIDAY_CONFIG);
  assert(
    result.discountPercent === tc.expectedPercent,
    `Subtotal CHF ${tc.subtotal}: expected ${tc.expectedPercent}% discount, got ${result.discountPercent}%`
  );
  assert(
    Math.abs(result.finalSubtotal - tc.expectedFinal) < 0.005,
    `Subtotal CHF ${tc.subtotal}: expected final CHF ${tc.expectedFinal}, got CHF ${result.finalSubtotal}`
  );
  assert(
    Math.abs(result.discountAmount - tc.expectedDiscount) < 0.005,
    `Subtotal CHF ${tc.subtotal}: expected discount CHF ${tc.expectedDiscount}, got CHF ${result.discountAmount}`
  );
  console.log(
    `✅ PASSED: CHF ${tc.subtotal.toFixed(2)} -> ${tc.expectedPercent}% -> Final CHF ${result.finalSubtotal.toFixed(2)} (Remise CHF ${result.discountAmount.toFixed(2)})`
  );
}

console.log('\n--- 2. MILESTONE PROGRESS BAR & NEXT TIER MESSAGING TESTS ---');

// Under 50: Next tier is 50 (10%)
const under50 = calculateBlackFridayDiscount(30, DEFAULT_BLACK_FRIDAY_CONFIG);
assert(under50.nextTier?.threshold === 50, 'Next tier should be 50');
assert(under50.nextTier?.discountPercent === 10, 'Next tier discount should be 10%');
assert(under50.nextTier?.remaining === 20, 'Remaining should be 20');
assert(under50.message.includes('Plus que CHF 20.00 pour profiter de 10%'), 'Message matches UX expectation');
console.log(`✅ PASSED: CHF 30 milestone: "${under50.message}"`);

// Exactly 50: Next tier is 110 (15%)
const at50 = calculateBlackFridayDiscount(50, DEFAULT_BLACK_FRIDAY_CONFIG);
assert(at50.nextTier?.threshold === 110, 'Next tier should be 110');
assert(at50.nextTier?.discountPercent === 15, 'Next tier discount should be 15%');
assert(at50.nextTier?.remaining === 60, 'Remaining should be 60');
console.log(`✅ PASSED: CHF 50 milestone: "${at50.message}"`);

// At 180: Next tier is 200 (25%), remaining 20
const at180 = calculateBlackFridayDiscount(180, DEFAULT_BLACK_FRIDAY_CONFIG);
assert(at180.nextTier?.threshold === 200, 'Next tier should be 200');
assert(at180.nextTier?.discountPercent === 25, 'Next tier discount should be 25%');
assert(at180.nextTier?.remaining === 20, 'Remaining should be 20');
assert(at180.message.includes('Plus que CHF 20.00 pour profiter de 25%'), 'Message matches example in prompt');
console.log(`✅ PASSED: CHF 180 milestone: "${at180.message}"`);

// At 200 or above: Max tier reached
const at200 = calculateBlackFridayDiscount(200, DEFAULT_BLACK_FRIDAY_CONFIG);
assert(at200.nextTier === null, 'Next tier should be null at max');
assert(at200.message.includes('remise maximale'), 'Max tier congratulation message');
console.log(`✅ PASSED: CHF 200 milestone: "${at200.message}"`);

console.log('\n--- 3. ACTIVATION & TIMEZONE WINDOW TESTS ---');

const activeConfig: BlackFridayConfig = {
  enabled: true,
  startDate: '2026-11-20T00:00:00+01:00',
  endDate: '2026-12-02T23:59:59+01:00',
  tiers: DEFAULT_BLACK_FRIDAY_CONFIG.tiers,
  bannerText: 'BF',
};

// Inside window (Nov 27, 2026)
const insideDate = new Date('2026-11-27T12:00:00+01:00');
assert(isBlackFridayActive(activeConfig, insideDate) === true, 'Should be active inside date window');
console.log('✅ PASSED: Active during promotional window');

// Before window (Nov 15, 2026)
const beforeDate = new Date('2026-11-15T12:00:00+01:00');
assert(isBlackFridayActive(activeConfig, beforeDate) === false, 'Should be inactive before start date');
const inactiveBefore = calculateBlackFridayDiscount(250, activeConfig, beforeDate);
assert(inactiveBefore.isActive === false, 'Calculation reflects inactive before start date');
assert(inactiveBefore.discountAmount === 0, 'No discount before start date');
console.log('✅ PASSED: Inactive before start date');

// After window (Dec 05, 2026)
const afterDate = new Date('2026-12-05T12:00:00+01:00');
assert(isBlackFridayActive(activeConfig, afterDate) === false, 'Should be inactive after end date');
const inactiveAfter = calculateBlackFridayDiscount(250, activeConfig, afterDate);
assert(inactiveAfter.isActive === false, 'Calculation reflects inactive after end date');
assert(inactiveAfter.discountAmount === 0, 'No discount after end date');
console.log('✅ PASSED: Inactive after end date');

// Manually disabled toggle
const disabledConfig: BlackFridayConfig = {
  ...activeConfig,
  enabled: false,
};
assert(isBlackFridayActive(disabledConfig, insideDate) === false, 'Should be inactive when enabled is false');
console.log('✅ PASSED: Inactive when enabled toggle is false');

console.log('\n----------------------------------------------');
console.log('✅ ALL Black Friday Engine Unit Tests Passed Successfully!');
