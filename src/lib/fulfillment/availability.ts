import { AvailabilityResult, OriginId } from './types';

export function detectCountryFromHeaders(headers: Headers): string {
  return headers.get('x-vercel-ip-country') || 'CH';
}

export async function getAvailability(
  productId: string,
  shippingOrigin: 'switzerland' | 'portugal' | 'common' | undefined,
  countryCode: string,
  locationType?: 'COMMON' | 'GENEVA_ONLY' | 'PORTUGAL_ONLY',
  stockGeneva?: number,
  stockPortugal?: number
): Promise<AvailabilityResult> {
  const isCommon = locationType === 'COMMON' || shippingOrigin === 'common';
  const isPortugalOnly =
    locationType === 'PORTUGAL_ONLY' ||
    (shippingOrigin === 'portugal' && !isCommon);

  const euCountries = new Set([
    'EU', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ]);

  const getResult = (
    available: boolean,
    origin?: OriginId,
    etaMin?: number,
    etaMax?: number,
    duties?: boolean,
    labelOverride?: string,
    commonNote?: string
  ): AvailabilityResult => {
    let label = '❌ Non disponible dans votre pays';
    if (available && origin === 'GENEVA') {
      label = `🇨🇭 Swiss Fulfillment – livraison en ${etaMin}–${etaMax} jours ouvrables`;
    } else if (available && origin === 'PORTUGAL') {
      label = `🇵🇹 Portugal Fulfillment – livraison en ${etaMin}–${etaMax} jours ouvrables`;
    }
    
    if (labelOverride) {
      label = labelOverride;
    }

    return {
      available,
      origin,
      etaMin,
      etaMax,
      dutiesNote: duties ? "Des droits de douane/TVA peuvent s'appliquer à la livraison" : undefined,
      label,
      labelFr: label,
      labelEn: label,
      isCommon,
      commonNote,
    };
  };

  // All products ship exclusively from Portugal with no stock gating needed (3–5 working days to Switzerland & Europe)
  return getResult(
    true,
    'PORTUGAL',
    3,
    5,
    false,
    '🇵🇹 Portugal Fulfillment – livraison en 3–5 jours ouvrables'
  );
}
