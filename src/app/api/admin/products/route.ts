import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { revalidatePath, revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim();
  const locationFilter = searchParams.get('location') || 'all'; // 'all' | 'GENEVA' | 'PORTUGAL' | 'COMMON'
  const statusFilter = searchParams.get('status') || 'published'; // 'all' | 'published' | 'draft' | 'deleted'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '25', 10)));
  const offset = (page - 1) * limit;

  try {
    const supabase = getAdminSupabase();

    // Query products
    let query = supabase
      .from('products')
      .select(`
        id, woo_id, sku, name, slug, type, status, main_location,
        base_price, compare_at_price, weight_kg, weight_grams, images,
        deleted_at, created_at, updated_at,
        product_variants (
          id, woo_id, sku, attribute_name, attribute_value, price,
          compare_at_price, image_url, stock_geneva, stock_portugal, weight_grams
        ),
        product_stock (
          id, variant_id, origin_id, quantity, is_active
        )
      `, { count: 'exact' });

    if (statusFilter === 'draft') {
      query = query.eq('status', 'draft').is('deleted_at', null);
    } else if (statusFilter === 'deleted') {
      query = query.not('deleted_at', 'is', null);
    } else if (statusFilter === 'published') {
      query = query.eq('status', 'published').is('deleted_at', null);
    } // 'all' leaves it unconstrained

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,woo_id.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data: rawProducts, count: totalCount, error } = await query;

    if (error) {
      console.error('[Admin Products API] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process each product to compute derived stock, locations, and variants
    const processed = (rawProducts || []).map((p: any) => {
      const stocks: any[] = p.product_stock || [];
      const parentStocks = stocks.filter(s => !s.variant_id);

      const genevaStockEntry = parentStocks.find(s => s.origin_id === 'GENEVA');
      const portugalStockEntry = parentStocks.find(s => s.origin_id === 'PORTUGAL');

      const isGenevaActive = Boolean(genevaStockEntry ? genevaStockEntry.is_active : true);
      const isPortugalActive = Boolean(portugalStockEntry ? portugalStockEntry.is_active : false);

      let locationType: 'GENEVA_ONLY' | 'PORTUGAL_ONLY' | 'COMMON' = 'GENEVA_ONLY';
      if (isGenevaActive && isPortugalActive) {
        locationType = 'COMMON';
      } else if (isPortugalActive && !isGenevaActive) {
        locationType = 'PORTUGAL_ONLY';
      } else {
        locationType = 'GENEVA_ONLY';
      }

      // Compute total stock counts
      let totalStockGeneva = genevaStockEntry ? Number(genevaStockEntry.quantity) || 0 : 0;
      let totalStockPortugal = portugalStockEntry ? Number(portugalStockEntry.quantity) || 0 : 0;

      // Variants
      const variants = (p.product_variants || []).map((v: any) => {
        const vStocks = stocks.filter(s => s.variant_id === v.id);
        const vGenStock = vStocks.find(s => s.origin_id === 'GENEVA');
        const vPtStock = vStocks.find(s => s.origin_id === 'PORTUGAL');

        return {
          id: v.id,
          sku: v.sku || '',
          attribute_name: v.attribute_name,
          attribute_value: v.attribute_value,
          price: Number(v.price) || 0,
          compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
          image_url: v.image_url,
          stock_geneva: Number(v.stock_geneva) || 0,
          stock_portugal: Number(v.stock_portugal) || 0,
          is_geneva_active: vGenStock ? Boolean(vGenStock.is_active) : isGenevaActive,
          is_portugal_active: vPtStock ? Boolean(vPtStock.is_active) : isPortugalActive,
        };
      });

      // For variable products with variants, sum variant stock if parent stock is 0
      if (variants.length > 0) {
        const sumGen = variants.reduce((acc: number, v: any) => acc + v.stock_geneva, 0);
        const sumPt = variants.reduce((acc: number, v: any) => acc + v.stock_portugal, 0);
        if (totalStockGeneva === 0 && sumGen > 0) totalStockGeneva = sumGen;
        if (totalStockPortugal === 0 && sumPt > 0) totalStockPortugal = sumPt;
      }

      return {
        id: p.id,
        woo_id: p.woo_id,
        sku: p.sku || '',
        name: p.name,
        slug: p.slug,
        type: p.type,
        status: p.status,
        main_location: p.main_location || 'GENEVA',
        base_price: Number(p.base_price) || 0,
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
        weight_kg: Number(p.weight_kg) || 0,
        images: Array.isArray(p.images) ? p.images : [],
        deleted_at: p.deleted_at,
        updated_at: p.updated_at,
        stock_geneva: totalStockGeneva,
        stock_portugal: totalStockPortugal,
        is_geneva_active: isGenevaActive,
        is_portugal_active: isPortugalActive,
        location_type: locationType,
        variants
      };
    });

    // Apply client location filter if specified
    let filtered = processed;
    if (locationFilter === 'GENEVA') {
      filtered = filtered.filter(p => p.location_type === 'GENEVA_ONLY');
    } else if (locationFilter === 'PORTUGAL') {
      filtered = filtered.filter(p => p.location_type === 'PORTUGAL_ONLY');
    } else if (locationFilter === 'COMMON') {
      filtered = filtered.filter(p => p.location_type === 'COMMON');
    }

    const totalFiltered = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      products: paginated,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit)
      }
    });
  } catch (err: any) {
    console.error('[Admin Products API] Fatal error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      main_location,
      status,
      stock_geneva,
      stock_portugal,
      toggle_location, // 'GENEVA' | 'PORTUGAL'
      is_geneva_active,
      is_portugal_active,
      variants, // optional [{ id, stock_geneva, stock_portugal }]
      user = 'admin'
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // Fetch existing product state for audit log
    const { data: existingProduct, error: fetchErr } = await supabase
      .from('products')
      .select('*, product_stock(*)')
      .eq('id', id)
      .single();

    if (fetchErr || !existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (main_location) updates.main_location = main_location;
    if (status) updates.status = status;

    // Update products table if needed
    if (Object.keys(updates).length > 1) {
      await supabase
        .from('products')
        .update(updates)
        .eq('id', id);
    }

    // Handle Location Toggles & Stock Updates
    const oldStock = existingProduct.product_stock || [];

    // Geneva Stock / Active
    if (toggle_location === 'GENEVA' || is_geneva_active !== undefined || stock_geneva !== undefined) {
      const currentGeneva = oldStock.find((s: any) => !s.variant_id && s.origin_id === 'GENEVA');
      const newActive = is_geneva_active !== undefined 
        ? is_geneva_active 
        : toggle_location === 'GENEVA' 
          ? !(currentGeneva?.is_active ?? true) 
          : (currentGeneva?.is_active ?? true);
      const newQty = stock_geneva !== undefined 
        ? Math.max(0, parseInt(stock_geneva, 10)) 
        : (currentGeneva?.quantity ?? 0);

      await supabase.from('product_stock').upsert({
        product_id: id,
        variant_id: null,
        origin_id: 'GENEVA',
        quantity: newQty,
        is_active: newActive,
        updated_at: new Date().toISOString()
      }, { onConflict: 'product_id,origin_id' });
    }

    // Portugal Stock / Active
    if (toggle_location === 'PORTUGAL' || is_portugal_active !== undefined || stock_portugal !== undefined) {
      const currentPortugal = oldStock.find((s: any) => !s.variant_id && s.origin_id === 'PORTUGAL');
      const newActive = is_portugal_active !== undefined 
        ? is_portugal_active 
        : toggle_location === 'PORTUGAL' 
          ? !(currentPortugal?.is_active ?? false) 
          : (currentPortugal?.is_active ?? false);
      const newQty = stock_portugal !== undefined 
        ? Math.max(0, parseInt(stock_portugal, 10)) 
        : (currentPortugal?.quantity ?? 0);

      await supabase.from('product_stock').upsert({
        product_id: id,
        variant_id: null,
        origin_id: 'PORTUGAL',
        quantity: newQty,
        is_active: newActive,
        updated_at: new Date().toISOString()
      }, { onConflict: 'product_id,origin_id' });
    }

    // Handle variant stock updates if provided
    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (!v.id) continue;
        const vUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
        if (v.stock_geneva !== undefined) vUpdates.stock_geneva = Math.max(0, parseInt(v.stock_geneva, 10));
        if (v.stock_portugal !== undefined) vUpdates.stock_portugal = Math.max(0, parseInt(v.stock_portugal, 10));

        await supabase.from('product_variants').update(vUpdates).eq('id', v.id);

        if (v.stock_geneva !== undefined) {
          await supabase.from('product_stock').upsert({
            product_id: id,
            variant_id: v.id,
            origin_id: 'GENEVA',
            quantity: vUpdates.stock_geneva,
            is_active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'product_id,variant_id,origin_id' });
        }
        if (v.stock_portugal !== undefined) {
          await supabase.from('product_stock').upsert({
            product_id: id,
            variant_id: v.id,
            origin_id: 'PORTUGAL',
            quantity: vUpdates.stock_portugal,
            is_active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'product_id,variant_id,origin_id' });
        }
      }
    }

    // Insert Audit Log
    await supabase.from('product_audit_log').insert({
      product_id: id,
      user_id: user,
      action: 'update_product_location',
      old_values: {
        status: existingProduct.status,
        main_location: existingProduct.main_location,
        stock: existingProduct.product_stock
      },
      new_values: body
    });

    // On-Demand Revalidation
    try {
      revalidatePath('/');
      revalidatePath('/boutique');
      revalidatePath('/categorie');
      if (existingProduct.slug) {
        revalidatePath(`/produit/${existingProduct.slug}`);
      }
      revalidateTag('products');
      revalidateTag(`product:${id}`);
    } catch (revalErr) {
      console.warn('[Admin Products API] Revalidation notice:', revalErr);
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('[Admin Products API] Patch error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
