import { NextResponse } from 'next/server';
import { getBlackFridayConfig, isBlackFridayActive } from '@/lib/black-friday';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getBlackFridayConfig();
    const active = isBlackFridayActive(config);

    return NextResponse.json({
      active,
      config,
    });
  } catch (err: any) {
    console.error('[Black Friday Public API] Error:', err);
    return NextResponse.json({ active: false, error: err.message }, { status: 500 });
  }
}
