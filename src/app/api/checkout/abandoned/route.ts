import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { sendAbandonedCartAlertToMarco, sendCustomerCartRecoveryEmail } from '@/lib/email/resend';
import { verifyCartRestoreToken } from '@/lib/cartRestore';
import { isValidAbandonedLeadId, canUpdateAbandonedLead } from '@/lib/abandonedLead';

async function sendRecoveryForOrder(targetNumber: string) {
  const supabase = getAdminSupabase();
  const { data: order } = await supabase.from('orders').select('*')
    .eq('order_number', targetNumber).maybeSingle();
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  const result = await sendCustomerCartRecoveryEmail({
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    totalAmount: order.total_amount,
    currency: order.currency,
    items: order.items
  });
  if (result.success) {
    const shipping = order.shipping_address || {};
    await supabase.from('orders').update({
      shipping_address: { ...shipping, customer_recovery_sent_at: new Date().toISOString() }
    }).eq('order_number', targetNumber);
  }
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get('action') === 'send_recovery') {
    const target = url.searchParams.get('target');
    if (!target) return NextResponse.json({ error: 'Missing target order number' }, { status: 400 });
    try { return await sendRecoveryForOrder(target); }
    catch { return NextResponse.json({ error: 'Recovery action failed' }, { status: 500 }); }
  }
  try {
    const body = await req.json();
    const {
      leadId,
      orderNumber,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      items,
      totalAmount,
      currency = 'CHF',
      paymentMethod = 'NONE'
    } = body;

    const email = (customerEmail || '').trim();
    const phone = (customerPhone || '').trim();

    // Must have at least email or phone and some cart items
    if ((!email || !email.includes('@')) && (!phone || phone.length < 6)) {
      return NextResponse.json({ success: false, reason: 'No valid contact info yet' }, { status: 200 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, reason: 'Empty cart' }, { status: 200 });
    }

    const targetOrderNumber = String(orderNumber || leadId || `LEAD-${Date.now()}`);
    if (!isValidAbandonedLeadId(targetOrderNumber) ||
        (leadId && orderNumber && String(leadId) !== String(orderNumber))) {
      return NextResponse.json({ error: 'Invalid abandoned cart identifier' }, { status: 400 });
    }
    if (items.length > 100) return NextResponse.json({ error: 'Too many cart items' }, { status: 400 });

    const supabase = getAdminSupabase();
    // Never let this public endpoint alter paid, pending or another customer's orders.
    const { data: existing, error: existingError } = await supabase
      .from('orders')
      .select('status, shipping_address, customer_email, customer_phone')
      .eq('order_number', targetOrderNumber)
      .maybeSingle();
    if (existingError) return NextResponse.json({ error: 'Could not check cart status' }, { status: 500 });
    if (existing && existing.status !== 'abandoned') {
      return NextResponse.json({ success: true, message: 'Existing order is not an abandoned cart' });
    }
    if (!canUpdateAbandonedLead(existing, email, phone)) {
      return NextResponse.json({ error: 'Cannot modify this abandoned cart' }, { status: 409 });
    }

    const cleanItems = items.map((it: any) => ({
      id: it.id || it.productId || '',
      name: typeof it.name === 'object' && it.name !== null ? (it.name.fr || Object.values(it.name)[0] || 'Produit') : String(it.name || 'Produit'),
      sku: it.sku || '',
      flavor: typeof it.flavor === 'object' && it.flavor !== null ? (it.flavor.fr || '') : String(it.flavor || 'Standard'),
      format: typeof it.format === 'object' && it.format !== null ? (it.format.fr || '') : String(it.format || 'Standard'),
      price: Number(it.price || 0),
      quantity: Math.max(1, Number(it.quantity || 1)),
      image: it.image || it.image_url || '/images/placeholder.webp'
    }));

    const cleanSubtotal = cleanItems.reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0);
    const cleanTotal = Number(totalAmount) || cleanSubtotal;

    const existingShipping = existing?.shipping_address || {};
    const alertAlreadySent = !!existingShipping.marco_alert_sent_at;

    const updatedShippingAddress = {
      ...existingShipping,
      name: customerName || existingShipping.name || '',
      email: email || existingShipping.email || '',
      phone: phone || existingShipping.phone || '',
      street: shippingAddress?.street || existingShipping.street || '',
      address: shippingAddress?.street || existingShipping.address || '',
      city: shippingAddress?.city || existingShipping.city || '',
      postalCode: shippingAddress?.postalCode || existingShipping.postalCode || '',
      country: shippingAddress?.country || existingShipping.country || 'CH',
      subtotal: cleanSubtotal,
      totalAmount: cleanTotal,
      marco_alert_sent_at: alertAlreadySent ? existingShipping.marco_alert_sent_at : new Date().toISOString()
    };

    // Upsert as abandoned cart
    const { error: upsertErr } = await supabase.from('orders').upsert({
      order_number: targetOrderNumber,
      customer_name: customerName || 'Client Intéressé',
      customer_email: email,
      customer_phone: phone,
      total_amount: cleanTotal,
      currency: (currency || 'CHF').toUpperCase(),
      payment_method: (paymentMethod || 'NONE').toUpperCase(),
      status: 'abandoned',
      items: cleanItems,
      shipping_address: updatedShippingAddress
    }, { onConflict: 'order_number' });

    if (upsertErr) {
      console.error('[Abandoned Lead API] Upsert error:', upsertErr);
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    // Send immediate email alert to Marco (ONLY Marco, not Omar) if not sent yet
    if (!alertAlreadySent && (email || phone)) {
      try {
        console.log(`[Abandoned Lead API] Sending instant alert to Marco for ${customerName} (${cleanTotal} CHF)`);
        await sendAbandonedCartAlertToMarco({
          orderNumber: targetOrderNumber,
          customerName: customerName || 'Client Intéressé',
          customerEmail: email,
          customerPhone: phone,
          totalAmount: cleanTotal,
          currency: (currency || 'CHF').toUpperCase(),
          items: cleanItems,
          shippingAddress: updatedShippingAddress
        });
      } catch (mailErr: any) {
        console.warn('[Abandoned Lead API] Warning: could not send email to Marco:', mailErr.message);
      }
    }

    return NextResponse.json({ success: true, leadId: targetOrderNumber });
  } catch (err: any) {
    console.error('[Abandoned Lead API] Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const orderNumber = searchParams.get('orderNumber');
    const supabase = getAdminSupabase();

    // 1. Restore specific cart on /commande?restore=...
    if (orderNumber) {
      // The former sequential WEB-ID lookup exposed private shipping and contact data.
      // Only a seven-day signed URL generated in a recovery email may retrieve it.
      if (!(await verifyCartRestoreToken(orderNumber, searchParams.get('token')))) {
        return NextResponse.json({ error: 'Invalid or expired recovery link' }, { status: 401 });
      }
      const { data: order, error } = await supabase
        .from('orders')
        .select('customer_email, customer_phone, customer_name, shipping_address')
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (error || !order) {
        return NextResponse.json({ error: 'Order or lead not found' }, { status: 404 });
      }

      // Never expose whole order rows, payment metadata, or internal status on public links.
      const ship = order.shipping_address || {};
      return NextResponse.json({
        success: true,
        lead: {
          customer_email: order.customer_email, customer_phone: order.customer_phone,
          customer_name: order.customer_name,
          shipping_address: {
            street: ship.street || ship.address, postalCode: ship.postalCode,
            city: ship.city, country: ship.country
          }
        }
      }, { headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } });
    }

    // Recovery emails are state-changing operations and must not be GET requests.
    if (action === 'send_recovery') {
      return NextResponse.json({ error: 'Use authenticated POST for recovery emails' }, { status: 405 });
    }

    // 3. List all abandoned carts for Admin Dashboard
    const { data: abandonedCarts, error } = await supabase
      .from('orders')
      .select('*')
      .or('status.eq.abandoned,status.eq.pending,status.eq.cancelled')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter out internal tests and counter sales
    const filtered = (abandonedCarts || []).filter(o => {
      if (o.customer_name === 'Client Comptoir') return false;
      const name = (o.customer_name || '').toLowerCase();
      const email = (o.customer_email || '').toLowerCase();
      const num = (o.order_number || '').toLowerCase();

      if (num.startsWith('test-') || name.includes('test') || name.includes('jean dupont') || name.includes('client async')) {
        return false;
      }
      if (email.includes('test@') || email.includes('async@') || email.includes('example.com')) {
        return false;
      }
      return true;
    });

    return NextResponse.json({ success: true, abandonedCarts: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
