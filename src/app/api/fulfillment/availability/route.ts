import { NextResponse } from 'next/server';
import { getAvailability } from '@/lib/fulfillment/availability';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId') ?? '';
  const country = (searchParams.get('country') ?? 'CH').toUpperCase().slice(0, 2);
  const originHint = searchParams.get('origin') as 'switzerland' | 'portugal' | 'common' | null;
  const locationType = searchParams.get('locationType') as 'COMMON' | 'GENEVA_ONLY' | 'PORTUGAL_ONLY' | null;
  const stockGenevaParam = searchParams.get('stockGeneva');
  const stockPortugalParam = searchParams.get('stockPortugal');

  const stockGeneva = stockGenevaParam !== null ? parseInt(stockGenevaParam, 10) : undefined;
  const stockPortugal = stockPortugalParam !== null ? parseInt(stockPortugalParam, 10) : undefined;

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
