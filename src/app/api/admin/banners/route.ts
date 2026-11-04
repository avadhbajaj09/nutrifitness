import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { revalidatePath, revalidateTag } from 'next/cache';
import { DEFAULT_HERO_BANNERS, type HeroBanner } from '@/lib/banners';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function mapRow(row: any): HeroBanner {
  return {
    id: String(row.id),
    productName: row.product_name || '',
    brand: row.brand || 'Marvelous Nutrition',
    tag: row.tag || '',
    badge: row.badge || '100% Stock Suisse',
    wideImage: row.wide_image || '',
    mobileImage: row.mobile_image || row.wide_image || '',
    link: row.link || '/',
    ctaText: row.cta_text || 'Commander',
    sortOrder: typeof row.sort_order === 'number' ? row.sort_order : 0,
    isActive: row.is_active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// GET: Fetch all banners (or only active if ?active=true)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get('active') === 'true';

    const supabase = getAdminSupabase();
    let query = supabase.from('hero_banners').select('*').order('sort_order', { ascending: true });

    if (onlyActive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Admin Banners API] Supabase error:', error);
      return NextResponse.json({ success: true, banners: DEFAULT_HERO_BANNERS });
    }

    return NextResponse.json({
      success: true,
      banners: (data && data.length > 0) ? data.map(mapRow) : DEFAULT_HERO_BANNERS
    });
  } catch (err: any) {
    console.error('[Admin Banners API] Unexpected GET error:', err);
    return NextResponse.json({ success: false, error: err.message, banners: DEFAULT_HERO_BANNERS }, { status: 500 });
  }
}

// POST: Create or Update a Banner
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      productName,
      brand,
      tag,
      badge,
      wideImage,
      mobileImage,
      link,
      ctaText,
      sortOrder,
      isActive
    } = body;

    if (!productName || !productName.trim()) {
      return NextResponse.json({ success: false, error: 'Product name is required.' }, { status: 400 });
    }
    if (!wideImage || !wideImage.trim()) {
      return NextResponse.json({ success: false, error: 'Wide banner image is required.' }, { status: 400 });
    }
    if (!link || !link.trim()) {
      return NextResponse.json({ success: false, error: 'Target link or product URL is required.' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const now = new Date().toISOString();

    const bannerPayload = {
      product_name: productName.trim(),
      brand: (brand && brand.trim()) || 'Marvelous Nutrition',
      tag: (tag && tag.trim()) || null,
      badge: (badge && badge.trim()) || '100% Stock Suisse',
      wide_image: wideImage.trim(),
      mobile_image: (mobileImage && mobileImage.trim()) || wideImage.trim(),
      link: link.trim(),
      cta_text: (ctaText && ctaText.trim()) || 'Commander',
      is_active: isActive !== false,
      updated_at: now
    };

    let resultBanner: any = null;

    if (id && !String(id).startsWith('default-')) {
      // Update existing
      const { data, error } = await supabase
        .from('hero_banners')
        .update(bannerPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      resultBanner = data;
    } else {
      // Determine next sort order
      let nextSort = typeof sortOrder === 'number' ? sortOrder : 0;
      if (typeof sortOrder !== 'number') {
        const { data: maxOrderData } = await supabase
          .from('hero_banners')
          .select('sort_order')
          .order('sort_order', { ascending: false })
          .limit(1);

        const currentMax = maxOrderData?.[0]?.sort_order ?? 0;
        nextSort = currentMax + 1;
      }

      const { data, error } = await supabase
        .from('hero_banners')
        .insert({
          ...bannerPayload,
          sort_order: nextSort,
          created_at: now
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      resultBanner = data;
    }

    // Revalidate storefront cache
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidateTag('banners');
    } catch (e) {
      console.warn('[Admin Banners API] Cache revalidate notice:', e);
    }

    return NextResponse.json({
      success: true,
      banner: mapRow(resultBanner)
    });
  } catch (err: any) {
    console.error('[Admin Banners API] POST error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

// PUT: Reorder or toggle multiple banners
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { items } = body; // Array of { id: string, sortOrder: number, isActive?: boolean }

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Expected items array' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const now = new Date().toISOString();

    for (const item of items) {
      if (!item.id || String(item.id).startsWith('default-')) continue;
      const updateObj: any = {
        sort_order: item.sortOrder,
        updated_at: now
      };
      if (typeof item.isActive === 'boolean') {
        updateObj.is_active = item.isActive;
      }

      await supabase
        .from('hero_banners')
        .update(updateObj)
        .eq('id', item.id);
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidateTag('banners');
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Admin Banners API] PUT error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE: Remove a banner by id
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing banner ID' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { error } = await supabase
      .from('hero_banners')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidateTag('banners');
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Admin Banners API] DELETE error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
