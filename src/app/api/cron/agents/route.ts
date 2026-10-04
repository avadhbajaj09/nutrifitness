// Vercel Cron: runs queued agent tasks. Add to vercel.json: { "crons": [{ "path": "/api/cron/agents", "schedule": "*/10 * * * *" }] }
import { runOne } from '@/lib/agents/runner';

export const maxDuration = 300;

export async function GET(req: Request): Promise<Response> {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return new Response('Unauthorized', { status: 401 });
  const results = [];
  for (let i = 0; i < 3; i++) { const r = await runOne(); results.push(r); if (!r.ran) break; }
  return Response.json({ results });
}
