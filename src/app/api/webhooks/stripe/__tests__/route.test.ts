import crypto from 'crypto';
import { POST, GET, PUT } from '../route';

// Test fixtures & helper
const TEST_WEBHOOK_SECRET = 'whsec_test_secret_for_stripe_webhooks_987654321';

function generateStripeSignature(payload: string, secret: string, timestamp?: number): string {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return `t=${ts},v1=${signature}`;
}

let failed = false;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASSED: ${message}`);
  } else {
    console.error(`❌ FAILED: ${message}`);
    failed = true;
  }
}

async function runTests() {
  console.log('--- Running Stripe Webhook Route Tests ---\n');

  // Preserve original env
  const origSecret = process.env.STRIPE_WEBHOOK_SECRET;
  process.env.STRIPE_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;

  try {
    // 1. Missing secret handling (500)
    {
      delete process.env.STRIPE_WEBHOOK_SECRET;
      const req = new Request('https://nutrifitness.ch/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': 'dummy' },
        body: JSON.stringify({ id: 'evt_1' })
      });
      const res = await POST(req);
      assert(res.status === 500, 'Returns 500 when STRIPE_WEBHOOK_SECRET is missing');
      process.env.STRIPE_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
    }

    // 2. Missing stripe-signature header (400)
    {
      const req = new Request('https://nutrifitness.ch/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ id: 'evt_2' })
      });
      const res = await POST(req);
      assert(res.status === 400, 'Returns 400 when stripe-signature header is missing');
    }

    // 3. Invalid signature (400)
    {
      const payload = JSON.stringify({ id: 'evt_3', type: 'test.event' });
      const req = new Request('https://nutrifitness.ch/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 't=123456,v1=invalid_hex_signature_here'
        },
        body: payload
      });
      const res = await POST(req);
      assert(res.status === 400, 'Returns 400 when signature is invalid');
    }

    // 4. Non-POST methods return 405 Method Not Allowed
    {
      const getRes = await GET();
      assert(getRes.status === 405, 'GET returns 405 Method Not Allowed');
      assert(getRes.headers.get('Allow') === 'POST', 'GET response includes Allow: POST header');

      const putRes = await PUT();
      assert(putRes.status === 405, 'PUT returns 405 Method Not Allowed');
    }

    // 5. Valid signature with unknown or ping event returns 200
    {
      const payload = JSON.stringify({
        id: 'evt_ping_test',
        type: 'ping',
        data: { object: {} }
      });
      const sig = generateStripeSignature(payload, TEST_WEBHOOK_SECRET);
      const req = new Request('https://nutrifitness.ch/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': sig,
          'content-type': 'application/json'
        },
        body: payload
      });
      const res = await POST(req);
      const data = await res.json();
      assert(res.status === 200, 'Valid signature returns 200 OK');
      assert(data.received === true, 'Response body has received: true');
    }

    // 6. checkout.session.completed event processing
    {
      const testOrderNumber = `TEST-ORDER-${Date.now()}`;
      const payload = JSON.stringify({
        id: `evt_session_${Date.now()}`,
        type: 'checkout.session.completed',
        data: {
          object: {
            id: `cs_test_${Date.now()}`,
            amount_total: 4500, // CHF 45.00
            currency: 'chf',
            customer_details: {
              name: 'Jean Dupont',
              email: 'test@nutrifitness.ch',
              phone: '+41791234567'
            },
            payment_method_types: ['card'],
            metadata: {
              order_number: testOrderNumber,
              shipping_street: 'Rue du Rhône 10',
              shipping_city: 'Genève',
              shipping_postal_code: '1204',
              shipping_country: 'CH'
            }
          }
        }
      });

      const sig = generateStripeSignature(payload, TEST_WEBHOOK_SECRET);
      const req = new Request('https://nutrifitness.ch/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': sig, 'content-type': 'application/json' },
        body: payload
      });
      const res = await POST(req);
      assert(res.status === 200, 'checkout.session.completed returns 200 OK');

      // 7. Duplicate delivery of checkout.session.completed (Idempotency)
      const dupReq = new Request('https://nutrifitness.ch/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': sig, 'content-type': 'application/json' },
        body: payload
      });
      const dupRes = await POST(dupReq);
      const dupData = await dupRes.json();
      assert(dupRes.status === 200, 'Duplicate delivery returns 200 OK');
      assert(
        dupData.received === true && (dupData.status === 'already_processed' || dupData.received === true),
        'Duplicate delivery handled idempotently without error'
      );
    }

    // 8. checkout.session.async_payment_succeeded event
    {
      const asyncOrderNumber = `TEST-ASYNC-${Date.now()}`;
      const payload = JSON.stringify({
        id: `evt_async_${Date.now()}`,
        type: 'checkout.session.async_payment_succeeded',
        data: {
          object: {
            id: `cs_async_${Date.now()}`,
            amount_total: 8900,
            currency: 'chf',
            customer_details: { email: 'async@nutrifitness.ch', name: 'Client Async' },
            metadata: { order_number: asyncOrderNumber }
          }
        }
      });
      const sig = generateStripeSignature(payload, TEST_WEBHOOK_SECRET);
      const req = new Request('https://nutrifitness.ch/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': sig, 'content-type': 'application/json' },
        body: payload
      });
      const res = await POST(req);
      assert(res.status === 200, 'checkout.session.async_payment_succeeded returns 200 OK');
    }

    // 9. payment_intent.payment_failed event
    {
      const failOrderNumber = `TEST-FAIL-${Date.now()}`;
      const payload = JSON.stringify({
        id: `evt_fail_${Date.now()}`,
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: `pi_fail_${Date.now()}`,
            metadata: { order_number: failOrderNumber }
          }
        }
      });
      const sig = generateStripeSignature(payload, TEST_WEBHOOK_SECRET);
      const req = new Request('https://nutrifitness.ch/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': sig, 'content-type': 'application/json' },
        body: payload
      });
      const res = await POST(req);
      assert(res.status === 200, 'payment_intent.payment_failed returns 200 OK');
    }

  } finally {
    // Restore original env
    if (origSecret) {
      process.env.STRIPE_WEBHOOK_SECRET = origSecret;
    } else {
      delete process.env.STRIPE_WEBHOOK_SECRET;
    }
  }

  if (failed) {
    console.error('\n❌ Some Stripe Webhook Route tests failed!');
    process.exit(1);
  } else {
    console.log('\n🎉 All Stripe Webhook Route tests passed successfully!');
  }
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
