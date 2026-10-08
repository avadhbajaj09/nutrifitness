import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { z } from 'zod';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('fulfillment_stock')
      .select('*')
      .order('product_id');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ stock: data ?? [], success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

const StockUpdateSchema = z.object({
  productId: z.string(),
  variantSku: z.string().optional(),
  originId: z.enum(['GENEVA', 'PORTUGAL']),
  quantity: z.number().int().min(0),
  productSku: z.string().optional(),
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = StockUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 });
    }

    const { productId, variantSku, originId, quantity, productSku } = parsed.data;
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from('fulfillment_stock')
      .upsert({
        product_id: productId,
        product_sku: productSku ?? productId,
        variant_sku: variantSku ?? null,
        origin_id: originId,
        quantity,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'product_id,variant_sku,origin_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, stock: data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return PATCH(request);
}
