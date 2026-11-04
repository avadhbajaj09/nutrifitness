import { NextResponse } from 'next/server';
import { getActiveHeroBanners } from '@/lib/banners';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const banners = await getActiveHeroBanners();
    return NextResponse.json({
      success: true,
      banners
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
