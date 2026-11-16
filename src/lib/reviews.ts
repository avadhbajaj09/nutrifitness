/**
 * Review provenance safety gate.
 *
 * The previous implementation generated product ratings, counts and "verified"
 * testimonials deterministically from product IDs and category templates.
 * Such values are not customer feedback and must not appear as genuine reviews.
 *
 * No verified, product-linked review source is wired to this module yet.
 * Return the absence of reviews until a validated source is integrated.
 */
export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  verified: boolean;
  title: string;
  comment: string;
}

export interface ProductReviewStats {
  rating: number;
  count: number;
  stars: string;
  reviews: CustomerReview[];
}

/** No synthetic stars, ratings, review counts or testimonial content. */
export function getProductReviewStats(
  _productId: string | number,
  _categorySlug?: string,
  _slug?: string
): ProductReviewStats {
  return { rating: 0, count: 0, stars: '', reviews: [] };
}

/**
 * Checks if a product or item is an Ebook (digital downloadable product).
 */
export function isEbookItem(productOrItem: any): boolean {
  if (!productOrItem) return false;
  const id = String(productOrItem.id || productOrItem.slug || '');
  const cat = String(productOrItem.categorySlug || '');
  const name = String(productOrItem.name?.fr || productOrItem.name || '').toLowerCase();
  const slug = String(productOrItem.slug?.fr || productOrItem.slug || '').toLowerCase();

  return (
    id === 'prod-25430' ||
    cat === 'guides-ebooks' ||
    productOrItem.isEbook === true ||
    slug === 'le-guide-ultime-des-complements' ||
    name.includes('guide ultime') ||
    name.includes('ebook') ||
    slug.includes('guide-ultime')
  );
}
