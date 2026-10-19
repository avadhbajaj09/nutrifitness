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

// 1. COMMON in CH -> GENEVA
let result = resolveShipments([createItem('COMMON_ITEM')], 'CH', stockByProduct, rulesByOriginCountry);
assert(result.shipments.length === 1 && result.shipments[0].origin === 'GENEVA', 'COMMON in CH -> GENEVA');

// 2. COMMON in FR -> PORTUGAL
result = resolveShipments([createItem('COMMON_ITEM')], 'FR', stockByProduct, rulesByOriginCountry);
assert(result.shipments.length === 1 && result.shipments[0].origin === 'PORTUGAL', 'COMMON in FR -> PORTUGAL');

// 3. COMMON in UK -> PORTUGAL + requires_customs=true
result = resolveShipments([createItem('COMMON_ITEM')], 'UK', stockByProduct, rulesByOriginCountry);
assert(result.shipments.length === 1 && result.shipments[0].origin === 'PORTUGAL' && result.shipments[0].requiresCustoms === true, 'COMMON in UK -> PORTUGAL + customs');

// 4. GENEVA_ONLY in CH -> GENEVA
result = resolveShipments([createItem('GENEVA_ONLY')], 'CH', stockByProduct, rulesByOriginCountry);
assert(result.shipments.length === 1 && result.shipments[0].origin === 'GENEVA', 'GENEVA_ONLY in CH -> GENEVA');

// 5. GENEVA_ONLY in ES -> blocked COUNTRY_NOT_SUPPORTED
result = resolveShipments([createItem('GENEVA_ONLY')], 'ES', stockByProduct, rulesByOriginCountry);
assert(result.shipments.length === 0 && result.blockedItems.length === 1 && result.blockedItems[0].reason === 'COUNTRY_NOT_SUPPORTED', 'GENEVA_ONLY in ES -> blocked');

// 6. PORTUGAL_ONLY in CH -> PORTUGAL + requires_customs=true
result = resolveShipments([createItem('PORTUGAL_ONLY')], 'CH', stockByProduct, rulesByOriginCountry);
assert(result.shipments.length === 1 && result.shipments[0].origin === 'PORTUGAL' && result.shipments[0].requiresCustoms === true, 'PORTUGAL_ONLY in CH -> PORTUGAL + customs');

// 7. Mixed cart (COMMON+PORTUGAL_ONLY) in CH -> 2 shipments
result = resolveShipments([createItem('COMMON_ITEM'), createItem('PORTUGAL_ONLY')], 'CH', stockByProduct, rulesByOriginCountry);
assert(result.shipments.length === 2 && result.shipments.some(s => s.origin === 'GENEVA') && result.shipments.some(s => s.origin === 'PORTUGAL'), 'Mixed cart in CH -> 2 shipments');

// 8. COMMON in FR, Geneva OOS -> PORTUGAL (correct fallback)
// Wait, if it's OOS in Geneva, it is PORTUGAL_ONLY, so it will go from Portugal anyway.
const tempStock = new Map(stockByProduct);
tempStock.set('COMMON_ITEM', { genevaQty: 0, genevaReserved: 0, portugalQty: 10, portugalReserved: 0 });
result = resolveShipments([createItem('COMMON_ITEM')], 'FR', tempStock, rulesByOriginCountry);
assert(result.shipments.length === 1 && result.shipments[0].origin === 'PORTUGAL', 'COMMON (Geneva OOS) in FR -> PORTUGAL');

// 9. Both OOS -> OUT_OF_STOCK blocked
result = resolveShipments([createItem('OOS_ITEM')], 'CH', stockByProduct, rulesByOriginCountry);
assert(result.shipments.length === 0 && result.blockedItems.length === 1 && result.blockedItems[0].reason === 'OUT_OF_STOCK', 'Both OOS -> OUT_OF_STOCK');

console.log('\nAll tests passed successfully!');
process.exit(0);
