import { NextResponse } from 'next/server';
import { getHiddenProductSlugs } from '@/lib/hiddenProducts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const hidden = await getHiddenProductSlugs();
  return NextResponse.json({
    success: true,
    hiddenSlugs: Array.from(hidden)
  });
}
