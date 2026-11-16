import assert from 'node:assert/strict';
import robots from '../src/app/robots';
import { getSitemapIndexXml } from '../src/lib/sitemapIndex';

const keys = ['VERCEL_ENV', 'ALLOW_INDEXING', 'NEXT_PUBLIC_SITE_URL', 'ROBOTS_DISALLOW_ALL'] as const;
const saved = Object.fromEntries(keys.map(k => [k, process.env[k]]));
try {
  for (const key of keys) delete process.env[key];
  process.env.NEXT_PUBLIC_SITE_URL = 'https://nutrifitness.ch';
  const prod = robots();
  assert.ok(Array.isArray(prod.rules), 'External production hosting must permit public indexing');
  assert.ok(JSON.stringify(prod.rules).includes('Googlebot'));
  assert.ok(prod.sitemap && JSON.stringify(prod.sitemap).includes('https://nutrifitness.ch/sitemap.xml'));
  process.env.VERCEL_ENV = 'preview';
  assert.deepEqual(robots().rules, { userAgent: '*', disallow: '/' }, 'Vercel previews must not be indexed');
  delete process.env.VERCEL_ENV;
  process.env.NEXT_PUBLIC_SITE_URL = 'https://nutrifitness-preview.vercel.app';
  assert.deepEqual(robots().rules, { userAgent: '*', disallow: '/' }, 'Vercel deployment hostname must not be indexed');
  process.env.NEXT_PUBLIC_SITE_URL = 'https://nutrifitness.ch';
  process.env.ROBOTS_DISALLOW_ALL = 'true';
  assert.deepEqual(robots().rules, { userAgent: '*', disallow: '/' }, 'Explicit staging block must remain supported');
  delete process.env.ROBOTS_DISALLOW_ALL;
  const index = getSitemapIndexXml();
  for (const part of ['pages', 'produits', 'categories', 'blog', 'marques']) {
    assert.ok(index.includes('/sitemap/' + part + '.xml'), 'Missing sitemap segment: ' + part);
  }
  assert.ok(!index.includes('<lastmod>'), 'No fabricated static last-modified date in sitemap index');
  console.log('Robots/indexing and sitemap-index integrity tests passed.');
} finally {
  for (const key of keys) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
}
