import assert from 'node:assert/strict';
import { POST } from '../src/app/api/orders/route';

async function main() {
  const payload = {
    ticketNumber: 'WEB-TEST-NOT-PAID',
    total: 59.9,
    items: [{ id: 'test', name: 'Test only', price: 59.9, quantity: 1 }],
    paymentDetails: { reference: 'not-a-stripe-session' },
  };
  const request = (origin: string) => new Request('https://nutrifitness.ch/api/orders/', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin },
    body: JSON.stringify(payload)
  });
  const forged = await POST(request('https://nutrifitness.ch'));
  assert.equal(forged.status, 401, 'Cannot insert an unpaid order without verified Stripe session or admin login');
  const crossSite = await POST(request('https://malicious.example'));
  assert.equal(crossSite.status, 403, 'Cross-origin order submission must not reach the database');
  console.log('Unpaid order forgery and cross-site protection tests passed.');
}
main().catch(error => { console.error(error); process.exit(1); });
