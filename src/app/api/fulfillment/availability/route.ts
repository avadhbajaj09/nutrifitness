import { NextResponse } from 'next/server';
import { getAvailability } from '@/lib/fulfillment/availability';
import { PRODUCTS } from '@/lib/catalog';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('detect') === '1') {
    const detected = request.headers.get('x-vercel-ip-country') || 'CH';
    return NextResponse.json({ country: detected.toUpperCase() });
  }

  const productId = searchParams.get('productId') ?? '';
  const country = (searchParams.get('country') ?? 'CH').toUpperCase().slice(0, 2);
  let originHint = searchParams.get('origin') as 'switzerland' | 'portugal' | 'common' | null;
  let locationType = searchParams.get('locationType') as 'COMMON' | 'GENEVA_ONLY' | 'PORTUGAL_ONLY' | null;
  const stockGenevaParam = searchParams.get('stockGeneva');
  const stockPortugalParam = searchParams.get('stockPortugal');

  let stockGeneva = stockGenevaParam !== null ? parseInt(stockGenevaParam, 10) : undefined;
  let stockPortugal = stockPortugalParam !== null ? parseInt(stockPortugalParam, 10) : undefined;

  if (productId && (!originHint || !locationType)) {
    const catalogItem = PRODUCTS.find(p => p.id === productId || p.slug.fr === productId);
    if (catalogItem) {
      if (!originHint && catalogItem.shippingOrigin) originHint = catalogItem.shippingOrigin;
      if (!locationType && catalogItem.locationType) locationType = catalogItem.locationType;
      if (stockGeneva === undefined && typeof catalogItem.stockGeneva === 'number') stockGeneva = catalogItem.stockGeneva;
      if (stockPortugal === undefined && typeof catalogItem.stockPortugal === 'number') stockPortugal = catalogItem.stockPortugal;
    }
  }

  const result = await getAvailability(
    productId,
    originHint ?? undefined,
    country,
    locationType ?? undefined,
    isNaN(stockGeneva as number) ? undefined : stockGeneva,
    isNaN(stockPortugal as number) ? undefined : stockPortugal
  );

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
