import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getAdminSupabase } from '@/lib/supabase';

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
      orderNumber,
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

    // Pre-record pending order with full cart items into Supabase
    try {
      const supabase = getAdminSupabase();
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
        };
      });

      const subtotalVal = cleanItems.reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0);
      const totalVal = subtotalVal + Number(shippingCost || 0);

      await supabase.from('orders').upsert({
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
          shippingMethod: 'post_priority',
          shippingLabel: 'PostPac Priority (La Poste Suisse 24h)',
          subtotal: subtotalVal,
          couponCode: couponCode || ''
        }
      }, { onConflict: 'order_number' });
    } catch (dbErr) {
      console.warn('[Checkout API] Could not pre-record pending order:', dbErr);
    }

    const host = req.headers.get('host') || 'nutrifitness.ch';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

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

      return {
        price_data: {
          currency: normalizedCurrency,
          unit_amount: unitAmount,
          product_data: {
            name: nameStr,
            description: [flavorStr, sizeStr].filter(Boolean).join(' · ') || undefined,
            images: isValidHttpsImage ? [imgUrl] : undefined,
            metadata: {
              sku: item.sku || item.itemKey || '',
              product_id: item.id || '',
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
