import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { BLOG_POSTS, getBlogPostBySlug, type BlogPost } from '@/lib/blog';
import { getProductBySlug } from '@/lib/catalog';
import BlogFaqAccordion from '@/components/BlogFaqAccordion';
import BlogProductCards, { type BlogProductItem } from '@/components/BlogProductCards';
import { 
  ChevronRight, 
  Home, 
  Clock, 
  Calendar, 
  Sparkles, 
  ExternalLink, 
  ShoppingBag, 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  CheckCircle2, 
  Share2,
  BookOpen
} from 'lucide-react';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: 'Article introuvable | NutriFitness.ch',
    };
  }

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: [post.targetKeyword, post.category, 'nutrition sportive suisse', 'nutrifitness geneve'],
    alternates: {
      canonical: `https://nutrifitness.ch/blog/${post.slug}/`,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://nutrifitness.ch/blog/${post.slug}/`,
      siteName: 'NutriFitness.ch',
      locale: 'fr_CH',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.image],
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Find related read-next posts
  const readNextPosts: BlogPost[] = (post.readNextSlugs || [])
    .map(slug => getBlogPostBySlug(slug))
    .filter((p): p is BlogPost => p !== undefined)
    .slice(0, 3);

  // If fewer than 3, fill with other posts from same category or general
  if (readNextPosts.length < 3) {
    const others = BLOG_POSTS.filter(p => p.slug !== post.slug && !readNextPosts.some(r => r.slug === p.slug));
    readNextPosts.push(...others.slice(0, 3 - readNextPosts.length));
  }

  // Resolve full ProductItem data for suggestedProducts
  const suggestedProductsWithData: BlogProductItem[] = (post.suggestedProducts || []).map(sp => {
    const slug = sp.href.replace(/^\/produit\//, '').replace(/\/$/, '');
    const product = getProductBySlug(slug, 'fr');
    return {
      ...sp,
      product
    };
  });

  // Schema.org Article / BlogPosting
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription,
    image: `https://nutrifitness.ch${post.image}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: post.authorRole,
      worksFor: {
        '@type': 'Organization',
        name: 'NutriFitness Genève',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'NutriFitness Genève',
      url: 'https://nutrifitness.ch',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nutrifitness.ch/images/brand/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://nutrifitness.ch/blog/${post.slug}/`,
    },
  };

  // Schema.org FAQPage
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  // Schema.org BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://nutrifitness.ch/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://nutrifitness.ch/blog/',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.category,
        item: `https://nutrifitness.ch/blog/?cat=${post.categorySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: post.title,
        item: `https://nutrifitness.ch/blog/${post.slug}/`,
      },
    ],
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white pt-6 pb-24">
      {/* Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 text-xs text-white/50 mb-8">
          <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Accueil</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-white/30" />
          <Link href="/blog/" className="hover:text-white transition-colors">
            Blog & Guides
          </Link>
          <ChevronRight className="w-3 h-3 text-white/30" />
          <span className="text-[#F80404] font-bold">{post.category}</span>
        </nav>

        {/* 2-Column Full-Width Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Main Article Content (lg:col-span-8) */}
          <article className="lg:col-span-8 min-w-0">

        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#F80404] text-black text-xs font-black uppercase tracking-wider font-heading">
              {post.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-white/60 font-bold">
              <Clock className="w-3.5 h-3.5 text-[#F80404]" />
              <span>{post.readingTime} de lecture</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/50">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(post.publishedAt).toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-heading leading-tight tracking-tight mb-6">
            {post.title}
          </h1>

          {/* Author & Swiss Badge Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#141414] border border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#F80404]/20 border border-[#F80404]/40 flex items-center justify-center font-black text-white text-sm">
                MS
              </div>
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{post.author}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/80 font-normal">Expert Certifié</span>
                </p>
                <p className="text-xs text-white/50">{post.authorRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[#95d600] bg-[#95d600]/10 px-3 py-1.5 rounded-xl border border-[#95d600]/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Conforme OSAV / DFI Suisse</span>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden mb-10 border border-white/10 shadow-2xl">
          <Image 
            src={post.image} 
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* AEO Direct Answer Box (Google AI Overviews / Featured Snippet Box) */}
        <div className="mb-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#1E1111] to-[#141414] border-2 border-[#F80404]/50 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#F80404] mb-3 font-heading">
            <Sparkles className="w-4 h-4" />
            <span>En Bref • La Réponse Directe de nos Experts (AEO)</span>
          </div>
          <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
            {post.shortAnswer}
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-10 p-5 rounded-2xl bg-[#111111] border border-white/10">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/80 font-heading mb-3">
            <BookOpen className="w-4 h-4 text-[#F80404]" />
            <span>Sommaire du Dossier</span>
          </div>
          <ul className="space-y-1.5 text-xs text-white/70">
            {post.sections.map((sec, i) => (
              <li key={i} className="flex items-center gap-2 hover:text-[#F80404] transition-colors">
                <span className="text-[#F80404] font-bold">{i + 1}.</span>
                <a href={`#section-${i}`} className="hover:underline">
                  {sec.title || `Partie ${i + 1}`}
                </a>
              </li>
            ))}
            <li className="flex items-center gap-2 hover:text-[#F80404] transition-colors">
              <span className="text-[#F80404] font-bold">•</span>
              <a href="#faq-section" className="hover:underline">
                Questions Fréquentes & FAQ
              </a>
            </li>
            <li className="flex items-center gap-2 hover:text-[#F80404] transition-colors">
              <span className="text-[#F80404] font-bold">•</span>
              <a href="#scientific-sources" className="hover:underline">
                Sources & Références Scientifiques
              </a>
            </li>
          </ul>
        </div>

        {/* Main Article Content */}
        <div className="space-y-10 text-white/90 text-sm sm:text-base leading-relaxed">
          {post.sections.map((sec, index) => (
            <section key={index} id={`section-${index}`} className="scroll-mt-24 space-y-4">
              {sec.title && (
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-heading pt-4 border-t border-white/10">
                  {sec.title}
                </h2>
              )}
              {sec.content.map((paragraph, pIdx) => (
                <p key={pIdx} className="leading-relaxed text-white/80">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* Suggested Products (Internal Product Links with Real Images & Cart) */}
        {suggestedProductsWithData && suggestedProductsWithData.length > 0 && (
          <div id="produits-recommandes" className="my-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#141414] to-[#0D0D0D] border border-[#F80404]/30 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F80404]/10 border border-[#F80404]/20 flex items-center justify-center text-[#F80404]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#F80404] font-heading block">
                    Sélection NutriFitness
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-white uppercase font-heading">
                    Produits Recommandés dans ce Dossier
                  </h3>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#95d600] bg-[#95d600]/10 px-3 py-1 rounded-full border border-[#95d600]/20">
                <span>🇨🇭</span>
                <span>En stock à Genève · 24h</span>
              </span>
            </div>

            <BlogProductCards products={suggestedProductsWithData} variant="in-article" />
          </div>
        )}

        {/* Interactive FAQ Section */}
        <div id="faq-section" className="scroll-mt-24">
          <BlogFaqAccordion faqs={post.faqs} title={`FAQ : ${post.title}`} />
        </div>

        {/* Scientific Sources & Authorities (External Links) */}
        {post.externalSources && post.externalSources.length > 0 && (
          <div id="scientific-sources" className="my-10 p-6 rounded-2xl bg-[#111111] border border-white/10 scroll-mt-24">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/80 font-heading mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#95d600]" />
              Sources & Références Scientifiques Consultées
            </h3>
            <ul className="space-y-2.5">
              {post.externalSources.map((source, idx) => (
                <li key={idx} className="flex items-start justify-between gap-3 text-xs bg-black/40 p-3 rounded-xl border border-white/5">
                  <div>
                    <span className="font-bold text-white block mb-0.5">{source.title}</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-wider">Autorité : {source.authority}</span>
                  </div>
                  <a 
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-2 rounded-lg bg-white/5 hover:bg-[#F80404] hover:text-black text-white transition-all"
                    aria-label={`Consulter la source ${source.title}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Geneva Store Consultation & Coaching Banner */}
        <div className="my-12 p-8 rounded-3xl bg-gradient-to-r from-[#171717] via-[#1A0A0A] to-[#171717] border border-white/15 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-[#F80404] font-heading">
              <MapPin className="w-3.5 h-3.5" />
              <span>Boutique Genève & Coaching</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-heading">
              Besoin d&apos;un conseil sur-mesure ?
            </h3>
            <p className="text-xs text-white/60 max-w-lg">
              Venez nous rencontrer au 34 Rue des Pâquis, 1201 Genève ou réservez un bilan nutritionnel gratuit avec notre coach.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link 
              href="/coaching-nutritionnel-personnalise/"
              className="px-5 py-3 rounded-xl bg-[#F80404] hover:bg-[#FF3D00] text-black font-black text-xs uppercase tracking-wider transition-all"
            >
              Bilan Coaching Gratuit
            </Link>
            <Link 
              href="/boutique-geneve/"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10"
            >
              Visiter le Magasin
            </Link>
          </div>
        </div>

        {/* Read Next / Related Articles */}
        {readNextPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#F80404] font-heading">
                  Continuer votre lecture
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-heading">
                  Dossiers Recommandés
                </h3>
              </div>
              <Link href="/blog/" className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider">
                Tous les guides →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {readNextPosts.map((related) => (
                <article 
                  key={related.id}
                  className="bg-[#141414] rounded-2xl overflow-hidden border border-white/10 hover:border-[#F80404]/50 transition-all flex flex-col group"
                >
                  <Link href={`/blog/${related.slug}/`} className="relative aspect-[16/10] overflow-hidden block">
                    <Image 
                      src={related.image} 
                      alt={related.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded bg-[#F80404] text-black text-[9px] font-black uppercase tracking-wider">
                        {related.category}
                      </span>
                    </div>
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#F80404] transition-colors mb-2 line-clamp-2">
                        <Link href={`/blog/${related.slug}/`}>
                          {related.title}
                        </Link>
                      </h4>
                      <p className="text-[11px] text-white/60 line-clamp-2 mb-3">
                        {related.shortAnswer}
                      </p>
                    </div>

                    <Link 
                      href={`/blog/${related.slug}/`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-white group-hover:text-[#F80404] transition-colors mt-auto"
                    >
                      <span>Lire le dossier</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

      </article>

          {/* Sticky Sidebar Column (lg:col-span-4) */}
          <aside className="hidden lg:block lg:col-span-4 min-w-0 sticky top-24 space-y-6">
            
            {/* Sidebar Widget 1: Products in this guide */}
            {suggestedProductsWithData.length > 0 && (
              <div className="p-5 rounded-3xl bg-[#141414] border border-[#F80404]/30 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#F80404]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white font-heading">
                      Produits du Guide
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#95d600] font-bold">🇨🇭 Genève</span>
                </div>

                <BlogProductCards products={suggestedProductsWithData} variant="sidebar" />

                <Link
                  href="/boutique/"
                  className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1 border border-white/10"
                >
                  <span>Explorer toute la boutique</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Sidebar Widget 2: Sticky Table of Contents */}
            <div className="p-5 rounded-3xl bg-[#141414] border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/90 font-heading pb-2 border-b border-white/10">
                <BookOpen className="w-4 h-4 text-[#F80404]" />
                <span>Sommaire du Dossier</span>
              </div>
              <ul className="space-y-2 text-xs text-white/70">
                {post.sections.map((sec, i) => (
                  <li key={i}>
                    <a 
                      href={`#section-${i}`}
                      className="hover:text-[#F80404] transition-colors flex items-start gap-2 group"
                    >
                      <span className="text-[#F80404] font-bold shrink-0">{i + 1}.</span>
                      <span className="group-hover:underline line-clamp-1">{sec.title || `Partie ${i + 1}`}</span>
                    </a>
                  </li>
                ))}
                {suggestedProductsWithData.length > 0 && (
                  <li>
                    <a 
                      href="#produits-recommandes"
                      className="text-[#95d600] font-bold hover:underline flex items-center gap-2"
                    >
                      <span>★</span>
                      <span>Produits Recommandés</span>
                    </a>
                  </li>
                )}
                <li>
                  <a href="#faq-section" className="hover:text-[#F80404] transition-colors flex items-center gap-2">
                    <span className="text-[#F80404] font-bold">•</span>
                    <span className="hover:underline">Questions Fréquentes (FAQ)</span>
                  </a>
                </li>
                {post.externalSources && post.externalSources.length > 0 && (
                  <li>
                    <a href="#scientific-sources" className="hover:text-[#F80404] transition-colors flex items-center gap-2">
                      <span className="text-[#F80404] font-bold">•</span>
                      <span className="hover:underline">Sources Scientifiques</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Sidebar Widget 3: Ebook Promo */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1E1111] via-[#141414] to-[#141414] border border-[#95d600]/40 shadow-xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#95d600]/20 text-[#95d600] border border-[#95d600]/30 font-heading">
                  Ebook PDF · 66 Pages
                </span>
                <span className="text-xs font-bold text-amber-400">★★★★★ 5.0</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-16 shrink-0 rounded-lg overflow-hidden border border-[#95d600]/30 bg-black/60">
                  <Image
                    src="/images/banners/mobile/imgi_10_guidebook.jpg"
                    alt="Guide Ultime Ebook"
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase font-heading leading-snug">
                    Le Guide Ultime des Compléments
                  </h4>
                  <p className="text-[10px] text-white/60 mt-0.5 leading-tight">
                    11 ans d&apos;expertise sans langue de bois.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-sm font-black text-[#95d600] font-heading">29.90 CHF</span>
                <Link
                  href="/guide-des-complements-alimentaires/"
                  className="px-3.5 py-1.5 rounded-xl bg-[#95d600] hover:bg-[#85c000] text-black text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  Télécharger
                </Link>
              </div>
            </div>

            {/* Sidebar Widget 4: Swiss Trust Guarantee */}
            <div className="p-5 rounded-3xl bg-[#141414] border border-white/10 shadow-xl space-y-3 text-xs">
              <div className="flex items-center gap-2 font-black uppercase tracking-wider text-white font-heading">
                <ShieldCheck className="w-4 h-4 text-[#95d600]" />
                <span>Engagements NutriFitness</span>
              </div>
              <ul className="space-y-2 text-white/70 text-[11px]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#95d600] shrink-0" />
                  <span>Stock 100% physique à Genève</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#95d600] shrink-0" />
                  <span>Expédition 24h PostPac Priority</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#95d600] shrink-0" />
                  <span>Livraison offerte dès 75 CHF</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#95d600] shrink-0" />
                  <span>TVA 2.6% incluse · Zéro douane</span>
                </li>
              </ul>
              <div className="pt-2 border-t border-white/5">
                <Link
                  href="/boutique-geneve/"
                  className="text-[11px] text-[#F80404] hover:underline font-bold flex items-center gap-1"
                >
                  <span>Visiter la boutique aux Pâquis</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}
