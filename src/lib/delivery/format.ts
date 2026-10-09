/**
 * Delivery Promise & Stock Text Localization Formatters
 */

export function formatDeliveryPromise(dateStr: string, locale: 'fr' | 'en' | 'de' = 'fr'): string {
  if (!dateStr || !dateStr.includes('-')) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));

  if (locale === 'fr') {
    const formatted = new Intl.DateTimeFormat('fr-CH', {
      timeZone: 'UTC',
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(date);
    return `Livraison d'ici le ${formatted}`;
  }

  if (locale === 'de') {
    const formatted = new Intl.DateTimeFormat('de-CH', {
      timeZone: 'UTC',
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(date);
    return `Lieferung bis ${formatted}`;
  }

  // English default
  const formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(date);
  return `Get it by ${formatted}`;
}

export function formatShipsFrom(origin: 'GENEVA' | 'PORTUGAL', locale: 'fr' | 'en' | 'de' = 'fr'): string {
  if (origin === 'GENEVA') {
    if (locale === 'fr') return 'Expédié de Genève';
    if (locale === 'de') return 'Versand aus Genf';
    return 'Ships from Geneva';
  } else {
    if (locale === 'fr') return 'Expédié du Portugal';
    if (locale === 'de') return 'Versand aus Portugal';
    return 'Ships from Portugal';
  }
}

export function formatStockPill(
  quantity: number,
  locale: 'fr' | 'en' | 'de' = 'fr'
): { fr: string; en: string; de: string; status: 'in_stock' | 'low_stock' | 'out_of_stock' } {
  if (quantity <= 0) {
    return {
      status: 'out_of_stock',
      fr: 'Rupture de stock',
      en: 'Out of stock',
      de: 'Nicht vorrätig'
    };
  }

  if (quantity < 5) {
    return {
      status: 'low_stock',
      fr: 'Stock limité – vite épuisé',
      en: 'Few items left – selling fast',
      de: 'Geringer Bestand – fast ausverkauft'
    };
  }

  return {
    status: 'in_stock',
    fr: 'En stock',
    en: 'In stock',
    de: 'Auf Lager'
  };
}
