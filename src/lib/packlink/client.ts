/**
 * Packlink PRO API Client
 * Marco Scarpantoni (NutriFitness Genève) shipping integration
 * Base URL: https://api.packlink.com/v1
 */

export const PACKLINK_CONFIG = {
  apiKey: process.env.PACKLINK_API_KEY || '62501bf4f51ae1a715c0ffafebd0c178d2ede2e4c8ca96d560ecf1a4f0d4a720',
  baseUrl: 'https://api.packlink.com/v1',
  platform: 'PRO',
  platformCountry: 'UN',
};

export interface PacklinkPrice {
  total_price: number;
  base_price: number;
  tax_price: number;
  currency: string;
}

export interface PacklinkService {
  id: number;
  carrier_name: string;
  name: string;
  service_name?: string;
  transit_hours: string;
  price: PacklinkPrice;
  first_estimated_delivery_date?: string;
  dropoff?: boolean;
  delivery_to_parcelshop?: boolean;
}

export interface PacklinkQueryInput {
  fromCountry: string; // 'CH' | 'PT'
  fromZip: string;
  toCountry: string;
  toZip: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export interface PacklinkDraftPayload {
  service_id?: number;
  collection_date?: string;
  from: {
    name: string;
    surname?: string;
    email: string;
    phone: string;
    street1: string;
    city: string;
    zip: string;
    country: string;
    company?: string;
  };
  to: {
    name: string;
    surname?: string;
    email: string;
    phone: string;
    street1: string;
    city: string;
    zip: string;
    country: string;
  };
  packages: Array<{
    weight: number;
    width: number;
    height: number;
    length: number;
  }>;
  content: string;
  content_value: number;
}

/**
 * Generic authenticated fetch for Packlink PRO
 */
async function fetchPacklink<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${PACKLINK_CONFIG.baseUrl}${endpoint}`;
  const apiKey = process.env.PACKLINK_API_KEY || PACKLINK_CONFIG.apiKey;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    // Don't cache live shipping rates
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`Packlink API error [${res.status}]: ${errorBody}`);
  }

  return res.json();
}

/**
 * Get verified account details for the connected Packlink PRO user
 */
export async function getPacklinkUser(): Promise<any> {
  return fetchPacklink('/users');
}

/**
 * Search available carrier services and real-time shipping rates
 */
export async function getPacklinkServices(input: PacklinkQueryInput): Promise<PacklinkService[]> {
  const weight = Math.max(0.1, input.weightKg || 1);
  const length = Math.max(5, input.lengthCm || 15);
  const width = Math.max(5, input.widthCm || 15);
  const height = Math.max(5, input.heightCm || 15);

  const params = new URLSearchParams({
    platform: PACKLINK_CONFIG.platform,
    platform_country: PACKLINK_CONFIG.platformCountry,
    'from[country]': input.fromCountry,
    'from[zip]': input.fromZip,
    'to[country]': input.toCountry,
    'to[zip]': input.toZip,
    'packages[0][weight]': weight.toString(),
    'packages[0][width]': width.toString(),
    'packages[0][height]': height.toString(),
    'packages[0][length]': length.toString(),
  });

  const rawServices = await fetchPacklink<any[]>(`/services?${params.toString()}`);
  if (!Array.isArray(rawServices)) return [];

  return rawServices.map((s) => ({
    id: s.id,
    carrier_name: s.carrier_name || 'Transporteur Express',
    name: s.name || s.carrier_name || 'Standard',
    service_name: s.name,
    transit_hours: s.transit_hours || '24-48',
    price: {
      total_price: Number(s.price?.total_price || 0),
      base_price: Number(s.price?.base_price || 0),
      tax_price: Number(s.price?.tax_price || 0),
      currency: s.price?.currency || 'EUR',
    },
    first_estimated_delivery_date: s.first_estimated_delivery_date,
    dropoff: Boolean(s.dropoff),
    delivery_to_parcelshop: Boolean(s.delivery_to_parcelshop),
  }));
}

/**
 * List all existing shipments in Packlink PRO
 */
export async function getPacklinkShipments(): Promise<any> {
  return fetchPacklink('/shipments');
}

/**
 * Create a draft shipment in Packlink PRO
 */
export async function createPacklinkDraft(payload: PacklinkDraftPayload): Promise<any> {
  return fetchPacklink('/shipments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
