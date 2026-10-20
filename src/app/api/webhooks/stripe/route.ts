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

    // Enforce 5-minute timestamp tolerance in production to protect against replay attacks
    const eventTime = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(eventTime) || (process.env.NODE_ENV === 'production' && Math.abs(now - eventTime) > 300)) {
      return false;
    }

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return signatures.some(sig => {
      try {
        const sigBuf = Buffer.from(sig, 'hex');
        const expBuf = Buffer.from(expectedSig, 'hex');
        if (sigBuf.length !== expBuf.length) return false;
        return crypto.timingSafeEqual(sigBuf, expBuf);
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
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Stripe Webhook] Error: STRIPE_WEBHOOK_SECRET environment variable is missing.');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const sigHeader = req.headers.get('stripe-signature');
    if (!sigHeader) {
      console.warn('[Stripe Webhook] Warning: Missing stripe-signature header.');
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const rawBody = await req.text();
    if (!rawBody) {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sigHeader, webhookSecret);
    } catch (err: any) {
      // Fallback manual verification if SDK verification encounters clock skew or formatting difference
      const isValid = verifyStripeSignature(rawBody, sigHeader, webhookSecret);
      if (!isValid) {
        console.warn(`[Stripe Webhook] Signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Invalid Stripe signature: ${err.message}` }, { status: 400 });
      }
      try {
        event = JSON.parse(rawBody);
      } catch (parseErr) {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }
    }

    // 1. Process successful checkout and payment events
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data?.object;
      if (session) {
        const orderNumber =
          session.metadata?.order_number ||
          session.client_reference_id ||
          session.metadata?.event_id ||
          session.id;

        const email = session.customer_details?.email || session.customer_email || undefined;
        const phone = session.customer_details?.phone || undefined;
        const customerName = session.customer_details?.name || session.metadata?.customer_name || 'Client';
        const value = session.amount_total ? session.amount_total / 100 : undefined;
        const currency = session.currency ? session.currency.toUpperCase() : 'CHF';
        const paymentMethod = (
          session.payment_method_types?.[0] ||
          session.metadata?.payment_selected ||
          'CARD'
        ).toUpperCase();

        // Send Meta Conversion API (non-blocking / error-isolated)
        try {
          await sendMetaConversionEvent({
            eventName: 'Purchase',
            eventId: String(orderNumber),
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
        } catch (metaErr) {
          console.warn('[Stripe Webhook] Non-critical Meta CAPI tracking failed:', metaErr);
        }

        // Idempotent Order Persistence in Supabase
        const supabase = getAdminSupabase();
        const orderNum = String(orderNumber);

        const { data: existing, error: fetchErr } = await supabase
          .from('orders')
          .select('id, status, items, shipping_address')
          .eq('order_number', orderNum)
          .maybeSingle();

        if (fetchErr) {
          console.error(`[Stripe Webhook] Supabase error fetching order ${orderNum}:`, fetchErr);
          // Return 500 so Stripe retries when database recovers
          return NextResponse.json({ error: 'Database temporary error' }, { status: 500 });
        }

        // Retrieve purchased items from Stripe line items as fallback
        let sessionItems: any[] = [];
        try {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
            limit: 100,
            expand: ['data.price.product'],
          });
          for (const item of (lineItems.data || [])) {
            const product = item.price?.product as any;
            const desc = item.description || '';
            if (
              desc.toLowerCase().includes('frais de livraison') ||
              desc.toLowerCase().includes('frais de port') ||
              desc.toLowerCase().includes('expédition') ||
              product?.name?.toLowerCase().includes('frais de')
            ) {
              continue;
            }
            const img = Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : '';
            const meta = product?.metadata || {};
            const descParts = (product?.description || '').split('·').map((s: string) => s.trim());
            const unitPrice = item.amount_total && item.quantity ? (item.amount_total / item.quantity) / 100 : ((item.price?.unit_amount || 0) / 100);

            sessionItems.push({
              id: meta.product_id || product?.id || `item-${item.id}`,
              name: product?.name || desc || 'Produit',
              sku: meta.sku || item.price?.id || '',
              flavor: descParts[0] || 'Standard',
              format: descParts[1] || 'Standard',
              price: unitPrice,
              quantity: item.quantity || 1,
              image: img || '/images/placeholder.webp',
            });
          }
        } catch (itemErr) {
          console.warn('[Stripe Webhook] Error retrieving session line items:', itemErr);
        }

        if (existing) {
          // Idempotency: If already marked as in_processing, delivered, or shipped, do not re-process
          if (['in_processing', 'delivered', 'shipped', 'completed'].includes(existing.status)) {
            return NextResponse.json({ received: true, status: 'already_processed' }, { status: 200 });
          }

          // Update pending/unpaid order to in_processing
          const currentAddress = typeof existing.shipping_address === 'object' && existing.shipping_address ? existing.shipping_address : {};
          const updatePayload: any = {
            status: 'in_processing',
            payment_method: paymentMethod,
            shipping_address: {
              ...currentAddress,
              stripeSessionId: session.id,
              confirmedByWebhook: true,
              webhookConfirmedAt: new Date().toISOString(),
            }
          };

          // If existing order was created with empty items, fill with sessionItems
          if ((!existing.items || (Array.isArray(existing.items) && existing.items.length === 0)) && sessionItems.length > 0) {
            updatePayload.items = sessionItems;
          }

          const { error: updateErr } = await supabase
            .from('orders')
            .update(updatePayload)
            .eq('order_number', orderNum);

          if (updateErr) {
            console.error(`[Stripe Webhook] Failed to update order ${orderNum}:`, updateErr);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
          }
        } else {
          // Insert verified paid order directly from Stripe session
          const { error: insertErr } = await supabase.from('orders').insert({
            order_number: orderNum,
            customer_name: customerName,
            customer_email: email || '',
            customer_phone: phone || session.metadata?.customer_phone || '',
            total_amount: value || 0,
            currency: currency || 'CHF',
            payment_method: paymentMethod,
            status: 'in_processing',
            shipping_address: {
              name: customerName,
              email: email || '',
              phone: phone || session.metadata?.customer_phone || '',
              street: session.metadata?.shipping_street || '',
              city: session.metadata?.shipping_city || '',
              postalCode: session.metadata?.shipping_postal_code || '',
              country: session.metadata?.shipping_country || 'CH',
              stripeSessionId: session.id,
              confirmedByWebhook: true,
              webhookConfirmedAt: new Date().toISOString(),
            },
            items: sessionItems,
          });

          if (insertErr) {
            console.error(`[Stripe Webhook] Failed to insert order ${orderNum}:`, insertErr);
            return NextResponse.json({ error: 'Failed to record order' }, { status: 500 });
          }
        }
      }
    }

    // 2. Process Payment Intent Succeeded (only if not handled by checkout session)
    else if (event.type === 'payment_intent.succeeded') {
      const pi = event.data?.object;
      if (pi && !pi.metadata?.handled_by_session) {
        const orderNumber = pi.metadata?.order_number || pi.metadata?.event_id || pi.id;
        const email = pi.receipt_email || pi.metadata?.customer_email || undefined;
        const phone = pi.metadata?.customer_phone || undefined;
        const value = pi.amount ? pi.amount / 100 : undefined;
        const currency = pi.currency ? pi.currency.toUpperCase() : 'CHF';

        try {
          await sendMetaConversionEvent({
            eventName: 'Purchase',
            eventId: String(orderNumber),
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
        } catch (metaErr) {
          console.warn('[Stripe Webhook] Non-critical Meta CAPI tracking failed on PI:', metaErr);
        }

        // If order exists in database and is pending, update it
        try {
          const supabase = getAdminSupabase();
          const orderNum = String(orderNumber);
          const { data: existing } = await supabase
            .from('orders')
            .select('id, status')
            .eq('order_number', orderNum)
            .maybeSingle();

          if (existing && (existing.status === 'pending' || existing.status === 'unpaid')) {
            await supabase
              .from('orders')
              .update({ status: 'in_processing' })
              .eq('order_number', orderNum);
          }
        } catch (piDbErr) {
          console.warn('[Stripe Webhook] Error updating PI order status:', piDbErr);
        }
      }
    }

    // 3. Process Payment Failed events
    else if (
      event.type === 'checkout.session.async_payment_failed' ||
      event.type === 'payment_intent.payment_failed'
    ) {
      const failedObj = event.data?.object;
      const orderNum =
        failedObj?.metadata?.order_number ||
        failedObj?.client_reference_id;

      if (orderNum) {
        try {
          const supabase = getAdminSupabase();
          const { data: existing } = await supabase
            .from('orders')
            .select('id, status')
            .eq('order_number', String(orderNum))
            .maybeSingle();

          // Only mark failed if not already completed/in_processing
          if (existing && existing.status !== 'in_processing' && existing.status !== 'delivered' && existing.status !== 'shipped') {
            await supabase
              .from('orders')
              .update({ status: 'payment_failed' })
              .eq('order_number', String(orderNum));
          }
        } catch (failErr) {
          console.error('[Stripe Webhook] Error recording payment failure:', failErr);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Stripe Webhook] Unexpected internal handler error:', error?.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Reject non-POST requests with 405 Method Not Allowed
export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed. Stripe webhooks must use POST.' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method Not Allowed. Stripe webhooks must use POST.' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}
