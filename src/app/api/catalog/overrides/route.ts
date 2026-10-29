import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getAdminSupabase();

    const { data: dbProducts, error } = await supabase
      .from('products')
      .select(`
        id, woo_id, sku, slug, name, brand, base_price, compare_at_price,
        images, gtin13, stock_geneva, stock_portugal, main_location, status, deleted_at,
        nutrition, ingredients, allergens, usage_instructions, short_description, description,
        product_variants (
          id, woo_id, sku, attribute_name, attribute_value, price, compare_at_price,
          image_url, stock_geneva, stock_portugal, gtin13
        )
      `)
      .is('deleted_at', null)
      .eq('status', 'published');

    if (error) {
      console.error('[Catalog Overrides API] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const overrides: Record<string, any> = {};

    for (const p of dbProducts || []) {
      const entry = {
        id: p.id,
        wooId: p.woo_id,
        sku: p.sku,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        priceChf: Number(p.base_price) || 0,
        compareAtPriceChf: p.compare_at_price ? Number(p.compare_at_price) : undefined,
        images: Array.isArray(p.images) ? p.images : [],
        gtin13: p.gtin13 || '',
        stockGeneva: Number(p.stock_geneva) || 0,
        stockPortugal: Number(p.stock_portugal) || 0,
        mainLocation: p.main_location,
        shippingOrigin: p.main_location === 'COMMON' ? 'common' : p.main_location === 'PORTUGAL' ? 'portugal' : 'switzerland',
        locationType: p.main_location === 'COMMON' ? 'COMMON' : p.main_location === 'PORTUGAL' ? 'PORTUGAL_ONLY' : 'GENEVA_ONLY',
        nutrition: p.nutrition,
        shortDescription: p.short_description,
        description: p.description,
        ingredients: p.ingredients,
        allergens: p.allergens,
        usageInstructions: p.usage_instructions,
        variants: Array.isArray(p.product_variants) ? p.product_variants.map((v: any) => ({
          id: v.id,
          sku: v.sku,
          flavor: v.attribute_value,
          priceChf: Number(v.price) || (Number(p.base_price) || 0),
          compareAtPriceChf: v.compare_at_price ? Number(v.compare_at_price) : undefined,
          image: v.image_url,
          stockGeneva: Number(v.stock_geneva) || 0,
          stockPortugal: Number(v.stock_portugal) || 0,
          gtin13: v.gtin13 || ''
        })) : []
      };

      if (p.id) overrides[p.id] = entry;
      if (p.slug) overrides[p.slug.toLowerCase().trim()] = entry;
      if (p.sku) overrides[p.sku.toLowerCase().trim()] = entry;
      if (p.woo_id) {
        const wid = String(p.woo_id).trim();
        overrides[wid] = entry;
        const cleanWid = wid.replace(/^prod-/, '');
        overrides[cleanWid] = entry;
        overrides[`prod-${cleanWid}`] = entry;
      }
    }

    return NextResponse.json({
      success: true,
      overrides
    });
  } catch (err: any) {
    console.error('[Catalog Overrides API] Unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
