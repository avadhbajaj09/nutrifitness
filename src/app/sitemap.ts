import { getAllBlogPosts } from '@/lib/blog';
import { PRODUCTS } from '@/lib/catalog';
import { CATEGORIES_DATA } from '@/lib/categories';
import { getIndexableBrands } from '@/lib/brands';
import { getAdminSupabase } from '@/lib/supabase';
// @ts-ignore - redirects.mjs is an ES module
import { getRedirects } from '../../redirects.mjs';

interface Entry { 
  url: string; 
  lastModified?: string | Date; 
  changeFrequency?: 'daily' | 'weekly' | 'monthly'; 
  priority?: number;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nutrifitness.ch';

// Fixed ISO dates defined as constants (avoids new Date() per audit requirements)
export const STATIC_PAGES_LASTMOD = '2026-10-10T00:00:00.000Z';
export const CATEGORIES_LASTMOD = '2026-10-10T00:00:00.000Z';
export const DEFAULT_PRODUCT_LASTMOD = '2026-10-10T00:00:00.000Z';

type Source = { slug: string; updatedAt: string }[];

function getRedirectSources(): Set<string> {
  try {
    const list = getRedirects();
    const set = new Set<string>();
    for (const r of list) {
      if (r && r.source) {
        const clean = r.source.trim();
        set.add(clean);
        set.add(clean.replace(/\/+$/, ''));
        if (!clean.endsWith('/')) {
          set.add(clean + '/');
        }
      }
    }
    return set;
  } catch (err) {
    console.warn('[Sitemap] Could not load redirects:', err);
    return new Set<string>();
  }
}

async function products(): Promise<Source> {
  const redirectSources = getRedirectSources();

  // Valid non-draft products from local catalog that actually resolve to rendered pages
  const validProducts = PRODUCTS.filter(p => p.status !== 'draft');
  const validCatalogMap = new Map<string, typeof PRODUCTS[0]>();
  for (const p of validProducts) {
    if (p.slug && p.slug.fr) {
      validCatalogMap.set(p.slug.fr, p);
    }
  }

  // Load updated_at timestamps from Supabase for freshness if available
  const dbTimestamps = new Map<string, string>();
  try {
    const supabase = getAdminSupabase();
    const { data } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('status', 'published')
      .is('deleted_at', null);

    if (data && data.length > 0) {
      for (const row of data) {
        if (row.slug && row.updated_at) {
          dbTimestamps.set(row.slug, new Date(row.updated_at).toISOString());
        }
      }
    }
  } catch (err) {
    console.warn('[Sitemap] Supabase products query error:', err);
  }

  const results: Source = [];
  const seenSlugs = new Set<string>();

  for (const [slug] of validCatalogMap.entries()) {
    // 1. Skip if slug is a redirect source
    const productPath = `/produit/${slug}/`;
    const productPathNoSlash = `/produit/${slug}`;
    if (redirectSources.has(productPath) || redirectSources.has(productPathNoSlash)) {
      continue;
    }

    // 2. Prevent duplicate slugs
    if (seenSlugs.has(slug)) {
      continue;
    }
    seenSlugs.add(slug);

    const updatedAt = dbTimestamps.get(slug) || DEFAULT_PRODUCT_LASTMOD;
    results.push({ slug, updatedAt });
  }

  return results;
}

async function categories(): Promise<Source> {
  return CATEGORIES_DATA.map(c => ({
    slug: c.slug,
    updatedAt: CATEGORIES_LASTMOD,
  }));
}

async function posts(): Promise<Source> {
  return getAllBlogPosts().map(p => ({
    slug: p.slug,
    updatedAt: `${p.publishedAt}T00:00:00.000Z`,
  }));
}

export async function generateSitemaps(): Promise<{ id: string }[]> {
  return [{ id: 'pages' }, { id: 'produits' }, { id: 'categories' }, { id: 'blog' }, { id: 'marques' }];
}

export default async function sitemap({ id }: { id: string }): Promise<Entry[]> {
  const redirectSources = getRedirectSources();
  const seenUrls = new Set<string>();

  const map = (rows: Source, base: string, priority: number): Entry[] =>
    rows.map(r => ({ 
      url: `${SITE}${base}${r.slug}/`, 
      lastModified: r.updatedAt, 
      changeFrequency: 'weekly' as const, 
      priority 
    }));

  let rawEntries: Entry[];

  switch (id) {
    case 'produits': 
      rawEntries = map(await products(), '/produit/', 0.8);
      break;
    case 'categories': 
      rawEntries = map(await categories(), '/categorie/', 0.9);
      break;
    case 'blog': 
      rawEntries = map(await posts(), '/blog/', 0.75);
      break;
    case 'marques':
      rawEntries = getIndexableBrands()
        .filter(b => b.indexable !== false)
        .map(b => ({
          url: `${SITE}/marque/${b.slug}/`,
          lastModified: STATIC_PAGES_LASTMOD,
          changeFrequency: 'weekly' as const,
          priority: 0.85,
        }));
      break;
    default: 
      rawEntries = [
        '', 
        '/boutique/', 
        '/categorie/',
        '/blog/',
        '/coaching-nutritionnel-personnalise/',
        '/guide-des-complements-alimentaires/',
        '/boutique-geneve/', 
        '/click-and-collect/',
        '/proteines-geneve/',
        '/creatine-geneve/',
        '/complements-alimentaires-geneve/',
        '/livraison/',
        '/paiement/',
        '/marques/',
        '/a-propos/',
        '/contact/',
        '/quel-complement-choisir/',
        '/qualite-conservation/',
        '/sante-securite/',
        '/faq-geneve-complements-alimentaires-proteines-en-poudre/',
        '/mentions-legales/',
        '/cgv/',
        '/protection-donnees/',
        '/retours/',
        '/cookies/'
      ].map(p => ({ 
        url: `${SITE}${p}/`.replace(/\/\/$/, '/'), 
        lastModified: STATIC_PAGES_LASTMOD, 
        changeFrequency: 'weekly' as const, 
        priority: p === '' ? 1.0 : (p.startsWith('/cgv') || p.startsWith('/mentions') || p.startsWith('/protection') || p.startsWith('/retours') || p.startsWith('/cookies')) ? 0.5 : 0.8 
      }));
      break;
  }

  // Filter out any URL that is a redirect source and deduplicate
  return rawEntries.filter(entry => {
    const pathname = entry.url.replace(/^https?:\/\/[^\/]+/, '');
    const cleanPath = pathname.replace(/\/+$/, '');

    if (redirectSources.has(pathname) || redirectSources.has(cleanPath) || redirectSources.has(cleanPath + '/')) {
      return false;
    }

    if (seenUrls.has(entry.url)) {
      return false;
    }
    seenUrls.add(entry.url);

    return true;
  });
}
