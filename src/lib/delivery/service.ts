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

  // Try to load current stock from DB for the requested products
  const productIds = Array.from(new Set(items.map(it => it.productId).filter(Boolean)));
  let stockMap = new Map<string, { genevaQty: number; portugalQty: number }>();

  if (productIds.length > 0) {
    try {
      const supabase = getAdminSupabase();
      const { data: stockRows } = await supabase
        .from('fulfillment_stock')
        .select('product_id, origin_id, quantity, reserved_quantity')
        .in('product_id', productIds);

      if (stockRows && stockRows.length > 0) {
        for (const row of stockRows) {
          const pid = row.product_id;
          const curr = stockMap.get(pid) || { genevaQty: 0, portugalQty: 0 };
          const avail = Math.max(0, (row.quantity || 0) - (row.reserved_quantity || 0));
          if (row.origin_id === 'GENEVA') curr.genevaQty = avail;
          if (row.origin_id === 'PORTUGAL') curr.portugalQty = avail;
          stockMap.set(pid, curr);
        }
      }
    } catch {}
  }

  const results: DeliveryEstimateItemResult[] = [];
  let overallLatestDate: string | null = null;

  const isSwissOrLi = country === 'CH' || country === 'LI';

  for (const item of items) {
    const stockInfo = stockMap.get(item.productId);
    let genevaQty = 20;
    let portugalQty = 0;

    if (stockInfo) {
      genevaQty = stockInfo.genevaQty;
      portugalQty = stockInfo.portugalQty;
    } else if (item.shippingOriginHint === 'portugal') {
      genevaQty = 0;
      portugalQty = 25;
    } else if (item.shippingOriginHint === 'common') {
      genevaQty = 20;
      portugalQty = 25;
    } else {
      genevaQty = 20;
      portugalQty = 0;
    }

    const isCommon = genevaQty > 0 && portugalQty > 0;
    const isGenevaOnly = genevaQty > 0 && portugalQty <= 0;
    const isPortugalOnly = portugalQty > 0 && genevaQty <= 0;
    const isBothOOS = genevaQty <= 0 && portugalQty <= 0;

    // Resolve Origin per Part 1 rules
    let resolvedOrigin: OriginId = 'GENEVA';
    let availableStock = 0;

    if (isBothOOS) {
      resolvedOrigin = 'GENEVA';
      availableStock = 0;
    } else if (isCommon) {
      if (isSwissOrLi) {
        resolvedOrigin = 'GENEVA';
        availableStock = genevaQty;
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

    results.push({
      productId: item.productId,
      variantSku: item.variantSku,
      resolvedOrigin,
      isAvailable: true,
      stockStatus: availableStock < 5 ? 'low_stock' : 'in_stock',
      stockCount: availableStock,
      stockPillText: formatStockPill(availableStock, 'fr'),
      estimate,
      displayDates: {
        fr: formatDeliveryPromise(estimate.displayDate, 'fr'),
        en: formatDeliveryPromise(estimate.displayDate, 'en'),
        de: formatDeliveryPromise(estimate.displayDate, 'de')
      },
      shipsFromText: {
        fr: formatShipsFrom(resolvedOrigin, 'fr'),
        en: formatShipsFrom(resolvedOrigin, 'en'),
        de: formatShipsFrom(resolvedOrigin, 'de')
      }
    });
  }

  let overallLatestFormatted = null;
  if (overallLatestDate) {
    overallLatestFormatted = {
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
