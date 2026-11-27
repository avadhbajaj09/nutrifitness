import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });

    const amountShipping = typeof session.total_details?.amount_shipping === 'number'
      ? session.total_details.amount_shipping / 100
      : 0;
    const amountDiscount = typeof session.total_details?.amount_discount === 'number'
      ? session.total_details.amount_discount / 100
      : 0;
    const amountTax = typeof session.total_details?.amount_tax === 'number'
      ? session.total_details.amount_tax / 100
      : 0;

    return NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email || session.customer_email,
      customer_name: session.customer_details?.name,
      amount_total: session.amount_total ? session.amount_total / 100 : 0,
      amount_shipping: amountShipping,
      amount_discount: amountDiscount,
      amount_tax: amountTax,
      currency: session.currency?.toUpperCase() || 'CHF',
      metadata: session.metadata || {},
      order_id: session.metadata?.order_number || session.client_reference_id,
      line_items: session.line_items?.data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
