import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { claimNext, db, enqueue, saveArtifact, todaysCostUsd } from './db';
import { ask } from './llm';
import type { AgentName, Task } from './types';

const TIER: Record<AgentName, 'orchestrator' | 'worker' | 'cheap'> = {
  orchestrator: 'orchestrator', 'keyword-researcher': 'worker', 'serp-analyst': 'worker', 'content-writer': 'worker',
  'compliance-checker': 'worker', 'technical-auditor': 'cheap', 'schema-feed': 'worker', 'image-checker': 'cheap',
  'internal-linking': 'cheap', 'geo-visibility': 'worker', 'offsite-pr': 'worker', reporter: 'cheap',
};

function agentPrompt(agent: AgentName): string {
  const raw = readFileSync(join(process.cwd(), '.claude', 'agents', `${agent}.md`), 'utf8');
  return raw.replace(/^---[\s\S]*?---\n/, ''); // strip frontmatter
}

/** Writer -> compliance -> human approval pipeline. Everything else is a single step. */
const NEXT_STEP: Partial<Record<AgentName, { agent: AgentName; type: string }>> = {
  'content-writer': { agent: 'compliance-checker', type: 'review_draft' },
};

export async function runOne(): Promise<{ ran: boolean; taskId?: string }> {
  const cap = Number(process.env.DAILY_COST_CAP_USD ?? 15);
  if ((await todaysCostUsd()) >= cap) { console.warn('Daily cost cap reached; halting.'); return { ran: false }; }

  const task = await claimNext();
  if (!task) return { ran: false };
  try {
    await execute(task);
  } catch (e) {
    const failed = task.attempts >= task.max_attempts;
    await db().from('tasks').update({ status: failed ? 'failed' : 'queued', error: String(e), updated_at: new Date().toISOString() }).eq('id', task.id);
  }
  return { ran: true, taskId: task.id };
}

async function execute(task: Task): Promise<void> {
  const output = await ask({
    agent: task.agent, tier: TIER[task.agent], system: agentPrompt(task.agent),
    user: `Task type: ${task.type}\nPayload (JSON):\n${JSON.stringify(task.payload, null, 2)}\n\nReturn the result as the agent's defined output.`,
  });
  const artifactId = await saveArtifact(task.id, task.agent, task.type, { text: output, payload: task.payload }, String(task.payload.url ?? ''));

  const next = NEXT_STEP[task.agent];
  if (next) await enqueue({ agent: next.agent, type: next.type, payload: { ...task.payload, draft_artifact_id: artifactId }, parent_task_id: task.id, requires_approval: true, created_by: task.agent });

  if (task.requires_approval && !next) {
    await db().from('approvals').insert({ artifact_id: artifactId, status: 'pending' });
    await db().from('tasks').update({ status: 'needs_approval', result_artifact_id: artifactId, updated_at: new Date().toISOString() }).eq('id', task.id);
    return;
  }
  await db().from('tasks').update({ status: next ? 'needs_review' : 'done', result_artifact_id: artifactId, updated_at: new Date().toISOString() }).eq('id', task.id);
}
