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
  const name = productName.replace(/\s+/g, ' ').trim();
  const suffix = ' | NutriFitness Suisse';
  // Product identity (including pack size) is more important than a rigid character limit.
  return name.length + suffix.length <= 68 ? name + suffix : name + ' | NutriFitness';
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
  const candidate = (variant ? variant.gtin13 : product.gtin13)?.trim();
  if (!candidate || !/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(candidate) || /^0+$/.test(candidate)) return undefined;
  const digits = candidate.split('').map(Number);
  const check = digits.pop();
  const sum = digits.reverse().reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check ? candidate : undefined;
}
