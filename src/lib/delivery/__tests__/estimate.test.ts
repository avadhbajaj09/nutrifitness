import { estimateDelivery } from '../estimate';
import { DEFAULT_DELIVERY_RULES, DEFAULT_HOLIDAYS, DEFAULT_COUNTRY_GROUPS } from '../defaults';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

console.log('Running Delivery Date Engine Unit Tests...\n');

// 1. Worked Example 1: GENEVA -> CH, Fri 9 Oct 2026 at 10:00 Zurich
// Zurich is UTC+2 in October (CEST)
// 10:00 Zurich = 08:00 UTC
const friMorningZurich = new Date(Date.UTC(2026, 9, 9, 8, 0, 0)); // 2026-10-09 10:00 CEST

const ex1 = estimateDelivery({
  origin: 'GENEVA',
  destinationCountry: 'CH',
  now: friMorningZurich,
  rules: DEFAULT_DELIVERY_RULES,
  holidays: DEFAULT_HOLIDAYS,
  countryGroups: DEFAULT_COUNTRY_GROUPS
});

assert(ex1.isAllowed === true, 'Example 1 is allowed');
assert(ex1.dispatchDate === '2026-10-09', `Example 1 dispatchDate is Fri 9 Oct (got ${ex1.dispatchDate})`);
assert(ex1.earliestDate === '2026-10-12', `Example 1 earliestDate is Mon 12 Oct (got ${ex1.earliestDate})`);
assert(ex1.latestDate === '2026-10-13', `Example 1 latestDate is Tue 13 Oct (got ${ex1.latestDate})`);
assert(ex1.displayDate === '2026-10-13', `Example 1 displayDate is Tue 13 Oct (got ${ex1.displayDate})`);
assert(ex1.cutoffPassed === false, 'Example 1 cutoff not passed');
assert(ex1.orderByTime !== null && ex1.orderByTime?.hours === 4, `Example 1 order within 4h (got ${ex1.orderByTime?.hours})`);

// 2. Worked Example 2: GENEVA -> CH, Fri 9 Oct 2026 at 15:00 Zurich (cutoff 14:00 passed!)
// 15:00 Zurich = 13:00 UTC
const friAfternoonZurich = new Date(Date.UTC(2026, 9, 9, 13, 0, 0));

const ex2 = estimateDelivery({
  origin: 'GENEVA',
  destinationCountry: 'CH',
  now: friAfternoonZurich,
  rules: DEFAULT_DELIVERY_RULES,
  holidays: DEFAULT_HOLIDAYS,
  countryGroups: DEFAULT_COUNTRY_GROUPS
});

assert(ex2.isAllowed === true, 'Example 2 is allowed');
assert(ex2.cutoffPassed === true, 'Example 2 cutoff passed');
assert(ex2.dispatchDate === '2026-10-12', `Example 2 dispatchDate is Mon 12 Oct (got ${ex2.dispatchDate})`);
assert(ex2.earliestDate === '2026-10-13', `Example 2 earliestDate is Tue 13 Oct (got ${ex2.earliestDate})`);
assert(ex2.latestDate === '2026-10-14', `Example 2 latestDate is Wed 14 Oct (got ${ex2.latestDate})`);
assert(ex2.displayDate === '2026-10-14', `Example 2 displayDate is Wed 14 Oct (got ${ex2.displayDate})`);

// 3. Worked Example 3: PORTUGAL -> FR (transit 3-4, handling 1), Fri 9 Oct 2026 at 10:00 Lisbon
// Lisbon is UTC+1 in October (WEST)
// 10:00 Lisbon = 09:00 UTC
const friMorningLisbon = new Date(Date.UTC(2026, 9, 9, 9, 0, 0));

