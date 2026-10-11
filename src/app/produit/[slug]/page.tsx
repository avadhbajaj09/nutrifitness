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

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return PRODUCTS.map(p => ({
    slug: p.slug.fr
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductBySlug(params.slug, 'fr');
  if (!product) return {};

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
  // Check if draft or deleted in DB
  try {
    const supabase = getAdminSupabase();
    const { data: dbProduct } = await supabase
      .from('products')
      .select('id, status, deleted_at')
      .eq('slug', params.slug)
      .single();

    if (dbProduct && (dbProduct.status === 'draft' || dbProduct.deleted_at !== null)) {
      notFound();
    }
  } catch (err) {
    // Non-blocking fallback
  }

  const product = getProductBySlug(params.slug, 'fr');

  if (!product) {
    notFound();
  }

  const { getHiddenProductSlugs } = await import('@/lib/hiddenProducts');
  const hiddenSlugs = await getHiddenProductSlugs();

  const relatedProducts = PRODUCTS.filter(p => {
    const slug = (p.slug?.fr || '').toLowerCase().trim();
    if (hiddenSlugs.has(slug) || hiddenSlugs.has(p.id)) return false;
    return p.id !== product.id && p.categorySlug === product.categorySlug;
  }).slice(0, 8);
  const fallbackRelated = relatedProducts.length > 0 ? relatedProducts : PRODUCTS.filter(p => {
    const slug = (p.slug?.fr || '').toLowerCase().trim();
    if (hiddenSlugs.has(slug) || hiddenSlugs.has(p.id)) return false;
    return p.id !== product.id;
  }).slice(0, 8);

  const gtin = getProductGtin(product);

  const productSchema = generateProductSchema(
    {
      slug: params.slug,
      name: getLocalized(product.name),
      description: getLocalized(product.shortDescription),
      brand: product.brand,
      images: product.images?.map(img => img.src) || [],
      price: product.priceChf,
      inStock: product.variants?.some(v => v.inStock) ?? true,
      sku: product.variants?.[0]?.sku,
      gtin,
      category: product.categorySlug,
    },
    {
      cost: product.priceChf >= 75 ? 0 : 7.90,
      minDays: 1,
      maxDays: 2,
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
