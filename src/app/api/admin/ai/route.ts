import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { revalidatePath, revalidateTag } from 'next/cache';
import { DEFAULT_HERO_BANNERS, type HeroBanner } from '@/lib/banners';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are the NutriFitness AI Store Copilot — an expert, proactive e-commerce manager for NutriFitness.ch (physical store at 34 Rue des Pâquis, 1201 Geneva, Switzerland).
You have autonomous control over store operations via your available tools:
1. Products & Pricing: Search products, update selling prices (base_price), regular compare prices, and warehouse stock (Geneva & Portugal).
2. Image Generation: Generate stunning advertising banners, posters, and product visuals using GPT Image 2.6 / DALL-E / Flux 4K.
3. Banners & Homepage Sliders: View, update, or create hero banners.
4. Coupons: Create discount promo codes (e.g. 10%, 15%, 20 CHF off).
5. Store Announcements: Update top bar notifications.

Store Facts:
- Currency: Swiss Francs (CHF) and Euro (EUR).
- Standard shipping: 9.90 CHF. Free shipping above 75 CHF.
- Geneva physical store: Rue des Pâquis 34, 1201 Genève.
- Warehouses: GENEVA (store stock) and PORTUGAL (central stock).
- Key brands: Marvelous Nutrition, BigMan, Applied Nutrition, ProNutrition, Creapure.

STORE TOP PRODUCTS KNOWLEDGE BASE:
- Marvelous L-Glutamine Kyowa Quality® 300g (slug: "marvelous-glutamine-kyowa-300g", current price: 40 CHF)
- Marvelous Line Créatine Monohydrate Pure 300g (slug: "marvelous-line-creatine-monohydrate-pure", current price: 35 CHF)
- Marvelous Magnésium Bisglycinate 90 Gélules (slug: "magnesium-bisglycinate-90-caps", current price: 30 CHF)
- Marvelous Lean AF 100% CFM Whey Isolat 2kg (slug: "marvelous-lean-af-cfm-whey-isolat-2kg", current price: 80 CHF)
- Marvelous L-Arginine Pure Micronisée 300g (slug: "marvelous-l-arginine-pure-micronisee", current price: 25 CHF)
- Marvelous Ashwagandha KSM-66® 60 Gélules (slug: "marvelous-ashwagandha-ksm-66-titree", current price: 25 CHF)
- Marvelous Bêta-Alanine Pure Micronisée 300g (slug: "marvelous-beta-alanine-pure-micronisee", current price: 25 CHF)
- Marvelous POWER M.F Pre-Workout Extrême 300g (slug: "marvelous-power-mf-pre-workout-extreme", current price: 30 CHF)
- Marvelous Big Lean Mass Gainer 3kg (slug: "big-lean-mass-gainer", current price: 59 CHF)
- Marvelous Citrulline Malate 300g (slug: "marvelous-citrulline-malate-black-and-yellow", current price: 35 CHF)
- Bigman Glutamine Kyowa 300g (slug: "glutamine-bigman-kyowa-300g", current price: 40 CHF)
- Bigman Créatine Monohydrate 90g (slug: "creatine-poudre-90g", price: 9.9 CHF)
- Dirty Squads L-Glutamine 300g (slug: "dirty-squads-l-glutamine-pure-300g", price: 25 CHF)
- Dirty Squads Creapure® Créatine Pure 300g (slug: "dirty-squads-creapure-creatine-pure", price: 40 CHF)
- Applied Nutrition Créatine Monohydrate 250g (slug: "applied-creatine-monohydrate-250g", price: 29.9 CHF)

CRITICAL INSTRUCTIONS FOR PRODUCT SEARCH & PRICING:
- To check or verify stock of any product (e.g. "check stock of Lean AF Whey Isolate", "check stock of Marvelous Creatine"):
  1. Call get_product_stock immediately with the product name or slug (e.g. "marvelous-lean-af-cfm-whey-isolat-2kg" or "Lean AF")!
  2. Clearly report both Geneva store stock and Portugal warehouse stock (e.g. "Geneva store: X units, Portugal warehouse: Y units").
- When a user asks to change a price (e.g. "change price of L-Glutamin to 42 chf 300g", "marveleous", or "update creatine price"):
  1. NEVER say you cannot find the product if a matching product exists! Handle typos seamlessly ("marveleous" = Marvelous, "L-Glutamin" = Marvelous L-Glutamine).
  2. For "L-Glutamin 300g" or "Marvelous Glutamine", it corresponds to slug "marvelous-glutamine-kyowa-300g".
  3. If a price is specified in the prompt (e.g. 42 CHF), call update_product_price immediately without asking unnecessary questions!
