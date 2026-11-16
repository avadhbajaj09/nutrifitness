import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const canonical = 'https://nutrifitness.ch/faq-geneve-complements-alimentaires-proteines-en-poudre/';
const shortPage = readFileSync('src/app/faq/page.tsx', 'utf8');
const primaryPage = readFileSync('src/app/faq-geneve-complements-alimentaires-proteines-en-poudre/page.tsx', 'utf8');
const view = readFileSync('src/components/FAQView.tsx', 'utf8');
for (const [name, content] of [['short FAQ alias', shortPage], ['primary FAQ', primaryPage]] as const) {
  assert.ok(content.includes(`canonical: '${canonical}'`), `${name}: metadata canonical must match primary URL`);
  assert.ok(content.includes(`canonicalUrl="${canonical}"`), `${name}: JSON-LD canonical prop must match metadata`);
}
assert.ok(view.includes("'mainEntityOfPage': canonicalUrl"), 'FAQ JSON-LD must refer to canonical URL');
assert.ok(view.includes("'inLanguage': 'fr-CH'"), 'FAQ JSON-LD must declare French-Swiss locale');
console.log('FAQ canonical and JSON-LD alignment passed.');
