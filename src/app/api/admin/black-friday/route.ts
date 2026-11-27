import { NextResponse } from 'next/server';
import { getBlackFridayConfig, saveBlackFridayConfig, isBlackFridayActive } from '@/lib/black-friday';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getBlackFridayConfig();
    const active = isBlackFridayActive(config);

    return NextResponse.json({
      success: true,
      active,
      config,
    });
  } catch (err: any) {
    console.error('[Admin Black Friday API] GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { enabled, startDate, endDate, tiers, bannerText } = body;

    // Validate tiers if provided
    let validatedTiers = undefined;
    if (Array.isArray(tiers)) {
      validatedTiers = tiers.map((t: any) => ({
        threshold: Math.max(0, Number(t.threshold) || 0),
        discountPercent: Math.min(100, Math.max(0, Number(t.discountPercent) || 0)),
      })).sort((a: any, b: any) => a.threshold - b.threshold);
    }

    const updated = await saveBlackFridayConfig({
      enabled: typeof enabled === 'boolean' ? enabled : undefined,
      startDate: typeof startDate === 'string' ? startDate : undefined,
      endDate: typeof endDate === 'string' ? endDate : undefined,
      tiers: validatedTiers,
      bannerText: typeof bannerText === 'string' ? bannerText : undefined,
    });

    const active = isBlackFridayActive(updated);

    return NextResponse.json({
      success: true,
      active,
      config: updated,
    });
  } catch (err: any) {
    console.error('[Admin Black Friday API] POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
