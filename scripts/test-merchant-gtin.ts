import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getProductGtin, isValidGtin } from '../src/lib/seo';

for (const good of ['4006381333931', '036000291452', '96385074']) {
  assert.equal(isValidGtin(good), true, 'Valid GTIN rejected: ' + good);
}
for (const bad of ['4006381333932', '036000291453', '96385075', '1234567890123', '', 'abc', '000000']) {
  assert.equal(isValidGtin(bad), false, 'Invalid GTIN accepted: ' + bad);
}
assert.equal(getProductGtin({ gtin13: '4006381333931' }), '4006381333931');
assert.equal(getProductGtin({ gtin13: '4006381333932', variants: [{ sku: '96385074' }] }), undefined,
  'Numeric retail SKU must never be guessed as a barcode');
assert.equal(getProductGtin({ gtin13: '4006381333931' }, { gtin13: '036000291452' }), '036000291452',
  'Declared variant GTIN has priority');
assert.equal(getProductGtin({ gtin13: '4006381333931' }, { gtin13: '00000001' }), '4006381333931',
  'Invalid variant GTIN should not mask valid parent barcode');

const merchant = readFileSync('src/app/feeds/merchant.xml/route.ts', 'utf8');
assert.ok(!merchant.includes('<g:mpn>'), 'Retail SKUs must not be submitted as manufacturer MPN');
assert.ok(merchant.includes('product.variants?.find(v => v.inStock'), 'Stocked variant should be the featured offer');
console.log('Merchant GTIN and source consistency tests passed.');
