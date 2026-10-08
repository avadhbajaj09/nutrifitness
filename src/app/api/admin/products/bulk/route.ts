import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { revalidatePath, revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, product_ids, user = 'admin' } = body;

    if (!action || !Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json({ error: 'Invalid bulk action payload' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    for (const id of product_ids) {
      if (action === 'publish') {
        await supabase
          .from('products')
          .update({ status: 'published', deleted_at: null, updated_at: new Date().toISOString() })
          .eq('id', id);
      } else if (action === 'draft') {
        await supabase
          .from('products')
          .update({ status: 'draft', updated_at: new Date().toISOString() })
          .eq('id', id);
      } else if (action === 'delete_to_draft') {
        await supabase
          .from('products')
          .update({ status: 'draft', deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', id);
      } else if (action === 'set_location_geneva') {
        await supabase.from('product_stock').upsert({
          product_id: id,
          variant_id: null,
          origin_id: 'GENEVA',
          is_active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'product_id,origin_id' });
        await supabase.from('product_stock').upsert({
          product_id: id,
          variant_id: null,
          origin_id: 'PORTUGAL',
          is_active: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'product_id,origin_id' });
        await supabase.from('products').update({ main_location: 'GENEVA' }).eq('id', id);
      } else if (action === 'set_location_portugal') {
        await supabase.from('product_stock').upsert({
          product_id: id,
          variant_id: null,
          origin_id: 'PORTUGAL',
          is_active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'product_id,origin_id' });
        await supabase.from('product_stock').upsert({
          product_id: id,
          variant_id: null,
          origin_id: 'GENEVA',
          is_active: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'product_id,origin_id' });
        await supabase.from('products').update({ main_location: 'PORTUGAL' }).eq('id', id);
      } else if (action === 'set_location_both') {
        await supabase.from('product_stock').upsert({
          product_id: id,
          variant_id: null,
          origin_id: 'GENEVA',
          is_active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'product_id,origin_id' });
        await supabase.from('product_stock').upsert({
          product_id: id,
          variant_id: null,
          origin_id: 'PORTUGAL',
          is_active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'product_id,origin_id' });
      }

      // Log in audit log
      await supabase.from('product_audit_log').insert({
        product_id: id,
        user_id: user,
        action: `bulk_${action}`,
        new_values: { action, product_ids_count: product_ids.length }
      });
    }

    // Trigger instant Next.js cache revalidation
    try {
      const { clearHiddenProductsCache } = await import('@/lib/hiddenProducts');
      clearHiddenProductsCache();
      revalidatePath('/');
      revalidatePath('/boutique');
      revalidatePath('/categorie');
      revalidatePath('/sitemap.xml');
      revalidateTag('products');
    } catch (e) {
      console.warn('[Bulk Action] Revalidation error:', e);
    }

    return NextResponse.json({ success: true, count: product_ids.length, action });
  } catch (err: any) {
    console.error('[Bulk Action] Fatal error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
