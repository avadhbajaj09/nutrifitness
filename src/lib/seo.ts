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
 * Check GS1 GTIN-8, UPC-A (GTIN-12), EAN-13 and GTIN-14 check digits.
 * A retailer SKU is not a manufacturer-issued GTIN even if it is numeric.
 */
export function isValidGtin(candidate: string | undefined | null): boolean {
  if (!candidate || !/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(candidate)) return false;
  let sum = 0;
  let weight = 3;
  for (let i = candidate.length - 2; i >= 0; i--) {
    sum += Number(candidate[i]) * weight;
    weight = weight === 3 ? 1 : 3;
  }
  return ((10 - (sum % 10)) % 10) === Number(candidate[candidate.length - 1]);
}

/** Only expose explicitly supplied, checksum-valid manufacturer GTINs. */
export function getProductGtin(
  product: { gtin13?: string; variants?: { sku?: string; gtin13?: string }[] },
  variant?: { sku?: string; gtin13?: string }
): string | undefined {
  const candidate = [variant?.gtin13, product.gtin13, ...(variant ? [] : [product.variants?.[0]?.gtin13])]
    .map(value => value?.trim())
    .find(value => isValidGtin(value));
  return candidate || undefined;
}
