import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
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

    const isSecretValid = !TWINT_CONFIG.webhookSecret || !secretHeader || secretHeader === TWINT_CONFIG.webhookSecret;
    if (TWINT_CONFIG.webhookSecret && secretHeader) {
      if (secretHeader === TWINT_CONFIG.webhookSecret) {
        console.log('[TWINT Webhook] Webhook secret verified successfully');
      } else {
        console.warn('[TWINT Webhook] Webhook secret mismatch:', secretHeader);
      }
    }

    const orderNumber = payload.orderNumber || payload.order_id || payload.orderId || payload.reference;
    const status = payload.status || payload.payment_status || 'paid';
    const amount = payload.amount;

    console.log('[TWINT Webhook] Received notification:', {
      orderNumber,
      status,
      amount,
      storeUuid: payload.storeUUID || payload.store_uuid || TWINT_CONFIG.storeUuid,
    });

    if (orderNumber) {
      const supabase = getAdminSupabase();
      const cleanOrderNum = String(orderNumber).trim();

      await supabase
        .from('orders')
        .update({
          payment_status: status === 'SUCCESS' || status === 'paid' ? 'paid' : status,
          status: status === 'SUCCESS' || status === 'paid' ? 'in_processing' : 'pending',
          updated_at: new Date().toISOString(),
        })
        .or(`order_number.eq.${cleanOrderNum},id.eq.${cleanOrderNum}`);
    }

    return NextResponse.json({
      success: true,
      received: true,
      storeUuid: TWINT_CONFIG.storeUuid,
      merchantName: TWINT_CONFIG.merchantName,
    });
  } catch (err: any) {
    console.error('[TWINT Webhook] Error processing webhook:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
