import { AvailabilityResult, OriginId } from './types';

export function detectCountryFromHeaders(headers: Headers): string {
  return headers.get('x-vercel-ip-country') || 'CH';
}

export async function getAvailability(
  productId: string,
  shippingOrigin: 'switzerland' | 'portugal' | undefined,
  countryCode: string
): Promise<AvailabilityResult> {
  const isPortugal = shippingOrigin === 'portugal';
  const euCountries = new Set([
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ]);
  const nonEuSupported = new Set(['CH', 'LI', 'GB', 'NO', 'IS', 'UK']);

  const getResult = (
    available: boolean,
    origin?: OriginId,
    etaMin?: number,
    etaMax?: number,
    duties?: boolean,
    labelFrOverride?: string
  ): AvailabilityResult => {
    let label = '❌ Non disponible dans votre pays';
    if (available && origin === 'GENEVA') {
      label = `🇨🇭 Expédié depuis Genève – livraison en ${etaMin}–${etaMax} jours ouvrables`;
    } else if (available && origin === 'PORTUGAL') {
      label = `🇵🇹 Expédié depuis le Portugal – livraison en ${etaMin}–${etaMax} jours ouvrables`;
    }
    
    if (labelFrOverride) {
      label = labelFrOverride;
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
    };
  };

  if (!isPortugal) { // GENEVA
    if (['CH', 'LI'].includes(countryCode)) {
      return getResult(true, 'GENEVA', 1, 3, false);
    }
    if (['FR', 'DE', 'IT', 'AT'].includes(countryCode)) {
      return getResult(true, 'GENEVA', 1, 3, false);
    }
    return getResult(false);
  } else { // PORTUGAL
    if (euCountries.has(countryCode)) {
      return getResult(true, 'PORTUGAL', 3, 7, false);
    }
    if (['CH', 'LI'].includes(countryCode)) {
      return getResult(true, 'PORTUGAL', 4, 8, true);
    }
    if (['UK', 'GB', 'NO', 'IS'].includes(countryCode)) {
      return getResult(true, 'PORTUGAL', 5, 10, true);
    }
    return getResult(false);
  }
}
