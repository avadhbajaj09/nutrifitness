import { getAdminSupabase } from './supabase';

export interface BlackFridayTier {
  threshold: number;      // Cart product subtotal threshold in CHF (e.g. 50, 110, 200)
  discountPercent: number; // Discount percentage (e.g. 10, 15, 25)
}

export interface BlackFridayConfig {
  enabled: boolean;
  startDate: string; // ISO 8601 string in Europe/Zurich
  endDate: string;   // ISO 8601 string in Europe/Zurich
  tiers: BlackFridayTier[];
  bannerText: string;
}

export interface BlackFridayCalculation {
  isActive: boolean;
  eligible: boolean;
  tier: BlackFridayTier | null;
  discountPercent: number;
  discountAmount: number;
  originalSubtotal: number;
  finalSubtotal: number;
  savings: number;
  nextTier: {
    threshold: number;
    discountPercent: number;
    remaining: number;
  } | null;
  progressPercent: number; // 0 to 100
  message: string;
}

export const DEFAULT_BLACK_FRIDAY_CONFIG: BlackFridayConfig = {
  enabled: true,
  startDate: '2026-11-20T00:00:00+01:00',
  endDate: '2026-12-02T23:59:59+01:00',
  tiers: [
    { threshold: 50, discountPercent: 10 },
    { threshold: 110, discountPercent: 15 },
    { threshold: 200, discountPercent: 25 },
  ],
  bannerText: 'BLACK FRIDAY — JUSQU’À −25%',
};

/**
 * Checks if the Black Friday promotion is currently active based on enabled flag
 * and the Europe/Zurich campaign dates.
 */
export function isBlackFridayActive(config?: BlackFridayConfig | null, now?: Date): boolean {
  const cfg = config || DEFAULT_BLACK_FRIDAY_CONFIG;
  if (!cfg.enabled) return false;

  const current = now || new Date();

  if (cfg.startDate) {
    const start = new Date(cfg.startDate);
    if (!isNaN(start.getTime()) && current < start) {
      return false;
    }
  }

  if (cfg.endDate) {
    const end = new Date(cfg.endDate);
    if (!isNaN(end.getTime()) && current > end) {
      return false;
    }
  }

  return true;
}

/**
 * Calculates the highest eligible automatic discount for a given product subtotal.
 * Excludes shipping and guarantees:
 * - CHF 0–49.99: 0%
 * - CHF 50–109.99: 10%
 * - CHF 110–199.99: 15%
 * - CHF 200+: 25%
 */
export function calculateBlackFridayDiscount(
  subtotal: number,
  config?: BlackFridayConfig | null,
  now?: Date
): BlackFridayCalculation {
  const cfg = config || DEFAULT_BLACK_FRIDAY_CONFIG;
  const active = isBlackFridayActive(cfg, now);

  const cleanSubtotal = Number.isFinite(subtotal) ? Math.max(0, Math.round(subtotal * 100) / 100) : 0;

  // Sort tiers ascending by threshold
  const sortedTiers = [...(cfg.tiers || DEFAULT_BLACK_FRIDAY_CONFIG.tiers)].sort(
    (a, b) => a.threshold - b.threshold
  );

  if (!active || sortedTiers.length === 0) {
    return {
      isActive: active,
      eligible: false,
      tier: null,
      discountPercent: 0,
      discountAmount: 0,
      originalSubtotal: cleanSubtotal,
      finalSubtotal: cleanSubtotal,
      savings: 0,
      nextTier: null,
      progressPercent: 0,
      message: '',
    };
  }

  // Find the highest eligible tier (threshold <= subtotal)
  let eligibleTier: BlackFridayTier | null = null;
  for (const t of sortedTiers) {
    if (cleanSubtotal >= t.threshold - 0.001) {
      eligibleTier = t;
    }
  }

  // Find the next tier to unlock
  let nextTier: { threshold: number; discountPercent: number; remaining: number } | null = null;
  for (const t of sortedTiers) {
    if (cleanSubtotal < t.threshold - 0.001) {
      const remaining = Math.round((t.threshold - cleanSubtotal) * 100) / 100;
      nextTier = {
        threshold: t.threshold,
        discountPercent: t.discountPercent,
        remaining: Math.max(0.01, remaining),
      };
      break;
    }
  }

  const discountPercent = eligibleTier ? eligibleTier.discountPercent : 0;
  // Calculate discount amount rounded to 2 decimal places
  const discountAmount = Math.round(((cleanSubtotal * discountPercent) / 100) * 100) / 100;
  const finalSubtotal = Math.round((cleanSubtotal - discountAmount) * 100) / 100;

  // Calculate visual progress percentage (0 to 100) based on max tier threshold
  const maxThreshold = sortedTiers[sortedTiers.length - 1].threshold;
  const progressPercent = Math.min(100, Math.max(0, Math.round((cleanSubtotal / maxThreshold) * 100)));

  // Generate French UX notification message
  let message = '';
  if (nextTier) {
    message = `Plus que CHF ${nextTier.remaining.toFixed(2)} pour profiter de ${nextTier.discountPercent}% de réduction !`;
  } else if (eligibleTier) {
    message = `Félicitations ! Vous profitez de la remise maximale de ${eligibleTier.discountPercent}% !`;
  }

  return {
    isActive: true,
    eligible: discountPercent > 0,
    tier: eligibleTier,
    discountPercent,
    discountAmount,
    originalSubtotal: cleanSubtotal,
    finalSubtotal,
    savings: discountAmount,
    nextTier,
    progressPercent,
    message,
  };
}

