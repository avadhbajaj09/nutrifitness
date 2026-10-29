import { getAdminSupabase } from '../supabase';
import {
  DeliveryRule,
  CountryGroup,
  HolidayEntry,
  DeliverySettings,
  DeliveryEstimateItemInput,
  DeliveryEstimateItemResult,
  BatchDeliveryEstimatesResponse,
  OriginId
} from './types';
import {
  DEFAULT_DELIVERY_RULES,
  DEFAULT_COUNTRY_GROUPS,
  DEFAULT_HOLIDAYS,
  DEFAULT_DELIVERY_SETTINGS
} from './defaults';
import { estimateDelivery } from './estimate';
import { formatDeliveryPromise, formatShipsFrom, formatStockPill } from './format';

interface CachedDeliveryData {
  rules: DeliveryRule[];
  countryGroups: CountryGroup[];
  holidays: HolidayEntry[];
  settings: DeliverySettings;
  timestamp: number;
}

let cachedData: CachedDeliveryData | null = null;
const CACHE_TTL_MS = 15000; // 15 seconds in memory

export async function getDeliveryData(): Promise<{
  rules: DeliveryRule[];
  countryGroups: CountryGroup[];
  holidays: HolidayEntry[];
  settings: DeliverySettings;
}> {
  const now = Date.now();
  if (cachedData && now - cachedData.timestamp < CACHE_TTL_MS) {
    return cachedData;
  }

  try {
    const supabase = getAdminSupabase();

    const [rulesRes, groupsRes, holidaysRes, settingsRes] = await Promise.all([
      supabase.from('delivery_rules').select('*').eq('is_active', true),
      supabase.from('country_groups').select('*'),
      supabase.from('holidays').select('*'),
      supabase.from('delivery_settings').select('*').eq('id', 'default').single()
    ]);

    const rules: DeliveryRule[] = (rulesRes.data && rulesRes.data.length > 0)
      ? rulesRes.data
      : DEFAULT_DELIVERY_RULES;

    const countryGroups: CountryGroup[] = (groupsRes.data && groupsRes.data.length > 0)
      ? groupsRes.data
      : DEFAULT_COUNTRY_GROUPS;

    const holidays: HolidayEntry[] = (holidaysRes.data && holidaysRes.data.length > 0)
      ? holidaysRes.data.map((h: any) => ({
          calendar: h.calendar,
          date: typeof h.date === 'string' ? h.date.slice(0, 10) : h.date,
          name: h.name
        }))
      : DEFAULT_HOLIDAYS;

    const settings: DeliverySettings = settingsRes.data
      ? { extra_delay_days: settingsRes.data.extra_delay_days || 0, banner_text: settingsRes.data.banner_text || '' }
      : DEFAULT_DELIVERY_SETTINGS;

    cachedData = {
      rules,
      countryGroups,
      holidays,
      settings,
      timestamp: now
    };

    return cachedData;
  } catch (e) {
    console.warn('[getDeliveryData] Falling back to default delivery rules:', e);
    return {
      rules: DEFAULT_DELIVERY_RULES,
      countryGroups: DEFAULT_COUNTRY_GROUPS,
      holidays: DEFAULT_HOLIDAYS,
      settings: DEFAULT_DELIVERY_SETTINGS
    };
  }
}

export function clearDeliveryCache() {
  cachedData = null;
}

/**
 * Resolves stock and fulfilment origin per Part 1 rules
 */
