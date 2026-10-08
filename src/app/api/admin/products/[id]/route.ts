import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { revalidatePath, revalidateTag } from 'next/cache';
import { clearHiddenProductsCache } from '@/lib/hiddenProducts';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const supabase = getAdminSupabase();

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*),
        product_stock (*),
        product_categories (category_id, categories(name, slug)),
        product_tags (tag_id, tags(name, slug))
      `)
      .eq('id', id)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { data: auditLogs } = await supabase
      .from('product_audit_log')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      success: true,
      product,
      auditLogs: auditLogs || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const body = await request.json();
    const { action, user = 'admin' } = body;
    const supabase = getAdminSupabase();

    const { data: product, error: fetchErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (action === 'delete_to_draft') {
      // 4.3 Delete = move to draft
      await supabase
        .from('products')
        .update({
          status: 'draft',
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      await supabase.from('product_audit_log').insert({
        product_id: id,
        user_id: user,
        action: 'delete_to_draft',
        old_values: { status: product.status, deleted_at: product.deleted_at },
        new_values: { status: 'draft', deleted_at: new Date().toISOString() }
      });
    } else if (action === 'restore') {
      // Restore from draft
      await supabase
        .from('products')
        .update({
          status: 'published',
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      await supabase.from('product_audit_log').insert({
        product_id: id,
        user_id: user,
        action: 'restore',
        old_values: { status: product.status, deleted_at: product.deleted_at },
        new_values: { status: 'published', deleted_at: null }
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Revalidate paths
    try {
      clearHiddenProductsCache();
      revalidatePath('/');
      revalidatePath('/boutique');
      revalidatePath('/categorie');
      if (product.slug) {
        revalidatePath(`/produit/${product.slug}`);
      }
      revalidatePath('/sitemap.xml');
      revalidateTag('products');
      revalidateTag(`product:${id}`);
    } catch (e) {
      console.warn('[Revalidation error]:', e);
    }

    return NextResponse.json({ success: true, action, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const supabase = getAdminSupabase();

    // Permanent hard delete
    const { data: product } = await supabase.from('products').select('slug').eq('id', id).single();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      clearHiddenProductsCache();
      revalidatePath('/');
      revalidatePath('/boutique');
      revalidatePath('/categorie');
      if (product?.slug) {
        revalidatePath(`/produit/${product.slug}`);
      }
      revalidatePath('/sitemap.xml');
      revalidateTag('products');
    } catch (e) {
      console.warn('[Revalidation error]:', e);
    }

    return NextResponse.json({ success: true, deleted_id: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
