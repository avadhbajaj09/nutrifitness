import type { ProductItem, SupportedLocale } from './types';

/**
 * Normalizes a string for fast, accent-insensitive, punctuation-insensitive search matching.
 * e.g. "Créatine Monohydrate (300g)" -> "creatine monohydrate 300g"
 * e.g. "Pre-Workout" -> "pre workout"
 */
export function normalizeSearchString(str: string = ''): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics / accents
    .replace(/[^a-z0-9]/g, ' ')      // remove non-alphanumeric (hyphens, slashes, apostrophes, etc.)
    .replace(/\s+/g, ' ')           // collapse multiple spaces
    .trim();
}

/**
 * Searches and scores products against a multi-token query.
 * Matches across:
 * - Product localized name (fr, en, de, it)
 * - Brand
 * - Category slug / category name
 * - Product slug
 * - Short description
 * - Variant flavors, SKUs, and barcodes
 *
 * Returns sorted products by relevance score descending.
 */
export function searchProducts(
  products: ProductItem[],
  query: string,
  locale: SupportedLocale = 'fr'
): ProductItem[] {
  if (!query || !query.trim()) {
    return products;
  }

  const normalizedQuery = normalizeSearchString(query);
  if (!normalizedQuery) {
    return products;
  }

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  if (tokens.length === 0) {
    return products;
  }

  const scored: { product: ProductItem; score: number }[] = [];

  for (const p of products) {
    const nameCurrent = (typeof p.name === 'object' ? (p.name[locale] || p.name.fr) : p.name) || '';
    const normNameCurrent = normalizeSearchString(nameCurrent);

    const allNames = typeof p.name === 'object' 
      ? Object.values(p.name).join(' ') 
      : (p.name || '');
    const normAllNames = normalizeSearchString(allNames);

    const brand = p.brand || '';
    const normBrand = normalizeSearchString(brand);

    const category = p.categorySlug || '';
    const normCategory = normalizeSearchString(category);

    const slugs = typeof p.slug === 'object' 
      ? Object.values(p.slug).join(' ') 
      : (p.slug || '');
    const normSlugs = normalizeSearchString(slugs);

    const desc = typeof p.shortDescription === 'object'
      ? Object.values(p.shortDescription).join(' ')
      : (p.shortDescription || '');
    const normDesc = normalizeSearchString(desc);

    const variantTokens: string[] = [];
    if (Array.isArray(p.variants)) {
      for (const v of p.variants) {
        if (v.flavorName) {
          if (typeof v.flavorName === 'object' && v.flavorName !== null) {
            variantTokens.push(...Object.values(v.flavorName).map(String));
          } else {
            variantTokens.push(String(v.flavorName));
          }
        }
        if ((v as any).flavor) {
          if (typeof (v as any).flavor === 'object' && (v as any).flavor !== null) {
            variantTokens.push(...Object.values((v as any).flavor).map(String));
          } else {
            variantTokens.push(String((v as any).flavor));
          }
        }
        if (v.sku) variantTokens.push(v.sku);
        if (v.gtin13) variantTokens.push(v.gtin13);
      }
    }
    const normVariants = normalizeSearchString(variantTokens.join(' '));

    // Full searchable text
    const fullHaystack = `${normAllNames} ${normBrand} ${normCategory} ${normSlugs} ${normDesc} ${normVariants}`;

    // Every token in user query must appear somewhere in the haystack
    const matchesAll = tokens.every(token => fullHaystack.includes(token));
    if (!matchesAll) {
      continue;
    }

    // Compute relevance score
    let score = 0;

    // Exact matches
    if (normNameCurrent === normalizedQuery) score += 1000;
    else if (normNameCurrent.startsWith(normalizedQuery)) score += 600;
    else if (normNameCurrent.includes(normalizedQuery)) score += 400;

    // Brand matches
    if (normBrand === normalizedQuery) score += 500;
    else if (normBrand.startsWith(normalizedQuery)) score += 300;
    else if (normBrand.includes(normalizedQuery)) score += 200;

    // All tokens present in the current product title
    const allInTitle = tokens.every(t => normNameCurrent.includes(t));
    if (allInTitle) score += 250;

    // All tokens present across brand + title
    const allInBrandTitle = tokens.every(t => `${normBrand} ${normNameCurrent}`.includes(t));
    if (allInBrandTitle) score += 150;

    // Category matches
    if (normCategory.includes(normalizedQuery)) score += 100;

    // Variant / flavor matches
    if (normVariants.includes(normalizedQuery)) score += 80;

    // Bonus for in-stock products
    if (p.inStock !== false) score += 30;

    scored.push({ product: p, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.product);
}
