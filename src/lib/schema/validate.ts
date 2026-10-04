import type { JsonLd } from './types';

/** Fail the build if schema disagrees with visible page data. Use in CI and in the Technical Auditor. */
export function assertProductMatchesPage(schema: JsonLd, visible: { price: number; inStock: boolean; name: string }): string[] {
  const errors: string[] = [];
  const offers = schema.offers as { price?: string; availability?: string } | undefined;
  if (!offers) return ['Product schema has no offers'];
  if (Number(offers.price) !== Number(visible.price.toFixed(2))) errors.push(`Schema price ${offers.price} != visible price ${visible.price}`);
  const schemaIn = offers.availability?.endsWith('InStock') ?? false;
  if (schemaIn !== visible.inStock) errors.push('Schema availability differs from visible stock state');
  if (schema.name !== visible.name) errors.push('Schema name differs from visible H1');
  return errors;
}

export function assertFrench(schema: JsonLd): string[] {
  const lang = schema.inLanguage as string | undefined;
  return lang && lang !== 'fr-CH' ? [`inLanguage is ${lang}, expected fr-CH`] : [];
}
