import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { generateSwissPostLabel } from '@/lib/swisspost/label';
import { sendShipmentUpdate } from '@/lib/email/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminSupabase();
    const orderId = params.id;
    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    const isPdfRequested = format === 'pdf';

    // 1. Fetch order from Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${orderId},order_number.eq.${orderId}`)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const addr = typeof order.shipping_address === 'object' ? order.shipping_address : {};
    const recipientName = order.customer_name || addr.name || addr.fullName || 'Client';
    const street = addr.address || addr.street || '';
    const zip = addr.postalCode || addr.postal_code || addr.zip || '';
    const city = addr.city || '';
    const country = addr.country || 'CH';

    if (!street || !zip || !city) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Incomplete shipping address for order ${order.order_number || order.id}. Street, Postal Code, and City are required.` 
        }, 
        { status: 400 }
      );
    }

    // 2. Generate live Swiss Post label
    const labelResult = await generateSwissPostLabel({
      orderId: order.order_number || `NF-${order.id.slice(0, 8)}`,
      recipient: {
        name: recipientName,
        street,
        zip,
        city,
        country,
        email: order.customer_email || addr.email,
        phone: order.customer_phone || addr.phone,
      },
      weightKg: Number(order.package_weight) || 1.0,
      service: 'PRI',
    });

    // 3. Update order in Supabase with tracking number
    await supabase
      .from('orders')
      .update({
        tracking_number: labelResult.trackingNumber,
        shipping_status: 'label_created',
        label_created_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    // 3b. Send shipping tracking update email to customer
    const targetEmail = order.customer_email || addr.email;
    if (targetEmail && targetEmail.includes('@')) {
      try {
        await sendShipmentUpdate(targetEmail, {
          orderNumber: order.order_number || `NF-${order.id.slice(0, 8)}`,
          trackingNumber: labelResult.trackingNumber,
          carrier: 'La Poste Suisse',
        });
      } catch (shipMailErr) {
        console.warn('[SwissPost Label API] Could not send tracking email:', shipMailErr);
      }
    }

    // 4. Return binary PDF if requested
    if (isPdfRequested) {
      return new NextResponse(new Uint8Array(labelResult.pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="SwissPost_${labelResult.trackingNumber}.pdf"`,
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    // Return JSON with PDF base64 and details
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      trackingNumber: labelResult.trackingNumber,
      formattedTrackingNumber: labelResult.formattedTrackingNumber,
      pdfBase64: labelResult.pdfBase64,
      recipient: {
        name: recipientName,
        street,
        zip,
        city,
        country,
      },
      sender: {
        name1: process.env.SWISSPOST_SENDER_NAME1 || 'NUTRIFITNESS',
        name2: process.env.SWISSPOST_SENDER_NAME2 || '',
        street: process.env.SWISSPOST_SENDER_STREET || 'Rue des Pâquis 34',
        zip: process.env.SWISSPOST_SENDER_ZIP || '1201',
        city: process.env.SWISSPOST_SENDER_CITY || 'Genève',
      },
    });
  } catch (err: any) {
    console.error('[Label API Route Error]', err);
    return NextResponse.json({ success: false, error: err.message || 'Error generating label' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  return GET(request, { params });
}
