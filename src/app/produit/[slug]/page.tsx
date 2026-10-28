import React from 'react';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { PRODUCTS, getProductBySlug } from '@/lib/catalog';
import type { Metadata } from 'next';
import { formatChf } from '@/lib/tax';
import { product as generateProductSchema, breadcrumbs } from '@/lib/schema';
import { getLocalized } from '@/lib/types';
import { getProductFaqs } from '@/lib/productFaq';
import { getAdminSupabase } from '@/lib/supabase';
import { getCategoryBySlug } from '@/lib/categories';

import { formatProductMetaTitle, formatMetaDescription, getProductGtin } from '@/lib/seo';
import { getProductOriginType } from '@/lib/translations';
import { stripHtmlAndEscapes } from '@/lib/formatContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return PRODUCTS.map(p => ({
    slug: p.slug.fr
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { getHiddenProductSlugs } = await import('@/lib/hiddenProducts');
  const hiddenSlugs = await getHiddenProductSlugs();
  const slugLower = params.slug.toLowerCase().trim();

  if (hiddenSlugs.has(slugLower)) {
    return {
      robots: { index: false, follow: false }
    };
  }

  let product = getProductBySlug(params.slug, 'fr');
  if (!product) {
    try {
      const supabase = getAdminSupabase();
      const { data: dbItem } = await supabase
        .from('products')
        .select('id, name, short_description, images')
        .eq('slug', params.slug)
        .maybeSingle();

      if (dbItem) {
        const title = formatProductMetaTitle(dbItem.name || params.slug);
        const metaDesc = formatMetaDescription(dbItem.short_description || dbItem.name || '');
        const image = dbItem.images?.[0]?.src || 'https://nutrifitness.ch/images/brand/logo.png';
        return {
          title,
          description: metaDesc,
          alternates: {
            canonical: `https://nutrifitness.ch/produit/${params.slug}/`,
          },
          openGraph: {
            title,
            description: metaDesc,
            images: [image],
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description: metaDesc,
            images: [image],
          },
        };
      }
    } catch {}
    return {};
  }

  const prodId = (product.id || '').toLowerCase().trim();
  const cleanId = prodId.replace(/^prod-/, '');
  if (hiddenSlugs.has(prodId) || hiddenSlugs.has(cleanId) || hiddenSlugs.has(`prod-${cleanId}`)) {
    return {
      robots: { index: false, follow: false }
    };
  }

  const name = getLocalized(product.name);
  const desc = stripHtmlAndEscapes(getLocalized(product.shortDescription));
  const title = formatProductMetaTitle(name);
  const metaDesc = formatMetaDescription(desc);
  const image = product.images?.[0]?.src || 'https://nutrifitness.ch/images/brand/logo.png';

  return {
    title,
    description: metaDesc,
    alternates: {
      canonical: `https://nutrifitness.ch/produit/${params.slug}/`,
    },
    openGraph: {
      title,
      description: metaDesc,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDesc,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { getHiddenProductSlugs } = await import('@/lib/hiddenProducts');
  const hiddenSlugs = await getHiddenProductSlugs();

  const slugLower = params.slug.toLowerCase().trim();
  if (hiddenSlugs.has(slugLower)) {
    notFound();
  }

  const rawProduct = getProductBySlug(params.slug, 'fr');
  const supabase = getAdminSupabase();

  const conditions: string[] = [`slug.eq.${params.slug}`];
  if (rawProduct?.id) {
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const isNumeric = (val: string) => /^\d+$/.test(val);
    const cleanId = rawProduct.id.replace(/^prod-/, '');
    if (isUuid(rawProduct.id)) conditions.push(`id.eq.${rawProduct.id}`);
    if (cleanId && isNumeric(cleanId)) conditions.push(`woo_id.eq.${cleanId}`);
  }

  let dbProduct: any = null;
  try {
    const { data } = await supabase
      .from('products')
      .select(`
        id, woo_id, sku, name, slug, brand, base_price, compare_at_price,
        short_description, description, images, gtin13,
        nutrition, ingredients, allergens, usage_instructions,
        main_location, stock_geneva, stock_portugal, status, deleted_at,
        product_variants (
          id, woo_id, sku, attribute_name, attribute_value, price, compare_at_price,
          image_url, stock_geneva, stock_portugal, gtin13
        )
      `)
      .or(conditions.join(','))
      .maybeSingle();
    dbProduct = data;
  } catch (dbErr) {
    console.warn('[ProductDetailPage] Supabase product query warning:', dbErr);
  }

  if (!rawProduct && !dbProduct) {
    notFound();
  }

  if (dbProduct && (dbProduct.status === 'draft' || dbProduct.deleted_at)) {
    notFound();
  }

  let product: any = rawProduct ? { ...rawProduct } : {
    id: dbProduct.id,
    sku: dbProduct.sku || dbProduct.id,
    slug: { fr: dbProduct.slug, de: dbProduct.slug, it: dbProduct.slug, en: dbProduct.slug },
    name: { fr: dbProduct.name, de: dbProduct.name, it: dbProduct.name, en: dbProduct.name },
    brand: dbProduct.brand || 'NutriFitness',
    categorySlug: 'proteines',
    taxCategory: 'food_reduced',
    priceChf: Number(dbProduct.base_price) || 29.9,
    compareAtPriceChf: dbProduct.compare_at_price ? Number(dbProduct.compare_at_price) : undefined,
    images: [],
    variants: [],
    inStock: true
  };

  if (dbProduct) {
    if (dbProduct.name) {
      product.name = {
        fr: dbProduct.name,
        de: dbProduct.name,
        it: dbProduct.name,
        en: dbProduct.name
      };
    }

    if (dbProduct.brand) {
      product.brand = dbProduct.brand;
    }

    if (dbProduct.base_price !== null && dbProduct.base_price !== undefined) {
      product.priceChf = Number(dbProduct.base_price);
    }

    if (dbProduct.compare_at_price !== null && dbProduct.compare_at_price !== undefined) {
      product.compareAtPriceChf = Number(dbProduct.compare_at_price);
    }

    if (dbProduct.gtin13) {
      product.gtin13 = dbProduct.gtin13;
    }

    if (dbProduct.short_description) {
      product.shortDescription = {
        fr: dbProduct.short_description,
        de: rawProduct?.shortDescription?.de || dbProduct.short_description,
        it: rawProduct?.shortDescription?.it || dbProduct.short_description,
        en: rawProduct?.shortDescription?.en || dbProduct.short_description
      };
    }

    if (dbProduct.description) {
      product.longDescription = {
        fr: dbProduct.description,
        de: rawProduct?.longDescription?.de || dbProduct.description,
        it: rawProduct?.longDescription?.it || dbProduct.description,
        en: rawProduct?.longDescription?.en || dbProduct.description
      };
    }

    if (dbProduct.ingredients) {
      product.ingredients = {
        fr: dbProduct.ingredients,
        de: rawProduct?.ingredients?.de || dbProduct.ingredients,
        it: rawProduct?.ingredients?.it || dbProduct.ingredients,
        en: rawProduct?.ingredients?.en || dbProduct.ingredients
      };
    }

    if (dbProduct.allergens) {
      product.allergens = {
        fr: dbProduct.allergens,
        de: rawProduct?.allergens?.de || dbProduct.allergens,
        it: rawProduct?.allergens?.it || dbProduct.allergens,
        en: rawProduct?.allergens?.en || dbProduct.allergens
      };
    }

    if (dbProduct.usage_instructions) {
      product.usageInstructions = {
        fr: dbProduct.usage_instructions,
        de: rawProduct?.usageInstructions?.de || dbProduct.usage_instructions,
        it: rawProduct?.usageInstructions?.it || dbProduct.usage_instructions,
        en: rawProduct?.usageInstructions?.en || dbProduct.usage_instructions
      };
    }

    if (dbProduct.nutrition) {
      product.nutrition = dbProduct.nutrition;
    }

    if (Array.isArray(dbProduct.images) && dbProduct.images.length > 0) {
      product.images = dbProduct.images.map((img: any) => {
        const src = typeof img === 'string' ? img : img.src;
        const altText = typeof img === 'string' 
          ? (dbProduct.name || product.name?.fr || '') 
          : (typeof img.alt === 'string' ? img.alt : (img.alt?.fr || dbProduct.name || product.name?.fr || ''));
        return {
          src,
          alt: { fr: altText, de: altText, it: altText, en: altText },
          width: 800,
          height: 800
        };
      });
    }

    const loc = dbProduct.main_location as 'GENEVA' | 'PORTUGAL' | 'COMMON' | undefined;
    if (loc === 'PORTUGAL') {
      product.shippingOrigin = 'portugal';
      product.locationType = 'PORTUGAL_ONLY';
    } else if (loc === 'COMMON') {
      product.shippingOrigin = 'common';
      product.locationType = 'COMMON';
    } else if (loc === 'GENEVA') {
      product.shippingOrigin = 'switzerland';
      product.locationType = 'GENEVA_ONLY';
    }

    if (dbProduct.stock_geneva !== null && dbProduct.stock_geneva !== undefined) {
      product.stockGeneva = Number(dbProduct.stock_geneva);
    }
    if (dbProduct.stock_portugal !== null && dbProduct.stock_portugal !== undefined) {
      product.stockPortugal = Number(dbProduct.stock_portugal);
    }

    if (dbProduct.product_variants && dbProduct.product_variants.length > 0) {
      const vars = dbProduct.product_variants.map((v: any) => {
        const gen = Number(v.stock_geneva) || 0;
        const pt = Number(v.stock_portugal) || 0;
        const tot = gen + pt;
        const flavor = v.attribute_value || 'Standard';
        return {
          id: v.id,
          sku: v.sku || ('NF-' + (v.woo_id || v.id.slice(0, 8))),
          flavorName: { fr: flavor, de: flavor, it: flavor, en: flavor },
          format: v.attribute_name === 'poids' ? flavor : '1 unité',
          priceChf: Number(v.price) || product.priceChf,
          compareAtPriceChf: v.compare_at_price ? Number(v.compare_at_price) : undefined,
          inventoryQuantity: tot,
          inStock: tot > 0,
          image: v.image_url || product.images?.[0]?.src || '/images/placeholder.webp',
          stockGeneva: gen,
          stockPortugal: pt,
          gtin13: v.gtin13 || ''
        };
      });
      const totalGen = vars.reduce((s: number, v: any) => s + (v.stockGeneva || 0), 0);
      const totalPt = vars.reduce((s: number, v: any) => s + (v.stockPortugal || 0), 0);

      product = {
        ...product,
        variants: vars,
        stockGeneva: totalGen,
        stockPortugal: totalPt,
        inStock: (totalGen + totalPt) > 0
      };
    } else {
      const tot = (product.stockGeneva || 0) + (product.stockPortugal || 0);
      product.inStock = tot > 0;
    }

    if (loc === 'PORTUGAL' && product.directAnswerAeo) {
      const prodName = typeof product.name === 'string' ? product.name : (product.name?.fr || 'Ce produit');
      product.directAnswerAeo = {
        fr: `${prodName} est un complément nutritionnel de référence expédié directement depuis nos entrepôts au Portugal avec livraison suivie en 3-5 jours ouvrables.`,
        en: `${prodName} is a premium sports nutrition supplement shipped directly from our warehouse in Portugal with tracked delivery in 3-5 business days.`,
        de: `${prodName} ist ein hochwertiges Nahrungsergänzungsmittel, direkt aus unserem Lager in Portugal mit Sendungsverfolgung in 3-5 Werktagen geliefert.`,
        it: `${prodName} è un integratore di référence spedito direttamente dal nostro magazzino in Portogallo con spedizione tracciata in 3-5 giorni lavorativi.`
      };
    }
  }

  const prodId = (product.id || '').toLowerCase().trim();
  const cleanId = prodId.replace(/^prod-/, '');
  if (
    hiddenSlugs.has(prodId) ||
    hiddenSlugs.has(cleanId) ||
    hiddenSlugs.has(`prod-${cleanId}`)
  ) {
    notFound();
  }

  const isHidden = (p: typeof PRODUCTS[0]) => {
    const s = (p.slug?.fr || '').toLowerCase().trim();
    const pid = (p.id || '').toLowerCase().trim();
    const cid = pid.replace(/^prod-/, '');
    return hiddenSlugs.has(s) || hiddenSlugs.has(pid) || hiddenSlugs.has(cid) || hiddenSlugs.has(`prod-${cid}`);
  };

  const relatedProducts = PRODUCTS.filter(p => {
    if (isHidden(p)) return false;
    return p.id !== product.id && p.categorySlug === product.categorySlug;
  }).slice(0, 8);
  const fallbackRelated = relatedProducts.length > 0 ? relatedProducts : PRODUCTS.filter(p => {
    if (isHidden(p)) return false;
    return p.id !== product.id;
  }).slice(0, 8);

  const gtin = getProductGtin(product);

  const originType = getProductOriginType(product);
  const destinations = originType === 'GENEVA_ONLY'
    ? ['CH', 'LI']
    : [
        'CH', 'LI', 'PT', 'ES', 'FR', 'DE', 'IT', 'AT', 'BE', 'LU', 'NL', 'IE', 'DK',
        'SE', 'FI', 'PL', 'CZ', 'SK', 'HU', 'SI', 'HR', 'RO', 'BG', 'EE', 'LV', 'LT',
        'GR', 'CY', 'MT', 'UK', 'NO', 'IS'
      ];

  const hasStock = (typeof product.stockGeneva === 'number' || typeof product.stockPortugal === 'number')
    ? ((product.stockGeneva ?? 0) + (product.stockPortugal ?? 0)) > 0
    : (product.variants?.some(v => v.inStock) ?? true);

  const productSchema = generateProductSchema(
    {
      slug: params.slug,
      name: getLocalized(product.name),
      description: stripHtmlAndEscapes(getLocalized(product.shortDescription)),
      brand: product.brand,
      images: product.images?.map(img => img.src) || [],
      price: product.priceChf,
      inStock: hasStock,
      sku: product.variants?.[0]?.sku,
      gtin,
      category: product.categorySlug,
    },
    {
      cost: product.priceChf >= 75 ? 0 : 7.90,
      minDays: originType === 'PORTUGAL_ONLY' ? 3 : 1,
      maxDays: originType === 'PORTUGAL_ONLY' ? 5 : 2,
      destinations,
    }
  );

  const category = getCategoryBySlug(product.categorySlug);
  const categoryName = category ? category.name : 'Boutique';
  const categoryPath = category ? `/categorie/${category.slug}/` : '/boutique/';
  const productName = getLocalized(product.name);

  const breadcrumbSchema = breadcrumbs([
    { name: 'Accueil', path: '/' },
    { name: categoryName, path: categoryPath },
    { name: productName, path: `/produit/${params.slug}/` },
  ]);

  const productFaqs = getProductFaqs(product);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: productFaqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ProductDetailClient product={product} relatedProducts={fallbackRelated} />
    </>
  );
}
