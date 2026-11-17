/**
 * Legacy warehouse login endpoint: issue the same signed server session as
 * /api/auth/session without accepting an embedded default password.
 */
import { POST as createSession } from '@/app/api/auth/session/route';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const headers = new Headers(request.headers);
  headers.set('content-type', 'application/json');
  headers.delete('content-length');
  const delegated = new Request(request.url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ role: 'omar', password: body.password })
  });
  return createSession(delegated);
}
