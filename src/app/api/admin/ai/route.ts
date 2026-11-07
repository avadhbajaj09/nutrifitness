import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { revalidatePath, revalidateTag } from 'next/cache';
import { DEFAULT_HERO_BANNERS, type HeroBanner } from '@/lib/banners';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are the NutriFitness AI Webmaster & Store Copilot.
You assist the owner of NutriFitness.ch (physical store at 34 Rue des Pâquis, 1201 Geneva, Switzerland).
You have direct autonomous control over store operations via your available tools:
1. Banners & Homepage Sliders: View, update, create hero banners.
2. Products & Pricing: Search products, update base price and regular compare price, update Geneva & Portugal stock.
3. Coupons: Create discount promo codes (e.g. 10%, 15%, 20 CHF off).
4. Blog & SEO: Draft and publish expert SEO fitness articles.
5. Store Announcements: Update top bar notifications.

Store Facts:
- Currency: Swiss Francs (CHF) and Euro (EUR).
- Standard shipping: 9.90 CHF. Free shipping above 75 CHF.
- Geneva store: Rue des Pâquis 34, 1201 Genève.
- Warehouses: GENEVA (store stock) and PORTUGAL (central stock).
- Key brands: Marvelous Nutrition, BigMan, Applied Nutrition, ProNutrition, Creapure.

