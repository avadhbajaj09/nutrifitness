import { resolveShipments } from '../routing';
import { StockInfo, CountryRule, CartItemForRouting } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('Running Routing Engine Tests...\n');

const stockByProduct = new Map<string, StockInfo>();
stockByProduct.set('COMMON_ITEM', { genevaQty: 10, genevaReserved: 0, portugalQty: 10, portugalReserved: 0 });
stockByProduct.set('GENEVA_ONLY', { genevaQty: 10, genevaReserved: 0, portugalQty: 0, portugalReserved: 0 });
stockByProduct.set('PORTUGAL_ONLY', { genevaQty: 0, genevaReserved: 0, portugalQty: 10, portugalReserved: 0 });
stockByProduct.set('OOS_ITEM', { genevaQty: 0, genevaReserved: 0, portugalQty: 0, portugalReserved: 0 });

const rulesByOriginCountry = new Map<string, CountryRule>();
rulesByOriginCountry.set('GENEVA:CH', { originId: 'GENEVA', countryCode: 'CH', isAllowed: true, preferredForCommon: true, etaMin: 1, etaMax: 3, requiresCustoms: false });
rulesByOriginCountry.set('PORTUGAL:CH', { originId: 'PORTUGAL', countryCode: 'CH', isAllowed: true, preferredForCommon: false, etaMin: 4, etaMax: 8, requiresCustoms: true });
rulesByOriginCountry.set('GENEVA:FR', { originId: 'GENEVA', countryCode: 'FR', isAllowed: true, preferredForCommon: false, etaMin: 1, etaMax: 3, requiresCustoms: false });
rulesByOriginCountry.set('PORTUGAL:FR', { originId: 'PORTUGAL', countryCode: 'FR', isAllowed: true, preferredForCommon: true, etaMin: 3, etaMax: 7, requiresCustoms: false });
rulesByOriginCountry.set('GENEVA:UK', { originId: 'GENEVA', countryCode: 'UK', isAllowed: false, preferredForCommon: false, etaMin: 1, etaMax: 3, requiresCustoms: false });
rulesByOriginCountry.set('PORTUGAL:UK', { originId: 'PORTUGAL', countryCode: 'UK', isAllowed: true, preferredForCommon: true, etaMin: 5, etaMax: 10, requiresCustoms: true });
rulesByOriginCountry.set('GENEVA:ES', { originId: 'GENEVA', countryCode: 'ES', isAllowed: false, preferredForCommon: false, etaMin: 1, etaMax: 3, requiresCustoms: false });
rulesByOriginCountry.set('PORTUGAL:ES', { originId: 'PORTUGAL', countryCode: 'ES', isAllowed: true, preferredForCommon: true, etaMin: 3, etaMax: 7, requiresCustoms: false });


const createItem = (id: string): CartItemForRouting => ({ productId: id, variantSku: 'def', quantity: 1, priceChf: 10, name: id });

// 1. Order in CH -> PORTUGAL with customs
let result = resolveShipments([createItem('ITEM_1')], 'CH', stockByProduct, rulesByOriginCountry);
assert(result.shipments.length === 1 && result.shipments[0].origin === 'PORTUGAL' && result.shipments[0].requiresCustoms === true, 'Order in CH -> PORTUGAL + customs');

// 2. Order in FR -> PORTUGAL without customs
result = resolveShipments([createItem('ITEM_1')], 'FR', stockByProduct, rulesByOriginCountry);
assert(result.shipments.length === 1 && result.shipments[0].origin === 'PORTUGAL' && result.shipments[0].requiresCustoms === false, 'Order in FR -> PORTUGAL (no customs)');

// 3. Order in UK -> PORTUGAL + requiresCustoms=true
result = resolveShipments([createItem('ITEM_1')], 'UK', stockByProduct, rulesByOriginCountry);
assert(result.shipments.length === 1 && result.shipments[0].origin === 'PORTUGAL' && result.shipments[0].requiresCustoms === true, 'Order in UK -> PORTUGAL + customs');

// 4. Multiple items in CH -> 1 consolidated Portugal shipment (no split)
result = resolveShipments([createItem('ITEM_1'), createItem('ITEM_2')], 'CH', stockByProduct, rulesByOriginCountry);
assert(result.shipments.length === 1 && result.shipments[0].origin === 'PORTUGAL' && result.shipments[0].items.length === 2, 'Multiple items in CH -> 1 consolidated Portugal shipment');

// 5. Delivery ETA is 3-5 days
assert(result.shipments[0].etaMin === 3 && result.shipments[0].etaMax === 5, 'Delivery ETA is 3-5 days');

// 6. Free shipping threshold is 75 for CH, 120 for EU
assert(result.shipments[0].freeShippingThreshold === 75, 'Free shipping threshold is 75 for CH');
const euResult = resolveShipments([createItem('ITEM_1')], 'FR', stockByProduct, rulesByOriginCountry);
assert(euResult.shipments[0].freeShippingThreshold === 120, 'Free shipping threshold is 120 for EU');

console.log('\nAll routing tests passed successfully!');
process.exit(0);
