import React from 'react';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { PRODUCTS, getProductBySlug } from '@/lib/catalog';
import type { Metadata } from 'next';
import { formatChf } from '@/lib/tax';
import { product as generateProductSchema } from '@/lib/schema';
import { getLocalized } from '@/lib/types';
import { getProductFaqs } from '@/lib/productFaq';
import { getAdminSupabase } from '@/lib/supabase';

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
  const metaDesc = desc.length > 158 ? `${desc.slice(0, 155)}...` : desc;

  return {
    title: `${name} | NutriFitness Suisse - ${formatChf(product.priceChf)}`,
    description: metaDesc,
    openGraph: {
      title: `${name} | NutriFitness Suisse`,
      description: metaDesc,
      images: product.images?.[0]?.src ? [product.images[0].src] : []
    }
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
      category: product.categorySlug,
    },
    {
      cost: product.priceChf >= 75 ? 0 : 7.90,
      minDays: 1,
      maxDays: 2,
    }
  );

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ProductDetailClient product={product} relatedProducts={fallbackRelated} />
    </>
  );
}
