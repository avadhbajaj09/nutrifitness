const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nutrifitness.ch';
const LASTMOD = '2026-10-10T00:00:00.000Z';

export function getSitemapIndexXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE}/sitemap/pages.xml</loc>
    <lastmod>${LASTMOD}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE}/sitemap/produits.xml</loc>
    <lastmod>${LASTMOD}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE}/sitemap/categories.xml</loc>
    <lastmod>${LASTMOD}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE}/sitemap/blog.xml</loc>
    <lastmod>${LASTMOD}</lastmod>
  </sitemap>
</sitemapindex>`.trim();
}
