import { db, enqueue } from './db';
import { planSprint } from './decisions';
import { ask } from './llm';
import type { UrlMetrics } from './types';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Weekly: load measured metrics, apply deterministic rules, enqueue tasks, ask the LLM for a short rationale. */
export async function runWeeklyPlan(loadMetrics: () => Promise<UrlMetrics[]>): Promise<{ created: number }> {
  const metrics = await loadMetrics();
  const decisions = planSprint(metrics);
  let created = 0;
  for (const d of decisions) for (const a of d.actions) { await enqueue({ ...a, created_by: 'orchestrator', payload: { ...a.payload, reason: d.diagnosis } }); created++; }

  const system = readFileSync(join(process.cwd(), '.claude', 'agents', 'orchestrator.md'), 'utf8').replace(/^---[\s\S]*?---\n/, '');
  const summary = await ask({ agent: 'orchestrator', tier: 'orchestrator', system, maxTokens: 1500,
    user: `Write a short sprint plan (bullets) for the human. Decisions made by rules:\n${JSON.stringify(decisions.map(d => ({ url: d.url, diagnosis: d.diagnosis, tasks: d.actions.map(a => `${a.agent}:${a.type}`) })), null, 2)}` });
  await db().from('artifacts').insert({ agent: 'orchestrator', kind: 'sprint_plan', content: { text: summary, decisions } });
  return { created };
}
