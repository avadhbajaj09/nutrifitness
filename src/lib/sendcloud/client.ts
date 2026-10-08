/**
 * Sendcloud API client.
 * Operates in STUB mode when SENDCLOUD_PUBLIC_KEY starts with 'stub_'.
 * Switch to real mode by replacing the env vars with actual Sendcloud credentials.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SendcloudAddress {
  name: string;
  company?: string;
  street: string;
  house_number?: string;
  city: string;
  postal_code: string;
  country: string; // 2-letter ISO
  email?: string;
  phone?: string;
}

export interface SendcloudRate {
  id: number;
  carrier: string;
  carrier_code: string;
  name: string;
  price: number; // CHF
  min_days: number;
  max_days: number;
}

export interface SendcloudParcel {
  id: number;
  tracking_number: string;
  tracking_url: string;
  label_url: string;
  status: string;
  carrier: string;
}

export interface SendcloudShipmentInput {
  origin: 'GENEVA' | 'PORTUGAL';
  toAddress: SendcloudAddress;
  weight_grams: number;
  items: {
    description: string;
    quantity: number;
    weight: number; // kg
    value: number;  // CHF
    hs_code?: string;
    origin_country?: string;
  }[];
  requires_customs: boolean;
  order_number: string;
  chosen_carrier_code?: string;
}

// ─── Rate cache ───────────────────────────────────────────────────────────────

interface CachedRates {
  rates: SendcloudRate[];
  expiresAt: number;
}
const rateCache = new Map<string, CachedRates>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function rateCacheKey(origin: string, country: string, weightBand: number): string {
  return `${origin}:${country}:${weightBand}`;
}

// ─── Stub mode ────────────────────────────────────────────────────────────────

function isStubMode(): boolean {
  return (process.env.SENDCLOUD_PUBLIC_KEY ?? 'stub_').startsWith('stub_');
}

let stubCounter = 1000;

function stubRates(origin: 'GENEVA' | 'PORTUGAL'): SendcloudRate[] {
  if (origin === 'GENEVA') {
    return [
      { id: 1, carrier: 'Swiss Post', carrier_code: 'swiss-post', name: 'PostPac Priority', price: 7.90, min_days: 1, max_days: 2 },
      { id: 2, carrier: 'DHL', carrier_code: 'dhl', name: 'DHL Express', price: 19.90, min_days: 1, max_days: 1 },
    ];
  }
  return [
    { id: 10, carrier: 'DHL', carrier_code: 'dhl', name: 'DHL Parcel International', price: 9.90, min_days: 3, max_days: 7 },
    { id: 11, carrier: 'GLS', carrier_code: 'gls', name: 'GLS EuroBusinessParcel', price: 8.50, min_days: 4, max_days: 8 },
    { id: 12, carrier: 'CTT', carrier_code: 'ctt', name: 'CTT Expresso Internacional', price: 7.90, min_days: 5, max_days: 10 },
  ];
}

function stubParcel(input: SendcloudShipmentInput): SendcloudParcel {
  const num = ++stubCounter;
  const tracking = `STUB${num}CH`;
  return {
    id: num,
    tracking_number: tracking,
    tracking_url: `https://tracking.sendcloud.sc/forward?carrier=stub&code=${tracking}`,
    label_url: `https://panel.sendcloud.sc/api/v2/labels/stub_${num}.pdf`,
    status: 'label_created',
    carrier: input.origin === 'GENEVA' ? 'Swiss Post' : 'DHL',
  };
}

// ─── Real Sendcloud API ───────────────────────────────────────────────────────

function basicAuth(): string {
  const pub = process.env.SENDCLOUD_PUBLIC_KEY ?? '';
  const sec = process.env.SENDCLOUD_SECRET_KEY ?? '';
  return Buffer.from(`${pub}:${sec}`).toString('base64');
}

async function fetchSendcloud<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`https://panel.sendcloud.sc/api/v2${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sendcloud API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getRates(input: {
  origin: 'GENEVA' | 'PORTUGAL';
  toAddress: SendcloudAddress;
  weight_grams: number;
}): Promise<SendcloudRate[]> {
  const weightBand = Math.ceil(input.weight_grams / 500);
  const cacheKey = rateCacheKey(input.origin, input.toAddress.country, weightBand);
  const cached = rateCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) return cached.rates;

  if (isStubMode()) {
    console.warn('[Sendcloud STUB] getRates() returning fake rates. Set real SENDCLOUD_PUBLIC_KEY to enable live rates.');
    const rates = stubRates(input.origin);
    rateCache.set(cacheKey, { rates, expiresAt: Date.now() + CACHE_TTL_MS });
    return rates;
  }

  try {
    const data = await fetchSendcloud<{ shipping_methods: Record<string, unknown>[] }>('/shipping_methods');
    const rates: SendcloudRate[] = (data.shipping_methods ?? []).map((m) => ({
      id: m.id as number,
      carrier: m.carrier as string,
      carrier_code: (m.carrier as string).toLowerCase().replace(/\s+/g, '-'),
      name: m.name as string,
      price: (m.price as number) ?? 9.90,
      min_days: (m.min_days as number) ?? 3,
      max_days: (m.max_days as number) ?? 7,
    }));
    rateCache.set(cacheKey, { rates, expiresAt: Date.now() + CACHE_TTL_MS });
    return rates;
  } catch (err) {
    console.error('[Sendcloud] getRates failed, falling back to stub:', err);
    return stubRates(input.origin);
  }
}

export async function createParcel(input: SendcloudShipmentInput): Promise<SendcloudParcel> {
  if (isStubMode()) {
    console.warn('[Sendcloud STUB] createParcel() returning fake parcel. Set real SENDCLOUD_PUBLIC_KEY to create real labels.');
    return stubParcel(input);
  }

  const body = {
    parcel: {
      name: input.toAddress.name,
      company_name: input.toAddress.company ?? '',
      address: input.toAddress.street,
      address_2: input.toAddress.house_number ?? '',
      city: input.toAddress.city,
      postal_code: input.toAddress.postal_code,
      country: { iso_2: input.toAddress.country },
      email: input.toAddress.email ?? '',
      telephone: input.toAddress.phone ?? '',
      order_number: input.order_number,
      weight: (input.weight_grams / 1000).toFixed(3),
      shipment: { id: 8 },
      request_label: true,
      customs_invoice_nr: input.requires_customs ? input.order_number : undefined,
      customs_shipment_type: input.requires_customs ? 2 : undefined,
      parcel_items: input.requires_customs
        ? input.items.map((it) => ({
            description: it.description,
            quantity: it.quantity,
            weight: it.weight,
            value: it.value,
            hs_code: it.hs_code ?? '',
            origin_country: it.origin_country ?? 'CH',
          }))
        : undefined,
    },
  };

  const data = await fetchSendcloud<{ parcel: Record<string, unknown> }>('/parcels', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const parcel = data.parcel;
  const labelUrls = parcel.label as Record<string, string[]> | undefined;
  return {
    id: parcel.id as number,
    tracking_number: parcel.tracking_number as string,
    tracking_url: parcel.tracking_url as string,
    label_url: labelUrls?.normal_printer?.[0] ?? '',
    status: (parcel.status as Record<string, string>)?.message ?? 'label_created',
    carrier: (parcel.carrier as Record<string, string>)?.code ?? '',
  };
}
