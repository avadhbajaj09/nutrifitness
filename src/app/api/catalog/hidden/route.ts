import { NextResponse } from 'next/server';
import { getHiddenProductSlugs, clearHiddenProductsCache } from '@/lib/hiddenProducts';
import { getAdminSupabase } from '@/lib/supabase';
import { revalidatePath, revalidateTag } from 'next/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const hidden = await getHiddenProductSlugs();
  return NextResponse.json({
    success: true,
    hiddenSlugs: Array.from(hidden)
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, slug } = body;

    if (!id && !slug) {
      return NextResponse.json({ error: 'Missing id or slug' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const now = new Date().toISOString();
    const targetId = id || slug;
    const cleanId = String(targetId).replace(/^prod-/, '');

    // Mark as draft in Supabase
    await supabase
      .from('products')
      .update({
        status: 'draft',
        deleted_at: now,
        updated_at: now
      })
      .or(`id.eq.${targetId},woo_id.eq.${targetId},woo_id.eq.${cleanId},slug.eq.${targetId},slug.eq.${slug || ''}`);

    clearHiddenProductsCache();

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/boutique');
      revalidatePath('/categorie');
      if (slug) {
        revalidatePath(`/produit/${slug}`);
      }
      revalidatePath('/sitemap.xml');
      revalidateTag('products');
    } catch {}

    const updated = await getHiddenProductSlugs();
    return NextResponse.json({
      success: true,
      hiddenSlugs: Array.from(updated)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
