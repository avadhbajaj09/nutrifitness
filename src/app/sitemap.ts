import { getAllBlogPosts } from '@/lib/blog';
import { PRODUCTS } from '@/lib/catalog';
import { CATEGORIES_DATA } from '@/lib/categories';

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
  return CATEGORIES_DATA.map(c => ({
    slug: c.slug,
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
        '/categorie/',
        '/blog/',
        '/coaching-nutritionnel-personnalise/',
        '/inscription-au-coaching/',
        '/guide-des-complements-alimentaires/',
        '/boutique-geneve/', 
        '/magasin-geneve/',
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
        '/cookies/',
        '/panier/', 
        '/commande/'
      ].map(p => ({ 
        url: `${SITE}${p}/`.replace(/\/\/$/, '/'), 
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: p === '' ? 1.0 : (p.startsWith('/cgv') || p.startsWith('/mentions') || p.startsWith('/protection') || p.startsWith('/retours') || p.startsWith('/cookies')) ? 0.5 : 0.8 
      }));
  }
}