export async function resolveBatchEstimates(
  countryCode: string,
  items: DeliveryEstimateItemInput[],
  now: Date = new Date()
): Promise<BatchDeliveryEstimatesResponse> {
  const country = (countryCode || 'CH').toUpperCase().trim();
  const { rules, countryGroups, holidays, settings } = await getDeliveryData();

  // Try to load current stock and main_location from DB for the requested products
  const productIds = Array.from(new Set(items.map(it => it.productId).filter(Boolean)));
  let stockMap = new Map<string, { genevaQty: number; portugalQty: number }>();
  let locationMap = new Map<string, 'GENEVA' | 'PORTUGAL' | 'COMMON'>();

  if (productIds.length > 0) {
    try {
      const supabase = getAdminSupabase();

      // 1. Fetch main_location from products table
      const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
      const isNumeric = (val: string) => /^\d+$/.test(val);

      const uuidIds = productIds.filter(isUuid);
      const numericIds = productIds
        .map(id => id.replace(/^prod-/, '').trim())
        .filter(isNumeric);
      const rawSlugs = productIds
        .filter(id => !isUuid(id))
        .map(id => id.replace(/^prod-/, '').trim());

      const orClauses: string[] = [];
      if (uuidIds.length > 0) {
        orClauses.push(`id.in.(${uuidIds.map(id => `"${id}"`).join(',')})`);
      }
      if (numericIds.length > 0) {
        orClauses.push(`woo_id.in.(${numericIds.map(id => `"${id}"`).join(',')})`);
      }
      if (rawSlugs.length > 0) {
        orClauses.push(`slug.in.(${rawSlugs.map(id => `"${id}"`).join(',')})`);
      }

      if (orClauses.length > 0) {
        const { data: dbProducts } = await supabase
          .from('products')
          .select(`
            id, woo_id, slug, main_location, stock_geneva, stock_portugal,
            product_variants (id, sku, attribute_value, stock_geneva, stock_portugal)
          `)
          .or(orClauses.join(','));

        if (dbProducts) {
          for (const p of dbProducts) {
            const loc = p.main_location;
            if (loc) {
              if (p.id) locationMap.set(p.id, loc);
              if (p.woo_id) {
                locationMap.set(p.woo_id, loc);
                locationMap.set(`prod-${p.woo_id}`, loc);
              }
              if (p.slug) locationMap.set(p.slug, loc);
            }

            const gQty = Number(p.stock_geneva) || 0;
            const ptQty = Number(p.stock_portugal) || 0;
            const baseStock = { genevaQty: gQty, portugalQty: ptQty };
            if (p.id) stockMap.set(p.id, { ...baseStock });
            if (p.woo_id) {
              stockMap.set(p.woo_id, { ...baseStock });
              stockMap.set(`prod-${p.woo_id}`, { ...baseStock });
            }
            if (p.slug) stockMap.set(p.slug, { ...baseStock });

            if (Array.isArray(p.product_variants)) {
              for (const v of p.product_variants) {
                const vGQty = Number(v.stock_geneva) || 0;
                const vPtQty = Number(v.stock_portugal) || 0;
                const vStock = { genevaQty: vGQty, portugalQty: vPtQty };
                const vIdentifiers = [v.sku, v.attribute_value, v.id].filter(Boolean);
                const pIdentifiers = [p.id, p.woo_id, `prod-${p.woo_id}`, p.slug].filter(Boolean);
                for (const pId of pIdentifiers) {
                  for (const vId of vIdentifiers) {
                    stockMap.set(`${pId}:${String(vId).toLowerCase().trim()}`, vStock);
                  }
                }
              }
            }
          }
        }
      }

      // 2. Fetch fulfillment_stock to overlay any warehouse overrides
      const allDbUuids = Array.from(new Set([
        ...productIds.filter(isUuid),
        ...Array.from(locationMap.keys()).filter(isUuid)
      ]));

      const { data: stockRows } = await supabase
        .from('fulfillment_stock')
        .select('product_id, variant_sku, origin_id, quantity, reserved_quantity')
        .in('product_id', allDbUuids.length > 0 ? allDbUuids : productIds);

      if (stockRows && stockRows.length > 0) {
        for (const row of stockRows) {
          const pid = row.product_id;
          const avail = Math.max(0, (row.quantity || 0) - (row.reserved_quantity || 0));

          // Base product stock
          const curr = stockMap.get(pid) || { genevaQty: 0, portugalQty: 0 };
          if (row.origin_id === 'GENEVA') curr.genevaQty = Math.max(curr.genevaQty, avail);
          if (row.origin_id === 'PORTUGAL') curr.portugalQty = Math.max(curr.portugalQty, avail);
          stockMap.set(pid, curr);

          // Variant specific stock
          if (row.variant_sku) {
            const vKey = `${pid}:${row.variant_sku.toLowerCase().trim()}`;
            const vCurr = stockMap.get(vKey) || { genevaQty: 0, portugalQty: 0 };
            if (row.origin_id === 'GENEVA') vCurr.genevaQty = avail;
            if (row.origin_id === 'PORTUGAL') vCurr.portugalQty = avail;
            stockMap.set(vKey, vCurr);
          }
        }
      }
    } catch {}
  }

  const results: DeliveryEstimateItemResult[] = [];
  let overallLatestDate: string | null = null;

  const isSwissOrLi = country === 'CH' || country === 'LI';

  for (const item of items) {
    const vKey = item.variantSku ? `${item.productId}:${item.variantSku.toLowerCase().trim()}` : null;
    const stockInfo = (vKey ? stockMap.get(vKey) : null) || stockMap.get(item.productId);
    const mainLoc = locationMap.get(item.productId);

    // Authoritative location: DB main_location always takes precedence over client hints
    const effectiveLoc = mainLoc || (
      item.shippingOriginHint === 'portugal' ? 'PORTUGAL' :
      item.shippingOriginHint === 'common' ? 'COMMON' :
      item.shippingOriginHint === 'switzerland' ? 'GENEVA' : undefined
    );

    let genevaQty = stockInfo ? stockInfo.genevaQty : 0;
    let portugalQty = stockInfo ? stockInfo.portugalQty : 0;

    if (effectiveLoc === 'PORTUGAL') {
      genevaQty = 0;
      portugalQty = stockInfo ? stockInfo.portugalQty : 25;
    } else if (effectiveLoc === 'COMMON') {
      genevaQty = stockInfo ? stockInfo.genevaQty : 20;
      portugalQty = stockInfo ? stockInfo.portugalQty : 25;
    } else if (effectiveLoc === 'GENEVA') {
      genevaQty = stockInfo ? stockInfo.genevaQty : 20;
      portugalQty = 0;
    } else if (!stockInfo) {
      genevaQty = 20;
      portugalQty = 0;
    }

    const isCommon = effectiveLoc === 'COMMON' || (genevaQty > 0 && portugalQty > 0);
    const isGenevaOnly = effectiveLoc === 'GENEVA' || (genevaQty > 0 && portugalQty <= 0);
    const isPortugalOnly = effectiveLoc === 'PORTUGAL' || (portugalQty > 0 && genevaQty <= 0);
    const isBothOOS = genevaQty <= 0 && portugalQty <= 0;

    // Resolve Origin per Part 1 rules
    let resolvedOrigin: OriginId = 'GENEVA';
    let availableStock = 0;

    if (isBothOOS) {
      resolvedOrigin = isSwissOrLi ? 'GENEVA' : 'PORTUGAL';
      availableStock = 0;
    } else if (isCommon) {
      if (isSwissOrLi) {
        if (genevaQty > 0) {
          resolvedOrigin = 'GENEVA';
          availableStock = genevaQty;
        } else {
          resolvedOrigin = 'PORTUGAL';
          availableStock = portugalQty;
        }
      } else {
        resolvedOrigin = 'PORTUGAL';
        availableStock = portugalQty;
      }
    } else if (isGenevaOnly) {
      resolvedOrigin = 'GENEVA';
      availableStock = genevaQty;
    } else if (isPortugalOnly) {
      resolvedOrigin = 'PORTUGAL';
      availableStock = portugalQty;
    }

    // Out of Stock state
    if (availableStock <= 0 || isBothOOS) {
      results.push({
        productId: item.productId,
        variantSku: item.variantSku,
        resolvedOrigin,
        isAvailable: false,
        stockStatus: 'out_of_stock',
        stockCount: 0,
        stockPillText: formatStockPill(0, 'fr'),
        estimate: undefined,
        displayDates: null,
        shipsFromText: {
          fr: formatShipsFrom(resolvedOrigin, 'fr'),
          en: formatShipsFrom(resolvedOrigin, 'en'),
          de: formatShipsFrom(resolvedOrigin, 'de')
        }
      });
      continue;
    }

    // Calculate delivery date using pure estimate function
    const estimate = estimateDelivery({
      origin: resolvedOrigin,
      destinationCountry: country,
      now,
      rules,
      holidays,
      settings,
      countryGroups
    });

    if (!estimate.isAllowed) {
      // Product is not available in destination country
      results.push({
        productId: item.productId,
        variantSku: item.variantSku,
        resolvedOrigin,
        isAvailable: false,
        stockStatus: 'out_of_stock',
        stockCount: availableStock,
        stockPillText: {
          fr: 'Non disponible dans votre pays',
          en: 'Not available in your country',
          de: 'In Ihrem Land nicht verfügbar'
        },
        estimate: undefined,
        displayDates: null,
        shipsFromText: {
          fr: formatShipsFrom(resolvedOrigin, 'fr'),
          en: formatShipsFrom(resolvedOrigin, 'en'),
          de: formatShipsFrom(resolvedOrigin, 'de')
        }
      });
      continue;
    }

    // Keep track of overall latest date across items
    if (!overallLatestDate || estimate.latestDate > overallLatestDate) {
      overallLatestDate = estimate.latestDate;
    }

    const isPortugal = resolvedOrigin === 'PORTUGAL';
    const displayDates = isPortugal
      ? {
          fr: 'Livraison en 3–5 jours ouvrables',
          en: 'Delivery in 3–5 business days',
          de: 'Lieferung in 3–5 Werktagen'
        }
      : {
          fr: 'Livraison en 1–2 jours ouvrables',
          en: 'Delivery in 1–2 business days',
          de: 'Lieferung in 1–2 Werktagen'
        };

    results.push({
      productId: item.productId,
      variantSku: item.variantSku,
      resolvedOrigin,
      isAvailable: true,
      stockStatus: availableStock < 5 ? 'low_stock' : 'in_stock',
      stockCount: availableStock,
      stockPillText: formatStockPill(availableStock, 'fr'),
      estimate,
      displayDates,
      shipsFromText: {
        fr: formatShipsFrom(resolvedOrigin, 'fr'),
        en: formatShipsFrom(resolvedOrigin, 'en'),
        de: formatShipsFrom(resolvedOrigin, 'de')
      }
    });
  }

  let overallLatestFormatted = null;
  if (overallLatestDate) {
    const hasPortugalOnly = results.some(r => r.resolvedOrigin === 'PORTUGAL');
    overallLatestFormatted = hasPortugalOnly
      ? {
          fr: 'Livraison en 3–5 jours ouvrables',
          en: 'Delivery in 3–5 business days',
          de: 'Lieferung in 3–5 Werktagen'
        }
      : {
          fr: formatDeliveryPromise(overallLatestDate, 'fr'),
          en: formatDeliveryPromise(overallLatestDate, 'en'),
          de: formatDeliveryPromise(overallLatestDate, 'de')
        };
  }

  return {
    country,
    items: results,
    overallLatestDate,
    overallLatestFormatted,
    extraDelayDays: settings.extra_delay_days,
    bannerText: settings.banner_text
  };
}
