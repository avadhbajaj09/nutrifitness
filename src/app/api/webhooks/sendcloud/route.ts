import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-sendcloud-signature');
    const rawBody = await req.text();

    const isStubMode = process.env.SENDCLOUD_WEBHOOK_SECRET === 'stub_webhook_secret' || !process.env.SENDCLOUD_WEBHOOK_SECRET;

    if (!isStubMode) {
      // In real mode, verify HMAC-SHA256(rawBody, SENDCLOUD_WEBHOOK_SECRET) == signature
    } else {
      console.warn('[Sendcloud Webhook STUB MODE] Skipping signature verification');
    }

    const payload = JSON.parse(rawBody);
    console.log('Webhook payload:', payload.action);
    
    // Update fulfillment_shipments.status based on event
    // Log to fulfillment_events
    // Send customer email via Resend stub

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
