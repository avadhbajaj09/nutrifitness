import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { NewTask, Task } from './types';

let client: SupabaseClient | null = null;
export function db(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing');
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export async function enqueue(t: NewTask): Promise<string> {
  const { data, error } = await db().from('tasks').insert({
    agent: t.agent, type: t.type, payload: t.payload, priority: t.priority ?? 3,
    requires_approval: t.requires_approval ?? false, parent_task_id: t.parent_task_id ?? null, created_by: t.created_by ?? 'orchestrator',
  }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

/** Claim the next queued task atomically enough for a single-runner cron. */
export async function claimNext(): Promise<Task | null> {
  const { data } = await db().from('tasks').select('*').eq('status', 'queued').order('priority').order('created_at').limit(1);
  const t = data?.[0] as Task | undefined;
  if (!t) return null;
  const { data: upd } = await db().from('tasks').update({ status: 'running', attempts: t.attempts + 1, updated_at: new Date().toISOString() }).eq('id', t.id).eq('status', 'queued').select('*').single();
  return (upd as Task) ?? null;
}

export async function saveArtifact(taskId: string, agent: string, kind: string, content: unknown, url?: string): Promise<string> {
  const { data, error } = await db().from('artifacts').insert({ task_id: taskId, agent, kind, content, url: url ?? null }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function todaysCostUsd(): Promise<number> {
  const since = new Date(); since.setUTCHours(0, 0, 0, 0);
  const { data } = await db().from('cost_log').select('cost_usd').gte('logged_at', since.toISOString());
  return (data ?? []).reduce((s, r) => s + Number((r as { cost_usd: number }).cost_usd), 0);
}

export async function isApproved(artifactId: string): Promise<boolean> {
  const { data } = await db().from('approvals').select('id').eq('artifact_id', artifactId).eq('status', 'approved').limit(1);
  return (data?.length ?? 0) > 0;
}
