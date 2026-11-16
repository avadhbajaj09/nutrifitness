import { revalidateTag as frameworkRevalidateTag } from 'next/cache';

/**
 * Bridge the Next.js 14 and 16 tag invalidation signatures.
 * Next 16 requires an explicit cacheLife profile. { expire: 0 } preserves
 * the old blocking invalidation behavior for commerce pricing and inventory.
 *
 * Keep this adapter until the complete Next 16 migration is released.
 */
export function revalidateTag(tag: string): void {
  const invalidate = frameworkRevalidateTag as (name: string, options?: { expire: number }) => void;
  invalidate(tag, { expire: 0 });
}
