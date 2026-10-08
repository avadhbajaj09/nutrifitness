import { getAdminSupabase } from './supabase';
import { PRODUCTS } from './catalog';
import type { ProductItem } from './types';

let cachedHiddenSlugs: Set<string> | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5000; // 5 seconds cache in memory

export async function getHiddenProductSlugs(): Promise<Set<string>> {
  const now = Date.now();
  if (cachedHiddenSlugs && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedHiddenSlugs;
  }

  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('slug, id, sku')
      .or('status.eq.draft,deleted_at.not.is.null');

    if (error || !data) {
      return cachedHiddenSlugs || new Set();
    }

    const hidden = new Set<string>();
    for (const p of data) {
      if (p.slug) hidden.add(p.slug.toLowerCase().trim());
      if (p.id) hidden.add(p.id);
      if (p.sku) hidden.add(p.sku.toLowerCase().trim());
    }

    cachedHiddenSlugs = hidden;
    lastFetchTime = now;
    return hidden;
  } catch (e) {
    console.warn('[getHiddenProductSlugs] Supabase fetch error:', e);
    return cachedHiddenSlugs || new Set();
  }
}

export function clearHiddenProductsCache() {
  cachedHiddenSlugs = null;
  lastFetchTime = 0;
}

export async function getVisibleProducts(): Promise<ProductItem[]> {
  const hidden = await getHiddenProductSlugs();
  if (hidden.size === 0) return PRODUCTS;

  return PRODUCTS.filter(p => {
    const slugFr = p.slug?.fr ? p.slug.fr.toLowerCase().trim() : '';
    const id = p.id || '';
    const sku = p.variants?.[0]?.sku ? p.variants[0].sku.toLowerCase().trim() : '';
    return !hidden.has(slugFr) && !hidden.has(id) && (!sku || !hidden.has(sku));
  });
}
