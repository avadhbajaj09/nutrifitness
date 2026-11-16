// Next.js App Router robots. Staging must block everything.
type Rule = { userAgent: string | string[]; allow?: string | string[]; disallow?: string | string[] };
interface Robots { rules: Rule | Rule[]; sitemap?: string | string[]; host?: string }

const PRIVATE_DISALLOWS = [
  '/panier',
  '/commande',
  '/compte',
  '/my-account',
  '/mon-compte',
  '/recherche',
  '/wp-admin',
  '/wp-admin/',
  '/api/',
  '/*?orderby=',
  '/*?filter_',
];

const AI_USER_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Google-Extended',
];

export default function robots(): Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nutrifitness.ch';
  // Hosting-neutral indexing guard: production outside Vercel must not accidentally
  // return "Disallow: /" just because VERCEL_ENV is undefined.
  const isPreview = process.env.VERCEL_ENV === 'preview' ||
    process.env.VERCEL_ENV === 'development' ||
    site.includes('.vercel.app');
  const blockAll = process.env.ROBOTS_DISALLOW_ALL === 'true' ||
    (isPreview && process.env.ALLOW_INDEXING !== 'true');
  if (blockAll) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  const aiRules: Rule[] = AI_USER_AGENTS.map(agent => ({
    userAgent: agent,
    allow: '/',
    disallow: PRIVATE_DISALLOWS,
  }));

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_DISALLOWS,
      },
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Bingbot'],
        allow: '/',
        disallow: PRIVATE_DISALLOWS,
      },
      ...aiRules,
    ],
    sitemap: [`${site}/sitemap.xml`],
    host: site,
  };
}