Always respond in the same language as the user (French or English).
When executing actions, be concise, professional, and clear about the exact changes made.`;

// Common Tool Definitions
const TOOL_DEFINITIONS = [
  {
    name: 'get_banners',
    description: 'Retrieve all current homepage hero banners and their configuration.',
    parameters: {
      type: 'object',
      properties: {},
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
        link: { type: 'string', description: 'Product destination URL or page link, e.g. /produit/marvelous-line-creatine-monohydrate-pure' },
        ctaText: { type: 'string', description: 'Button text, e.g. "Acheter maintenant", "Découvrir"' },
        sortOrder: { type: 'number', description: 'Order position in slider (0 is first)' },
        isActive: { type: 'boolean', description: 'Whether the banner is visible' },
      },
      required: ['productName', 'wideImage', 'link'],
    },
  },
  {
    name: 'search_products',
    description: 'Search products by name, slug, brand, or SKU to inspect pricing and stock.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term or product name' },
      },
      required: ['query'],
    },
  },
  {
    name: 'update_product_price',
    description: 'Update the selling price (base_price) and optional regular price (compare_at_price) of a product.',
    parameters: {
      type: 'object',
      properties: {
        productIdOrSlug: { type: 'string', description: 'Product ID, UUID, SKU, or URL slug (e.g. marvelous-line-creatine-monohydrate-pure)' },
        base_price: { type: 'number', description: 'New selling price in CHF (e.g. 29.90)' },
        compare_at_price: { type: 'number', description: 'Optional regular price (for strikethrough sale price, e.g. 39.90)' },
      },
      required: ['productIdOrSlug', 'base_price'],
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

// Helper: Execute a Tool Call directly against Supabase / Stripe
async function executeTool(name: string, args: any): Promise<{ success: boolean; data?: any; error?: string; visualCard?: any }> {
  const supabase = getAdminSupabase();

  try {
    if (name === 'get_banners') {
      const { data, error } = await supabase.from('hero_banners').select('*').order('sort_order', { ascending: true });
      if (error || !data || data.length === 0) {
        return { success: true, data: DEFAULT_HERO_BANNERS };
      }
      return { success: true, data };
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
          details: `Bouton: "${payload.cta_text}" ➔ Lien: ${payload.link}`,
          link: payload.link,
          imageUrl: payload.wide_image,
        },
      };
    }

    if (name === 'search_products') {
      const q = String(args.query || '').trim();
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, sku, base_price, compare_at_price, main_location, status, product_stock(origin_id, quantity)')
        .or(`name.ilike.%${q}%,slug.ilike.%${q}%,sku.ilike.%${q}%`)
        .limit(6);

      if (error) throw new Error(error.message);
      return { success: true, data: data || [] };
    }

    if (name === 'update_product_price') {
      const { productIdOrSlug, base_price, compare_at_price } = args;
      const cleanId = String(productIdOrSlug).trim().replace(/^https?:\/\/[^\/]+\/produit\//, '').replace(/\/$/, '');

      // Locate product
      const { data: prod, error: findErr } = await supabase
        .from('products')
        .select('id, name, slug, base_price, compare_at_price')
        .or(`id.eq.${cleanId},slug.eq.${cleanId},sku.eq.${cleanId}`)
        .maybeSingle();

      if (findErr || !prod) {
        throw new Error(`Produit introuvable pour "${cleanId}"`);
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
        data: { product: prod.name, oldPrice: prod.base_price, newPrice: base_price },
        visualCard: {
          type: 'price',
          title: prod.name,
          details: `Prix mis à jour: ${prod.base_price} CHF ➔ ${base_price} CHF`,
          link: `/produit/${prod.slug}`,
        },
      };
    }

    if (name === 'update_product_stock') {
      const { productIdOrSlug, stock_geneva, stock_portugal } = args;
      const cleanId = String(productIdOrSlug).trim().replace(/^https?:\/\/[^\/]+\/produit\//, '').replace(/\/$/, '');

      const { data: prod } = await supabase
        .from('products')
        .select('id, name, slug')
        .or(`id.eq.${cleanId},slug.eq.${cleanId},sku.eq.${cleanId}`)
        .maybeSingle();

      if (!prod) throw new Error(`Produit introuvable pour "${cleanId}"`);

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
        data: { product: prod.name, stock_geneva, stock_portugal },
        visualCard: {
          type: 'stock',
          title: prod.name,
          details: `Stock Genève: ${stock_geneva ?? 'Inchangé'} | Stock Portugal: ${stock_portugal ?? 'Inchangé'}`,
          link: `/produit/${prod.slug}`,
        },
      };
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

      // Also save in Supabase if coupons table exists
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
          title: `Code Promo: ${cleanCode}`,
          details: `-${percentOff}% de réduction immédiate (valide ${days} jours)`,
        },
      };
    }

    return { success: false, error: `Action inconnue: ${name}` };
  } catch (err: any) {
    console.error(`[AI Copilot Tool Error: ${name}]`, err);
    return { success: false, error: err.message || 'Erreur lors de l’exécution' };
  }
}

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
      model,
      messages = [],
      mode = 'instant', // 'instant' | 'preview'
      confirmedAction,
    } = body;

    // 1. If executing a confirmed preview action directly:
    if (confirmedAction && confirmedAction.tool) {
      const toolResult = await executeTool(confirmedAction.tool, confirmedAction.args || {});
      return NextResponse.json({
        success: toolResult.success,
        reply: toolResult.success 
          ? `Action "${confirmedAction.tool}" exécutée avec succès sur NutriFitness !` 
          : `Échec de l'action: ${toolResult.error}`,
        visualCard: toolResult.visualCard,
        error: toolResult.error,
      });
    }

    // 2. Validate API Key
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Veuillez saisir votre clé API (OpenAI ou Anthropic Claude) dans les paramètres du copilote.',
      }, { status: 400 });
    }

    const trimmedKey = apiKey.trim();

    // -------------------------------------------------------------
    // PROVIDER 1: OPENAI (ChatGPT)
    // -------------------------------------------------------------
    if (provider === 'openai') {
      const selectedModel = model || 'gpt-4o';
      const openAiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
          content: String(m.content || ''),
        })),
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${trimmedKey}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: openAiMessages,
          tools: getOpenAITools(),
          tool_choice: 'auto',
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `Erreur OpenAI HTTP ${res.status}`;
        return NextResponse.json({ success: false, error: errMsg }, { status: res.status });
      }

      const completion = await res.json();
      const choice = completion.choices?.[0];
      const message = choice?.message;

      // Check if OpenAI called tools
      if (message?.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0];
        const toolName = toolCall.function.name;
        let toolArgs = {};
        try {
          toolArgs = JSON.parse(toolCall.function.arguments || '{}');
        } catch (e) {
          toolArgs = {};
        }

        // Mode PREVIEW: ask for confirmation
        if (mode === 'preview' && toolName !== 'search_products' && toolName !== 'get_banners') {
          return NextResponse.json({
            success: true,
            reply: `Je m'apprête à effectuer l'action **${toolName}**. Souhaitez-vous confirmer ?`,
            pendingAction: {
              tool: toolName,
              args: toolArgs,
            },
          });
        }

        // Mode INSTANT: Execute tool now
        const execution = await executeTool(toolName, toolArgs);

        // Feed tool result back to OpenAI to get human friendly confirmation
        const secondRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${trimmedKey}`,
          },
          body: JSON.stringify({
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
            temperature: 0.3,
          }),
        });

        let finalReply = `Action ${toolName} effectuée avec succès !`;
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

      // No tool called, standard reply
      return NextResponse.json({
        success: true,
        reply: message?.content || 'Aucune réponse générée.',
      });
    }

    // -------------------------------------------------------------
    // PROVIDER 2: ANTHROPIC (Claude)
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
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `Erreur Claude HTTP ${res.status}`;
        return NextResponse.json({ success: false, error: errMsg }, { status: res.status });
      }

      const claudeData = await res.json();
      const contentBlocks = claudeData.content || [];
      const toolUseBlock = contentBlocks.find((b: any) => b.type === 'tool_use');

      if (toolUseBlock) {
        const toolName = toolUseBlock.name;
        const toolArgs = toolUseBlock.input || {};

        if (mode === 'preview' && toolName !== 'search_products' && toolName !== 'get_banners') {
          return NextResponse.json({
            success: true,
            reply: `Je m'apprête à exécuter l'action **${toolName}**. Confirmez-vous la modification ?`,
            pendingAction: {
              tool: toolName,
              args: toolArgs,
            },
          });
        }

        // Execute tool
        const execution = await executeTool(toolName, toolArgs);

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
            temperature: 0.3,
          }),
        });

        let finalReply = `Action ${toolName} effectuée avec succès !`;
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
        reply: textBlock?.text || 'Aucune réponse générée.',
      });
    }

    return NextResponse.json({ success: false, error: 'Fournisseur non supporté.' }, { status: 400 });
  } catch (err: any) {
    console.error('[AI Copilot Fatal Error]', err);
    return NextResponse.json({ success: false, error: err.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
