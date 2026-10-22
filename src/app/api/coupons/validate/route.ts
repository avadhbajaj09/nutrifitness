import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

interface LocalCoupon {
  rate: number;
  percentOff?: number;
  amountOff?: number;
  discountType: 'percent' | 'amount';
  description: string;
}

const LOCAL_FALLBACK_COUPONS: Record<string, LocalCoupon> = {
  SWISS10: {
    rate: 0.10,
    percentOff: 10,
    discountType: 'percent',
    description: '-10% de réduction immédiate',
  },
  WELCOME10: {
    rate: 0.10,
    percentOff: 10,
    discountType: 'percent',
    description: '-10% de bienvenue NutriFitness',
  },
  NUTRI10: {
    rate: 0.10,
    percentOff: 10,
    discountType: 'percent',
    description: '-10% fidélité',
  },
  VIP20: {
    rate: 0.20,
    percentOff: 20,
    discountType: 'percent',
    description: '-20% réduction privilège VIP',
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawCode = body?.code;

    if (!rawCode || typeof rawCode !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Veuillez saisir un code promo valide.' },
        { status: 400 }
      );
    }

    const cleanCode = rawCode.trim().toUpperCase();
    if (cleanCode.length === 0) {
      return NextResponse.json(
        { valid: false, error: 'Veuillez saisir un code promo valide.' },
        { status: 400 }
      );
    }

    // 1. Check live Stripe Promotion Codes if Stripe is initialized
    if (stripe) {
      try {
        const promoRes = await stripe.promotionCodes.list({
          code: cleanCode,
          active: true,
          limit: 1,
        });

        if (promoRes.data.length > 0) {
          const promo = promoRes.data[0];
          const coupon = (promo as any).coupon;
          if (coupon && coupon.valid) {
            const isPercent = typeof coupon.percent_off === 'number' && coupon.percent_off > 0;
            const rate = isPercent ? (coupon.percent_off! / 100) : 0;
            const amountOff = coupon.amount_off ? coupon.amount_off / 100 : undefined;
            const desc = isPercent
              ? `-${coupon.percent_off}% de réduction`
              : `-${amountOff} ${coupon.currency?.toUpperCase() || 'CHF'}`;

            return NextResponse.json({
              valid: true,
              code: cleanCode,
              rate,
              percentOff: coupon.percent_off ?? undefined,
              amountOff,
              discountType: isPercent ? 'percent' : 'amount',
              description: desc,
              stripePromotionCodeId: promo.id,
              stripeCouponId: coupon.id,
            });
          }
        }
      } catch (stripePromoErr) {
        // Silently continue to direct coupon retrieval
      }

      // 2. Check live Stripe Coupons directly
      try {
        const coupon = await stripe.coupons.retrieve(cleanCode);
        if (coupon && coupon.valid) {
          const isPercent = typeof coupon.percent_off === 'number' && coupon.percent_off > 0;
          const rate = isPercent ? (coupon.percent_off! / 100) : 0;
          const amountOff = coupon.amount_off ? coupon.amount_off / 100 : undefined;
          const desc = isPercent
            ? `-${coupon.percent_off}% de réduction`
            : `-${amountOff} ${coupon.currency?.toUpperCase() || 'CHF'}`;

          return NextResponse.json({
            valid: true,
            code: cleanCode,
            rate,
            percentOff: coupon.percent_off ?? undefined,
            amountOff,
            discountType: isPercent ? 'percent' : 'amount',
            description: desc,
            stripeCouponId: coupon.id,
          });
        }
      } catch (stripeCouponErr) {
        // Silently continue to fallback map
      }
    }

    // 3. Check fallback predefined promotional codes
    const fallback = LOCAL_FALLBACK_COUPONS[cleanCode];
    if (fallback) {
      return NextResponse.json({
        valid: true,
        code: cleanCode,
        rate: fallback.rate,
        percentOff: fallback.percentOff,
        amountOff: fallback.amountOff,
        discountType: fallback.discountType,
        description: fallback.description,
      });
    }

    // 4. Personalized client loyalty codes ending in 10 (e.g. MARCO10, SAMUEL10, AVADH10)
    if (/^[A-Z0-9]{3,20}10$/.test(cleanCode)) {
      // Ensure coupon exists in Stripe so checkout applies it smoothly
      if (stripe) {
        try {
          const existingCoupon = await stripe.coupons.retrieve(cleanCode).catch(() => null);
          if (!existingCoupon || !existingCoupon.valid) {
            await stripe.coupons.create({
              id: cleanCode,
              name: `Remise Fidélité 10% ${cleanCode}`,
              percent_off: 10,
              duration: 'once',
              redeem_by: Math.floor(Date.now() / 1000) + (45 * 24 * 60 * 60)
            }).catch(err => console.warn(`[Stripe Coupon] Auto-create notice: ${err.message}`));
          }
        } catch (stripeErr) {
          console.warn('[Stripe Coupon Auto-create error]', stripeErr);
        }
      }

      return NextResponse.json({
        valid: true,
        code: cleanCode,
        rate: 0.10,
        percentOff: 10,
        discountType: 'percent',
        description: '-10% Cadeau Fidélité (Valable 45 jours)',
        stripeCouponId: cleanCode,
      });
    }

    return NextResponse.json(
      {
        valid: false,
        error: `Le code "${cleanCode}" est invalide ou a expiré.`,
      },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: error?.message || 'Erreur lors de la vérification du code.' },
      { status: 500 }
    );
  }
}
