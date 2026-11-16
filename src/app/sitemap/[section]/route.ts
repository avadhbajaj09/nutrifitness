import { NextResponse } from 'next/server';
import { getSitemapEntries } from '@/lib/sitemapEntries';

export const dynamic = 'force-dynamic';

const SEGMENTS = new Set(['pages', 'produits', 'categories', 'blog', 'marques']);
const escapeXml = (value: string) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[char] || char));

export async function GET(_request: Request, context: { params: Promise<{ section: string }> }) {
  const { section } = await context.params;
  const id = section.endsWith('.xml') ? section.slice(0, -4) : '';
  if (!SEGMENTS.has(id)) return new NextResponse('Not found', { status: 404 });

  const entries = await getSitemapEntries({ id });
  const urls = entries.map(item => [
    '  <url>',
    '    <loc>' + escapeXml(item.url) + '</loc>',
    ...(item.lastModified ? ['    <lastmod>' +
      escapeXml(new Date(item.lastModified).toISOString()) + '</lastmod>'] : []),
    ...(item.changeFrequency ? ['    <changefreq>' + item.changeFrequency + '</changefreq>'] : []),
    ...(item.priority !== undefined ? ['    <priority>' + item.priority.toFixed(1) + '</priority>'] : []),
    '  </url>',
  ].join('\n')).join('\n');
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls + '\n</urlset>';
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
