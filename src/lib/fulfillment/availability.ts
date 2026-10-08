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
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
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
      label = `🇨🇭 Expédié depuis Genève – livraison en ${etaMin}–${etaMax} jours ouvrables`;
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

  // COMMON PRODUCT (Stocked in both Geneva and Portugal)
  if (isCommon) {
    // 1. Switzerland or Liechtenstein -> Nearest is GENEVA (1-3 days)
    if (['CH', 'LI'].includes(countryCode)) {
      if (stockGeneva === undefined || stockGeneva > 0) {
        return getResult(
          true,
          'GENEVA',
          1,
          3,
          false,
          '🇨🇭 Expédié depuis Genève – livraison en 1–3 jours ouvrables',
          '🌍 Disponible aux 2 endroits (Genève & Portugal). Auto-sélection : expédié depuis Genève pour la Suisse.'
        );
      } else if (stockPortugal === undefined || stockPortugal > 0) {
        // Geneva out of stock -> fallback to Portugal warehouse
        return getResult(
          true,
          'PORTUGAL',
          4,
          8,
          true,
          '🇵🇹 Expédié depuis le Portugal – livraison en 4–8 jours ouvrables',
          'Stock boutique Genève temporairement épuisé – expédié depuis l\'usine au Portugal.'
        );
      }
      return getResult(false, undefined, undefined, undefined, false, '❌ Rupture de stock');
    }

    // 2. European Union countries -> Nearest & cheapest is PORTUGAL (3-7 days, intra-EU no customs)
    if (euCountries.has(countryCode)) {
      if (stockPortugal === undefined || stockPortugal > 0) {
        return getResult(
          true,
          'PORTUGAL',
          3,
          7,
          false,
          '🇵🇹 Expédié depuis le Portugal – livraison en 3–7 jours ouvrables',
          '🌍 Disponible aux 2 endroits (Genève & Portugal). Auto-sélection : expédié depuis le Portugal pour l\'Europe (sans frais de douane).'
        );
      } else if (stockGeneva === undefined || stockGeneva > 0) {
        // Portugal OOS -> fallback to Geneva if country is in Geneva nearby allow-list
        if (['FR', 'DE', 'IT', 'AT'].includes(countryCode)) {
          return getResult(
            true,
            'GENEVA',
            1,
            3,
            false,
            '🇨🇭 Expédié depuis Genève – livraison en 1–3 jours ouvrables',
            'Stock usine Portugal épuisé – expédié exceptionnellement depuis la boutique de Genève.'
          );
        }
      }
      return getResult(false, undefined, undefined, undefined, false, '❌ Rupture de stock');
    }

    // 3. Other supported non-EU European countries (UK, NO, IS)
    if (['UK', 'GB', 'NO', 'IS'].includes(countryCode)) {
      return getResult(
        true,
        'PORTUGAL',
        5,
        10,
        true,
        '🇵🇹 Expédié depuis le Portugal – livraison en 5–10 jours ouvrables',
        '🌍 Disponible aux 2 endroits (Genève & Portugal).'
      );
    }

    return getResult(false);
  }

  // PORTUGAL_ONLY PRODUCT
  if (isPortugalOnly) {
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

  // GENEVA_ONLY PRODUCT
  if (['CH', 'LI'].includes(countryCode)) {
    return getResult(true, 'GENEVA', 1, 3, false);
  }
  if (['FR', 'DE', 'IT', 'AT'].includes(countryCode)) {
    return getResult(true, 'GENEVA', 1, 3, false);
  }
  return getResult(false);
}
