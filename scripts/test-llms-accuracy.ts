import assert from 'node:assert/strict';
import { GET } from '../src/app/llms.txt/route';
import { CATEGORIES_DATA } from '../src/lib/categories';
import { BLOG_POSTS } from '../src/lib/blog';
import { COMPANY } from '../src/lib/company';

async function main() {
  const response = await GET();
  assert.equal(response.status, 200);
  assert.ok(response.headers.get('content-type')?.includes('text/plain'));
  const content = await response.text();
  assert.ok(content.includes(COMPANY.address.full), 'Official company address should match central configuration');
  assert.ok(content.includes('https://nutrifitness.ch/retours/'), 'Return policy link is available');
  assert.ok(content.includes('https://nutrifitness.ch/livraison/'), 'Shipping policy link is available');
  assert.ok(content.includes('https://nutrifitness.ch/paiement/'), 'Payment information link is available');
  for (const category of CATEGORIES_DATA) {
    assert.ok(content.includes('/categorie/' + category.slug + '/'), 'Category missing: ' + category.slug);
  }
  for (const article of BLOG_POSTS) {
    assert.ok(content.includes('/blog/' + article.slug + '/'), 'Blog link missing: ' + article.slug);
  }
  const unsupportedPromises = [
    /Click & Collect disponible en 2h/i,
    /retrait Click & Collect immédiat/i,
    /garantie.{0,20}99[.,]99\s*%/i,
    /conforme au droit suisse/i,
    /aucun frais de douane caché/i,
    /livraison 24h garantie/i,
    /normes suisses OSAV\s*\/\s*DFI/i,
    /pureté garantie/i,
  ];
  for (const pattern of unsupportedPromises) {
    assert.ok(!pattern.test(content), 'Unverified claim found: ' + pattern);
  }
  assert.ok(content.includes('fiches produits'), 'Product detail pages should remain the source of truth');
  console.log('GEO llms.txt accuracy and link coverage checks passed.');
}
main().catch(error => { console.error(error); process.exit(1); });