const ex3 = estimateDelivery({
  origin: 'PORTUGAL',
  destinationCountry: 'FR',
  now: friMorningLisbon,
  rules: [
    ...DEFAULT_DELIVERY_RULES.filter(r => !(r.origin === 'PORTUGAL' && r.country_code === 'FR')),
    {
      origin: 'PORTUGAL',
      country_code: 'FR',
      shipping_method: null,
      is_allowed: true,
      handling_days: 1,
      cutoff_time: '12:00',
      transit_min_days: 3,
      transit_max_days: 4,
      requires_customs: false,
      customs_buffer_days: 0,
      delivers_saturday: false,
      is_active: true
    }
  ],
  holidays: DEFAULT_HOLIDAYS,
  countryGroups: DEFAULT_COUNTRY_GROUPS
});

assert(ex3.isAllowed === true, 'Example 3 is allowed');
assert(ex3.dispatchDate === '2026-10-12', `Example 3 dispatchDate is Mon 12 Oct (got ${ex3.dispatchDate})`);
assert(ex3.earliestDate === '2026-10-15', `Example 3 earliestDate is Thu 15 Oct (got ${ex3.earliestDate})`);
assert(ex3.latestDate === '2026-10-16', `Example 3 latestDate is Fri 16 Oct (got ${ex3.latestDate})`);
assert(ex3.displayDate === '2026-10-16', `Example 3 displayDate is Fri 16 Oct (got ${ex3.displayDate})`);

// 4. Test Holiday inside transit window
const ex4 = estimateDelivery({
  origin: 'GENEVA',
  destinationCountry: 'CH',
  now: friMorningZurich,
  rules: DEFAULT_DELIVERY_RULES,
  holidays: [
    ...DEFAULT_HOLIDAYS,
    { calendar: 'CH', date: '2026-10-13', name: 'Test Swiss Holiday' }
  ],
  countryGroups: DEFAULT_COUNTRY_GROUPS
});
// Dispatch Fri 9 Oct. Transit 1 = Mon 12 Oct. Tue 13 Oct is Holiday! Transit 2 = Wed 14 Oct!
assert(ex4.latestDate === '2026-10-14', `Holiday inside transit shifts latestDate to Wed 14 Oct (got ${ex4.latestDate})`);

// 5. Test Extra delay days (e.g. peak season strikes +2 days)
const ex5 = estimateDelivery({
  origin: 'GENEVA',
  destinationCountry: 'CH',
  now: friMorningZurich,
  rules: DEFAULT_DELIVERY_RULES,
  holidays: DEFAULT_HOLIDAYS,
  settings: { extra_delay_days: 2 }
});
// Transit 1-2 + 2 extra days = 3 to 4 working days!
// Mon 12 (1), Tue 13 (2), Wed 14 (3), Thu 15 (4)
assert(ex5.latestDate === '2026-10-15', `Extra delay +2 days yields Thu 15 Oct (got ${ex5.latestDate})`);

// 6. Test Blocked / unsupported destination
const ex6 = estimateDelivery({
  origin: 'GENEVA',
  destinationCountry: 'IN', // India
  now: friMorningZurich,
  rules: DEFAULT_DELIVERY_RULES,
  holidays: DEFAULT_HOLIDAYS
});
assert(ex6.isAllowed === false, 'Non-supported destination IN is blocked');

// 7. Test Saturday delivery enabled
const ex7 = estimateDelivery({
  origin: 'GENEVA',
  destinationCountry: 'CH',
  now: friMorningZurich,
  rules: [
    {
      origin: 'GENEVA',
      country_code: 'CH',
      shipping_method: 'saturday_express',
      is_allowed: true,
      handling_days: 0,
      cutoff_time: '14:00',
      transit_min_days: 1,
      transit_max_days: 1,
      requires_customs: false,
      customs_buffer_days: 0,
      delivers_saturday: true,
      is_active: true
    }
  ],
  shippingMethod: 'saturday_express',
  holidays: DEFAULT_HOLIDAYS
});
// Ordered Fri 9 Oct morning -> Transit 1 with Saturday allowed = Sat 10 Oct!
assert(ex7.latestDate === '2026-10-10', `Saturday delivery arrives on Sat 10 Oct (got ${ex7.latestDate})`);

console.log('\nAll 11 assertions passed successfully!');
