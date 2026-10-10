import { DeliveryRule, CountryGroup, HolidayEntry, DeliverySettings } from './types';

export const DEFAULT_COUNTRY_GROUPS: CountryGroup[] = [
  { code: 'CH_LI', name: 'Suisse & Liechtenstein', countries: ['CH', 'LI'] },
  { code: 'EU_NEAR', name: 'Europe Proche (Frontaliers)', countries: ['FR', 'DE', 'IT', 'AT'] },
  { code: 'EU_BENELUX', name: 'Benelux', countries: ['BE', 'LU', 'NL'] },
  { code: 'EU_IBERIA', name: 'Péninsule Ibérique', countries: ['PT', 'ES'] },
  { code: 'EU_CENTRAL', name: 'Europe Centrale & Nordique', countries: ['AT', 'IE', 'DK'] },
  { code: 'EU_EAST', name: "Europe de l'Est & Baltique", countries: ['SE', 'FI', 'PL', 'CZ', 'SK', 'HU', 'SI', 'HR', 'RO', 'BG', 'EE', 'LV', 'LT'] },
  { code: 'EU_MED', name: 'Méditerranée Insulaire', countries: ['GR', 'CY', 'MT'] },
  { code: 'NON_EU_WEST', name: 'Europe Hors-UE', countries: ['UK', 'NO', 'IS'] }
];

export const DEFAULT_DELIVERY_RULES: DeliveryRule[] = [
  // GENEVA Origin (Handling 0, cutoff 14:00 Zurich) - 6 working days (Mon-Sat), CH max 3 days
  { origin: 'GENEVA', country_code: 'CH', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 1, transit_max_days: 3, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'GENEVA', country_code: 'LI', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 1, transit_max_days: 3, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'GENEVA', country_code: 'FR', shipping_method: null, is_allowed: false, handling_days: 0, cutoff_time: '14:00', transit_min_days: 2, transit_max_days: 4, requires_customs: true, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'GENEVA', country_code: 'DE', shipping_method: null, is_allowed: false, handling_days: 0, cutoff_time: '14:00', transit_min_days: 2, transit_max_days: 4, requires_customs: true, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'GENEVA', country_code: 'IT', shipping_method: null, is_allowed: false, handling_days: 0, cutoff_time: '14:00', transit_min_days: 2, transit_max_days: 4, requires_customs: true, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'GENEVA', country_code: 'AT', shipping_method: null, is_allowed: false, handling_days: 0, cutoff_time: '14:00', transit_min_days: 2, transit_max_days: 4, requires_customs: true, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'GENEVA', country_code: 'BE', shipping_method: null, is_allowed: false, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: true, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'GENEVA', country_code: 'LU', shipping_method: null, is_allowed: false, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: true, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'GENEVA', country_code: 'NL', shipping_method: null, is_allowed: false, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: true, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },

  // PORTUGAL Origin (Handling 0, cutoff 14:00 Lisbon) - 6 working days (Mon-Sat), max 5 working days overall
  { origin: 'PORTUGAL', country_code: 'PT', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 1, transit_max_days: 2, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'ES', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 1, transit_max_days: 3, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'FR', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 2, transit_max_days: 4, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'BE', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 2, transit_max_days: 4, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'LU', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 2, transit_max_days: 4, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'NL', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 2, transit_max_days: 4, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'DE', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 2, transit_max_days: 4, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'IT', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 2, transit_max_days: 4, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'AT', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'IE', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'DK', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'SE', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'FI', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'PL', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'CZ', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'SK', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'HU', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'SI', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'HR', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'RO', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'BG', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'EE', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'LV', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'LT', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'GR', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'CY', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'MT', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'CH', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: true, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'LI', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: true, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'UK', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: true, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'NO', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: true, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'IS', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: true, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false },
  { origin: 'PORTUGAL', country_code: 'EU', shipping_method: null, is_allowed: true, handling_days: 0, cutoff_time: '14:00', transit_min_days: 3, transit_max_days: 5, requires_customs: false, customs_buffer_days: 0, delivers_saturday: true, is_active: true, needs_verification: false }
];

