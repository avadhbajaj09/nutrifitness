import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/app/layout.tsx', 'utf8');
const metaBlock = source.split('export const metadata: Metadata = {')[1]?.split('\n};')[0];
assert.ok(metaBlock, 'Global metadata declaration must exist');
assert.match(metaBlock, /Boutique de nutrition sportive à Genève/, 'Business location should remain explicit');
assert.match(metaBlock, /disponibilités/i, 'Availability should be described as product-specific');
assert.doesNotMatch(metaBlock, /100\s*%\s*(?:du\s*)?stock\s*(?:en\s*)?Suisse/i, 'Cannot claim all products ship from Swiss stock');
assert.doesNotMatch(metaBlock, /vitamines certifiées/i, 'Do not imply all vitamins are certified');
assert.doesNotMatch(metaBlock, /livraison\s*1\s*[-à]\s*2\s*jours/i, 'Do not promise one delivery window globally');
assert.doesNotMatch(metaBlock, /livraison\s*(?:gratuite|offerte)\s*dès\s*75/i, 'Do not imply all destinations and origins share one shipping threshold');
assert.match(metaBlock, /locale:\s*'fr_CH'/, 'Preserve French Swiss OpenGraph locale');
assert.match(source, /<html lang="fr-CH"/, 'Preserve HTML language');
console.log('Global SEO metadata factual-accuracy checks passed.');
