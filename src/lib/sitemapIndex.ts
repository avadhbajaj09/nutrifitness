const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nutrifitness.ch';

export function getSitemapIndexXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE}/sitemap/pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${SITE}/sitemap/produits.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${SITE}/sitemap/categories.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${SITE}/sitemap/blog.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${SITE}/sitemap/marques.xml</loc>
  </sitemap>
</sitemapindex>`.trim();
}
