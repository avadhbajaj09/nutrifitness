import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { revalidatePath, revalidateTag } from 'next/cache';
import { clearDeliveryCache } from '@/lib/delivery/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function GET() {
  try {
    const supabase = getAdminSupabase();

    // Load products, variants, and stock
    const [productsRes, stockRes, variantsRes] = await Promise.all([
      supabase.from('products').select('id, woo_id, slug, sku, main_location, status, deleted_at'),
      supabase.from('product_stock').select('*'),
      supabase.from('product_variants').select('id, product_id, sku, attribute_name, attribute_value, stock_geneva, stock_portugal')
    ]);

    if (productsRes.error) {
      return NextResponse.json({ error: productsRes.error.message }, { status: 500 });
    }

    const products = productsRes.data || [];
    const stockRows = stockRes.data || [];
    const variants = variantsRes.data || [];

    // Group variants by product_id
    const variantsByProd = new Map<string, any[]>();
    for (const v of variants) {
      if (!variantsByProd.has(v.product_id)) variantsByProd.set(v.product_id, []);
      variantsByProd.get(v.product_id)!.push(v);
    }

    // Group stock by product_id
    const stockByProd = new Map<string, any[]>();
    for (const s of stockRows) {
      if (!stockByProd.has(s.product_id)) stockByProd.set(s.product_id, []);
      stockByProd.get(s.product_id)!.push(s);
    }

    // Build unified stock record dictionary
    const stockMap: Record<string, {
      geneva: number;
      portugal: number;
      total: number;
      inStock: boolean;
      variants: Record<string, { geneva: number; portugal: number; total: number; inStock: boolean }>;
    }> = {};

    for (const p of products) {
      const pStocks = stockByProd.get(p.id) || [];
      const pVariants = variantsByProd.get(p.id) || [];

      // Parent stock rows (without variant_id)
      const parentGeneva = pStocks.find(s => !s.variant_id && s.origin_id === 'GENEVA');
      const parentPortugal = pStocks.find(s => !s.variant_id && s.origin_id === 'PORTUGAL');

      let genTotal = parentGeneva ? Number(parentGeneva.quantity) || 0 : 0;
      let ptTotal = parentPortugal ? Number(parentPortugal.quantity) || 0 : 0;

      // Variant stock map
      const variantStockMap: Record<string, { geneva: number; portugal: number; total: number; inStock: boolean }> = {};

      for (const v of pVariants) {
        const vStocks = pStocks.filter(s => s.variant_id === v.id);
        const vGenStock = vStocks.find(s => s.origin_id === 'GENEVA');
        const vPtStock = vStocks.find(s => s.origin_id === 'PORTUGAL');

        const vGenFromStock = vGenStock ? Number(vGenStock.quantity) : undefined;
        const vGenFromVariant = (v.stock_geneva !== null && v.stock_geneva !== undefined) ? Number(v.stock_geneva) : undefined;
        const vGen = (vGenFromVariant !== undefined && vGenFromVariant > 0)
          ? vGenFromVariant
          : (vGenFromStock !== undefined ? vGenFromStock : (vGenFromVariant || 0));

        const vPtFromStock = vPtStock ? Number(vPtStock.quantity) : undefined;
        const vPtFromVariant = (v.stock_portugal !== null && v.stock_portugal !== undefined) ? Number(v.stock_portugal) : undefined;
        const vPt = (vPtFromVariant !== undefined && vPtFromVariant > 0)
          ? vPtFromVariant
          : (vPtFromStock !== undefined ? vPtFromStock : (vPtFromVariant || 0));

        const vTot = vGen + vPt;

        const info = {
          geneva: vGen,
          portugal: vPt,
          total: vTot,
          inStock: vTot > 0
        };

        if (v.id) variantStockMap[v.id] = info;
        if (v.sku) variantStockMap[v.sku.toLowerCase().trim()] = info;
        if (v.attribute_value) {
          const rawFlv = v.attribute_value.toLowerCase().trim();
          variantStockMap[rawFlv] = info;
          const norm = rawFlv.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
          if (norm) variantStockMap[norm] = info;

          const synonyms: Record<string, string[]> = {
            vanille: ['vanilla'],
            vanilla: ['vanille'],
            fraise: ['strawberry', 'strawberries'],
            fraises: ['strawberry', 'strawberries'],
            strawberry: ['fraise', 'fraises'],
            strawberries: ['fraise', 'fraises'],
            chocolat: ['chocolate'],
            chocolate: ['chocolat'],
            ananas: ['pineapple'],
            pineapple: ['ananas'],
            banane: ['banana'],
            banana: ['banane'],
            citron: ['lemon'],
            lemon: ['citron'],
            peche: ['peach'],
            peach: ['peche'],
            pasteque: ['watermelon'],
            watermelon: ['pasteque'],
            fruitpunch: ['fruitspunch'],
            fruitspunch: ['fruitpunch'],
          };

          const syns = synonyms[norm] || [];
          for (const s of syns) {
            variantStockMap[s] = info;
          }
        }
      }

      // If parent has variants and parent stock is 0, sum up variants
      if (pVariants.length > 0) {
        const sumGen = pVariants.reduce((sum, v) => {
          const vStocks = pStocks.filter(s => s.variant_id === v.id);
          const vGen = vStocks.find(s => s.origin_id === 'GENEVA');
          return sum + (vGen ? Number(vGen.quantity) || 0 : Number(v.stock_geneva) || 0);
        }, 0);
        const sumPt = pVariants.reduce((sum, v) => {
          const vStocks = pStocks.filter(s => s.variant_id === v.id);
          const vPt = vStocks.find(s => s.origin_id === 'PORTUGAL');
          return sum + (vPt ? Number(vPt.quantity) || 0 : Number(v.stock_portugal) || 0);
        }, 0);

        if (genTotal === 0 && sumGen > 0) genTotal = sumGen;
        if (ptTotal === 0 && sumPt > 0) ptTotal = sumPt;
      }

      const totalQty = genTotal + ptTotal;
      const stockEntry = {
        geneva: genTotal,
        portugal: ptTotal,
        total: totalQty,
        inStock: totalQty > 0,
        variants: variantStockMap
      };

      // Index under all relevant identifiers
      if (p.id) stockMap[p.id] = stockEntry;
      if (p.woo_id) {
        const wid = p.woo_id.trim();
        stockMap[wid] = stockEntry;
        const cleanWid = wid.replace(/^prod-/, '');
        stockMap[cleanWid] = stockEntry;
        stockMap[`prod-${cleanWid}`] = stockEntry;
      }
      if (p.slug) {
        stockMap[p.slug.toLowerCase().trim()] = stockEntry;
      }
      if (p.sku) {
        stockMap[p.sku.toLowerCase().trim()] = stockEntry;
      }
    }

    return NextResponse.json({
      success: true,
      stocks: stockMap
    });
  } catch (err: any) {
    console.error('[Stock API GET error]:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productId,
      variantId,
      variantSku,
      origin = 'GENEVA', // 'GENEVA' | 'PORTUGAL' | 'ALL'
      quantity,
      delta
    } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // 1. Resolve product in DB
    const id = String(productId).trim();
    let query = supabase.from('products').select('id, woo_id, slug, sku, main_location');
    if (isUUID(id)) {
      query = query.eq('id', id);
    } else {
      const cleanId = id.replace(/^prod-/, '');
      query = query.or(`woo_id.eq.${id},woo_id.eq.${cleanId},slug.eq.${id},sku.eq.${id},sku.eq.${cleanId}`);
    }
    const { data: product, error: prodErr } = await query.maybeSingle();

    if (prodErr || !product) {
      return NextResponse.json({ error: 'Product not found in database' }, { status: 404 });
    }

    // 2. Resolve variant if specified
    let targetVariant: any = null;
    const flavorHint = body.attributeValue || body.flavor || body.flavorName;
    if (variantId || variantSku || flavorHint) {
      const vIdStr = String(variantId || '').trim();
      const cleanVId = vIdStr.replace(/^var-/, '').trim();

      if (vIdStr && isUUID(vIdStr)) {
        const { data: vData } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', product.id)
          .eq('id', vIdStr)
          .maybeSingle();
        targetVariant = vData;
      } else if (cleanVId && isUUID(cleanVId)) {
        const { data: vData } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', product.id)
          .eq('id', cleanVId)
          .maybeSingle();
        targetVariant = vData;
      }

      if (!targetVariant) {
        const { data: allVars } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', product.id);

        if (allVars && allVars.length > 0) {
          const matchKeys = [
            vIdStr.toLowerCase(),
            cleanVId.toLowerCase(),
            (variantSku || '').toLowerCase().trim(),
            String(flavorHint || '').toLowerCase().trim()
          ].filter(Boolean);

          targetVariant = allVars.find((v: any) => {
            const vIdLower = (v.id || '').toLowerCase();
            const vWoo = String(v.woo_id || '').toLowerCase().trim();
            const vSku = (v.sku || '').toLowerCase().trim();
            const vAttr = (v.attribute_value || '').toLowerCase().trim();

            return matchKeys.some(k =>
              k === vIdLower ||
              k === vWoo ||
              (vSku && k === vSku) ||
              (vAttr && k === vAttr) ||
              (vAttr && (k.includes(vAttr) || vAttr.includes(k)))
            );
          }) || null;
        }
      }
    }

    // 3. Determine origins to update
    const originsToUpdate: ('GENEVA' | 'PORTUGAL')[] = origin === 'PORTUGAL'
      ? ['PORTUGAL']
      : origin === 'ALL'
      ? ['GENEVA', 'PORTUGAL']
      : ['GENEVA'];

    const now = new Date().toISOString();

    for (const targetOrigin of originsToUpdate) {
      // Find existing stock row in product_stock
      let stockQuery = supabase
        .from('product_stock')
        .select('*')
        .eq('product_id', product.id)
        .eq('origin_id', targetOrigin);

      if (targetVariant?.id) {
        stockQuery = stockQuery.eq('variant_id', targetVariant.id);
      } else {
        stockQuery = stockQuery.is('variant_id', null);
      }

      const { data: existingStock } = await stockQuery.maybeSingle();
      const currentQty = existingStock ? Number(existingStock.quantity) || 0 : 0;

      let newQty = 0;
      if (typeof quantity === 'number') {
        newQty = Math.max(0, Math.floor(quantity));
      } else if (typeof delta === 'number') {
        newQty = Math.max(0, currentQty + Math.floor(delta));
      } else {
        newQty = currentQty;
      }

      // Upsert into product_stock
      if (existingStock) {
        await supabase
          .from('product_stock')
          .update({
            quantity: newQty,
            is_active: newQty > 0,
            updated_at: now
          })
          .eq('id', existingStock.id);
      } else {
        await supabase
          .from('product_stock')
          .insert({
            product_id: product.id,
            variant_id: targetVariant?.id || null,
            origin_id: targetOrigin,
            quantity: newQty,
            is_active: newQty > 0,
            reserved_quantity: 0,
            updated_at: now
          });
      }

      // If variant, also update product_variants table
      if (targetVariant) {
        const col = targetOrigin === 'GENEVA' ? 'stock_geneva' : 'stock_portugal';
        await supabase
          .from('product_variants')
          .update({ [col]: newQty, updated_at: now })
          .eq('id', targetVariant.id);
      }

      // Sync into fulfillment_stock
      try {
        await supabase
          .from('fulfillment_stock')
          .upsert({
            product_id: product.id,
            product_sku: product.sku || product.woo_id || product.id,
            variant_sku: targetVariant?.sku || null,
            origin_id: targetOrigin,
            quantity: newQty,
            updated_at: now
          }, { onConflict: 'product_id,variant_sku,origin_id' });
      } catch {}
    }

    // 4. Recalculate parent product stock sum
    const { data: allProdStocks } = await supabase
      .from('product_stock')
      .select('*')
      .eq('product_id', product.id);

    const genevaSum = (allProdStocks || [])
      .filter(s => s.origin_id === 'GENEVA')
      .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);

    const portugalSum = (allProdStocks || [])
      .filter(s => s.origin_id === 'PORTUGAL')
      .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);

    const totalStock = genevaSum + portugalSum;

    // Clear caches & revalidate
    clearDeliveryCache();
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/boutique');
      revalidatePath('/panier');
      if (product.slug) {
        revalidatePath(`/produit/${product.slug}`);
      }
      revalidateTag('products');
    } catch {}

    return NextResponse.json({
      success: true,
      productId: product.id,
      wooId: product.woo_id,
      slug: product.slug,
      stockGeneva: genevaSum,
      stockPortugal: portugalSum,
      totalStock,
      inStock: totalStock > 0
    });
  } catch (err: any) {
    console.error('[Stock API POST error]:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  return POST(request);
}
