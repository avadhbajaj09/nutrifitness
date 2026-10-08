import { NextResponse } from 'next/server';
import { getAvailability } from '@/lib/fulfillment/availability';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId') ?? '';
  const country = (searchParams.get('country') ?? 'CH').toUpperCase().slice(0, 2);
  const originHint = searchParams.get('origin') as 'switzerland' | 'portugal' | null;

  const result = await getAvailability(
    productId,
    originHint ?? undefined,
    country,
  );

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
