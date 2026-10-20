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

      const isGenevaActive = Boolean(genevaStockEntry ? genevaStockEntry.is_active : (p.main_location !== 'PORTUGAL'));
      const isPortugalActive = Boolean(portugalStockEntry ? portugalStockEntry.is_active : (p.main_location === 'PORTUGAL' || p.main_location === 'COMMON'));

      let locationType: 'GENEVA_ONLY' | 'PORTUGAL_ONLY' | 'COMMON' = 'GENEVA_ONLY';
      if (p.main_location === 'COMMON' || (isGenevaActive && isPortugalActive)) {
        locationType = 'COMMON';
      } else if (p.main_location === 'PORTUGAL' || (isPortugalActive && !isGenevaActive)) {
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
      filtered = filtered.filter(p => p.location_type === 'PORTUGAL_ONLY' || p.main_location === 'PORTUGAL');
    } else if (locationFilter === 'COMMON') {
      filtered = filtered.filter(p => p.location_type === 'COMMON' || p.main_location === 'COMMON');
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

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

async function findProduct(supabase: any, rawId: string) {
  const id = decodeURIComponent(rawId).trim();
  if (isUUID(id)) {
    const { data } = await supabase.from('products').select('*, product_stock(*)').eq('id', id).maybeSingle();
    if (data) return data;
  }
  const cleanId = id.replace(/^prod-/, '');
  const { data } = await supabase
    .from('products')
    .select('*, product_stock(*)')
    .or(`woo_id.eq.${id},woo_id.eq.${cleanId},slug.eq.${id},sku.eq.${id},sku.eq.${cleanId}`)
    .maybeSingle();
  return data;
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      brand,
      base_price,
      compare_at_price,
      images,
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

    // Fetch existing product state for audit log safely by UUID, woo_id, or slug
    const existingProduct = await findProduct(supabase, id);

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const realDbId = existingProduct.id;
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (name) {
      updates.name = name;
      updates.normalized_name = name.toLowerCase().trim();
    }
    if (brand) updates.brand = brand;
    if (base_price !== undefined) updates.base_price = Number(base_price);
    if (compare_at_price !== undefined) updates.compare_at_price = compare_at_price ? Number(compare_at_price) : null;
    if (images && Array.isArray(images)) {
      updates.images = images.map((img: any) => ({
        src: typeof img === 'string' ? img : img.src,
        alt: typeof img === 'string' ? (name || existingProduct.name) : (typeof img.alt === 'string' ? img.alt : (img.alt?.fr || name || existingProduct.name || ''))
      }));
    }

    if (main_location) {
      updates.main_location = main_location;

      if (main_location === 'PORTUGAL') {
        await supabase.from('product_variants').update({ stock_geneva: 0 }).eq('product_id', realDbId);
        await supabase.from('fulfillment_stock').update({ quantity: 0 }).eq('origin_id', 'GENEVA').or(`product_id.eq.${realDbId},product_id.eq.${existingProduct.woo_id},product_id.eq.prod-${existingProduct.woo_id}`);
        await supabase.from('product_stock').upsert({
          product_id: realDbId, variant_id: null, origin_id: 'GENEVA', quantity: 0, is_active: false, updated_at: new Date().toISOString()
        }, { onConflict: 'product_id,origin_id' });
        await supabase.from('product_stock').upsert({
          product_id: realDbId, variant_id: null, origin_id: 'PORTUGAL', is_active: true, updated_at: new Date().toISOString()
        }, { onConflict: 'product_id,origin_id' });
      } else if (main_location === 'GENEVA') {
        await supabase.from('product_variants').update({ stock_portugal: 0 }).eq('product_id', realDbId);
        await supabase.from('fulfillment_stock').update({ quantity: 0 }).eq('origin_id', 'PORTUGAL').or(`product_id.eq.${realDbId},product_id.eq.${existingProduct.woo_id},product_id.eq.prod-${existingProduct.woo_id}`);
        await supabase.from('product_stock').upsert({
          product_id: realDbId, variant_id: null, origin_id: 'PORTUGAL', quantity: 0, is_active: false, updated_at: new Date().toISOString()
        }, { onConflict: 'product_id,origin_id' });
        await supabase.from('product_stock').upsert({
          product_id: realDbId, variant_id: null, origin_id: 'GENEVA', is_active: true, updated_at: new Date().toISOString()
        }, { onConflict: 'product_id,origin_id' });
      } else if (main_location === 'COMMON') {
        await supabase.from('product_stock').upsert({
          product_id: realDbId, variant_id: null, origin_id: 'GENEVA', is_active: true, updated_at: new Date().toISOString()
        }, { onConflict: 'product_id,origin_id' });
        await supabase.from('product_stock').upsert({
          product_id: realDbId, variant_id: null, origin_id: 'PORTUGAL', is_active: true, updated_at: new Date().toISOString()
        }, { onConflict: 'product_id,origin_id' });
      }
    }
    if (status) updates.status = status;

    // Update products table if needed
    if (Object.keys(updates).length > 1) {
      await supabase
        .from('products')
        .update(updates)
        .eq('id', realDbId);
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
        product_id: realDbId,
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
        product_id: realDbId,
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
            product_id: realDbId,
            variant_id: v.id,
            origin_id: 'GENEVA',
            quantity: vUpdates.stock_geneva,
            is_active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'product_id,variant_id,origin_id' });
        }
        if (v.stock_portugal !== undefined) {
          await supabase.from('product_stock').upsert({
            product_id: realDbId,
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
    try {
      await supabase.from('product_audit_log').insert({
        product_id: realDbId,
        user_id: user,
        action: 'update_product_location',
        old_values: {
          status: existingProduct.status,
          main_location: existingProduct.main_location,
          stock: existingProduct.product_stock
        },
        new_values: body
      });
    } catch {}

    // On-Demand Revalidation
    try {
      revalidatePath('/');
      revalidatePath('/boutique');
      revalidatePath('/categorie');
      if (existingProduct.slug) {
        revalidatePath(`/produit/${existingProduct.slug}`);
      }
      revalidateTag('products');
      revalidateTag(`product:${realDbId}`);
    } catch (revalErr) {
      console.warn('[Admin Products API] Revalidation notice:', revalErr);
    }

    return NextResponse.json({ success: true, id: realDbId });
  } catch (err: any) {
    console.error('[Admin Products API] Patch error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      slug,
      brand = 'NutriFitness',
      base_price = 0,
      compare_at_price = null,
      main_location = 'GENEVA',
      status = 'published',
      images = [],
      user = 'admin'
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    let existingProduct = id ? await findProduct(supabase, id) : null;
    if (!existingProduct && slug) {
      existingProduct = await findProduct(supabase, slug);
    }

    const now = new Date().toISOString();
    const formattedImages = Array.isArray(images) ? images.map((img: any) => ({
      src: typeof img === 'string' ? img : img.src,
      alt: typeof img === 'string' ? name : (typeof img.alt === 'string' ? img.alt : (img.alt?.fr || name))
    })) : [];

    let targetId = existingProduct?.id;
    if (existingProduct) {
      targetId = existingProduct.id;
      const updates: Record<string, any> = {
        name,
        normalized_name: name.toLowerCase().trim(),
        brand,
        base_price: Number(base_price),
        compare_at_price: compare_at_price ? Number(compare_at_price) : null,
        main_location,
        status,
        images: formattedImages,
        updated_at: now
      };
      if (slug) updates.slug = slug;
      await supabase.from('products').update(updates).eq('id', targetId);
    } else {
      const crypto = await import('crypto');
      const hash = crypto.createHash('md5').update((slug || name) + Date.now()).digest('hex');
      targetId = [
        hash.substring(0, 8),
        hash.substring(8, 12),
        '4' + hash.substring(13, 16),
        '8' + hash.substring(17, 20),
        hash.substring(20, 32)
      ].join('-');

      await supabase.from('products').insert({
        id: targetId,
        woo_id: id?.replace(/^prod-/, '') || slug,
        sku: id || slug,
        name,
        normalized_name: name.toLowerCase().trim(),
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: 'simple',
        brand,
        base_price: Number(base_price),
        compare_at_price: compare_at_price ? Number(compare_at_price) : null,
        main_location,
        status,
        images: formattedImages,
        is_featured: false,
        created_at: now,
        updated_at: now
      });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/boutique');
      revalidatePath('/categorie');
      if (slug) revalidatePath(`/produit/${slug}`);
      revalidateTag('products');
    } catch {}

    return NextResponse.json({ success: true, id: targetId });
  } catch (err: any) {
    console.error('[Admin Products POST Error]:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
