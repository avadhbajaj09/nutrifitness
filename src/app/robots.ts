// Next.js App Router robots. Staging must block everything.
type Rule = { userAgent: string | string[]; allow?: string | string[]; disallow?: string | string[] };
interface Robots { rules: Rule | Rule[]; sitemap?: string | string[]; host?: string }

export default function robots(): Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nutrifitness.ch';
  if (process.env.VERCEL_ENV !== 'production' && process.env.ALLOW_INDEXING !== 'true') {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/panier', '/commande', '/mon-compte', '/recherche', '/wp-admin', '/wp-admin/', '/api/', '/*?orderby=', '/*?filter_'] },
      { userAgent: ['Googlebot', 'Googlebot-Image', 'Bingbot'], allow: '/' },
      // AI search crawlers: decide with the client. Allowed by default for visibility.
      { userAgent: ['OAI-SearchBot', 'PerplexityBot', 'Google-Extended'], allow: '/' },
    ],
    sitemap: [`${site}/sitemap-index.xml`],
    host: site,
  };
}
