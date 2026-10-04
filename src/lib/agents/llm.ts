import Anthropic from '@anthropic-ai/sdk';
import { db } from './db';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

export type Tier = 'orchestrator' | 'worker' | 'cheap';
const MODELS: Record<Tier, string> = {
  orchestrator: process.env.ORCHESTRATOR_MODEL ?? 'claude-opus-5-5',
  worker: process.env.WORKER_MODEL ?? 'claude-sonnet-5-5',
  cheap: process.env.CHEAP_MODEL ?? 'claude-haiku-4-5-20251001',
};
// Rough USD per million tokens [input, output]. Verify against current pricing and edit.
const PRICE: Record<Tier, [number, number]> = { orchestrator: [15, 75], worker: [3, 15], cheap: [1, 5] };

export async function ask(opts: { agent: string; tier: Tier; system: string; user: string; maxTokens?: number }): Promise<string> {
  const res = await client.messages.create({
    model: MODELS[opts.tier], max_tokens: opts.maxTokens ?? 4000, system: opts.system,
    messages: [{ role: 'user', content: opts.user }],
  });
  const [pi, po] = PRICE[opts.tier];
  const cost = (res.usage.input_tokens * pi + res.usage.output_tokens * po) / 1_000_000;
  await db().from('cost_log').insert({ agent: opts.agent, model: MODELS[opts.tier], input_tokens: res.usage.input_tokens, output_tokens: res.usage.output_tokens, cost_usd: cost });
  return res.content.map(b => (b.type === 'text' ? b.text : '')).join('');
}

/** Ask for JSON only; strip fences; throw if invalid so the task retries. */
export async function askJson<T>(opts: Parameters<typeof ask>[0]): Promise<T> {
  const raw = await ask({ ...opts, system: `${opts.system}\n\nReturn ONLY valid JSON. No prose, no markdown fences.` });
  return JSON.parse(raw.replace(/```json|```/g, '').trim()) as T;
}
