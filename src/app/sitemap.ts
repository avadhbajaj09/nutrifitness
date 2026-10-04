import { getAllBlogPosts } from '@/lib/blog';
import { PRODUCTS, CATEGORIES } from '@/lib/catalog';

interface Entry { 
  url: string; 
  lastModified?: string | Date; 
  changeFrequency?: 'daily' | 'weekly' | 'monthly'; 
  priority?: number;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nutrifitness.ch';

type Source = { slug: string; updatedAt: string }[];

async function products(): Promise<Source> {
  return PRODUCTS.map(p => ({
    slug: p.slug.fr,
    updatedAt: new Date().toISOString(),
  }));
}

async function categories(): Promise<Source> {
  return CATEGORIES.map(c => ({
    slug: c.slug.fr,
    updatedAt: new Date().toISOString(),
  }));
}

async function posts(): Promise<Source> {
  return getAllBlogPosts().map(p => ({
    slug: p.slug,
    updatedAt: `${p.publishedAt}T00:00:00.000Z`,
  }));
}

export async function generateSitemaps(): Promise<{ id: string }[]> {
  return [{ id: 'pages' }, { id: 'produits' }, { id: 'categories' }, { id: 'blog' }];
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
    default: 
      return [
        '', 
        '/boutique/', 
        '/blog/',
        '/coaching-nutritionnel-personnalise/',
        '/guide-des-complements-alimentaires/',
        '/boutique-geneve/', 
        '/panier/', 
        '/commande/'
      ].map(p => ({ 
        url: `${SITE}${p}/`.replace(/\/\/$/, '/'), 
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: p === '' ? 1.0 : 0.8 
      }));
  }
}
