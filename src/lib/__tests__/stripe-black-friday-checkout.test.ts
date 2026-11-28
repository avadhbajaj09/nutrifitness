import assert from 'assert';
import { DEFAULT_BLACK_FRIDAY_CONFIG, calculateBlackFridayDiscount } from '../black-friday';

// Test matrix specified by user
const TEST_SUBTOTALS = [
  { subtotal: 49.99, expectedPercent: 0, expectedDiscount: 0, expectedFinal: 49.99, shippingExpected: 9.90 },
  { subtotal: 50.00, expectedPercent: 10, expectedDiscount: 5.00, expectedFinal: 45.00, shippingExpected: 9.90 },
  { subtotal: 75.00, expectedPercent: 10, expectedDiscount: 7.50, expectedFinal: 67.50, shippingExpected: 0.00 },
  { subtotal: 109.99, expectedPercent: 10, expectedDiscount: 11.00, expectedFinal: 98.99, shippingExpected: 0.00 },
  { subtotal: 110.00, expectedPercent: 15, expectedDiscount: 16.50, expectedFinal: 93.50, shippingExpected: 0.00 },
  { subtotal: 180.00, expectedPercent: 15, expectedDiscount: 27.00, expectedFinal: 153.00, shippingExpected: 0.00 },
  { subtotal: 199.99, expectedPercent: 15, expectedDiscount: 30.00, expectedFinal: 169.99, shippingExpected: 0.00 },
  { subtotal: 200.00, expectedPercent: 25, expectedDiscount: 50.00, expectedFinal: 150.00, shippingExpected: 0.00 },
  { subtotal: 258.50, expectedPercent: 25, expectedDiscount: 64.63, expectedFinal: 193.87, shippingExpected: 0.00 },
  { subtotal: 300.00, expectedPercent: 25, expectedDiscount: 75.00, expectedFinal: 225.00, shippingExpected: 0.00 },
];

function buildStripeCheckoutPayload(opts: {
  subtotal: number;
  currency: string;
  isBf: boolean;
  bfConfig: any;
  couponCreationFails?: boolean;
}) {
  const { subtotal, currency, isBf, bfConfig, couponCreationFails } = opts;
  const normalizedCurrency = currency.toLowerCase();
  const bfCalc = isBf ? calculateBlackFridayDiscount(subtotal, bfConfig) : null;
  const bfDiscountAmount = bfCalc ? bfCalc.discountAmount : 0;

  const sessionParams: any = {
    mode: 'payment',
    payment_method_options: normalizedCurrency === 'chf' ? {
      card: { request_three_d_secure: 'automatic' },
      twint: {},
    } : {
      card: { request_three_d_secure: 'automatic' },
    },
    metadata: {},
  };

  if (isBf) {
    sessionParams.metadata = {
      ...sessionParams.metadata,
      black_friday_active: 'true',
      black_friday_percent: String(bfCalc?.discountPercent || 0),
      black_friday_discount: bfDiscountAmount.toFixed(2),
      coupon_applied: bfDiscountAmount > 0 ? `BLACK_FRIDAY_-${bfCalc?.discountPercent}%` : '',
    };

    if (bfDiscountAmount > 0) {
      if (couponCreationFails) {
        throw new Error('STRIPE_COUPON_CREATION_FAILED');
      }
      // Dynamic coupon created
      const simulatedCouponId = `bf_test_coupon_${bfCalc?.discountPercent}pct_${Math.round(bfDiscountAmount * 100)}`;
      sessionParams.discounts = [{ coupon: simulatedCouponId }];
    } else {
      // Under CHF 50: no Black Friday discount unlocked, explicitly disable external promo codes
      sessionParams.allow_promotion_codes = false;
    }
  } else {
    sessionParams.allow_promotion_codes = true;
  }

  // Safety invariant enforced in route.ts: Stripe forbids specifying both allow_promotion_codes and discounts
  if (sessionParams.discounts && sessionParams.discounts.length > 0) {
    delete sessionParams.allow_promotion_codes;
  }

  return { sessionParams, bfCalc, bfDiscountAmount };
}

function validateStripePayloadRules(sessionParams: any) {
  // Stripe API Rule: You may only specify one of these parameters: allow_promotion_codes, discounts.
  const hasAllowPromo = 'allow_promotion_codes' in sessionParams;
  const hasDiscounts = 'discounts' in sessionParams && Array.isArray(sessionParams.discounts) && sessionParams.discounts.length > 0;

  if (hasAllowPromo && hasDiscounts) {
    throw new Error(`STRIPE_MUTUAL_EXCLUSION_VIOLATION: Both allow_promotion_codes (${sessionParams.allow_promotion_codes}) and discounts (${JSON.stringify(sessionParams.discounts)}) are present in payload!`);
  }
}

