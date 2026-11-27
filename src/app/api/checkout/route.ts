import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PRODUCTS } from '@/lib/catalog';
import { isCountrySupported } from '@/lib/delivery/defaults';
import { stripe } from '@/lib/stripe';
import { getAdminSupabase } from '@/lib/supabase';
import { isServerTrackingExcluded } from '@/lib/tracking-exclusion';

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured on this server.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      items,
      currency = 'CHF',
      customerEmail,
      customerName,
      customerPhone,
      shippingCost = 0,
      paymentMethod = 'card',
      shippingAddress,
      couponCode,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    const orderNumber = 'NF-' + crypto.randomUUID();
    const supabase = getAdminSupabase();

    // Validate destination, quantity and prices against trusted catalogue records.
    const country = String(shippingAddress?.country || '').toUpperCase().trim();
    const isSwissDest = country === 'CH' || country === 'LI';
    const expectedCurrency = isSwissDest ? 'CHF' : 'EUR';
    if (!isCountrySupported(country) || currency !== expectedCurrency || items.length > 100) {
      return NextResponse.json({ error: 'Invalid destination or currency' }, { status: 400 });
    }
    const quantities = new Map<string, number>();
    let physicalItems = 0;
    let portugalItems = 0;
    for (const item of items) {
      const rawId = String(item.id || item.productId || '').trim();
      const cleanId = rawId.replace(/^prod-/, '');
      const qty = Number(item.quantity);
      if (!Number.isSafeInteger(qty) || qty < 1 || qty > 100) {
        return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
      }
      const slug = String(item.slug || '');
      const staticProduct = PRODUCTS.find(p => p.id === rawId || (slug && p.slug.fr === slug));
      const ebook = staticProduct?.id === 'prod-25430' && staticProduct?.categorySlug === 'guides-ebooks';
      const norm = (v: unknown) => String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
      const flavor = norm(typeof item.flavor === 'object' ? item.flavor?.fr : item.flavor);
      const filters: string[] = [];
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)) filters.push('id.eq.' + cleanId);
      if (/^\d+$/.test(cleanId)) filters.push('woo_id.eq.' + cleanId);
      if (/^[a-z0-9-]+$/i.test(slug)) filters.push('slug.eq.' + slug);
      if (!filters.length) return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
      const { data: product, error } = await supabase.from('products')
        .select('id, name, slug, sku, base_price, main_location, stock_geneva, stock_portugal, status, deleted_at, product_variants(id, sku, attribute_value, price, stock_geneva, stock_portugal)')
        .or(filters.join(',')).maybeSingle();
      if (error || !product || product.status !== 'published' || product.deleted_at) {
        return NextResponse.json({ error: 'Produit indisponible. Actualisez votre panier.' }, { status: 409 });
      }
      const variants = product.product_variants || [];
      const matches = variants.filter((v: any) => (item.sku && v.sku === item.sku) || (flavor && norm(v.attribute_value) === flavor));
      const variant = matches.length === 1 ? matches[0] : variants.length === 1 && !flavor ? variants[0] : undefined;
      if (variants.length && !variant) return NextResponse.json({ error: 'Variante indisponible. Actualisez votre panier.' }, { status: 409 });
      const key = product.id + ':' + (variant?.id || 'base');
      const totalQty = (quantities.get(key) || 0) + qty;
      if (quantities.has(key)) return NextResponse.json({ error: 'Duplicate cart item' }, { status: 400 });
      quantities.set(key, totalQty);
      if (ebook && totalQty !== 1) return NextResponse.json({ error: 'Invalid digital quantity' }, { status: 400 });
      const source = variant || product;
      const gen = Number(source.stock_geneva || 0);
      const pt = Number(source.stock_portugal || 0);
      const genevaOnly = product.main_location === 'GENEVA';
      const fromGeneva = isSwissDest && product.main_location !== 'PORTUGAL' && gen >= qty;
      if (!ebook) {
        physicalItems++;
        if (!fromGeneva) portugalItems++;
        if ((!fromGeneva && genevaOnly) || (fromGeneva ? gen : pt) < qty) {
          return NextResponse.json({ error: 'INSUFFICIENT_STOCK', message: 'Stock insuffisant. Actualisez votre panier.' }, { status: 409 });
        }
      }
      const base = Number(variant?.price ?? product.base_price);
      const staticVariant = staticProduct?.variants?.find(v => (variant?.sku && v.sku === variant.sku) || norm(v.flavorName?.fr) === flavor);
      const euro = staticVariant?.priceEurEurope ?? staticProduct?.priceEurEurope ?? staticVariant?.priceEur ?? staticProduct?.priceEur;
      if (!Number.isFinite(base) || base <= 0) return NextResponse.json({ error: 'Invalid product price' }, { status: 409 });
      const unit = isSwissDest ? base : (euro ?? Math.round(base * 0.95 * 100) / 100);
      const discounted = !ebook && qty >= 3 ? unit * 0.90 : !ebook && qty === 2 ? unit * 0.95 : unit;
      const price = Math.round(discounted * 100) / 100;
      if (!Number.isFinite(price) || price < 0.50 || Math.abs(Number(item.price) - price) > 0.005 || !Number.isFinite(Number(item.price))) {
        return NextResponse.json({ error: 'PRICE_CHANGED', message: 'Le prix a changé. Actualisez votre panier.' }, { status: 409 });
      }
      item.price = price;
      item.id = product.id;
      item.sku = variant?.sku || product.sku || product.id;
      item.name = product.name;
      item.quantity = qty;
      item.shippingOrigin = fromGeneva ? 'switzerland' : 'portugal';
    }
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const pickup = body.shippingMethod === 'clickcollect' && country === 'CH' && portugalItems === 0 && /^12\d{2}$/.test(String(shippingAddress?.postalCode || ''));
    const expectedShipping = !physicalItems || subtotal >= 75 || pickup ? 0 : 9.90;
    if (!Number.isFinite(Number(shippingCost)) || Math.abs(Number(shippingCost) - expectedShipping) > 0.005) {
      return NextResponse.json({ error: 'SHIPPING_CHANGED', message: 'Les frais de livraison ont changé. Actualisez votre panier.' }, { status: 409 });
    }

    // Pre-record pending order with full cart items into Supabase
    try {
      const orderNum = String(orderNumber || `NF-${Date.now()}`);
      const cleanItems = items.map((item: any) => {
        const nameStr = typeof item.name === 'object' && item.name !== null 
          ? ((item.name as any).fr || Object.values(item.name)[0] || 'Produit') 
          : String(item.name || 'Produit');
        const flavorStr = typeof item.flavor === 'object' && item.flavor !== null
          ? ((item.flavor as any).fr || '')
          : (item.flavor ? String(item.flavor) : 'Standard');
        const formatStr = typeof item.format === 'object' && item.format !== null
          ? ((item.format as any).fr || '')
          : (item.format || item.size ? String(item.format || item.size) : 'Standard');
        const unitPrice = Number(item.price || 0);
        const qty = Math.max(1, Number(item.quantity || 1));

        return {
          id: item.id || item.productId || '',
          name: nameStr,
          sku: item.sku || item.itemKey || '',
          flavor: flavorStr,
          format: formatStr,
          price: unitPrice,
          quantity: qty,
          image: item.image || '/images/placeholder.webp',
          shippingOrigin: item.shippingOrigin,
        };
      });

      const subtotalVal = cleanItems.reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0);
      const totalVal = subtotalVal + Number(shippingCost || 0);

      const { error: orderError } = await supabase.from('orders').insert({
        order_number: orderNum,
        customer_name: customerName || 'Client',
        customer_email: customerEmail || '',
        customer_phone: customerPhone || '',
        total_amount: totalVal,
        currency: (currency || 'CHF').toUpperCase(),
        payment_method: (paymentMethod || 'card').toUpperCase(),
        status: 'pending',
        items: cleanItems,
        shipping_address: {
          name: customerName || '',
          email: customerEmail || '',
          phone: customerPhone || '',
          street: shippingAddress?.street || '',
          address: shippingAddress?.street || '',
          city: shippingAddress?.city || '',
          postalCode: shippingAddress?.postalCode || '',
          country: shippingAddress?.country || 'Suisse',
          shippingCost: Number(shippingCost) || 0,
          shippingMethod: pickup ? 'store_pickup' : 'post_priority',
          shippingLabel: pickup ? 'Retrait boutique Genève' : 'Livraison suivie',
          subtotal: subtotalVal,
          couponCode: couponCode || ''
        }
      });
      if (orderError) throw orderError;
    } catch (dbErr) {
      console.warn('[Checkout API] Could not pre-record pending order:', dbErr);
      return NextResponse.json({ error: 'Order service temporarily unavailable' }, { status: 503 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nutrifitness.ch';

    const normalizedCurrency = (currency || 'CHF').toLowerCase();

    // Map cart items to Stripe line items
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => {
      const unitAmount = Math.max(50, Math.round(Number(item.price || 0) * 100));
      const nameStr = typeof item.name === 'object' && item.name !== null 
        ? ((item.name as any).fr || Object.values(item.name)[0] || 'Produit NutriFitness') 
        : String(item.name || 'Produit NutriFitness');
      
      const flavorStr = typeof item.flavor === 'object' && item.flavor !== null
        ? ((item.flavor as any).fr || '')
        : (item.flavor ? String(item.flavor) : '');
      const sizeStr = typeof item.size === 'object' && item.size !== null
        ? ((item.size as any).fr || '')
        : (item.size ? String(item.size) : '');

      let imgUrl = typeof item.image === 'string' ? item.image : '';
      if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('//')) {
        imgUrl = `${baseUrl}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
      }
      const isValidHttpsImage = imgUrl.startsWith('https://') && !imgUrl.includes('placeholder.webp');

      const descParts = [];
      if (flavorStr) {
        descParts.push(flavorStr.toLowerCase() === 'standard' ? 'Goût: Neutre / Standard' : `Saveur: ${flavorStr}`);
      }
      if (sizeStr && sizeStr !== 'Format standard') {
        descParts.push(sizeStr);
      }

      return {
        price_data: {
          currency: normalizedCurrency,
          unit_amount: unitAmount,
          product_data: {
            name: nameStr,
            description: descParts.join(' · ') || undefined,
            images: isValidHttpsImage ? [imgUrl] : undefined,
            metadata: {
              sku: item.sku || item.itemKey || '',
              product_id: item.id || '',
              flavor: flavorStr || 'Standard',
              format: sizeStr || 'Format standard',
            },
          },
        },
        quantity: Math.max(1, Number(item.quantity || 1)),
      };
    });

    // Add shipping cost as a line item if greater than 0
    if (shippingCost > 0) {
      line_items.push({
        price_data: {
          currency: normalizedCurrency,
          unit_amount: Math.round(Number(shippingCost) * 100),
          product_data: {
            name: 'Frais de livraison / Expédition',
            description: 'PostPac Priority Suisse / Express',
          },
        },
        quantity: 1,
      });
    }

    // Extract cookies for Meta CAPI tracking attribution
    const cookieHeader = req.headers.get('cookie') || '';
    const fbpMatch = cookieHeader.match(/(?:^|; )_fbp=([^;]*)/);
    const fbcMatch = cookieHeader.match(/(?:^|; )_fbc=([^;]*)/);
    const fbp = fbpMatch ? decodeURIComponent(fbpMatch[1]) : '';
    const fbc = fbcMatch ? decodeURIComponent(fbcMatch[1]) : '';

    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '';
    const userAgent = req.headers.get('user-agent') || '';

    const refererHeader = req.headers.get('referer');
    const hostHeader = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const isStaffOrDev = isServerTrackingExcluded({
      cookieHeader,
      refererHeader,
      hostHeader,
      email: customerEmail,
    }).excluded;

    // Create session parameters
    // TWINT is shown automatically by Stripe when currency=CHF and TWINT is enabled in Dashboard
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      customer_email: customerEmail || undefined,
      line_items,
      client_reference_id: orderNumber || `NF-${Date.now()}`,
      metadata: {
        order_number: orderNumber || `NF-${Date.now()}`,
        customer_name: customerName || '',
        customer_email: customerEmail || '',
        customer_phone: customerPhone || '',
        payment_selected: paymentMethod || 'card',
        coupon_applied: couponCode || '',
        is_staff: isStaffOrDev ? 'true' : 'false',
        fbp,
        fbc,
        client_ip: clientIp,
        client_user_agent: userAgent,
      },
      success_url: `${baseUrl}/commande/?session_id={CHECKOUT_SESSION_ID}&order_id=${orderNumber || ''}`,
      cancel_url: `${baseUrl}/commande/?canceled=true`,
      payment_method_options: normalizedCurrency === 'chf' ? {
        card: { request_three_d_secure: 'automatic' },
        twint: {},
      } : {
        card: { request_three_d_secure: 'automatic' },
      },
    };

    // Apply pre-selected coupon or allow typing promo code in Stripe Checkout
    if (couponCode && typeof couponCode === 'string') {
      const cleanCoupon = couponCode.trim().toUpperCase();
      try {
        const promoRes = await stripe.promotionCodes.list({
          code: cleanCoupon,
          active: true,
          limit: 1,
        });

        if (promoRes.data.length > 0) {
          sessionParams.discounts = [{ promotion_code: promoRes.data[0].id }];
        } else {
          // Verify coupon exists before attaching
          const couponObj = await stripe.coupons.retrieve(cleanCoupon);
          if (couponObj && couponObj.valid) {
            sessionParams.discounts = [{ coupon: cleanCoupon }];
          } else {
            sessionParams.allow_promotion_codes = true;
          }
        }
      } catch (couponErr) {
        console.warn('Coupon not found in Stripe, allowing customer to enter code in checkout:', couponErr);
        sessionParams.allow_promotion_codes = true;
      }
    } else {
      sessionParams.allow_promotion_codes = true;
    }

    // If shipping address details are provided, pre-fill them
    if (shippingAddress) {
      sessionParams.metadata = {
        ...sessionParams.metadata,
        shipping_street: shippingAddress.street || '',
        shipping_city: shippingAddress.city || '',
        shipping_postal_code: shippingAddress.postalCode || '',
        shipping_country: shippingAddress.country || '',
      };
    }

    // In modern Stripe Checkout, let Stripe automatically present the best payment methods
    // (Card, Apple Pay, Google Pay, TWINT if CHF in CH, etc.)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await stripe.checkout.sessions.create(sessionParams as any);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error?.message);
    return NextResponse.json(
      { error: error?.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
