import type { TaxRateCategory } from './types';

/**
 * Config-driven Swiss VAT rates (Needs verification by a professional).
 * Allows future adjustment (e.g. proposed ~0.4pp rise from 2028 for AHV funding).
 */
export const SWISS_VAT_CONFIG = {
  current: {
    effectiveFrom: '2024-01-01',
    food_reduced: 0.026, // 2.6% on foodstuffs and dietary supplements
    standard: 0.081,     // 8.1% standard (accessories, shaker bottles, gym gear)
  },
  future_2028_preview: {
    effectiveFrom: '2028-01-01', // Pending Swiss referendum outcome
    food_reduced: 0.026,
    standard: 0.085,
  }
};

/**
 * Calculates VAT portion included in the gross retail price.
 */
export function calculateVat(grossPriceChf: number, category: TaxRateCategory): {
  netAmount: number;
  vatAmount: number;
  ratePercentage: string;
} {
  const rate = SWISS_VAT_CONFIG.current[category];
  const netAmount = grossPriceChf / (1 + rate);
  const vatAmount = grossPriceChf - netAmount;

  return {
    netAmount: roundSwissRappen(netAmount),
    vatAmount: roundSwissRappen(vatAmount),
    ratePercentage: `${(rate * 100).toFixed(1)}%`
  };
}

/**
 * Swiss 5-Rappen cash and transaction rounding rule (0.05 increments).
 * Example: 69.02 -> 69.00; 69.03 -> 69.05
 */
export function roundSwissRappen(amount: number): number {
  return Math.round(amount * 20) / 20;
}

export function formatChf(amount: number): string {
  return `CHF ${roundSwissRappen(amount).toFixed(2)}`;
}

export type SupportedCurrency = 'CHF' | 'EUR';

/**
 * Exchange rate: 1 CHF = 1.05 EUR
 */
export const EUR_EXCHANGE_RATE = 1.05;

/**
 * Convert price in CHF to target currency
 */
export function convertPrice(amountChf: number, currency: SupportedCurrency = 'CHF'): number {
  if (currency === 'EUR') {
    return Math.round(amountChf * EUR_EXCHANGE_RATE * 100) / 100;
  }
  return roundSwissRappen(amountChf);
}

/**
 * Format price according to selected currency (CHF or EUR)
 */
export function formatPrice(amountChf: number, currency: SupportedCurrency = 'CHF'): string {
  if (currency === 'EUR') {
    const inEur = convertPrice(amountChf, 'EUR');
    return `€ ${inEur.toFixed(2)}`;
  }
  return formatChf(amountChf);
}