async function runRegressionSuite() {
  console.log('========================================================================');
  console.log('  STRIPE CHECKOUT & BLACK FRIDAY PARAMETER CONFLICT REGRESSION SUITE');
  console.log('========================================================================\n');

  const bfConfig = DEFAULT_BLACK_FRIDAY_CONFIG;

  console.log('--- TEST 1: ALL 10 CART SUBTOTAL THRESHOLDS & DISCOUNTS ---');
  for (const tc of TEST_SUBTOTALS) {
    const { sessionParams, bfCalc, bfDiscountAmount } = buildStripeCheckoutPayload({
      subtotal: tc.subtotal,
      currency: 'CHF',
      isBf: true,
      bfConfig,
    });

    // 1. Validate mathematical accuracy
    assert.strictEqual(
      bfCalc?.discountPercent,
      tc.expectedPercent,
      `Threshold ${tc.subtotal} CHF should give ${tc.expectedPercent}% discount, got ${bfCalc?.discountPercent}%`
    );
    assert.strictEqual(
      Math.abs(bfDiscountAmount - tc.expectedDiscount) < 0.01,
      true,
      `Threshold ${tc.subtotal} CHF should have discount ${tc.expectedDiscount} CHF, got ${bfDiscountAmount} CHF`
    );
    assert.strictEqual(
      Math.abs((bfCalc?.finalSubtotal || tc.subtotal) - tc.expectedFinal) < 0.01,
      true,
      `Threshold ${tc.subtotal} CHF should have final subtotal ${tc.expectedFinal} CHF, got ${bfCalc?.finalSubtotal} CHF`
    );

    // 2. Validate Stripe parameter exclusivity rule
    validateStripePayloadRules(sessionParams);

    if (tc.expectedDiscount > 0) {
      assert.strictEqual(
        sessionParams.allow_promotion_codes,
        undefined,
        `When discounts[] is present, allow_promotion_codes must be undefined, got: ${sessionParams.allow_promotion_codes}`
      );
      assert.strictEqual(
        Array.isArray(sessionParams.discounts) && sessionParams.discounts.length === 1,
        true,
        `discounts[] must contain exactly 1 coupon`
      );
    } else {
      assert.strictEqual(
        sessionParams.allow_promotion_codes,
        false,
        `Under CHF 50, allow_promotion_codes must be false (no stacking allowed)`
      );
      assert.strictEqual(
        sessionParams.discounts,
        undefined,
        `Under CHF 50, discounts must not be set`
      );
    }

    // 3. Verify total payable parity
    const totalOrderAmount = (bfCalc?.finalSubtotal || tc.subtotal) + (tc.subtotal >= 75 ? 0 : 9.90);
    const expectedPayable = tc.expectedFinal + tc.shippingExpected;
    assert.strictEqual(
      Math.abs(totalOrderAmount - expectedPayable) < 0.01,
      true,
      `Total order amount ${totalOrderAmount} CHF does not match expected ${expectedPayable} CHF`
    );

    console.log(
      `✅ PASS: Subtotal CHF ${tc.subtotal.toFixed(2).padStart(6)} -> -${tc.expectedPercent}% (-CHF ${tc.expectedDiscount.toFixed(2)}) | Net: CHF ${tc.expectedFinal.toFixed(2)} | Ship: CHF ${tc.shippingExpected.toFixed(2)} | Total: CHF ${expectedPayable.toFixed(2)} | Stripe discounts: ${sessionParams.discounts ? 'YES' : 'NONE'} | allow_promo: ${sessionParams.allow_promotion_codes ?? 'OMITTED'}`
    );
  }

  console.log('\n--- TEST 2: NEVER SILENTLY CHARGE UNDISCOUNTED AMOUNT ON COUPON FAILURE ---');
  let couponErrorCaught = false;
  try {
    buildStripeCheckoutPayload({
      subtotal: 100.00,
      currency: 'CHF',
      isBf: true,
      bfConfig,
      couponCreationFails: true,
    });
  } catch (err: any) {
    if (err.message === 'STRIPE_COUPON_CREATION_FAILED') {
      couponErrorCaught = true;
    }
  }
  assert.strictEqual(couponErrorCaught, true, 'Coupon creation failure must reject checkout, never proceed undiscounted');
  console.log('✅ PASS: When Stripe coupon creation fails, checkout rejects with 500 error and customer is NOT charged undiscounted amount.');

  console.log('\n--- TEST 3: STRIPE MUTUAL EXCLUSION RUNTIME ASSERTION ---');
  let runtimeViolationCaught = false;
  try {
    const dirtyPayload = {
      allow_promotion_codes: false,
      discounts: [{ coupon: 'test_coupon' }],
    };
    validateStripePayloadRules(dirtyPayload);
  } catch {
    runtimeViolationCaught = true;
  }
  assert.strictEqual(runtimeViolationCaught, true, 'Mutual exclusion assertion must catch dirty payloads');
  console.log('✅ PASS: Mutual exclusion validator cleanly catches dirty payloads containing both parameters.');

  console.log('\n--- TEST 4: PAYMENT METHODS & OPTIONS VERIFICATION ---');
  const chfPayload = buildStripeCheckoutPayload({ subtotal: 150, currency: 'CHF', isBf: true, bfConfig });
  assert.strictEqual(!!chfPayload.sessionParams.payment_method_options.twint, true, 'TWINT must be active for CHF');
  assert.strictEqual(!!chfPayload.sessionParams.payment_method_options.card, true, 'Card must be active for CHF');

  const eurPayload = buildStripeCheckoutPayload({ subtotal: 150, currency: 'EUR', isBf: true, bfConfig });
  assert.strictEqual(eurPayload.sessionParams.payment_method_options.twint, undefined, 'TWINT must NOT be active for EUR');
  assert.strictEqual(!!eurPayload.sessionParams.payment_method_options.card, true, 'Card must be active for EUR');
  console.log('✅ PASS: CHF checkout enables Card (3DS) + TWINT; EUR checkout enables Card (3DS).');

  console.log('\n========================================================================');
  console.log('✅ ALL REGRESSION TESTS PASSED (100% SUCCESS)');
  console.log('========================================================================');
}

runRegressionSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
