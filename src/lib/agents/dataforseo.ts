// Minimal DataForSEO client. Verify endpoint names and payloads at https://docs.dataforseo.com
const BASE = 'https://api.dataforseo.com/v3';
const LOCATION_CH = 2756; // Switzerland
const LANG_FR = 'fr';

async function post<T>(path: string, body: unknown): Promise<T> {
  const auth = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`DataForSEO ${path} ${res.status}`);
  return (await res.json()) as T;
}

export interface KeywordMetric { keyword: string; search_volume: number | null; competition?: string | null; cpc?: number | null }

export async function searchVolume(keywords: string[]) {
  return post<{ tasks: { result: KeywordMetric[] | null }[] }>('/keywords_data/google_ads/search_volume/live',
    [{ keywords, location_code: LOCATION_CH, language_code: LANG_FR }]);
}

export async function keywordDifficulty(keywords: string[]) {
  return post<{ tasks: { result: { items: { keyword: string; keyword_difficulty: number }[] }[] | null }[] }>(
    '/dataforseo_labs/google/bulk_keyword_difficulty/live', [{ keywords, location_code: LOCATION_CH, language_code: LANG_FR }]);
}

export async function keywordSuggestions(seed: string, limit = 100) {
  return post<{ tasks: { result: { items: { keyword: string; keyword_info?: { search_volume: number | null } }[] }[] | null }[] }>(
    '/dataforseo_labs/google/keyword_suggestions/live', [{ keyword: seed, location_code: LOCATION_CH, language_code: LANG_FR, limit }]);
}

export async function serpTop10(keyword: string) {
  return post<{ tasks: { result: { items: { type: string; rank_absolute: number; url?: string; domain?: string; title?: string }[] }[] | null }[] }>(
    '/serp/google/organic/live/advanced', [{ keyword, location_code: LOCATION_CH, language_code: LANG_FR, depth: 10 }]);
}