export const DEFAULT_HOLIDAYS: HolidayEntry[] = [
  // 2026 Geneva & Switzerland
  { calendar: 'GENEVA', date: '2026-01-01', name: 'Nouvel An' },
  { calendar: 'GENEVA', date: '2026-04-03', name: 'Vendredi Saint' },
  { calendar: 'GENEVA', date: '2026-04-06', name: 'Lundi de Pâques' },
  { calendar: 'GENEVA', date: '2026-05-14', name: 'Ascension' },
  { calendar: 'GENEVA', date: '2026-05-25', name: 'Lundi de Pentecôte' },
  { calendar: 'GENEVA', date: '2026-08-01', name: 'Fête Nationale Suisse' },
  { calendar: 'GENEVA', date: '2026-09-10', name: 'Jeûne Genevois' },
  { calendar: 'GENEVA', date: '2026-12-25', name: 'Noël' },
  { calendar: 'GENEVA', date: '2026-12-31', name: 'Restauration de Genève' },

  // 2027 Geneva & Switzerland
  { calendar: 'GENEVA', date: '2027-01-01', name: 'Nouvel An' },
  { calendar: 'GENEVA', date: '2027-03-26', name: 'Vendredi Saint' },
  { calendar: 'GENEVA', date: '2027-03-29', name: 'Lundi de Pâques' },
  { calendar: 'GENEVA', date: '2027-05-06', name: 'Ascension' },
  { calendar: 'GENEVA', date: '2027-05-17', name: 'Lundi de Pentecôte' },
  { calendar: 'GENEVA', date: '2027-08-01', name: 'Fête Nationale Suisse' },
  { calendar: 'GENEVA', date: '2027-09-09', name: 'Jeûne Genevois' },
  { calendar: 'GENEVA', date: '2027-12-25', name: 'Noël' },
  { calendar: 'GENEVA', date: '2027-12-31', name: 'Restauration de Genève' },

  // 2026 Portugal National Holidays
  { calendar: 'PORTUGAL', date: '2026-01-01', name: 'Ano Novo' },
  { calendar: 'PORTUGAL', date: '2026-04-03', name: 'Sexta-feira Santa' },
  { calendar: 'PORTUGAL', date: '2026-04-05', name: 'Páscoa' },
  { calendar: 'PORTUGAL', date: '2026-04-25', name: 'Dia da Liberdade' },
  { calendar: 'PORTUGAL', date: '2026-05-01', name: 'Dia do Trabalhador' },
  { calendar: 'PORTUGAL', date: '2026-06-04', name: 'Corpo de Deus' },
  { calendar: 'PORTUGAL', date: '2026-06-10', name: 'Dia de Portugal' },
  { calendar: 'PORTUGAL', date: '2026-08-15', name: 'Assunção de Nossa Senhora' },
  { calendar: 'PORTUGAL', date: '2026-10-05', name: 'Implantação da República' },
  { calendar: 'PORTUGAL', date: '2026-11-01', name: 'Dia de Todos os Santos' },
  { calendar: 'PORTUGAL', date: '2026-12-01', name: 'Restauração da Independência' },
  { calendar: 'PORTUGAL', date: '2026-12-08', name: 'Imaculada Conceição' },
  { calendar: 'PORTUGAL', date: '2026-12-25', name: 'Natal' },

  // 2027 Portugal National Holidays
  { calendar: 'PORTUGAL', date: '2027-01-01', name: 'Ano Novo' },
  { calendar: 'PORTUGAL', date: '2027-03-26', name: 'Sexta-feira Santa' },
  { calendar: 'PORTUGAL', date: '2027-03-28', name: 'Páscoa' },
  { calendar: 'PORTUGAL', date: '2027-04-25', name: 'Dia da Liberdade' },
  { calendar: 'PORTUGAL', date: '2027-05-01', name: 'Dia do Trabalhador' },
  { calendar: 'PORTUGAL', date: '2027-05-27', name: 'Corpo de Deus' },
  { calendar: 'PORTUGAL', date: '2027-06-10', name: 'Dia de Portugal' },
  { calendar: 'PORTUGAL', date: '2027-08-15', name: 'Assunção de Nossa Senhora' },
  { calendar: 'PORTUGAL', date: '2027-10-05', name: 'Implantação da República' },
  { calendar: 'PORTUGAL', date: '2027-11-01', name: 'Dia de Todos os Santos' },
  { calendar: 'PORTUGAL', date: '2027-12-01', name: 'Restauração da Independência' },
  { calendar: 'PORTUGAL', date: '2027-12-08', name: 'Imaculada Conceição' },
  { calendar: 'PORTUGAL', date: '2027-12-25', name: 'Natal' }
];

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  extra_delay_days: 0,
  banner_text: ''
};

export const SUPPORTED_DESTINATIONS = new Set([
  'CH', 'LI', 'EU', 'PT', 'ES', 'FR', 'DE', 'IT', 'AT', 'BE', 'LU', 'NL', 'IE', 'DK',
  'SE', 'FI', 'PL', 'CZ', 'SK', 'HU', 'SI', 'HR', 'RO', 'BG', 'EE', 'LV', 'LT',
  'GR', 'CY', 'MT', 'UK', 'GB', 'NO', 'IS'
]);

export const GENEVA_ALLOW_LIST = new Set(['CH', 'LI']);
export const SWITZERLAND_ALLOW_LIST = GENEVA_ALLOW_LIST;

export function isCountrySupported(countryCode: string): boolean {
  const code = (countryCode || '').toUpperCase().trim();
  return SUPPORTED_DESTINATIONS.has(code);
}

export function isGenevaAllowed(countryCode: string): boolean {
  const code = (countryCode || '').toUpperCase().trim();
  return GENEVA_ALLOW_LIST.has(code);
}

export function isProductDeliverableToCountry(
  countryCode: string,
  locationType?: string,
  shippingOrigin?: string,
  stockGeneva?: number,
  stockPortugal?: number
): boolean {
  const code = (countryCode || 'CH').toUpperCase().trim();
  if (!isCountrySupported(code)) return false;

  const isSwissDestination = code === 'CH' || code === 'LI';

  // In Switzerland: ALL products from both Swiss shop and Portugal warehouse are available!
  // Do NOT hide products in Switzerland.
  if (isSwissDestination) {
    if (typeof stockGeneva === 'number' || typeof stockPortugal === 'number') {
      const g = typeof stockGeneva === 'number' ? stockGeneva : 0;
      const p = typeof stockPortugal === 'number' ? stockPortugal : 0;
      return (g + p) > 0;
    }
    return true;
  }

  // Rest of Europe / Other destinations:
  // Handled by Portugal warehouse. Swiss shop-only items do not ship to Europe.
  const isCommon = locationType === 'COMMON' || shippingOrigin === 'common';
  const isSwissOnly = (locationType === 'GENEVA_ONLY' || shippingOrigin === 'switzerland') && !isCommon;

  if (isSwissOnly) {
    return false;
  }

  if (typeof stockPortugal === 'number') {
    return stockPortugal > 0;
  }
  return true;
}

