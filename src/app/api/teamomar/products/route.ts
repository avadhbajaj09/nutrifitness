import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim();
  const filter = searchParams.get('filter') || 'all'; // 'all' | 'portugal_only' | 'common' | 'low_stock'

  try {
    const supabase = getAdminSupabase();

    // Query products
    let query = supabase
      .from('products')
      .select(`
        id, woo_id, sku, name, slug, type, status, main_location,
        base_price, weight_kg, weight_grams, images,
        created_at, updated_at,
        product_variants (
          id, woo_id, sku, attribute_name, attribute_value,
          image_url, stock_portugal, weight_grams
        ),
        product_stock (
          id, variant_id, origin_id, quantity, is_active
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,woo_id.ilike.%${search}%`);
    }

    const { data: rawProducts, error } = await query;

    if (error) {
      console.error('[Omar Products API] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process and filter strictly to Portugal Warehouse products ONLY
    const portugalProducts = (rawProducts || [])
      .map((p: any) => {
        const stocks: any[] = p.product_stock || [];
        const parentStocks = stocks.filter(s => !s.variant_id);
        const ptStockEntry = parentStocks.find(s => s.origin_id === 'PORTUGAL');
        const genStockEntry = parentStocks.find(s => s.origin_id === 'GENEVA');

        const isPortugalActive = Boolean(ptStockEntry ? ptStockEntry.is_active : (p.main_location === 'PORTUGAL' || p.main_location === 'COMMON'));
        const isGenevaActive = Boolean(genStockEntry ? genStockEntry.is_active : (p.main_location !== 'PORTUGAL'));

        let locationType: 'PORTUGAL_ONLY' | 'COMMON' | 'GENEVA_ONLY' = 'GENEVA_ONLY';
        if (p.main_location === 'COMMON' || (isGenevaActive && isPortugalActive)) {
          locationType = 'COMMON';
        } else if (p.main_location === 'PORTUGAL' || (isPortugalActive && !isGenevaActive)) {
          locationType = 'PORTUGAL_ONLY';
        } else {
          locationType = 'GENEVA_ONLY';
        }

        // STRICT GATE: Omar's team can NEVER see Geneva-only products!
        if (locationType === 'GENEVA_ONLY') {
          return null;
        }

        const currentStockPortugal = ptStockEntry ? Number(ptStockEntry.quantity) || 0 : (p.main_location === 'PORTUGAL' ? 50 : 0);

        // Process variants
        const variants = (p.product_variants || []).map((v: any) => {
          const vStocks = stocks.filter(s => s.variant_id === v.id);
          const vPtStock = vStocks.find(s => s.origin_id === 'PORTUGAL');

          return {
            id: v.id,
            sku: v.sku || '',
            attribute_name: v.attribute_name,
            attribute_value: v.attribute_value,
            image_url: v.image_url,
            stock_portugal: vPtStock ? Number(vPtStock.quantity) || 0 : (Number(v.stock_portugal) || 0),
            is_active: vPtStock ? Boolean(vPtStock.is_active) : isPortugalActive,
          };
        });

        return {
          id: p.id,
          sku: p.sku || '',
          name: p.name,
          slug: p.slug,
          images: p.images || [],
          location_type: locationType,
          main_location: p.main_location,
          stock_portugal: currentStockPortugal,
          is_portugal_active: isPortugalActive,
          weight_kg: p.weight_kg,
          variants,
          updated_at: p.updated_at,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    // Apply secondary filters
    let filtered = portugalProducts;
    if (filter === 'portugal_only') {
      filtered = filtered.filter(p => p.location_type === 'PORTUGAL_ONLY');
    } else if (filter === 'common') {
      filtered = filtered.filter(p => p.location_type === 'COMMON');
    } else if (filter === 'low_stock') {
      filtered = filtered.filter(p => p.stock_portugal <= 5);
    }

    return NextResponse.json({
      success: true,
      products: filtered,
      totalCount: filtered.length,
      allPortugalCount: portugalProducts.length,
      portugalOnlyCount: portugalProducts.filter(p => p.location_type === 'PORTUGAL_ONLY').length,
      commonCount: portugalProducts.filter(p => p.location_type === 'COMMON').length,
      lowStockCount: portugalProducts.filter(p => p.stock_portugal <= 5).length,
    });
  } catch (err: any) {
    console.error('[Omar Products API] GET error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

const UpdatePortugalStockSchema = z.object({
  id: z.string(),
  stock_portugal: z.number().int().min(0).optional(),
  is_portugal_active: z.boolean().optional(),
  variants: z.array(z.object({
    id: z.string(),
    stock_portugal: z.number().int().min(0),
  })).optional(),
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = UpdatePortugalStockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.issues }, { status: 400 });
    }

    const { id, stock_portugal, is_portugal_active, variants } = parsed.data;
    const supabase = getAdminSupabase();

    // Verify product exists and is NOT Geneva-only
    const { data: existingProduct, error: fetchErr } = await supabase
      .from('products')
      .select('id, name, slug, main_location, product_stock (id, variant_id, origin_id, quantity, is_active)')
      .eq('id', id)
      .single();

    if (fetchErr || !existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Verify it is a Portugal or Common product
    const ptStocks = (existingProduct.product_stock || []).filter((s: any) => s.origin_id === 'PORTUGAL');
    const isAllowed = existingProduct.main_location === 'PORTUGAL' || 
                      existingProduct.main_location === 'COMMON' || 
                      ptStocks.length > 0;

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Forbidden: Marco Geneva-only products cannot be modified by Omar team.' },
        { status: 403 }
      );
    }

    const currentPtStock = ptStocks.find((s: any) => !s.variant_id);
    const newQty = stock_portugal !== undefined ? stock_portugal : (currentPtStock?.quantity ?? 0);
    const newActive = is_portugal_active !== undefined ? is_portugal_active : (currentPtStock?.is_active ?? true);

    // 1. Update product_stock for parent product
    if (stock_portugal !== undefined || is_portugal_active !== undefined) {
      await supabase.from('product_stock').upsert({
        product_id: id,
        variant_id: null,
        origin_id: 'PORTUGAL',
        quantity: newQty,
        is_active: newActive,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'product_id,origin_id' });

      // Sync fulfillment_stock
      await supabase.from('fulfillment_stock').upsert({
        product_id: id,
        product_sku: id,
        origin_id: 'PORTUGAL',
        quantity: newQty,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'product_id,variant_sku,origin_id' });
    }

    // 2. Update variant stocks if provided
    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (!v.id) continue;
        const vQty = Math.max(0, v.stock_portugal);

        await supabase.from('product_variants').update({
          stock_portugal: vQty,
          updated_at: new Date().toISOString(),
        }).eq('id', v.id);

        await supabase.from('product_stock').upsert({
          product_id: id,
          variant_id: v.id,
          origin_id: 'PORTUGAL',
          quantity: vQty,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'product_id,variant_id,origin_id' });
      }
    }

    // 3. Log to audit log
    await supabase.from('product_audit_log').insert({
      product_id: id,
      user_id: 'team_omar',
      action: 'update_portugal_stock',
      old_values: { ptStock: currentPtStock?.quantity },
      new_values: { stock_portugal: newQty, is_portugal_active: newActive, variants },
    });

    // 4. On-demand cache revalidation
    try {
      revalidatePath('/');
      revalidatePath('/boutique');
      revalidatePath('/admin/products');
      revalidatePath('/teamomar');
      if (existingProduct.slug) {
        revalidatePath(`/produit/${existingProduct.slug}`);
      }
      revalidateTag('products');
      revalidateTag(`product:${id}`);
    } catch (e) {
      console.warn('[Omar Products API] Revalidation notice:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Stock updated in Portugal warehouse.',
      id,
      stock_portugal: newQty,
      is_portugal_active: newActive,
    });
  } catch (err: any) {
    console.error('[Omar Products API] PATCH error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
