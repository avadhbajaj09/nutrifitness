import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { stripe } from '@/lib/stripe';
import { sendMetaConversionEvent } from '@/lib/meta-capi';
import { getAdminSupabase } from '@/lib/supabase';

function verifyStripeSignature(rawBody: string, sigHeader: string, secret: string): boolean {
  try {
    const parts = sigHeader.split(',');
    let timestamp = '';
    const signatures: string[] = [];

    for (const part of parts) {
      const [key, val] = part.split('=');
      if (key === 't') timestamp = val;
      if (key === 'v1') signatures.push(val);
    }

    if (!timestamp || signatures.length === 0) return false;

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return signatures.some(sig => {
      try {
        return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'));
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const sigHeader = req.headers.get('stripe-signature');
    const rawBody = await req.text();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: any;
    if (webhookSecret && sigHeader) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, sigHeader, webhookSecret);
      } catch (err: any) {
        // Fallback to manual verification if stripe SDK error
        const isValid = verifyStripeSignature(rawBody, sigHeader, webhookSecret);
        if (!isValid) {
          return NextResponse.json({ error: `Invalid Stripe signature: ${err.message}` }, { status: 400 });
        }
        event = JSON.parse(rawBody);
      }
    } else {
      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }
    }

    // Process successful payment events
    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object;
      if (session) {
        const eventId =
          session.metadata?.event_id ||
          session.metadata?.order_number ||
          session.client_reference_id ||
          session.id;

        const email = session.customer_details?.email || session.customer_email || undefined;
        const phone = session.customer_details?.phone || undefined;
        const value = session.amount_total ? session.amount_total / 100 : undefined;
        const currency = session.currency ? session.currency.toUpperCase() : 'CHF';

        await sendMetaConversionEvent({
          eventName: 'Purchase',
          eventId: String(eventId),
          eventSourceUrl: 'https://nutrifitness.ch/commande',
          value,
          currency,
          email,
          phone,
          fbp: session.metadata?.fbp,
          fbc: session.metadata?.fbc,
          clientIp: session.metadata?.client_ip,
          clientUserAgent: session.metadata?.client_user_agent,
        });

        // Ensure order is recorded in database if not already created
        try {
          const supabase = getAdminSupabase();
          const orderNum = String(eventId);
          const { data: existing } = await supabase
            .from('orders')
            .select('id, status')
            .eq('order_number', orderNum)
            .maybeSingle();

          if (existing) {
            // Update status to in_processing if pending
            if (existing.status === 'pending' || existing.status === 'unpaid') {
              await supabase
                .from('orders')
                .update({ status: 'in_processing' })
                .eq('order_number', orderNum);
            }
          } else {
            // Insert verified paid order from session metadata
            await supabase.from('orders').insert({
              order_number: orderNum,
              total_amount: value || 0,
              currency: currency || 'CHF',
              payment_method: (session.metadata?.payment_selected || 'ONLINE').toUpperCase(),
              status: 'in_processing',
              shipping_address: {
                name: session.metadata?.customer_name || session.customer_details?.name || 'Client',
                email: email || '',
                phone: phone || session.metadata?.customer_phone || '',
                street: session.metadata?.shipping_street || '',
                city: session.metadata?.shipping_city || '',
                postalCode: session.metadata?.shipping_postal_code || '',
                country: session.metadata?.shipping_country || 'CH',
                stripeSessionId: session.id,
                confirmedByWebhook: true,
              },
              items: [],
            });
          }
        } catch (dbErr) {
          console.error('[Stripe Webhook] Error updating database order:', dbErr);
        }
      }
    } else if (event.type === 'checkout.session.async_payment_failed' || event.type === 'payment_intent.payment_failed') {
      const failedObj = event.data?.object;
      const orderNum =
        failedObj?.metadata?.order_number ||
        failedObj?.client_reference_id;
      if (orderNum) {
        try {
          const supabase = getAdminSupabase();
          await supabase
            .from('orders')
            .update({ status: 'payment_failed' })
            .eq('order_number', orderNum);
        } catch (failErr) {
          console.error('[Stripe Webhook] Error recording payment failure:', failErr);
        }
      }
    } else if (event.type === 'payment_intent.succeeded') {
      const pi = event.data?.object;
      if (pi && !pi.metadata?.handled_by_session) {
        const eventId =
          pi.metadata?.event_id ||
          pi.metadata?.order_number ||
          pi.id;

        const email = pi.receipt_email || pi.metadata?.customer_email || undefined;
        const phone = pi.metadata?.customer_phone || undefined;
        const value = pi.amount ? pi.amount / 100 : undefined;
        const currency = pi.currency ? pi.currency.toUpperCase() : 'CHF';

        await sendMetaConversionEvent({
          eventName: 'Purchase',
          eventId: String(eventId),
          eventSourceUrl: 'https://nutrifitness.ch/commande',
          value,
          currency,
          email,
          phone,
          fbp: pi.metadata?.fbp,
          fbc: pi.metadata?.fbc,
          clientIp: pi.metadata?.client_ip,
          clientUserAgent: pi.metadata?.client_user_agent,
        });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
