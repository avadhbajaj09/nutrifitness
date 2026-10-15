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

    // Sync to product_stock and product_variants
    try {
      const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
      const cleanId = productId.replace(/^prod-/, '');
      let pQuery = supabase.from('products').select('id, woo_id, slug, sku');
      if (isUUID(productId)) {
        pQuery = pQuery.eq('id', productId);
      } else {
        pQuery = pQuery.or(`woo_id.eq.${productId},woo_id.eq.${cleanId},slug.eq.${productId}`);
      }
      const { data: prod } = await pQuery.maybeSingle();

      if (prod) {
        let vId = null;
        if (variantSku) {
          const { data: vData } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', prod.id)
            .or(`sku.eq.${variantSku},attribute_value.ilike.%${variantSku}%`)
            .maybeSingle();

          if (vData) {
            vId = vData.id;
            const col = originId === 'GENEVA' ? 'stock_geneva' : 'stock_portugal';
            await supabase.from('product_variants').update({ [col]: quantity }).eq('id', vData.id);
          }
        }

        let sQuery = supabase.from('product_stock').select('*').eq('product_id', prod.id).eq('origin_id', originId);
        if (vId) sQuery = sQuery.eq('variant_id', vId);
        else sQuery = sQuery.is('variant_id', null);
        const { data: exStock } = await sQuery.maybeSingle();

        if (exStock) {
          await supabase.from('product_stock').update({ quantity, is_active: quantity > 0 }).eq('id', exStock.id);
        } else {
          await supabase.from('product_stock').insert({ product_id: prod.id, variant_id: vId, origin_id: originId, quantity, is_active: quantity > 0 });
        }
      }
    } catch (syncErr) {
      console.warn('[Fulfillment stock sync warning]:', syncErr);
    }

    return NextResponse.json({ success: true, stock: data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return PATCH(request);
}
