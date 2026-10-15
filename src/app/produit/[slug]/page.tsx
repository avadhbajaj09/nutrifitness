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

  const product = getProductBySlug(params.slug, 'fr');
  if (!product) return {};

  const prodId = (product.id || '').toLowerCase().trim();
  const cleanId = prodId.replace(/^prod-/, '');
  if (hiddenSlugs.has(prodId) || hiddenSlugs.has(cleanId) || hiddenSlugs.has(`prod-${cleanId}`)) {
    return {
      robots: { index: false, follow: false }
    };
  }

  const name = getLocalized(product.name);
  const desc = getLocalized(product.shortDescription);
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

  if (!rawProduct) {
    notFound();
  }

  let product = { ...rawProduct };
  try {
    const supabase = getAdminSupabase();
    const cleanId = (product.id || '').replace(/^prod-/, '');
    const { data: dbProduct } = await supabase
      .from('products')
      .select(`
        id, main_location,
        product_variants (
          id, woo_id, sku, attribute_name, attribute_value, price,
          image_url, stock_geneva, stock_portugal
        )
      `)
      .or(`slug.eq.${params.slug},id.eq.${product.id},woo_id.eq.${cleanId}`)
      .maybeSingle();

    if (dbProduct && dbProduct.product_variants && dbProduct.product_variants.length > 0) {
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
          inventoryQuantity: tot,
          inStock: tot > 0,
          image: v.image_url || product.images?.[0]?.src || '/images/placeholder.webp',
          stockGeneva: gen,
          stockPortugal: pt
        };
      });
      const totalGen = vars.reduce((s: number, v: any) => s + (v.stockGeneva || 0), 0);
      const totalPt = vars.reduce((s: number, v: any) => s + (v.stockPortugal || 0), 0);

      product = {
        ...product,
        variants: vars,
        stockGeneva: totalGen,
        stockPortugal: totalPt
      };
    }
  } catch {}

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
      description: getLocalized(product.shortDescription),
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
