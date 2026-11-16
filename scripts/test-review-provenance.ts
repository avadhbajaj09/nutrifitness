import assert from 'node:assert/strict';
import { hasGoogleReviewSource, type GoogleReview } from '../src/components/GoogleReviewsSlider';

const base: GoogleReview = {
  id: 'example',
  author: 'Example customer',
  rating: 2,
  date: '2026-01-01',
  text: 'Example',
  verified: true,
};
assert.equal(hasGoogleReviewSource(base), false, 'A boolean flag is not provenance');
assert.equal(hasGoogleReviewSource({ ...base, sourceUrl: 'https://www.google.com/maps/reviews?review=example' }), true, 'A direct Google Maps source may be eligible regardless of star rating');
assert.equal(hasGoogleReviewSource({ ...base, verified: false, sourceUrl: 'https://www.google.com/maps/reviews?review=example' }), false);
for (const url of [
  'https://google.com.evil.test/maps/reviews',
  'http://www.google.com/maps/reviews',
  'https://www.google.com.evil.test/maps/reviews',
  'https://www.google.com/search?q=reviews',
  'javascript:alert(1)',
  'https://evil.test/maps/reviews',
]) {
  assert.equal(hasGoogleReviewSource({ ...base, sourceUrl: url }), false, 'Untrusted URL accepted: ' + url);
}
console.log('Review source validation tests passed');
