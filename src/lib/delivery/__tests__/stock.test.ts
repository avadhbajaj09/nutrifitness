import { formatStockPill } from '../format';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

console.log('Running Storefront Stock Pill Formatting Tests...\n');

// 1. Stock >= 5: Display generic in stock, NEVER quantities
const stock25 = formatStockPill(25, 'fr');
assert(stock25.status === 'in_stock', '25 items is in_stock');
assert(stock25.fr === 'En stock', `fr should be "En stock", got "${stock25.fr}"`);
assert(stock25.en === 'In stock', `en should be "In stock", got "${stock25.en}"`);
assert(stock25.de === 'Auf Lager', `de should be "Auf Lager", got "${stock25.de}"`);
assert(!/\d/.test(stock25.fr), 'fr must not contain digits');
assert(!/\d/.test(stock25.en), 'en must not contain digits');
assert(!/\d/.test(stock25.de), 'de must not contain digits');

const stock5 = formatStockPill(5, 'fr');
assert(stock5.status === 'in_stock', '5 items is in_stock');
assert(stock5.fr === 'En stock', `5 items fr is "En stock", got "${stock5.fr}"`);

// 2. Stock < 5 (1 to 4): Scarcity text, NEVER quantities
for (const qty of [1, 2, 3, 4]) {
  const pill = formatStockPill(qty, 'fr');
  assert(pill.status === 'low_stock', `${qty} items has status low_stock`);
  assert(pill.fr === 'Stock limité – vite épuisé', `${qty} items fr scarcity text`);
  assert(pill.en === 'Few items left – selling fast', `${qty} items en scarcity text`);
  assert(pill.de === 'Geringer Bestand – fast ausverkauft', `${qty} items de scarcity text`);
  assert(!/\d/.test(pill.fr), `${qty} items fr must not expose quantity digits`);
  assert(!/\d/.test(pill.en), `${qty} items en must not expose quantity digits`);
  assert(!/\d/.test(pill.de), `${qty} items de must not expose quantity digits`);
}

// 3. Stock <= 0: Out of stock
const stock0 = formatStockPill(0, 'fr');
assert(stock0.status === 'out_of_stock', '0 items is out_of_stock');
assert(stock0.fr === 'Rupture de stock', '0 items fr is Rupture de stock');
assert(stock0.en === 'Out of stock', '0 items en is Out of stock');
assert(stock0.de === 'Nicht vorrätig', '0 items de is Nicht vorrätig');
assert(!/\d/.test(stock0.fr), '0 items fr must not contain digits');

console.log('\nAll stock pill unit tests passed successfully!');
