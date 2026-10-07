import { NextResponse } from 'next/server';
import { RatesRequestSchema, CountryRule, StockInfo, CartItemForRouting } from '@/lib/fulfillment/types';
import { resolveShipments } from '@/lib/fulfillment/routing';
import { getRates } from '@/lib/sendcloud/client';
// import { supabase } from '@/lib/supabase/server'; // Assume you have a server client or use fallback

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = RatesRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const cartItems = result.data.cartItems as CartItemForRouting[];
    const { countryCode } = result.data;

    // In a real app, query Supabase for stock and rules.
    // For now we pass empty maps to trigger fallbacks from hints.
    const stockByProduct = new Map<string, StockInfo>();
    const rulesByOriginCountry = new Map<string, CountryRule>();

    const routingResult = resolveShipments(cartItems, countryCode, stockByProduct, rulesByOriginCountry);

    const shipmentsWithRates = await Promise.all(
      routingResult.shipments.map(async (shipment) => {
        const weight = shipment.items.reduce((acc, item) => acc + (item.weightGrams || 500) * item.quantity, 0);
        
        const toAddress = {
          name: '', street: '', city: '', postal_code: '', country: shipment.countryCode
        };

        const rates = await getRates({
          origin: shipment.origin,
          toAddress,
          weight_grams: weight
        });
        return {
          ...shipment,
          rates,
          selectedRate: rates[0] || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      shipments: shipmentsWithRates,
      blockedItems: routingResult.blockedItems,
    });
  } catch (error) {
    console.error('Rates API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
