import assert from 'node:assert/strict';
import { getProductReviewStats, isEbookItem } from '../src/lib/reviews';

const cases: Array<[string, string]> = [
  ['prod-25430', 'guides-ebooks'],
  ['nf-shaker-600ml', 'accessoires'],
  ['creatine-500g', 'creatine'],
  ['whey-2kg', 'proteines'],
  ['unknown-product', 'other'],
];

for (const [id, category] of cases) {
  const result = getProductReviewStats(id, category);
  assert.equal(result.rating, 0, id + ' should have no invented rating');
  assert.equal(result.count, 0, id + ' should have no invented review count');
  assert.equal(result.stars, '', id + ' should have no invented stars');
  assert.deepEqual(result.reviews, [], id + ' should have no invented testimonials');
}
assert.equal(isEbookItem({ id: 'prod-25430' }), true);
assert.equal(isEbookItem({ id: 'not-an-ebook', categorySlug: 'creatine' }), false);
console.log('Product review provenance gate passed.');
