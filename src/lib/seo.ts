/**
 * SEO metadata helpers for NutriFitness.ch
 * Ensures search engine title and description constraints:
 * - Title <= 60 chars (word boundary clamped)
 * - Description <= 155 chars (word boundary clamped)
 * - Product title: "<Product name> | NutriFitness" (price excluded)
 */

export function clampText(text: string, maxLen: number): string {
  if (!text) return '';
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLen) return trimmed;

  const sub = trimmed.slice(0, maxLen);
  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace > 0) {
    return sub.slice(0, lastSpace).replace(/[,;:.!?-]+$/, '').trim();
  }
  return sub.trim();
}

export function formatProductMetaTitle(productName: string): string {
  const suffix = ' | NutriFitness';
  const maxNameLen = 60 - suffix.length; // 45 chars
  const clampedName = clampText(productName, maxNameLen);
  return `${clampedName}${suffix}`;
}

export function formatMetaTitle(title: string): string {
  return clampText(title, 60);
}

export function formatMetaDescription(description: string): string {
  return clampText(description, 155);
}

/**
 * Returns a valid GTIN/EAN if available on the product or variant, or undefined.
 */
export function getProductGtin(
  product: { gtin13?: string; variants?: { sku?: string; gtin13?: string }[] },
  variant?: { sku?: string; gtin13?: string }
): string | undefined {
  if (variant?.gtin13 && variant.gtin13.trim()) return variant.gtin13.trim();
  if (product.gtin13 && product.gtin13.trim()) return product.gtin13.trim();

  const sku = variant?.sku || product.variants?.[0]?.sku;
  if (sku) {
    const cleanSku = sku.trim();
    if (/^\d{8}$|^\d{12,14}$/.test(cleanSku)) {
      return cleanSku;
    }
  }
  return undefined;
}

