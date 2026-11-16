import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getProductFaqs } from '../src/lib/productFaq';
import type { ProductItem } from '../src/lib/types';

const makeProduct = (categorySlug: string, overrides: Record<string, unknown> = {}): ProductItem => ({
  id: 'seo-test-only',
  name: { fr: 'Produit test', de: '', it: '', en: '' },
  categorySlug,
  brand: 'Marque test',
  nutrition: {
    servingSize: '',
    servingsPerContainer: '',
    proteinG: 0,
    energyKcal: 0,
  },
  ingredients: { fr: '', de: '', it: '', en: '' },
  allergens: { fr: '', de: '', it: '', en: '' },
  usageInstructions: { fr: '', de: '', it: '', en: '' },
  ...overrides,
} as unknown as ProductItem);

// Missing data must not become made-up amounts, assurances or product certifications.
const unknown = getProductFaqs(makeProduct('proteines'));
const unknownText = unknown.map(f => f.answer).join(' ').toLowerCase();
assert.ok(unknown.length >= 3);
assert.ok(unknown.some(f => f.question.includes('protéines')));
assert.ok(!unknownText.includes('0 g de protéines'));
assert.ok(!unknownText.includes('aucun allergène majeur'));
assert.ok(!unknownText.includes('revendeur agréé'));
assert.ok(!unknownText.includes('sous 2h'));

// Accurate product-specific data may be included, while the label remains authoritative.
const measured = getProductFaqs(makeProduct('proteines', {
  nutrition: { servingSize: '30 g', proteinG: 24, energyKcal: 115 },
  ingredients: { fr: 'Protéines de lactosérum, cacao', de: '', it: '', en: '' },
  allergens: { fr: 'Lait', de: '', it: '', en: '' },
}));
const measuredText = measured.map(f => f.answer).join(' ');
assert.ok(measuredText.includes('24 g de protéines'));
assert.ok(measuredText.includes('Protéines de lactosérum, cacao'));
assert.ok(measuredText.includes('Lait'));

const creatine = getProductFaqs(makeProduct('creatine'));
const creatineText = creatine.map(f => f.answer).join(' ').toLowerCase();
assert.ok(!creatineText.includes('pureté garantie'));
assert.ok(!creatineText.includes('rétention intramusculaire'));
assert.ok(creatine.some(f => f.question.includes('Comment utiliser')));

// Schema.org shippingDestination expects ISO 3166-1 alpha-2 country codes.
// The UK is represented as GB, not UK, in machine-readable country identifiers.
const productPageSource = readFileSync('src/app/produit/[slug]/page.tsx', 'utf8');
assert.ok(productPageSource.includes("'GB', 'NO', 'IS'"), 'Product shipping schema should use ISO GB');
assert.ok(!productPageSource.includes("'UK', 'NO', 'IS'"), 'UK is not an ISO 3166-1 alpha-2 code');

console.log('Product FAQ and shipping schema integrity checks passed.');
