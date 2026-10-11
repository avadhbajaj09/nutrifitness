import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS } from '@/lib/catalog';
import { getCategoryBySlug } from '@/lib/categories';
import { getProductGtin } from '@/lib/seo';
import { isProductDeliverableToCountry } from '@/lib/delivery/defaults';
import { convertPrice } from '@/lib/tax';
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

function parseWeight(formatStr?: string, nameStr?: string): string {
  const combined = `${formatStr || ''} ${nameStr || ''}`.toLowerCase();
  const kgMatch = combined.match(/([\d.,]+)\s*kg/);
  if (kgMatch) {
    const val = parseFloat(kgMatch[1].replace(',', '.'));
    if (!isNaN(val)) return `${Math.round(val * 1000)} g`;
  }
  const gMatch = combined.match(/([\d.,]+)\s*g\b/);
  if (gMatch) {
    const val = parseFloat(gMatch[1].replace(',', '.'));
    if (!isNaN(val)) return `${Math.round(val)} g`;
  }
  const capsMatch = combined.match(/(\d+)\s*(gélules|caps|capsules|comprimés|tablets)/);
  if (capsMatch) {
    const count = parseInt(capsMatch[1], 10);
    return `${Math.min(1000, Math.max(150, Math.round(count * 2.5)))} g`;
  }
  return '500 g';
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

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nutrifitness.ch';
  const hiddenSlugs = await getHiddenProductSlugs();

  // Filter available, non-hidden, physical, in-stock products for the target country
  const eligibleProducts = PRODUCTS.filter(p => {
    // Exclude draft status
    if (p.status === 'draft') return false;

    // Exclude digital products
    if (p.categorySlug === 'guides-ebooks' || p.id === 'prod-25430') return false;

    // Exclude hidden products
    const slugFr = (p.slug?.fr || '').toLowerCase().trim();
    const id = p.id || '';
    const sku = p.variants?.[0]?.sku ? p.variants[0].sku.toLowerCase().trim() : '';
    if (hiddenSlugs.has(slugFr) || hiddenSlugs.has(id) || (sku && hiddenSlugs.has(sku))) {
      return false;
    }

    // Exclude out of stock products
    const hasStock = p.variants?.some(v => v.inStock && v.inventoryQuantity > 0) ?? true;
    if (!hasStock) return false;

    // Check delivery eligibility for target country
    return isProductDeliverableToCountry(
      targetCountry,
      p.locationType,
      p.shippingOrigin,
      p.stockGeneva,
      p.stockPortugal
    );
  });

  const itemsXml = eligibleProducts
    .map(product => {
      const defaultVariant = product.variants?.[0];
      const sku = defaultVariant?.sku || product.id;
      const title = product.name?.fr || product.name?.en || 'Complément Sportif';
      
      // Clean description
      const rawDesc = product.shortDescription?.fr || product.longDescription?.fr || title;
      const cleanDesc = stripHtml(rawDesc).slice(0, 4500);

      // Link and images
      const link = `${SITE_URL}/produit/${product.slug.fr}/`;
      const primaryImage = formatImageUrl(product.images?.[0]?.src, SITE_URL);
      const additionalImages = (product.images || [])
        .slice(1, 10)
        .map(img => `      <g:additional_image_link>${escapeXml(formatImageUrl(img.src, SITE_URL))}</g:additional_image_link>`)
        .join('\n');

      // Price and currency calculation
      let priceFormatted = '';
      let shippingCostFormatted = '';
      let shippingService = '';

      if (isSwiss) {
        const priceVal = defaultVariant?.priceChf || product.priceChf;
        priceFormatted = `${priceVal.toFixed(2)} CHF`;
        const isFreeShipping = priceVal >= 75;
        shippingCostFormatted = isFreeShipping ? '0.00 CHF' : '7.90 CHF';
        shippingService = 'PostPac Priority (La Poste Suisse)';
      } else {
        const eurPriceVal =
          defaultVariant?.priceEurEurope ||
          defaultVariant?.priceEur ||
          product.priceEurEurope ||
          product.priceEur ||
          convertPrice(defaultVariant?.priceChf || product.priceChf, 'EUR');
        priceFormatted = `${eurPriceVal.toFixed(2)} EUR`;
        const isFreeShipping = eurPriceVal >= 120;
        shippingCostFormatted = isFreeShipping ? '0.00 EUR' : '9.90 EUR';
        shippingService = 'Livraison Suivie Europe';
      }

      // GTIN and identifier existence
      const gtin = getProductGtin(product, defaultVariant);
      const identifierExists = gtin ? 'yes' : 'no';

      // Category and product type
      const categoryObj = getCategoryBySlug(product.categorySlug);
      const productType = categoryObj?.name || 'Nutrition Sportive';
      const weight = parseWeight(defaultVariant?.format, title);

      return `    <item>
      <g:id>${escapeXml(sku)}</g:id>
      <title>${escapeXml(title)}</title>
      <description>${escapeXml(cleanDesc)}</description>
      <link>${escapeXml(link)}</link>
      <g:image_link>${escapeXml(primaryImage)}</g:image_link>
${additionalImages ? additionalImages + '\n' : ''}      <g:availability>in_stock</g:availability>
      <g:price>${escapeXml(priceFormatted)}</g:price>
      <g:brand>${escapeXml(product.brand)}</g:brand>
${gtin ? `      <g:gtin>${escapeXml(gtin)}</g:gtin>\n` : ''}      <g:mpn>${escapeXml(sku)}</g:mpn>
      <g:condition>new</g:condition>
      <g:google_product_category>Health &amp; Beauty &gt; Health Care &gt; Fitness &amp; Nutrition</g:google_product_category>
      <g:product_type>${escapeXml(productType)}</g:product_type>
      <g:shipping_weight>${escapeXml(weight)}</g:shipping_weight>
      <g:identifier_exists>${identifierExists}</g:identifier_exists>
      <g:shipping>
        <g:country>${escapeXml(targetCountry)}</g:country>
        <g:service>${escapeXml(shippingService)}</g:service>
        <g:price>${escapeXml(shippingCostFormatted)}</g:price>
      </g:shipping>
    </item>`;
    })
    .join('\n');

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
