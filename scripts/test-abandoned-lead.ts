import assert from 'node:assert/strict';
import { canUpdateAbandonedLead, isValidAbandonedLeadId } from '../src/lib/abandonedLead';

assert.equal(isValidAbandonedLeadId('WEB-123456'), true, 'Old in-flight client lead IDs remain compatible');
assert.equal(isValidAbandonedLeadId('WEB-5c63b610-6ef0-4d9a-ac22-987abcdcba19'), true);
assert.equal(isValidAbandonedLeadId('LEAD-1731712555000'), true);
for (const value of ['NF-PAID-ABC', 'POS-111', 'WEB-123', 'WEB-1234567', 'WEB-../../orders', '', 'NF-123456']) {
  assert.equal(isValidAbandonedLeadId(value), false, 'Dangerous record key accepted: ' + value);
}
assert.equal(canUpdateAbandonedLead(null, 'user@example.test', ''), true);
assert.equal(canUpdateAbandonedLead({ status: 'pending', customer_email: 'user@example.test' }, 'user@example.test', ''), false);
assert.equal(canUpdateAbandonedLead({ status: 'paid', customer_email: 'user@example.test' }, 'user@example.test', ''), false);
assert.equal(canUpdateAbandonedLead({ status: 'abandoned', customer_email: 'user@example.test' }, 'attacker@example.test', ''), false);
assert.equal(canUpdateAbandonedLead({ status: 'abandoned', customer_email: 'user@example.test' }, 'User@Example.Test', ''), true);
assert.equal(canUpdateAbandonedLead({ status: 'abandoned', customer_phone: '+41 79 250 35 64' }, '', '41792503564'), true);
assert.equal(canUpdateAbandonedLead({ status: 'abandoned', customer_phone: '+41 79 250 35 64' }, '', '111111'), false);
console.log('Abandoned-cart ownership and immutable order-state checks passed.');
