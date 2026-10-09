import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { z } from 'zod';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = getAdminSupabase();

    // Fetch all orders
    const { data: rawOrders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Omar Orders API] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter to orders belonging to or fulfilled by Omar Portugal warehouse
    const portugalOrders = (rawOrders || []).filter((o: any) => {
      const addr = (o.shipping_address && typeof o.shipping_address === 'object') ? o.shipping_address : {};
      
      // 1. Explicitly marked as Omar or Portugal
      if (o.fulfilled_by === 'omar' || addr.fulfilled_by === 'omar') return true;
      if (o.fulfillment_origin === 'PORTUGAL' || addr.fulfillment_origin === 'PORTUGAL') return true;

      // 2. City or country indicates Portugal or EU destination
      const city = (addr.city || '').toLowerCase();
      const country = (addr.country || '').toLowerCase();
      if (city.includes('lisbon') || city.includes('porto') || city.includes('portugal') || country.includes('portugal')) {
        return true;
      }

      // 3. Any item has a Portugal origin hint or product
      const items = Array.isArray(o.items) ? o.items : [];
      const hasPortugalItem = items.some((it: any) => {
        const origin = (it.shippingOrigin || it.origin || '').toLowerCase();
        const sku = (it.sku || it.id || '').toLowerCase();
        return origin === 'portugal' || sku.includes('bigman') || sku.includes('pt-');
      });

      return hasPortugalItem;
    });

    const mapped = portugalOrders.map((o: any) => {
      const addr = (o.shipping_address && typeof o.shipping_address === 'object') ? o.shipping_address : {};
      return {
        id: o.id,
        order_number: o.order_number || `WEB-${o.id.slice(0, 8)}`,
        created_at: o.created_at,
        customer_name: o.customer_name || 'Client',
        customer_email: o.customer_email || '',
        customer_phone: o.customer_phone || '',
        shipping_address: {
          address: addr.address || '',
          city: addr.city || '',
          postalCode: addr.postalCode || '',
          country: addr.country || 'Portugal',
          shippingMethod: addr.shippingMethod || 'standard',
          shippingLabel: addr.shippingLabel || 'Standard Delivery',
          trackingNumber: addr.trackingNumber || addr.tracking_number || '',
          carrier: addr.carrier || '',
          warehouse_notes: addr.warehouse_notes || '',
          fulfilled_by: 'omar',
        },
        items: Array.isArray(o.items) ? o.items : [],
        total_amount: Number(o.total_amount) || 0,
        currency: o.currency || 'CHF',
        payment_method: o.payment_method || 'TWINT',
        status: o.status || 'in_processing',
        fulfilled_by: 'omar',
        fulfillment_origin: 'PORTUGAL',
      };
    });

    const pendingCount = mapped.filter(o => o.status === 'pending').length;
    const processingCount = mapped.filter(o => o.status === 'in_processing').length;
    const packedCount = mapped.filter(o => o.status === 'packed').length;
    const shippedCount = mapped.filter(o => o.status === 'shipped').length;
    const deliveredCount = mapped.filter(o => o.status === 'delivered').length;

    return NextResponse.json({
      success: true,
      orders: mapped,
      totalCount: mapped.length,
      metrics: {
        total: mapped.length,
        pending: pendingCount,
        processing: processingCount,
        packed: packedCount,
        shipped: shippedCount,
        delivered: deliveredCount,
      },
    });
  } catch (err: any) {
    console.error('[Omar Orders API] GET error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

const UpdateOrderStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'in_processing', 'packed', 'shipped', 'delivered', 'cancelled', 'exception']),
  tracking_number: z.string().optional(),
  carrier: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = UpdateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.issues }, { status: 400 });
    }

    const { id, status, tracking_number, carrier, notes } = parsed.data;
    const supabase = getAdminSupabase();

    // 1. Fetch current order
    let { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', id)
      .maybeSingle();

    if (!order && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      const resById = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      order = resById.data;
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Merge updated shipping address metadata
    const addr = (order.shipping_address && typeof order.shipping_address === 'object') ? order.shipping_address : {};
    const updatedAddr = {
      ...addr,
      fulfilled_by: 'omar',
      fulfillment_origin: 'PORTUGAL',
      trackingNumber: tracking_number !== undefined ? tracking_number : (addr.trackingNumber || ''),
      carrier: carrier !== undefined ? carrier : (addr.carrier || 'CTT Express'),
      warehouse_notes: notes !== undefined ? notes : (addr.warehouse_notes || ''),
    };

    // Update order row
    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status,
        fulfilled_by: 'omar',
        fulfillment_origin: 'PORTUGAL',
        shipping_address: updatedAddr,
      })
      .eq('id', order.id);

    if (updateErr) {
      console.error('[Omar Orders API] Update error:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Also update fulfillment_shipments if a shipment exists
    try {
      await supabase
        .from('fulfillment_shipments')
        .update({
          status: status === 'shipped' ? 'in_transit' : status === 'delivered' ? 'delivered' : 'pending',
          tracking_number: tracking_number || null,
          carrier: carrier || 'CTT Express',
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', order.order_number);
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Order ${order.order_number} status updated to ${status} by Omar Team.`,
      status,
      fulfilled_by: 'omar',
    });
  } catch (err: any) {
    console.error('[Omar Orders API] PATCH error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
