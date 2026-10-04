export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nutrifitness.ch';
export const SITE_NAME = 'Nutrifitness';
export const LOCALE = 'fr-CH';
export const CURRENCY = 'CHF';

export type JsonLd = Record<string, unknown>;

export interface ProductInput {
  slug: string;
  name: string;            // visible H1
  description: string;     // plain text, same meaning as visible short description
  brand: string;
  images: string[];        // absolute URLs, >= 1500px recommended
  sku?: string;
  gtin?: string;
  mpn?: string;
  price: number;           // must equal visible price
  inStock: boolean;        // must equal visible stock state
  priceValidUntil?: string; // ISO date, only if real
  rating?: { value: number; count: number }; // only from real reviews
  reviews?: { author: string; rating: number; body: string; date: string }[];
  category?: string;
}

export interface CategoryInput { slug: string; name: string; description: string; products: { slug: string; name: string }[]; }
export interface FaqItem { question: string; answer: string; }
export interface Crumb { name: string; path: string; }

export const abs = (path: string): string => (path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`);