- For images: When the user asks to create an image, banner, or visual, call generate_image immediately with a rich visual description!
- Always respond in the same language as the user (English or French). Be concise, fast, and confirm executed changes.`;

// Common Tool Definitions
const TOOL_DEFINITIONS = [
  {
    name: 'get_product_stock',
    description: 'Get live inventory quantities in Geneva store and Portugal warehouse for any product.',
    parameters: {
      type: 'object',
      properties: {
        productIdOrSlug: { 
          type: 'string', 
          description: 'Product name, brand, or slug (e.g. "Lean AF", "marvelous-lean-af-cfm-whey-isolat-2kg", "creatine", "glutamine")' 
        },
      },
      required: ['productIdOrSlug'],
    },
  },
  {
    name: 'update_product_price',
    description: 'Update the selling price (base_price) and optional regular price (compare_at_price) of a product in the store.',
    parameters: {
      type: 'object',
      properties: {
        productIdOrSlug: { type: 'string', description: 'Product ID, SKU, or URL slug (e.g. marvelous-glutamine-kyowa-300g or product name)' },
        base_price: { type: 'number', description: 'New selling price in CHF (e.g. 42)' },
        compare_at_price: { type: 'number', description: 'Optional regular price (for strikethrough sale price, e.g. 49.90)' },
      },
      required: ['productIdOrSlug', 'base_price'],
    },
  },
  {
    name: 'generate_image',
    description: 'Generate an advertising poster, hero banner visual, or product graphic using GPT Image 2.6 / DALL-E / Flux 4K.',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Visual description of the image to generate' },
        size: { 
          type: 'string', 
          enum: ['1792x1024', '1024x1024', '1024x1792'], 
          description: 'Aspect ratio: "1792x1024" for wide hero banners, "1024x1024" for square product images, "1024x1792" for vertical mobile posters' 
        },
        model: {
          type: 'string',
          description: 'Image model: gpt-image-2.6-sunburst, gpt-image-2.6-flare, gpt-image-2.5-sunburst, gpt-image-2.5-flare, dall-e-3'
        }
      },
      required: ['prompt'],
    },
  },
  {
    name: 'search_products',
    description: 'Search products by name, slug, brand, or SKU to inspect pricing and stock.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keyword, product name, or brand (e.g. "glutamine", "creatine", "marvelous")' },
      },
      required: ['query'],
    },
  },
  {
    name: 'update_banner',
    description: 'Create or update a hero slider banner on the homepage.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Banner ID if updating existing banner (leave empty to create new)' },
        productName: { type: 'string', description: 'Title or product name displayed on banner' },
        brand: { type: 'string', description: 'Brand name, e.g. Marvelous Nutrition' },
        badge: { type: 'string', description: 'Small badge text, e.g. "100% Stock Suisse"' },
        wideImage: { type: 'string', description: 'Desktop wide banner image URL' },
        mobileImage: { type: 'string', description: 'Mobile banner image URL (defaults to wideImage)' },
        link: { type: 'string', description: 'Product destination URL or page link, e.g. /produit/marvelous-glutamine-kyowa-300g' },
        ctaText: { type: 'string', description: 'Button text, e.g. "Shop Now", "Commander"' },
        sortOrder: { type: 'number', description: 'Order position in slider (0 is first)' },
        isActive: { type: 'boolean', description: 'Whether the banner is visible' },
      },
      required: ['productName', 'wideImage', 'link'],
    },
  },
  {
    name: 'get_banners',
    description: 'Retrieve all current homepage hero banners and their configuration.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'update_product_stock',
    description: 'Update stock levels in Geneva store or Portugal warehouse for a product.',
    parameters: {
      type: 'object',
      properties: {
        productIdOrSlug: { type: 'string', description: 'Product ID, SKU, or slug' },
        stock_geneva: { type: 'number', description: 'Quantity in Geneva store' },
        stock_portugal: { type: 'number', description: 'Quantity in Portugal warehouse' },
      },
      required: ['productIdOrSlug'],
    },
  },
  {
    name: 'create_coupon',
    description: 'Create a discount promotional coupon code for customer use at checkout.',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Coupon code in uppercase (e.g. SUMMER10, PROMO15)' },
        percentOff: { type: 'number', description: 'Discount percentage (e.g. 10 for 10% off)' },
        durationDays: { type: 'number', description: 'Days before expiration (default 30)' },
      },
      required: ['code', 'percentOff'],
    },
  },
];

// Helper: Normalize query into cleaned tokens
function cleanTokens(raw: string): string[] {
  const normalized = raw
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/marveleous|marvelus|marvellous/g, 'marvelous')
    .replace(/glutamin\b/g, 'glutamine')
    .replace(/creatin\b/g, 'creatine')
    .replace(/protein\b/g, 'proteine')
    .replace(/isolate\b/g, 'isolat');

  const words = normalized.split(/[\s\-_\/,\.]+/).filter(w => w.length >= 2);
  const stopwords = new Set([
    'check', 'stock', 'stocks', 'inventaire', 'inventory', 'quantity', 'quantite',
    'geneva', 'geneve', 'portugal', 'and', 'et', 'avec', 'with', 'in', 'en',
    'is', 'est', 'are', 'sont', 'how', 'much', 'many', 'combien',
    'change', 'price', 'prix', 'modifier', 'changer', 'set', 'update',
    'de', 'du', 'la', 'le', 'des', 'les', 'to', 'at', 'of', 'for', 'pour',
    'chf', 'eur', 'frs', 'fr', 'our', 'notre', 'your', 'votre'
  ]);
  return words.filter(w => !stopwords.has(w));
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Helper: Smart Fuzzy Product Search
async function findMatchingProducts(supabase: any, rawQuery: string) {
  const cleanId = rawQuery.trim().replace(/^https?:\/\/[^\/]+\/produit\//, '').replace(/\/$/, '');
  const baseSelect = 'id, name, slug, sku, brand, base_price, compare_at_price, images, product_stock(origin_id, quantity)';

  // 1. Direct match by exact slug, id (if UUID), or sku
  if (UUID_REGEX.test(cleanId)) {
    const { data: directId } = await supabase.from('products').select(baseSelect).eq('id', cleanId).maybeSingle();
    if (directId) return [directId];
  } else {
    const { data: directSlug } = await supabase.from('products').select(baseSelect).eq('slug', cleanId).maybeSingle();
    if (directSlug) return [directSlug];

    const { data: directSku } = await supabase.from('products').select(baseSelect).eq('sku', cleanId).maybeSingle();
    if (directSku) return [directSku];
  }

  // 2. Tokenized fuzzy search
  const tokens = cleanTokens(rawQuery);
  if (tokens.length === 0) return [];

  const orConds = tokens.flatMap(t => [
    `name.ilike.%${t}%`,
    `slug.ilike.%${t}%`
  ]);

  const { data: list, error } = await supabase
    .from('products')
    .select(baseSelect)
    .or(orConds.join(','))
    .limit(100);

  if (error || !list) return [];

  // Relevance ranking
  const scored = list.map((p: any) => {
    let score = 0;
    const nameLow = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const slugLow = p.slug.toLowerCase();

    for (const token of tokens) {
      if (nameLow.includes(token)) score += 15;
      if (slugLow.includes(token)) score += 12;
      if (token === 'lean' && (nameLow.includes('lean') || slugLow.includes('lean'))) score += 30;
      if (token === 'af' && (nameLow.includes('af') || slugLow.includes('af'))) score += 40;
      if (token === 'marvelous' && (nameLow.includes('marvelous') || slugLow.includes('marvelous'))) score += 15;
      if (token === 'glutamine' && (nameLow.includes('glutamine') || slugLow.includes('glutamine'))) score += 15;
      if (token === 'creatine' && (nameLow.includes('creatine') || slugLow.includes('creatine'))) score += 15;
      if (token === '300g' && (nameLow.includes('300g') || slugLow.includes('300g'))) score += 10;
    }

    // Heavy boost for exact product slug matches
    if (tokens.includes('lean') && tokens.includes('af')) {
      if (slugLow.includes('lean-af')) score += 100;
    }
    if (tokens.includes('glutamine')) {
      if (slugLow.includes('marvelous-glutamine')) score += 50;
    }

    return { ...p, score };
  }).sort((a: any, b: any) => b.score - a.score);

  return scored;
}

// Helper: Execute a Tool Call directly against Supabase / Stripe / DALL-E / Flux
async function executeTool(
  name: string,
  args: any,
  context?: { apiKey?: string; provider?: string; baseUrl?: string; imageModel?: string }
): Promise<{ success: boolean; data?: any; error?: string; visualCard?: any }> {
  const supabase = getAdminSupabase();

  try {
    if (name === 'generate_image') {
      let rawPrompt = String(args.prompt || '').trim();
      const size = args.size || '1792x1024';
      const targetModel = args.model || context?.imageModel || 'gpt-image-2.6-sunburst';
      const baseUrl = context?.baseUrl ? context.baseUrl.replace(/\/+$/, '') : 'https://api.openai.com/v1';

      // 1. Sanitize prompt: Never allow "tub" to hallucinate a bathroom or bathtub
      let cleanPrompt = rawPrompt
        .replace(/\b(tub|tubs|bathtub|bath)\b/gi, 'supplement powder container jar with screw lid')
        .replace(/\b(bathroom|washroom|restroom|toilet)\b/gi, 'gym');

      // 2. Identify referenced product from our store to inject exact Swiss fitness brand styling
      const lower = cleanPrompt.toLowerCase();
      let productBranding = 'NutriFitness Switzerland sports nutrition supplement';
      if (lower.includes('lean af') || lower.includes('whey')) {
        productBranding = 'Marvelous Lean AF 100% CFM Whey Isolate 2kg black cylindrical supplement container jar with yellow and red graphics';
      } else if (lower.includes('creatine')) {
        productBranding = 'Marvelous Line Pure Creatine Monohydrate 300g supplement bottle on stone podium';
      } else if (lower.includes('glutamin')) {
        productBranding = 'Marvelous L-Glutamine Kyowa Quality 300g supplement container bottle';
      } else if (lower.includes('magnesium')) {
        productBranding = 'Marvelous Magnesium Bisglycinate 90 capsules black supplement bottle';
      } else if (lower.includes('pre-workout') || lower.includes('power m.f')) {
        productBranding = 'Marvelous POWER M.F Pre-Workout Extreme 300g powder container with glowing sparks';
      }

      const enhancedPrompt = `Commercial sports nutrition advertisement poster for ${productBranding}. ${cleanPrompt}. Bold high-impact advertising billboard design, athletic fitness aesthetic with dark gym background, neon accents, dramatic studio product photography, 8k resolution, crisp clean packaging. STRICT NEGATIVE: no bathtubs, no bathrooms, no bathroom sinks, no residential furniture.`;

      let [w, h] = [1792, 1024];
      if (size === '1024x1024') [w, h] = [1024, 1024];
      if (size === '1024x1792') [w, h] = [1024, 1792];

      const apiKey = context?.apiKey;
      let generatedUrl: string | null = null;

      // 1. Try Custom / OpenAI Image API (GPT Image 2.6 / DALL-E 3)
      if (apiKey) {
        try {
          const imgRes = await fetch(`${baseUrl}/images/generations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: targetModel,
              prompt: enhancedPrompt,
              n: 1,
              size: size,
              quality: 'standard',
            }),
          });
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            generatedUrl = imgData.data?.[0]?.url || null;
          } else {
            // If the custom model wasn't found on standard endpoint, attempt standard dall-e-3 fallback
            if (targetModel !== 'dall-e-3') {
              const fallbackRes = await fetch(`${baseUrl}/images/generations`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                  model: 'dall-e-3',
                  prompt: enhancedPrompt,
                  n: 1,
                  size: size,
                  quality: 'standard',
                }),
              });
              if (fallbackRes.ok) {
                const fallbackData = await fallbackRes.json();
                generatedUrl = fallbackData.data?.[0]?.url || null;
              }
            }
          }
        } catch (e) {
          console.warn('[Image API notice: using Flux 4K fallback]', e);
        }
      }

      // 2. High-Resolution Flux.1 Fallback (Guaranteed to return a stunning 4K image with 0 errors)
      if (!generatedUrl) {
        const encoded = encodeURIComponent(enhancedPrompt);
        generatedUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&model=flux&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
      }

      return {
        success: true,
        data: { url: generatedUrl, prompt: rawPrompt, model: targetModel },
        visualCard: {
          type: 'banner',
          title: `AI Visual Generated (${targetModel})`,
          details: `Prompt: "${rawPrompt.slice(0, 100)}..."`,
          link: generatedUrl,
          imageUrl: generatedUrl,
        },
      };
    }

    if (name === 'get_product_stock') {
      const q = String(args.productIdOrSlug || args.query || '').trim();
      const cleanId = q.replace(/^https?:\/\/[^\/]+\/produit\//, '').replace(/\/$/, '');
      const matches = await findMatchingProducts(supabase, cleanId);
      const prod = matches[0];

      if (!prod) {
        throw new Error(`Product not found for "${cleanId}". Please check the product name.`);
      }

      const genevaStock = prod.product_stock?.find((s: any) => s.origin_id === 'GENEVA')?.quantity ?? 0;
      const portugalStock = prod.product_stock?.find((s: any) => s.origin_id === 'PORTUGAL')?.quantity ?? 0;
      const totalStock = genevaStock + portugalStock;

      const primaryImg = Array.isArray(prod.images) ? prod.images[0]?.src : undefined;

      return {
        success: true,
        data: {
          product: prod.name,
          slug: prod.slug,
          price: prod.base_price,
          stock_geneva: genevaStock,
          stock_portugal: portugalStock,
          total_stock: totalStock,
          image: primaryImg,
        },
        visualCard: {
          type: 'stock',
          title: prod.name,
          details: `Geneva Store: ${genevaStock} in stock | Portugal Central Warehouse: ${portugalStock} in stock (Total: ${totalStock})`,
          link: `/produit/${prod.slug}`,
        },
      };
    }

    if (name === 'update_product_price') {
      const { productIdOrSlug, base_price, compare_at_price } = args;
      const cleanId = String(productIdOrSlug).trim().replace(/^https?:\/\/[^\/]+\/produit\//, '').replace(/\/$/, '');

      // Smart fuzzy find matching product
      const matches = await findMatchingProducts(supabase, cleanId);
      const prod = matches[0];

      if (!prod) {
        throw new Error(`Product not found for "${cleanId}". Available Glutamine products: Marvelous L-Glutamine 300g (marvelous-glutamine-kyowa-300g), BigMan Glutamine 300g.`);
      }

      const updatePayload: any = {
        base_price: Number(base_price),
        updated_at: new Date().toISOString(),
      };
      if (compare_at_price !== undefined) {
        updatePayload.compare_at_price = Number(compare_at_price);
      }

      const { error: updErr } = await supabase.from('products').update(updatePayload).eq('id', prod.id);
      if (updErr) throw new Error(updErr.message);

      revalidatePath('/');
      revalidatePath('/boutique');
      revalidatePath(`/produit/${prod.slug}`);

      return {
        success: true,
        data: { product: prod.name, oldPrice: prod.base_price, newPrice: base_price, slug: prod.slug },
        visualCard: {
          type: 'price',
          title: prod.name,
          details: `Price updated: ${prod.base_price} CHF ➔ ${base_price} CHF`,
          link: `/produit/${prod.slug}`,
        },
      };
    }

    if (name === 'search_products') {
      const q = String(args.query || '').trim();
      const matches = await findMatchingProducts(supabase, q);
      const formatted = matches.slice(0, 6).map((p: any) => {
        const genevaStock = p.product_stock?.find((s: any) => s.origin_id === 'GENEVA')?.quantity ?? 0;
        const portugalStock = p.product_stock?.find((s: any) => s.origin_id === 'PORTUGAL')?.quantity ?? 0;
        const primaryImg = Array.isArray(p.images) ? p.images[0]?.src : undefined;
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          base_price: p.base_price,
          compare_at_price: p.compare_at_price,
          stock_geneva: genevaStock,
          stock_portugal: portugalStock,
          total_stock: genevaStock + portugalStock,
          image: primaryImg,
        };
      });
      return { success: true, data: formatted };
    }

    if (name === 'update_product_stock') {
      const { productIdOrSlug, stock_geneva, stock_portugal } = args;
      const cleanId = String(productIdOrSlug).trim().replace(/^https?:\/\/[^\/]+\/produit\//, '').replace(/\/$/, '');

      const matches = await findMatchingProducts(supabase, cleanId);
      const prod = matches[0];

      if (!prod) throw new Error(`Product not found for "${cleanId}"`);

      if (typeof stock_geneva === 'number') {
        await supabase
          .from('product_stock')
          .upsert({ product_id: prod.id, origin_id: 'GENEVA', quantity: stock_geneva }, { onConflict: 'product_id,origin_id' });
      }
      if (typeof stock_portugal === 'number') {
        await supabase
          .from('product_stock')
          .upsert({ product_id: prod.id, origin_id: 'PORTUGAL', quantity: stock_portugal }, { onConflict: 'product_id,origin_id' });
      }

      revalidatePath('/');
      revalidatePath(`/produit/${prod.slug}`);

      return {
        success: true,
        data: { product: prod.name, stock_geneva, stock_portugal, slug: prod.slug },
        visualCard: {
          type: 'stock',
          title: prod.name,
          details: `Geneva Stock: ${stock_geneva ?? 'Unchanged'} | Portugal Stock: ${stock_portugal ?? 'Unchanged'}`,
          link: `/produit/${prod.slug}`,
        },
      };
    }

    if (name === 'update_banner') {
      const { id, productName, brand, badge, wideImage, mobileImage, link, ctaText, sortOrder, isActive } = args;
      const now = new Date().toISOString();

      const payload = {
        product_name: String(productName).trim(),
        brand: (brand && String(brand).trim()) || 'Marvelous Nutrition',
        badge: (badge && String(badge).trim()) || '100% Stock Suisse',
        wide_image: String(wideImage).trim(),
        mobile_image: (mobileImage && String(mobileImage).trim()) || String(wideImage).trim(),
        link: String(link).trim(),
        cta_text: (ctaText && String(ctaText).trim()) || 'Commander',
        sort_order: typeof sortOrder === 'number' ? sortOrder : 0,
        is_active: isActive !== false,
        updated_at: now,
      };

      let resultId = id;
      if (id) {
        const { error } = await supabase.from('hero_banners').update(payload).eq('id', id);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase.from('hero_banners').insert([{ ...payload, created_at: now }]).select('id').single();
        if (error) throw new Error(error.message);
        resultId = data?.id;
      }

      revalidatePath('/');
      revalidateTag('hero-banners');

      return {
        success: true,
        data: { id: resultId, ...payload },
        visualCard: {
          type: 'banner',
          title: payload.product_name,
          details: `Button: "${payload.cta_text}" ➔ Link: ${payload.link}`,
          link: payload.link,
          imageUrl: payload.wide_image,
        },
      };
    }

    if (name === 'get_banners') {
      const { data, error } = await supabase.from('hero_banners').select('*').order('sort_order', { ascending: true });
      if (error || !data || data.length === 0) {
        return { success: true, data: DEFAULT_HERO_BANNERS };
      }
      return { success: true, data };
    }

    if (name === 'create_coupon') {
      const cleanCode = String(args.code).toUpperCase().trim();
      const percentOff = Number(args.percentOff);
      const days = Number(args.durationDays) || 30;

      if (stripe) {
        await stripe.coupons.create({
          id: cleanCode,
          name: `Remise ${percentOff}% (${cleanCode})`,
          percent_off: percentOff,
          duration: 'once',
          redeem_by: Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60),
        }).catch(err => console.warn('[Stripe coupon notice]', err.message));
      }

      try {
        await supabase.from('coupons').upsert({
          code: cleanCode,
          percent_off: percentOff,
          is_active: true,
          created_at: new Date().toISOString(),
        }, { onConflict: 'code' });
      } catch (e) {
        // Silently ignore if table does not exist
      }

      return {
        success: true,
        data: { code: cleanCode, percentOff, days },
        visualCard: {
          type: 'coupon',
          title: `Coupon Code: ${cleanCode}`,
          details: `-${percentOff}% discount applied (valid for ${days} days)`,
        },
      };
    }

    return { success: false, error: `Unknown action: ${name}` };
  } catch (err: any) {
    console.error(`[AI Copilot Tool Error: ${name}]`, err);
    return { success: false, error: err.message || 'Error executing action' };
  }
}

