import { NextResponse } from 'next/server';
import { TWINT_CONFIG } from '@/lib/twint';

export const runtime = 'nodejs';

/**
 * TWINT / MameDev Webhook Handler
 * Verifies webhook secret or token and confirms order payments.
 */
export async function GET(req: Request) {
  // Webhook health check / ping
  return NextResponse.json({
    status: 'active',
    gateway: 'TWINT Suisse',
    storeUuid: TWINT_CONFIG.storeUuid,
    merchantName: TWINT_CONFIG.merchantName,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      payload = Object.fromEntries(params.entries());
    }

    const authHeader = req.headers.get('authorization') || '';
    const secretHeader = 
      req.headers.get('x-twint-signature') || 
      req.headers.get('x-webhook-secret') || 
      req.headers.get('x-webhook-key') ||
      req.headers.get('x-api-key') ||
      (authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader) ||
      payload.secret ||
      payload.webhook_secret ||
      payload.key ||
      '';

    // Stripe is the authoritative online checkout provider. Do not accept
    // legacy callbacks as proof of payment until the provider contract and
    // amount/currency reconciliation are implemented and tested.
    if (!TWINT_CONFIG.webhookSecret || !secretHeader || secretHeader !== TWINT_CONFIG.webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized webhook' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Legacy TWINT callback disabled; use verified Stripe payment events' }, { status: 503 });
  } catch (err: any) {
    console.error('[TWINT Webhook] Error processing webhook:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
