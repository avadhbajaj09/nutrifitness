export type SupportedLocale = 'fr' | 'de' | 'it' | 'en';

export type TaxRateCategory = 'food_reduced' | 'standard';

export interface ProductNutrition {
  servingSize: string;
  servingsPerContainer: number;
  energyKj: number;
  energyKcal: number;
  fatG: number;
  saturatedFatG: number;
  carbsG: number;
  sugarsG: number;
  proteinG: number;
  saltG: number;
  bcaaG?: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  gtin13?: string;
  flavorName: Record<SupportedLocale, string>;
  format: string; // e.g. "2 kg"
  priceChf: number;
  inventoryQuantity: number;
  inStock: boolean;
  image?: string;
  stockGeneva?: number;
  stockPortugal?: number;
}

export interface ProductItem {
  id: string;
  gtin13?: string;
  slug: Record<SupportedLocale, string>;
  name: Record<SupportedLocale, string>;
  brand: string;
  categorySlug: string; // Primary category
  categorySlugs?: string[]; // Multiple categories (e.g. ['proteines', 'avant-sport', 'meilleures-ventes', 'nouveautes'])
  taxCategory: TaxRateCategory;
  priceChf: number;
  compareAtPriceChf?: number; // Lowest price in last 30 days if discounted
  images: {
    src: string;
    alt: Record<SupportedLocale, string>;
    width: number;
    height: number;
  }[];
  shortDescription: Record<SupportedLocale, string>;
  directAnswerAeo: Record<SupportedLocale, string>;
  longDescription: Record<SupportedLocale, string>;
  usageInstructions: Record<SupportedLocale, string>;
  ingredients: Record<SupportedLocale, string>;
  allergens: Record<SupportedLocale, string>;
  nutrition: ProductNutrition;
  variants: ProductVariant[];
  isSwissOrigin?: boolean;
  shippingOrigin?: 'switzerland' | 'portugal' | 'common';
  locationType?: 'COMMON' | 'GENEVA_ONLY' | 'PORTUGAL_ONLY';
  mainLocation?: 'GENEVA' | 'PORTUGAL';
  stockGeneva?: number;
  stockPortugal?: number;
  status?: 'published' | 'draft';
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BreadcrumbStep {
  name: string;
  url: string;
}

export function getLocalized(val: Record<SupportedLocale, string> | string | undefined | null, locale: SupportedLocale = 'fr'): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale] || val['fr'] || Object.values(val)[0] || '';
}
