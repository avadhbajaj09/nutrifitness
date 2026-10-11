import { NextResponse } from 'next/server';
import { getSitemapIndexXml } from '@/lib/sitemapIndex';

export const dynamic = 'force-static';

export async function GET() {
  const xml = getSitemapIndexXml();
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
