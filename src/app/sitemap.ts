import { getAllBlogPosts } from '@/lib/blog';
import { PRODUCTS } from '@/lib/catalog';
import { CATEGORIES_DATA } from '@/lib/categories';
import { getIndexableBrands } from '@/lib/brands';
import { getAdminSupabase } from '@/lib/supabase';

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

async function products(): Promise<Source> {
  try {
    const supabase = getAdminSupabase();
    const { data } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('status', 'published')
      .is('deleted_at', null);

    if (data && data.length > 0) {
      return data.map(p => ({
        slug: p.slug,
        updatedAt: p.updated_at ? new Date(p.updated_at).toISOString() : DEFAULT_PRODUCT_LASTMOD,
      }));
    }
  } catch (err) {
    console.warn('[Sitemap] Supabase products query error:', err);
  }

  return PRODUCTS.filter(p => p.status !== 'draft').map(p => ({
    slug: p.slug.fr,
    updatedAt: DEFAULT_PRODUCT_LASTMOD,
  }));
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
  const map = (rows: Source, base: string, priority: number): Entry[] =>
    rows.map(r => ({ 
      url: `${SITE}${base}${r.slug}/`, 
      lastModified: r.updatedAt, 
      changeFrequency: 'weekly' as const, 
      priority 
    }));

  switch (id) {
    case 'produits': 
      return map(await products(), '/produit/', 0.8);
    case 'categories': 
      return map(await categories(), '/categorie/', 0.9);
    case 'blog': 
      return map(await posts(), '/blog/', 0.75);
    case 'marques':
      return getIndexableBrands().map(b => ({
        url: `${SITE}/marque/${b.slug}/`,
        lastModified: STATIC_PAGES_LASTMOD,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      }));
    default: 
      return [
        '', 
        '/boutique/', 
        '/categorie/',
        '/blog/',
        '/coaching-nutritionnel-personnalise/',
        '/inscription-au-coaching/',
        '/guide-des-complements-alimentaires/',
        '/boutique-geneve/', 
        '/magasin-geneve/',
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
        '/faq/',
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
  }
}
