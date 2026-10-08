import { NextResponse } from 'next/server';
import { resolveBatchEstimates } from '@/lib/delivery/service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { country = 'CH', items = [] } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'items must be an array' }, { status: 400 });
    }

    const response = await resolveBatchEstimates(country, items);

    return NextResponse.json({
      success: true,
      ...response
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error: any) {
    console.error('[Batch Delivery Estimates API] Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
