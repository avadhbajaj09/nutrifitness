import { abs, CURRENCY, LOCALE, SITE_NAME, SITE_URL, type Crumb, type CategoryInput, type FaqItem, type JsonLd, type ProductInput } from './types';

export function organization(): JsonLd {
  return {
    '@context': 'https://schema.org', '@type': 'Organization', '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME, url: SITE_URL, logo: abs('/logo.png'),
    sameAs: [] as string[], // add real profiles: Instagram, Facebook, Google Business Profile URL
  };
}

export function website(): JsonLd {
  return {
    '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME,
    inLanguage: LOCALE, publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/recherche?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
  };
}

export interface StoreInput {
  street: string; postalCode: string; city: string; phone: string; image: string;
  geo?: { lat: number; lng: number };
  hours: { days: string[]; opens: string; closes: string }[]; // days like 'Monday'
}
export function localBusiness(s: StoreInput): JsonLd {
  return {
    '@context': 'https://schema.org', '@type': 'Store', '@id': `${SITE_URL}/magasin-geneve/#store`,
    name: SITE_NAME, url: abs('/magasin-geneve/'), image: s.image, telephone: s.phone, priceRange: 'CHF',
    address: { '@type': 'PostalAddress', streetAddress: s.street, postalCode: s.postalCode, addressLocality: s.city, addressCountry: 'CH' },
    ...(s.geo ? { geo: { '@type': 'GeoCoordinates', latitude: s.geo.lat, longitude: s.geo.lng } } : {}),
    openingHoursSpecification: s.hours.map(h => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes })),
  };
}

export function breadcrumbs(items: Crumb[]): JsonLd {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
  };
}

export function faqPage(items: FaqItem[]): JsonLd | null {
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: LOCALE,
    mainEntity: items.map(q => ({ '@type': 'Question', name: q.question, acceptedAnswer: { '@type': 'Answer', text: q.answer } })),
  };
}

export function product(p: ProductInput, shipping?: { cost: number; minDays: number; maxDays: number }, returnDays = 14): JsonLd {
  const url = abs(`/produit/${p.slug}/`);
  return {
    '@context': 'https://schema.org', '@type': 'Product', '@id': `${url}#product`, url, name: p.name, description: p.description,
    image: p.images, brand: { '@type': 'Brand', name: p.brand },
    ...(p.sku ? { sku: p.sku } : {}), ...(p.gtin ? { gtin: p.gtin } : {}), ...(p.mpn ? { mpn: p.mpn } : {}),
    ...(p.category ? { category: p.category } : {}),
    offers: {
      '@type': 'Offer', url, priceCurrency: CURRENCY, price: p.price.toFixed(2),
      availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      ...(p.priceValidUntil ? { priceValidUntil: p.priceValidUntil } : {}),
      seller: { '@id': `${SITE_URL}/#organization` },
      ...(shipping ? { shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: shipping.cost.toFixed(2), currency: CURRENCY },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'CH' },
        deliveryTime: { '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: shipping.minDays, maxValue: shipping.maxDays, unitCode: 'DAY' } },
      } } : {}),
      hasMerchantReturnPolicy: { '@type': 'MerchantReturnPolicy', applicableCountry: 'CH', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: returnDays, returnMethod: 'https://schema.org/ReturnByMail' },
    },
    ...(p.rating && p.rating.count > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating.value, reviewCount: p.rating.count } } : {}),
    ...(p.reviews && p.reviews.length ? { review: p.reviews.map(r => ({ '@type': 'Review', author: { '@type': 'Person', name: r.author }, datePublished: r.date, reviewBody: r.body, reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 } })) } : {}),
  };
}

export function categoryItemList(c: CategoryInput): JsonLd {
  return {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.name, description: c.description, url: abs(`/categorie/${c.slug}/`), inLanguage: LOCALE,
    mainEntity: { '@type': 'ItemList', itemListElement: c.products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/produit/${p.slug}/`), name: p.name })) },
  };
}

export function article(a: { slug: string; title: string; description: string; image: string; author: string; published: string; modified: string }): JsonLd {
  const url = abs(`/blog/${a.slug}/`);
  return {
    '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': `${url}#article`, mainEntityOfPage: url, headline: a.title, description: a.description,
    image: a.image, inLanguage: LOCALE, datePublished: a.published, dateModified: a.modified,
    author: { '@type': 'Person', name: a.author }, publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

/** Render several JSON-LD objects for a <script type="application/ld+json"> tag. */
export function toScript(...nodes: (JsonLd | null)[]): string {
  return JSON.stringify(nodes.filter(Boolean));
}
