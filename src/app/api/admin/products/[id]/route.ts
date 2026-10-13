import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { revalidatePath, revalidateTag } from 'next/cache';
import { clearHiddenProductsCache } from '@/lib/hiddenProducts';
import crypto from 'crypto';

export const runtime = 'nodejs';

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

function toUuid(str: string) {
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16),
    '8' + hash.substring(17, 20),
    hash.substring(20, 32)
  ].join('-');
}

async function findProductInDb(supabase: any, rawId: string) {
  const id = decodeURIComponent(rawId).trim();

  if (isUUID(id)) {
    const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (data) return data;
  }

  const cleanId = id.replace(/^prod-/, '');
  const { data } = await supabase
    .from('products')
    .select('*')
    .or(`woo_id.eq.${id},woo_id.eq.${cleanId},slug.eq.${id},sku.eq.${id},sku.eq.${cleanId}`)
    .maybeSingle();

  return data;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const supabase = getAdminSupabase();
    const product = await findProductInDb(supabase, id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { data: auditLogs } = await supabase
      .from('product_audit_log')
      .select('*')
      .eq('product_id', product.id)
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
    const { action, user = 'admin', productData } = body;
    const supabase = getAdminSupabase();

    let product = await findProductInDb(supabase, id);

    if (action === 'delete_to_draft') {
      const now = new Date().toISOString();

      if (product) {
        // Move existing DB product to draft
        await supabase
          .from('products')
          .update({
            status: 'draft',
            deleted_at: now,
            updated_at: now
          })
          .eq('id', product.id);

        try {
          await supabase.from('product_audit_log').insert({
            product_id: product.id,
            user_id: user,
            action: 'delete_to_draft',
            old_values: { status: product.status, deleted_at: product.deleted_at },
            new_values: { status: 'draft', deleted_at: now }
          });
        } catch {}
      } else {
        // Product wasn't in DB yet (custom or catalog product) - insert as draft so it remains permanently hidden
        const cleanId = id.replace(/^prod-/, '');
        const targetSlug = productData?.slug?.fr || productData?.slug || id;
        const targetName = productData?.name?.fr || productData?.name || `Deleted Product ${id}`;
        const newUuid = isUUID(id) ? id : toUuid(id);

        await supabase.from('products').upsert({
          id: newUuid,
          woo_id: id,
          sku: id,
          normalized_name: targetName.toLowerCase().trim(),
          name: targetName,
          slug: targetSlug,
          type: 'simple',
          status: 'draft',
          main_location: 'GENEVA',
          brand: productData?.brand || 'NutriFitness',
          base_price: Number(productData?.priceChf) || 0,
          short_description: '',
          description: '',
          images: [],
          is_featured: false,
          deleted_at: now,
          updated_at: now
        });
      }
    } else if (action === 'restore') {
      if (!product) {
        return NextResponse.json({ error: 'Product not found to restore' }, { status: 404 });
      }

      await supabase
        .from('products')
        .update({
          status: 'published',
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      try {
        await supabase.from('product_audit_log').insert({
          product_id: product.id,
          user_id: user,
          action: 'restore',
          old_values: { status: product.status, deleted_at: product.deleted_at },
          new_values: { status: 'published', deleted_at: null }
        });
      } catch {}
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Revalidate paths and clear hidden cache
    try {
      clearHiddenProductsCache();
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/boutique');
      revalidatePath('/categorie');
      if (product?.slug) {
        revalidatePath(`/produit/${product.slug}`);
      }
      revalidatePath('/sitemap.xml');
      revalidateTag('products');
      if (product?.id) {
        revalidateTag(`product:${product.id}`);
      }
    } catch (e) {
      console.warn('[Revalidation error]:', e);
    }

    return NextResponse.json({ success: true, action, id, targetId: product?.id || id });
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
    const product = await findProductInDb(supabase, id);

    if (product) {
      // Mark draft & deleted_at for maximum resilience
      await supabase
        .from('products')
        .update({
          status: 'draft',
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);
    }

    try {
      clearHiddenProductsCache();
      revalidatePath('/', 'layout');
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
