import fs from 'fs';

const filePath = 'src/lib/catalog.ts';
const content = fs.readFileSync(filePath, 'utf8');

const targetIds = new Set([
  'prod-22386',
  'prod-21979',
  'prod-22011',
  'prod-ds-212',
  'prod-24668',
  'prod-21951',
  'prod-21965',
  'prod-ds-198',
  'prod-15582',
  'prod-mv-5733',
  'prod-11269',
  'prod-20464',
  'prod-9526',
  'prod-15217',
  'prod-11389',
  'prod-21724',
  'prod-11296',
  'prod-mv-5639',
  'prod-14341',
  'prod-21032',
  'prod-18593',
  'prod-20531',
  'prod-25535',
  'prod-20353',
  'prod-20727',
  'prod-21419',
  'prod-11806',
  'prod-11328',
  'prod-20370',
  'prod-9378',
  'prod-20358',
  'prod-21727',
  'prod-21650',
  'prod-11379',
  'prod-12992'
]);

const prefixMarker = 'export const PRODUCTS: ProductItem[] = ';
const pStart = content.indexOf(prefixMarker);
if (pStart === -1) {
  throw new Error('Could not find PRODUCTS in catalog.ts');
}

const pEnd = content.lastIndexOf('];');
const beforeProducts = content.slice(0, pStart + prefixMarker.length);
const productsJsonStr = content.slice(pStart + prefixMarker.length, pEnd + 1);
const afterProducts = content.slice(pEnd + 1);

const products = JSON.parse(productsJsonStr);
let updatedCount = 0;

for (const product of products) {
  if (targetIds.has(product.id)) {
    updatedCount++;
    product.shippingOrigin = 'common';
    product.locationType = 'COMMON';
    product.stockGeneva = 25;
    product.stockPortugal = 25;

    if (Array.isArray(product.variants)) {
      for (const variant of product.variants) {
        variant.stockGeneva = 25;
        variant.stockPortugal = 25;
        variant.inStock = true;
      }
    }
  }
}

console.log(`Updated ${updatedCount} products out of ${targetIds.size} target products to COMMON.`);

const newContent = beforeProducts + JSON.stringify(products, null, 2) + afterProducts;
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully updated src/lib/catalog.ts!');
