import type { Decision, NewTask, UrlMetrics } from './types';

/** Deterministic rules. Keep in sync with docs/09-DECISION-RULES.md. */
export function decide(m: UrlMetrics): Decision | null {
  const t = (agent: NewTask['agent'], type: string, extra: Record<string, unknown> = {}, approval = true): NewTask =>
    ({ agent, type, payload: { url: m.url, keyword: m.keyword, ...extra }, requires_approval: approval });

  if (m.merchantDisapproved)
    return { url: m.url, diagnosis: 'Merchant disapproval', score: 95, actions: [t('schema-feed', 'fix_feed_item'), t('image-checker', 'check_images', {}, false)] };

  if (!m.indexed && m.daysSincePublished >= 14)
    return { url: m.url, diagnosis: 'Not indexed after 14 days', score: 90, actions: [t('technical-auditor', 'inspect_and_fix_indexing', {}, false)] };

  if (m.position28 !== null && m.positionPrev28 !== null && m.position28 - m.positionPrev28 >= 5)
    return { url: m.url, diagnosis: 'Ranking regression (>=5 positions)', score: 85, actions: [t('technical-auditor', 'regression_check', {}, false), t('reporter', 'explain_regression', {}, false)] };

  if (m.competingUrls && m.competingUrls.length > 0)
    return { url: m.url, diagnosis: 'Keyword cannibalisation', score: 70, actions: [t('keyword-researcher', 'resolve_cannibalisation', { competing: m.competingUrls })] };

  if (m.position28 !== null && m.position28 <= 10 && m.expectedCtr !== undefined && m.ctr28 < m.expectedCtr * 0.7)
    return { url: m.url, diagnosis: 'Weak snippet: good position, low CTR', score: 75, actions: [t('content-writer', 'rewrite_title_meta', { variants: 2 })] };

  if (m.position28 !== null && m.position28 >= 4 && m.position28 <= 20 && m.impressions28 >= 100)
    return { url: m.url, diagnosis: 'Close to page 1 / top 3', score: 80, actions: [t('content-writer', 'expand_content'), t('internal-linking', 'add_links', { count: 3 }, true)] };

  if (m.position28 !== null && m.position28 <= 3 && m.clicks28 > 0)
    return { url: m.url, diagnosis: 'Winner: protect and amplify', score: 50, actions: [t('offsite-pr', 'link_building_for_url', {}, false)] };

  if (m.aiCitationGap)
    return { url: m.url, diagnosis: 'AI-citation gap', score: 60, actions: [t('geo-visibility', 'fix_citation_gap'), t('offsite-pr', 'third_party_mentions', {}, false)] };

  if (m.indexed && m.impressions28 < 10 && m.daysSincePublished >= 28)
    return { url: m.url, diagnosis: 'Indexed but invisible', score: 55, actions: [t('internal-linking', 'add_links', { count: 3 }, true), t('content-writer', 'strengthen_intro')] };

  return null;
}

export function planSprint(metrics: UrlMetrics[], maxContentTasks = 12): Decision[] {
  const decisions = metrics.map(decide).filter((d): d is Decision => d !== null).sort((a, b) => b.score - a.score);
  let content = 0;
  return decisions.filter(d => {
    const n = d.actions.filter(a => a.agent === 'content-writer').length;
    if (content + n > maxContentTasks) return false;
    content += n; return true;
  });
}