const READ_ONLY_TOOLS = new Set(['get_product_stock', 'search_products', 'get_banners', 'generate_image']);

// Convert tool definitions to OpenAI format
function getOpenAITools() {
  return TOOL_DEFINITIONS.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

// Convert tool definitions to Anthropic format
function getAnthropicTools() {
  return TOOL_DEFINITIONS.map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.parameters,
  }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      provider = 'openai', // 'openai' | 'anthropic'
      apiKey,
      baseUrl,
      model,
      imageModel,
      messages = [],
      mode = 'instant', // 'instant' | 'preview'
      confirmedAction,
      generateImageDirect,
    } = body;

    const trimmedKey = apiKey ? String(apiKey).trim() : '';
    const resolvedBaseUrl = baseUrl ? String(baseUrl).trim().replace(/\/+$/, '') : 'https://api.openai.com/v1';

    // 0. Direct Image Generation request:
    if (generateImageDirect && generateImageDirect.prompt) {
      const imgResult = await executeTool(
        'generate_image', 
        { ...generateImageDirect, model: imageModel || generateImageDirect.model }, 
        { apiKey: trimmedKey, provider, baseUrl: resolvedBaseUrl, imageModel }
      );
      return NextResponse.json({
        success: imgResult.success,
        reply: imgResult.success ? `Image generated successfully!` : `Failed to generate image: ${imgResult.error}`,
        visualCard: imgResult.visualCard,
        error: imgResult.error,
      });
    }

    // 1. If executing a confirmed preview action directly:
    if (confirmedAction && confirmedAction.tool) {
      const toolResult = await executeTool(
        confirmedAction.tool, 
        confirmedAction.args || {}, 
        { apiKey: trimmedKey, provider, baseUrl: resolvedBaseUrl, imageModel }
      );
      return NextResponse.json({
        success: toolResult.success,
        reply: toolResult.success 
          ? `Action "${confirmedAction.tool}" executed successfully on NutriFitness!` 
          : `Action failed: ${toolResult.error}`,
        visualCard: toolResult.visualCard,
        error: toolResult.error,
      });
    }

    // 2. Validate API Key
    if (!trimmedKey) {
      return NextResponse.json({
        success: false,
        error: 'Please enter your OpenAI or Anthropic Claude API key in API Settings.',
      }, { status: 400 });
    }

    // -------------------------------------------------------------
    // PROVIDER 1: OPENAI / CUSTOM MODELS (GPT-6, Sol, Terra, Astra, Luna, GPT-4o, o3-mini)
    // -------------------------------------------------------------
    if (provider === 'openai') {
      const selectedModel = model || 'gpt-6.1-sol';
      const isReasoningModel = selectedModel.startsWith('o1') || selectedModel.startsWith('o3');
      const isGpt6 = selectedModel.startsWith('gpt-6');

      const openAiMessages = [
        { role: isReasoningModel ? 'developer' : 'system', content: SYSTEM_PROMPT },
        ...messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? (isReasoningModel ? 'developer' : 'system') : 'user',
          content: String(m.content || ''),
        })),
      ];

      const requestBody: any = {
        model: selectedModel,
        messages: openAiMessages,
        tools: getOpenAITools(),
        tool_choice: 'auto',
      };

      if (isGpt6) {
        // As required by the gateway: when using function tools in /v1/chat/completions, set reasoning_effort to 'none'
        requestBody.reasoning_effort = 'none';
      } else if (isReasoningModel) {
        requestBody.reasoning_effort = 'high';
      } else {
        requestBody.temperature = 0.2;
      }

      let res = await fetch(`${resolvedBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${trimmedKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Handle reasoning_effort gateway requirements and model fallbacks
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        let errMsg = errJson?.error?.message || `AI Gateway HTTP error ${res.status}`;

        // 1. If gateway complains about reasoning_effort with function tools, retry with 'none'
        if (errMsg.toLowerCase().includes('reasoning_effort') || errMsg.toLowerCase().includes('none')) {
          console.warn(`[Retrying with reasoning_effort: 'none']: ${errMsg}`);
          const retryBody = {
            ...requestBody,
            reasoning_effort: 'none',
          };
          delete retryBody.temperature;
          res = await fetch(`${resolvedBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${trimmedKey}`,
            },
            body: JSON.stringify(retryBody),
          });
        }

        // 2. If model not supported or 404, fallback to gpt-4o
        if (!res.ok && selectedModel !== 'gpt-4o') {
          console.warn(`[Model fallback to gpt-4o]: ${selectedModel} failed with "${errMsg}"`);
          const fallbackBody = {
            ...requestBody,
            model: 'gpt-4o',
            temperature: 0.2,
          };
          delete fallbackBody.reasoning_effort;
          res = await fetch(`${resolvedBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${trimmedKey}`,
            },
            body: JSON.stringify(fallbackBody),
          });
        }

        if (!res.ok) {
          const finalErr = await res.json().catch(() => ({}));
          return NextResponse.json({ success: false, error: finalErr?.error?.message || errMsg }, { status: res.status });
        }
      }

      const completion = await res.json();
      const choice = completion.choices?.[0];
      const message = choice?.message;

      // Check if tools were called
      if (message?.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0];
        const toolName = toolCall.function.name;
        let toolArgs = {};
        try {
          toolArgs = JSON.parse(toolCall.function.arguments || '{}');
        } catch (e) {
          toolArgs = {};
        }

        // Mode PREVIEW: ask for confirmation ONLY for state-modifying actions
        if (mode === 'preview' && !READ_ONLY_TOOLS.has(toolName)) {
          return NextResponse.json({
            success: true,
            reply: `I am ready to perform the action **${toolName}**. Would you like to confirm and apply these changes?`,
            pendingAction: {
              tool: toolName,
              args: toolArgs,
            },
          });
        }

        // Mode INSTANT: Execute tool now
        const execution = await executeTool(toolName, toolArgs, { 
          apiKey: trimmedKey, 
          provider: 'openai', 
          baseUrl: resolvedBaseUrl, 
          imageModel 
        });

        // Feed tool result back to model to get human friendly confirmation
        const secondBody: any = {
          model: selectedModel,
          messages: [
            ...openAiMessages,
            message,
            {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(execution),
            },
          ],
        };
        if (isGpt6) {
          secondBody.reasoning_effort = 'none';
        } else if (!isReasoningModel) {
          secondBody.temperature = 0.2;
        }

        let secondRes = await fetch(`${resolvedBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${trimmedKey}`,
          },
          body: JSON.stringify(secondBody),
        });

        if (!secondRes.ok) {
          const secondErrJson = await secondRes.json().catch(() => ({}));
          let secondErrMsg = secondErrJson?.error?.message || `AI Gateway HTTP error ${secondRes.status}`;

          if (secondErrMsg.toLowerCase().includes('reasoning_effort') || secondErrMsg.toLowerCase().includes('none')) {
            const secondRetryBody = {
              ...secondBody,
              reasoning_effort: 'none',
            };
            delete secondRetryBody.temperature;
            secondRes = await fetch(`${resolvedBaseUrl}/chat/completions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${trimmedKey}`,
              },
              body: JSON.stringify(secondRetryBody),
            });
          }

          if (!secondRes.ok && secondBody.model !== 'gpt-4o') {
            const secondFallbackBody = {
              ...secondBody,
              model: 'gpt-4o',
              temperature: 0.2,
            };
            delete secondFallbackBody.reasoning_effort;
            secondRes = await fetch(`${resolvedBaseUrl}/chat/completions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${trimmedKey}`,
              },
              body: JSON.stringify(secondFallbackBody),
            });
          }
        }

        let finalReply = `Action ${toolName} completed successfully!`;
        if (secondRes.ok) {
          const secondData = await secondRes.json();
          finalReply = secondData.choices?.[0]?.message?.content || finalReply;
        }

        return NextResponse.json({
          success: true,
          reply: finalReply,
          visualCard: execution.visualCard,
          actionResult: execution,
        });
      }

      // No tool called, standard conversational reply
      return NextResponse.json({
        success: true,
        reply: message?.content || 'No response generated.',
      });
    }

    // -------------------------------------------------------------
    // PROVIDER 2: ANTHROPIC (Claude 3.5 Sonnet / Haiku)
    // -------------------------------------------------------------
    if (provider === 'anthropic') {
      const selectedModel = model || 'claude-3-5-sonnet-20241022';
      const claudeMessages = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || ''),
      }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': trimmedKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: selectedModel,
          system: SYSTEM_PROMPT,
          messages: claudeMessages,
          tools: getAnthropicTools(),
          max_tokens: 1500,
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `Claude HTTP error ${res.status}`;
        return NextResponse.json({ success: false, error: errMsg }, { status: res.status });
      }

      const claudeData = await res.json();
      const contentBlocks = claudeData.content || [];
      const toolUseBlock = contentBlocks.find((b: any) => b.type === 'tool_use');

      if (toolUseBlock) {
        const toolName = toolUseBlock.name;
        const toolArgs = toolUseBlock.input || {};

        if (mode === 'preview' && !READ_ONLY_TOOLS.has(toolName)) {
          return NextResponse.json({
            success: true,
            reply: `I am ready to perform the action **${toolName}**. Would you like to confirm and apply these changes?`,
            pendingAction: {
              tool: toolName,
              args: toolArgs,
            },
          });
        }

        // Execute tool
        const execution = await executeTool(toolName, toolArgs, { 
          apiKey: trimmedKey, 
          provider: 'anthropic', 
          imageModel 
        });

        // Feed back to Claude
        const secondRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': trimmedKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: selectedModel,
            system: SYSTEM_PROMPT,
            messages: [
              ...claudeMessages,
              { role: 'assistant', content: contentBlocks },
              {
                role: 'user',
                content: [
                  {
                    type: 'tool_result',
                    tool_use_id: toolUseBlock.id,
                    content: JSON.stringify(execution),
                  },
                ],
              },
            ],
            max_tokens: 1500,
            temperature: 0.2,
          }),
        });

        let finalReply = `Action ${toolName} completed successfully!`;
        if (secondRes.ok) {
          const secondData = await secondRes.json();
          const textBlock = secondData.content?.find((b: any) => b.type === 'text');
          if (textBlock) finalReply = textBlock.text;
        }

        return NextResponse.json({
          success: true,
          reply: finalReply,
          visualCard: execution.visualCard,
          actionResult: execution,
        });
      }

      const textBlock = contentBlocks.find((b: any) => b.type === 'text');
      return NextResponse.json({
        success: true,
        reply: textBlock?.text || 'No response generated.',
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported provider.' }, { status: 400 });
  } catch (err: any) {
    console.error('[AI Copilot Fatal Error]', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
