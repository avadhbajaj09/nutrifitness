import assert from 'node:assert/strict';
import { createCartRestoreToken, verifyCartRestoreToken, cartRestoreUrl } from '../src/lib/cartRestore';

async function main() {
const previous = process.env.ADMIN_SESSION_SECRET;
try {
  delete process.env.ADMIN_SESSION_SECRET;
  assert.equal(await verifyCartRestoreToken('WEB-123456', 'not-a-token'), false);
  process.env.ADMIN_SESSION_SECRET = 'only-test-secret-not-real-64-chars-long-1234567890';
  const now = Date.now();
  const order = 'WEB-912345';
  const token = await createCartRestoreToken(order, now);
  assert.equal(await verifyCartRestoreToken(order, token, now + 1000), true, 'Valid signed link accepted');
  assert.equal(await verifyCartRestoreToken('WEB-912346', token, now + 1000), false, 'Token not usable for another cart');
  assert.equal(await verifyCartRestoreToken(order, token, now + 8 * 24 * 60 * 60 * 1000), false, 'Expired link denied');
  assert.equal(await verifyCartRestoreToken(order, null), false, 'Unsigned link denied');
  const url = new URL(await cartRestoreUrl(order));
  assert.equal(url.searchParams.get('restore'), order);
  assert.ok(await verifyCartRestoreToken(order, url.searchParams.get('token')), 'Recovery URL contains valid signature');
  console.log('Signed cart restoration tests passed.');
} finally {
  if (previous === undefined) delete process.env.ADMIN_SESSION_SECRET;
  else process.env.ADMIN_SESSION_SECRET = previous;
}

}
main().catch(error => { console.error(error); process.exit(1); });
