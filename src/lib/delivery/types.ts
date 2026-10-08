export type OriginId = 'GENEVA' | 'PORTUGAL';

export interface DeliveryRule {
  id?: string;
  origin: OriginId;
  country_code?: string | null;
  country_group?: string | null;
  shipping_method?: string | null;
  is_allowed: boolean;
  handling_days: number;
  cutoff_time: string; // "14:00", "12:00"
  transit_min_days: number;
  transit_max_days: number;
  requires_customs: boolean;
  customs_buffer_days: number;
  delivers_saturday: boolean;
  is_active: boolean;
  needs_verification?: boolean;
}

export interface CountryGroup {
  code: string;
  name: string;
  countries: string[];
}

export interface HolidayEntry {
  calendar: string; // 'GENEVA', 'PORTUGAL', 'CH', 'FR', etc.
  date: string; // 'YYYY-MM-DD'
  name: string;
}

export interface DeliverySettings {
  extra_delay_days: number;
  banner_text?: string;
}

export interface EstimateDeliveryInput {
  origin: OriginId;
  destinationCountry: string; // ISO 2-letter, e.g. 'CH', 'FR', 'PT'
  shippingMethod?: string | null;
  now?: Date;
  rules: DeliveryRule[];
  holidays?: HolidayEntry[];
  settings?: DeliverySettings;
  countryGroups?: CountryGroup[];
}

export interface EstimateDeliveryResult {
  isAllowed: boolean;
  blockReason?: 'COUNTRY_NOT_SUPPORTED' | 'NO_ACTIVE_RULE';
  origin: OriginId;
  destinationCountry: string;
  shippingMethod?: string | null;
  dispatchDate: string; // 'YYYY-MM-DD'
  earliestDate: string; // 'YYYY-MM-DD'
  latestDate: string; // 'YYYY-MM-DD'
  displayDate: string; // 'YYYY-MM-DD' (latestDate)
  cutoffPassed: boolean;
  requiresCustoms: boolean;
  deliversSaturday: boolean;
  handlingDays: number;
  transitMinDays: number;
  transitMaxDays: number;
  orderByTime?: {
    hours: number;
    minutes: number;
    formatted: string; // e.g. "3 h 20 min"
  } | null;
  ruleMatched?: {
    type: 'exact' | 'default_method' | 'country_group';
    ruleId?: string;
  };
}

export interface DeliveryEstimateItemInput {
  productId: string;
  variantSku?: string;
  quantity?: number;
  shippingOriginHint?: 'switzerland' | 'portugal' | 'common';
  priceChf?: number;
}

export interface DeliveryEstimateItemResult {
  productId: string;
  variantSku?: string;
  resolvedOrigin: OriginId;
  isAvailable: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockCount: number;
  stockPillText: {
    fr: string;
    en: string;
    de: string;
  };
  estimate?: EstimateDeliveryResult;
  displayDates: {
    fr: string; // e.g. "Livraison d'ici le mar. 13 oct."
    en: string; // e.g. "Get it by Tue, 13 Oct"
    de: string; // e.g. "Lieferung bis Di., 13. Okt."
  } | null;
  shipsFromText: {
    fr: string; // "Expédié de Genève" / "Expédié du Portugal"
    en: string; // "Ships from Geneva" / "Ships from Portugal"
    de: string; // "Versand aus Genf" / "Versand aus Portugal"
  };
}

export interface BatchDeliveryEstimatesResponse {
  country: string;
  items: DeliveryEstimateItemResult[];
  overallLatestDate?: string | null;
  overallLatestFormatted?: {
    fr: string;
    en: string;
    de: string;
  } | null;
  extraDelayDays: number;
  bannerText?: string;
}
