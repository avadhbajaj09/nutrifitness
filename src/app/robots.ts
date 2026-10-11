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
  if (process.env.VERCEL_ENV !== 'production' && process.env.ALLOW_INDEXING !== 'true') {
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
