import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { z } from 'zod';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const status = searchParams.get('status');
  const needsAttention = searchParams.get('needs_attention');

  try {
    const supabase = getAdminSupabase();
    let query = supabase
      .from('fulfillment_shipments')
      .select('*')
      .order('created_at', { ascending: false });

    if (origin) query = query.eq('origin_id', origin);
    if (status) query = query.eq('status', status);
    if (needsAttention === 'true') query = query.eq('needs_attention', true);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ shipments: data ?? [], success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

const ShipmentUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending','label_created','label_printed','in_transit','delivered','exception','needs_attention','cancelled']).optional(),
  needs_attention: z.boolean().optional(),
  attention_reason: z.string().optional(),
  tracking_number: z.string().optional(),
  tracking_url: z.string().optional(),
  label_url: z.string().optional(),
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = ShipmentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from('fulfillment_shipments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, shipment: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
