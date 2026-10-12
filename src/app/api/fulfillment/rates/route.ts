import { NextResponse } from 'next/server';
import { RatesRequestSchema, CountryRule, StockInfo, CartItemForRouting } from '@/lib/fulfillment/types';
import { resolveShipments } from '@/lib/fulfillment/routing';
import { getRates } from '@/lib/sendcloud/client';
import { getPacklinkServices } from '@/lib/packlink/client';
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

        let rates: any[] = [];

        // For Portugal shipments, attempt real-time quote via Packlink PRO
        if (shipment.origin === 'PORTUGAL') {
          try {
            const packlinkServices = await getPacklinkServices({
              fromCountry: 'PT',
              fromZip: '3720-000',
              toCountry: shipment.countryCode,
              toZip: shipment.countryCode === 'CH' ? '1201' : '75001',
              weightKg: Math.max(0.2, weight / 1000),
            });

            if (packlinkServices && packlinkServices.length > 0) {
              rates = packlinkServices.map((s) => ({
                id: s.id,
                carrier: s.carrier_name,
                carrier_code: s.carrier_name.toLowerCase().replace(/\s+/g, '-'),
                name: s.name,
                price: s.price.total_price,
                min_days: 3,
                max_days: 7,
              }));
            }
          } catch (e) {
            console.warn('[Packlink PRO] Live rate lookup failed, falling back:', e);
          }
        }

        // Fallback to standard rates if Packlink didn't yield or for Geneva Swiss Post
        if (!rates || rates.length === 0) {
          rates = await getRates({
            origin: shipment.origin,
            toAddress,
            weight_grams: weight,
          });
        }

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
