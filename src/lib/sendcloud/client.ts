export interface SendcloudRate {
  id: string;
  carrier: string;
  name: string;
  price: number;
  currency: string;
}

export interface SendcloudParcel {
  id: string;
  tracking_number: string;
  tracking_url: string;
  label_url?: string;
}

const rateCache = new Map<string, { rates: SendcloudRate[]; expiresAt: number }>();

function isStubMode(): boolean {
  const pubKey = process.env.SENDCLOUD_PUBLIC_KEY || '';
  return pubKey.startsWith('stub_') || !pubKey;
}

export async function getRates(origin: string, country: string, weight: number): Promise<SendcloudRate[]> {
  const cacheKey = `${origin}-${country}-${weight}`;
  const cached = rateCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.rates;
  }

  if (isStubMode()) {
    console.warn('[Sendcloud STUB MODE] getRates');
    const rates: SendcloudRate[] = [
      { id: 'rate_1', carrier: 'swisspost', name: 'Swiss Post Standard', price: 7.90, currency: 'CHF' },
      { id: 'rate_2', carrier: 'dhl', name: 'DHL Express', price: 14.90, currency: 'CHF' },
    ];
    rateCache.set(cacheKey, { rates, expiresAt: Date.now() + 5 * 60 * 1000 });
    return rates;
  }

  // Real implementation would be here
  return [];
}

export async function createParcel(
  orderId: string,
  origin: string,
  items: any[],
  shippingAddress: any
): Promise<SendcloudParcel> {
  if (isStubMode()) {
    console.warn('[Sendcloud STUB MODE] createParcel');
    return {
      id: `stub_parcel_${Math.random().toString(36).substr(2, 9)}`,
      tracking_number: 'STUB-123456789CH',
      tracking_url: 'https://tracking.sendcloud.com/stub',
      label_url: 'https://sendcloud.com/stub-label.pdf'
    };
  }

  // Real implementation would be here
  return { id: '', tracking_number: '', tracking_url: '' };
}
