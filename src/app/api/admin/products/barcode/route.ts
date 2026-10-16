import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// GET: Fetch all saved GTIN13 / barcodes from Supabase
export async function GET() {
  try {
    const supabase = getAdminSupabase();

    const { data: dbProducts, error: pErr } = await supabase
      .from('products')
      .select('id, slug, sku, woo_id, gtin13');

    if (pErr) {
      console.error('[Admin Barcode API] Error fetching products:', pErr);
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    const { data: dbVariants, error: vErr } = await supabase
      .from('product_variants')
      .select('id, product_id, sku, woo_id, attribute_value, gtin13');

    if (vErr) {
      console.error('[Admin Barcode API] Error fetching variants:', vErr);
      return NextResponse.json({ error: vErr.message }, { status: 500 });
    }

    // Build lookup maps
    const productBarcodes: Record<string, string> = {};
    const variantBarcodes: Record<string, string> = {};

    const productMap = new Map<string, { id: string; slug?: string; woo_id?: string }>();
    for (const p of dbProducts || []) {
      productMap.set(p.id, p);
      if (p.gtin13 && p.gtin13.trim()) {
        const val = p.gtin13.trim();
        productBarcodes[p.id] = val;
        if (p.slug) productBarcodes[p.slug] = val;
        if (p.sku) productBarcodes[p.sku] = val;
        if (p.woo_id) {
          productBarcodes[p.woo_id] = val;
          productBarcodes[`prod-${p.woo_id}`] = val;
        }
      }
    }

    for (const v of dbVariants || []) {
      if (v.gtin13 && v.gtin13.trim()) {
        const val = v.gtin13.trim();
        variantBarcodes[v.id] = val;
        if (v.sku) variantBarcodes[v.sku] = val;
        if (v.woo_id) {
          variantBarcodes[v.woo_id] = val;
          variantBarcodes[`var-${v.woo_id}`] = val;
        }
        if (v.attribute_value) {
          const cleanAttr = v.attribute_value.toLowerCase().trim();
          variantBarcodes[`${v.product_id}_${cleanAttr}`] = val;
          const parent = productMap.get(v.product_id);
          if (parent) {
            if (parent.slug) variantBarcodes[`${parent.slug}_${cleanAttr}`] = val;
            if (parent.woo_id) {
              variantBarcodes[`${parent.woo_id}_${cleanAttr}`] = val;
              variantBarcodes[`prod-${parent.woo_id}_${cleanAttr}`] = val;
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      productBarcodes,
      variantBarcodes,
    });
  } catch (err: any) {
    console.error('[Admin Barcode API] Unexpected error in GET:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Save/update GTIN13 barcodes in Supabase permanently
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, gtin13, variants } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const now = new Date().toISOString();
    const mainBarcode = typeof gtin13 === 'string' ? gtin13.trim() : null;

    // 1. Resolve product in DB (by id, slug, woo_id, or sku safely without UUID cast error)
    const cleanId = String(productId).replace(/^prod-/, '');
    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    let prodQuery = supabase.from('products').select('id, slug, sku, woo_id');
    if (isUuid(productId)) {
      prodQuery = prodQuery.eq('id', productId);
    } else {
      prodQuery = prodQuery.or(`slug.eq.${productId},slug.eq.${cleanId},woo_id.eq.${cleanId},sku.eq.${productId}`);
    }
    const { data: dbProd } = await prodQuery.maybeSingle();

    if (dbProd) {
      // Update parent product in Supabase
      if (mainBarcode !== null) {
        await supabase
          .from('products')
          .update({ gtin13: mainBarcode || null, updated_at: now })
          .eq('id', dbProd.id);
      }

      // Update variants if provided
      if (Array.isArray(variants) && variants.length > 0) {
        const { data: dbVariants } = await supabase
          .from('product_variants')
          .select('id, woo_id, sku, attribute_value')
          .eq('product_id', dbProd.id);

        for (const vItem of variants) {
          const vBarcode = typeof vItem.gtin13 === 'string' ? vItem.gtin13.trim() : '';
          const vItemIdClean = String(vItem.id || '').replace(/^var-/, '');
          const target = (dbVariants || []).find(
            dbV =>
              dbV.id === vItem.id ||
              (dbV.woo_id && (dbV.woo_id === vItem.id || dbV.woo_id === vItemIdClean)) ||
              (vItem.sku && dbV.sku && dbV.sku.toLowerCase() === vItem.sku.toLowerCase()) ||
              (vItem.flavor && dbV.attribute_value && (
                dbV.attribute_value.toLowerCase() === vItem.flavor.toLowerCase() ||
                dbV.attribute_value.toLowerCase().includes(vItem.flavor.toLowerCase()) ||
                vItem.flavor.toLowerCase().includes(dbV.attribute_value.toLowerCase())
              ))
          );

          if (target) {
            await supabase
              .from('product_variants')
              .update({ gtin13: vBarcode || null, updated_at: now })
              .eq('id', target.id);
          }
        }
      }
    }

    // 2. Also sync to static src/lib/catalog.ts in-memory file if possible
    try {
      const catalogPath = path.resolve('src/lib/catalog.ts');
      if (fs.existsSync(catalogPath)) {
        const rawCatalog = fs.readFileSync(catalogPath, 'utf8');
        const prefixMarker = 'export const PRODUCTS: ProductItem[] = ';
        const pStart = rawCatalog.indexOf(prefixMarker);
        const pEnd = rawCatalog.lastIndexOf('];');

        if (pStart >= 0 && pEnd > pStart) {
          const before = rawCatalog.slice(0, pStart + prefixMarker.length);
          const jsonStr = rawCatalog.slice(pStart + prefixMarker.length, pEnd + 1);
          const after = rawCatalog.slice(pEnd + 1);
          const catalogProducts = JSON.parse(jsonStr);

          const cp = catalogProducts.find(
            (p: any) =>
              p.id === productId ||
              p.id === cleanId ||
              p.slug?.fr === productId ||
              p.slug?.fr === cleanId
          );

          if (cp) {
            if (mainBarcode !== null) cp.gtin13 = mainBarcode;
            if (Array.isArray(variants) && cp.variants) {
              for (const vItem of variants) {
                const cv = cp.variants.find(
                  (v: any) =>
                    v.id === vItem.id ||
                    (vItem.sku && v.sku && v.sku.toLowerCase() === vItem.sku.toLowerCase()) ||
                    (vItem.flavor && v.flavorName?.fr && v.flavorName.fr.toLowerCase() === vItem.flavor.toLowerCase())
                );
                if (cv && typeof vItem.gtin13 === 'string') {
                  cv.gtin13 = vItem.gtin13.trim();
                }
              }
            }
            const updatedContent = before + JSON.stringify(catalogProducts, null, 2) + after;
            fs.writeFileSync(catalogPath, updatedContent, 'utf8');
          }
        }
      }
    } catch (catErr) {
      console.warn('[Admin Barcode API] catalog.ts local file sync warning (non-fatal):', catErr);
    }

    console.log(`[Admin Barcode API] Successfully saved barcode for product "${productId}" to Supabase.`);
    return NextResponse.json({
      success: true,
      message: 'Barcode saved permanently to Supabase',
      productId,
      gtin13: mainBarcode,
    });
  } catch (error: any) {
    console.error('[Admin Barcode API] Error saving barcode:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
