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
      label = `🇨🇭 Expédié depuis la Suisse – livraison en ${etaMin}–${etaMax} jours ouvrables`;
    } else if (available && origin === 'PORTUGAL') {
      label = `🇵🇹 Expédié depuis le Portugal – livraison en ${etaMin}–${etaMax} jours ouvrables`;
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

  // COMMON PRODUCT (Stocked in both Switzerland and Portugal)
  if (isCommon) {
    // 1. Switzerland or Liechtenstein -> Fulfilled from Swiss shop (1-3 days)
    if (['CH', 'LI'].includes(countryCode)) {
      if (stockGeneva === undefined || stockGeneva > 0) {
        return getResult(
          true,
          'GENEVA',
          1,
          3,
          false,
          '🇨🇭 Expédié depuis la Suisse – livraison en 1–3 jours ouvrables',
          '🌍 Disponible en Suisse & au Portugal. Auto-sélection : expédié depuis la Suisse.'
        );
      }
      return getResult(false, undefined, undefined, undefined, false, '❌ Rupture de stock');
    }

    // 2. European countries -> Fulfilled from Portugal warehouse (3-5 days, intra-EU no customs)
    if (euCountries.has(countryCode) || ['UK', 'GB', 'NO', 'IS'].includes(countryCode)) {
      if (stockPortugal === undefined || stockPortugal > 0) {
        return getResult(
          true,
          'PORTUGAL',
          3,
          5,
          false,
          '🇵🇹 Expédié depuis le Portugal – livraison en 3–5 jours ouvrables',
          '🌍 Disponible en Suisse & au Portugal. Auto-sélection : expédié depuis le Portugal pour l\'Europe.'
        );
      }
      return getResult(false, undefined, undefined, undefined, false, '❌ Rupture de stock');
    }

    return getResult(false);
  }

  // PORTUGAL_ONLY PRODUCT
  if (isPortugalOnly) {
    if (['CH', 'LI'].includes(countryCode) || euCountries.has(countryCode) || ['UK', 'GB', 'NO', 'IS'].includes(countryCode)) {
      if (stockPortugal === undefined || stockPortugal > 0) {
        return getResult(
          true,
          'PORTUGAL',
          3,
          5,
          false,
          '🇵🇹 Expédié depuis le Portugal – livraison en 3–5 jours ouvrables'
        );
      }
      return getResult(false, undefined, undefined, undefined, false, '❌ Rupture de stock');
    }
    return getResult(false);
  }

  // SWITZERLAND_ONLY PRODUCT (GENEVA_ONLY)
  if (['CH', 'LI'].includes(countryCode)) {
    if (stockGeneva === undefined || stockGeneva > 0) {
      return getResult(true, 'GENEVA', 1, 3, false);
    }
    return getResult(false, undefined, undefined, undefined, false, '❌ Rupture de stock');
  }

  // Blocked for Europe (Swiss shop ships exclusively to Switzerland)
  return getResult(false, undefined, undefined, undefined, false, "❌ Non livrable dans l'UE (exclusivité boutique Suisse)");
}