let cachedConfig: BlackFridayConfig | null = null;
let cachedConfigTimestamp = 0;
const CACHE_TTL_MS = 10_000; // 10 seconds in-memory cache

/**
 * Retrieves the current Black Friday config from Supabase with memory fallback.
 */
export async function getBlackFridayConfig(): Promise<BlackFridayConfig> {
  const now = Date.now();
  if (cachedConfig && now - cachedConfigTimestamp < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('black_friday_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_BLACK_FRIDAY_CONFIG;
    }

    const config: BlackFridayConfig = {
      enabled: Boolean(data.enabled),
      startDate: data.start_date || DEFAULT_BLACK_FRIDAY_CONFIG.startDate,
      endDate: data.end_date || DEFAULT_BLACK_FRIDAY_CONFIG.endDate,
      tiers: Array.isArray(data.tiers) && data.tiers.length > 0 ? data.tiers : DEFAULT_BLACK_FRIDAY_CONFIG.tiers,
      bannerText: data.banner_text || DEFAULT_BLACK_FRIDAY_CONFIG.bannerText,
    };

    cachedConfig = config;
    cachedConfigTimestamp = now;
    return config;
  } catch (err) {
    console.warn('[BlackFriday] Error loading config from database, using defaults:', err);
    return DEFAULT_BLACK_FRIDAY_CONFIG;
  }
}

/**
 * Saves updated Black Friday config to Supabase and refreshes cache.
 */
export async function saveBlackFridayConfig(newConfig: Partial<BlackFridayConfig>): Promise<BlackFridayConfig> {
  const current = await getBlackFridayConfig();
  const merged: BlackFridayConfig = {
    enabled: typeof newConfig.enabled === 'boolean' ? newConfig.enabled : current.enabled,
    startDate: newConfig.startDate || current.startDate,
    endDate: newConfig.endDate || current.endDate,
    tiers: Array.isArray(newConfig.tiers) && newConfig.tiers.length > 0 ? newConfig.tiers : current.tiers,
    bannerText: newConfig.bannerText || current.bannerText,
  };

  const supabase = getAdminSupabase();
  const { error } = await supabase
    .from('black_friday_settings')
    .upsert({
      id: 'default',
      enabled: merged.enabled,
      start_date: merged.startDate,
      end_date: merged.endDate,
      tiers: merged.tiers,
      banner_text: merged.bannerText,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(`Failed to save Black Friday configuration: ${error.message}`);
  }

  cachedConfig = merged;
  cachedConfigTimestamp = Date.now();
  return merged;
}
