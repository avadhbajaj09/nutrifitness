import { NextResponse } from 'next/server';
import {
  createStaffSession, isSameOrigin, isSessionConfigured, sessionCookie,
  SESSION_DURATION_MS, type StaffRole, validStaffPassword, verifyStaffSession
} from '@/lib/adminSession';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const isRole = (value: unknown): value is StaffRole => value === 'admin' || value === 'omar';
function privateResponse<T extends NextResponse>(response: T): T {
  response.headers.set('Cache-Control', 'no-store, private');
  return response;
}

export async function GET(request: Request) {
  const role = new URL(request.url).searchParams.get('role');
  if (!isRole(role)) return privateResponse(NextResponse.json({ authenticated: false }, { status: 400 }));
  const cookies = request.headers.get('cookie') || '';
  const token = cookies.split(';').map(s => s.trim()).find(s => s.startsWith(sessionCookie(role) + '='))
    ?.slice(sessionCookie(role).length + 1);
  return privateResponse(NextResponse.json({ authenticated: await verifyStaffSession(token, role) }));
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return privateResponse(NextResponse.json({ error: 'Invalid origin' }, { status: 403 }));
  if (Number(request.headers.get('content-length') || 0) > 2048)
    return privateResponse(NextResponse.json({ error: 'Request too large' }, { status: 413 }));
  const body = await request.json().catch(() => ({}));
  const { role, password } = body;
  if (!isRole(role)) return privateResponse(NextResponse.json({ error: 'Invalid role' }, { status: 400 }));
  if (!isSessionConfigured()) return privateResponse(NextResponse.json({ error: 'Staff login not configured' }, { status: 503 }));
  if (!(await validStaffPassword(role, password)))
    return privateResponse(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }));
  const response = privateResponse(NextResponse.json({ authenticated: true }));
  response.cookies.set(sessionCookie(role), await createStaffSession(role), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict',
    path: '/', maxAge: SESSION_DURATION_MS / 1000,
  });
  return response;
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return privateResponse(NextResponse.json({ error: 'Invalid origin' }, { status: 403 }));
  const role = new URL(request.url).searchParams.get('role');
  if (!isRole(role)) return privateResponse(NextResponse.json({ error: 'Invalid role' }, { status: 400 }));
  const response = privateResponse(NextResponse.json({ authenticated: false }));
  response.cookies.set(sessionCookie(role), '', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict',
    path: '/', maxAge: 0,
  });
  return response;
}
