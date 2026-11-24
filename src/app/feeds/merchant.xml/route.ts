import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS } from '@/lib/catalog';
import { getCategoryBySlug } from '@/lib/categories';
import { getProductGtin } from '@/lib/seo';
import { isCountrySupported } from '@/lib/delivery/defaults';
import { getAdminSupabase } from '@/lib/supabase';
import { getHiddenProductSlugs } from '@/lib/hiddenProducts';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(html: string): string {
  return (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatImageUrl(src: string | undefined, siteUrl: string): string {
  if (!src) return `${siteUrl}/images/placeholder.webp`;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return `${siteUrl}${src.startsWith('/') ? '' : '/'}${src}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryParam = (searchParams.get('country') || 'CH').toUpperCase().trim();
  const targetCountry = countryParam.length === 2 ? countryParam : 'CH';
  const isSwiss = targetCountry === 'CH' || targetCountry === 'LI';
  if (!isCountrySupported(targetCountry)) return new NextResponse('Unsupported destination', { status: 400 });

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nutrifitness.ch';
  const hiddenSlugs = await getHiddenProductSlugs();

  // Published database records are authoritative. Never advertise stale inventory on query failure.
  const supabase = getAdminSupabase();
  const { data: rows, error } = await supabase.from('products')
    .select('id, woo_id, sku, slug, name, brand, base_price, short_description, images, main_location, stock_geneva, stock_portugal, gtin13, product_variants(id, sku, attribute_value, price, image_url, stock_geneva, stock_portugal, gtin13)')
    .eq('status', 'published').is('deleted_at', null);
  if (error || !rows) return new NextResponse('Feed temporarily unavailable', { status: 503 });
  const eligible = rows.filter(p => {
    const ids = [p.id, p.slug, p.sku, p.woo_id, 'prod-' + p.woo_id].filter(Boolean).map(x => String(x).toLowerCase());
    return p.slug && !ids.some(x => hiddenSlugs.has(x)) && String(p.woo_id) !== '25430';
  });
  const itemsXml = eligible.map(p => {
    const local = PRODUCTS.find(x => x.slug.fr === p.slug || x.id === 'prod-' + p.woo_id);
    if (local?.categorySlug === 'guides-ebooks' || !p.name || !p.brand) return '';
    if (!isSwiss && p.main_location === 'GENEVA') return '';
    const variants = p.product_variants || [];
    // A parent landing page does not yet select variant-specific URLs.
    // Advertise only the default visible offer, not unselectable variants.
    const available = (v: any) => isSwiss
      ? (p.main_location !== 'PORTUGAL' && Number(v.stock_geneva) > 0) || (p.main_location !== 'GENEVA' && Number(v.stock_portugal) > 0)
      : p.main_location !== 'GENEVA' && Number(v.stock_portugal) > 0;
    const first = variants.find((v: any) => isSwiss && Number(v.stock_geneva) > 0) || variants.find((v: any) => available(v)) || variants[0];
    const offer = first || p;
    const chf = Number(first?.price ?? p.base_price);
    const staticVariant = local?.variants?.find(v => v.sku === first?.sku);
    const price = isSwiss ? chf : (staticVariant?.priceEurEurope ?? local?.priceEurEurope ?? staticVariant?.priceEur ?? local?.priceEur ?? Math.round(chf * 0.95 * 100) / 100);
    const rawImage = Array.isArray(p.images) ? p.images[0] : undefined;
    const image = first?.image_url || (typeof rawImage === 'string' ? rawImage : rawImage?.src) || local?.images?.[0]?.src;
    const sku = first?.sku || p.sku || p.id;
    if (!Number.isFinite(price) || price <= 0 || !image || image.includes('placeholder') || !sku) return '';
    const gtin = getProductGtin({ gtin13: p.gtin13 }, first ? { gtin13: first.gtin13, sku: first.sku } : undefined);
    const currency = isSwiss ? 'CHF' : 'EUR';
    const link = SITE_URL + '/produit/' + p.slug + '/';
    const category = getCategoryBySlug(local?.categorySlug || '');
    const description = stripHtml(p.short_description || local?.shortDescription?.fr || p.name).slice(0, 4500);
    return `    <item>
      <g:id>${escapeXml(String(sku))}</g:id>
      <title>${escapeXml(p.name)}</title>
      <description>${escapeXml(description)}</description>
      <link>${escapeXml(link)}</link>
      <g:image_link>${escapeXml(formatImageUrl(image, SITE_URL))}</g:image_link>
      <g:availability>${available(offer) ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${price.toFixed(2)} ${currency}</g:price>
      <g:brand>${escapeXml(p.brand)}</g:brand>
      ${gtin ? '<g:gtin>' + escapeXml(gtin) + '</g:gtin>' : ''}
      <g:condition>new</g:condition>
      <g:product_type>${escapeXml(category?.name || 'Nutrition sportive')}</g:product_type>
    </item>`;
  }).filter(Boolean).join('\n');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>NutriFitness.ch - Google Merchant Center Product Feed (${targetCountry})</title>
    <link>${SITE_URL}</link>
    <description>Compléments alimentaires et nutrition sportive de haute qualité - Genève &amp; Suisse</description>
${itemsXml}
  </channel>
</rss>`.trim();

  return new NextResponse(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
