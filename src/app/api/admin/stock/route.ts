import { inventoryInteger } from '@/lib/inventory/errors';
import { inventoryFailure } from '@/lib/inventory/save';
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

    if (productsRes.error || stockRes.error || variantsRes.error) {
      return NextResponse.json({ error: 'Le stock ne peut pas être chargé.' }, { status: 500 });
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

      let genTotal = parentGeneva?.is_active ? Number(parentGeneva.quantity) || 0 : 0;
      let ptTotal = parentPortugal?.is_active ? Number(parentPortugal.quantity) || 0 : 0;

      // Variant stock map
      const variantStockMap: Record<string, { geneva: number; portugal: number; total: number; inStock: boolean }> = {};

      for (const v of pVariants) {
        const vStocks = pStocks.filter(s => s.variant_id === v.id);
        const vGenStock = vStocks.find(s => s.origin_id === 'GENEVA');
        const vPtStock = vStocks.find(s => s.origin_id === 'PORTUGAL');

        const vGen = vGenStock?.is_active ? Number(vGenStock.quantity) : 0;
        const vPt = vPtStock?.is_active ? Number(vPtStock.quantity) : 0;

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
        genTotal = pVariants.reduce((sum, v) => sum + Number(variantStockMap[v.id]?.geneva || 0), 0);
        ptTotal = pVariants.reduce((sum, v) => sum + Number(variantStockMap[v.id]?.portugal || 0), 0);
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
    if (!body.productId || !['GENEVA', 'PORTUGAL', 'ALL'].includes(body.origin || 'GENEVA') ||
        (body.quantity === undefined) === (body.delta === undefined)) {
      return NextResponse.json({ error: 'Quantité, dépôt ou produit invalide.' }, { status: 400 });
    }
    try { inventoryInteger(body.quantity === undefined ? body.delta : body.quantity, body.quantity === undefined); }
    catch (error: any) { return NextResponse.json({ error: error.message }, { status: 400 }); }
    const { data, error } = await getAdminSupabase().rpc('adjust_inventory', {
      payload: body, actor: 'legacy_admin_unverified',
    });
    if (error) {
      const failure = inventoryFailure(error);
      return NextResponse.json({ error: failure.error }, { status: failure.status });
    }
    clearDeliveryCache();
    revalidatePath('/', 'layout');
    revalidateTag('products');
    if (data.slug) revalidatePath(`/produit/${data.slug}`);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'La modification n’a pas été enregistrée.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) { return POST(request); }
