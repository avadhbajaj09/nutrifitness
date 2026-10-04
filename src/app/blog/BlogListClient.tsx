'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Clock, Calendar, ArrowRight, BookOpen, ShieldCheck, Sparkles, Filter, X } from 'lucide-react';
import type { BlogPost } from '@/lib/blog';
import { BLOG_CATEGORIES } from '@/lib/blog';

interface BlogListClientProps {
  posts: BlogPost[];
}

export default function BlogListClient({ posts }: BlogListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = 
        selectedCategory === 'all' || 
        post.categorySlug === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.targetKeyword.toLowerCase().includes(q) ||
        post.shortAnswer.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [posts, searchQuery, selectedCategory]);

  const featuredPost = posts[0]; // First article (Créatine quand et comment)

  return (
    <div className="space-y-12">
      {/* Search & Category Filter Section */}
      <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-black uppercase text-white font-heading tracking-wide flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#F80404]" />
              Explorer les Dossiers Scientifiques
            </h2>
            <p className="text-xs text-white/60">
              {filteredPosts.length} article{filteredPosts.length > 1 ? 's' : ''} disponible{filteredPosts.length > 1 ? 's' : ''} • Validés par nos préparateurs physiques
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher (ex: créatine, whey, bcaa, sommeil)..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-white/40 focus:border-[#F80404] focus:outline-none transition-colors"
            />
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {BLOG_CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive 
                    ? 'bg-[#F80404] text-black shadow-lg font-black' 
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-white/40'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Article Banner (Only on 'all' and no active search) */}
      {selectedCategory === 'all' && !searchQuery && featuredPost && (
        <div className="relative bg-gradient-to-r from-[#171717] to-[#121212] border border-white/15 rounded-3xl overflow-hidden shadow-2xl group hover:border-[#F80404]/50 transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#F80404] text-black text-[10px] font-black uppercase tracking-wider">
                    À la Une • Guide Essentiel
                  </span>
                  <span className="text-xs text-white/60 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#F80404]" />
                    {featuredPost.readingTime} de lecture
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase font-heading group-hover:text-[#F80404] transition-colors mb-4 leading-tight">
                  <Link href={`/blog/${featuredPost.slug}/`}>
                    {featuredPost.title}
                  </Link>
                </h2>

                <p className="text-sm text-white/70 line-clamp-3 mb-6 leading-relaxed">
                  {featuredPost.shortAnswer}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F80404]/20 border border-[#F80404]/40 flex items-center justify-center font-bold text-white text-xs">
                    MS
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{featuredPost.author}</p>
                    <p className="text-[10px] text-white/50">{featuredPost.authorRole}</p>
                  </div>
                </div>

                <Link 
                  href={`/blog/${featuredPost.slug}/`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-[#F80404] hover:text-black transition-all group-hover:scale-105"
                >
                  <span>Lire l&apos;article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[300px] overflow-hidden">
              <Image 
                src={featuredPost.image} 
                alt={featuredPost.title}
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-transparent via-[#121212]/30 to-[#121212]" />
            </div>
          </div>
        </div>
      )}

      {/* Grid of Articles */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-[#141414] rounded-3xl border border-white/10 p-8">
          <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Aucun dossier trouvé</h3>
          <p className="text-xs text-white/60 mb-6 max-w-md mx-auto">
            Aucun article ne correspond à votre recherche &ldquo;{searchQuery}&rdquo;. Réinitialisez les filtres pour voir tous les guides.
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="px-5 py-2.5 rounded-xl bg-[#F80404] text-black text-xs font-black uppercase tracking-wider hover:bg-[#FF3D00] transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPosts.map((post) => (
            <article 
              key={post.id}
              className="bg-[#141414] rounded-2xl overflow-hidden border border-white/10 hover:border-[#F80404]/50 transition-all flex flex-col group shadow-lg hover:shadow-2xl"
            >
              {/* Card Image */}
              <Link href={`/blog/${post.slug}/`} className="relative aspect-[16/10] overflow-hidden block">
                <Image 
                  src={post.image} 
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md bg-[#F80404] text-black text-[10px] font-black uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>

                {/* Read Time */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-bold text-white/90">
                  <Clock className="w-3 h-3 text-[#F80404]" />
                  <span>{post.readingTime}</span>
                </div>
              </Link>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-white/50 mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(post.publishedAt).toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#F80404] transition-colors mb-2.5 line-clamp-2 leading-snug">
                    <Link href={`/blog/${post.slug}/`}>
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-white/60 line-clamp-3 mb-4 leading-relaxed">
                    {post.shortAnswer}
                  </p>
                </div>

                {/* Card Footer: Author & Link */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/80">
                      MS
                    </div>
                    <span className="text-[11px] text-white/70 truncate max-w-[120px]">{post.author}</span>
                  </div>

                  <Link 
                    href={`/blog/${post.slug}/`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#F80404] transition-colors"
                  >
                    <span>Lire</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Swiss Expert Guarantee Banner */}
      <div className="bg-gradient-to-r from-black to-[#141414] border border-white/10 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#95d600]/10 border border-[#95d600]/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#95d600]" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black text-white uppercase font-heading mb-1">
              Rigueur Scientifique & Standards Suisses
            </h4>
            <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
              Tous nos articles s&apos;appuient sur les méta-analyses les plus récentes (ISSN, PubMed, NIH) et respectent scrupuleusement la législation suisse des denrées alimentaires (OSAV, DFI). Aucun compromis sur votre santé.
            </p>
          </div>
        </div>

        <Link 
          href="/coaching-nutritionnel-personnalise/"
          className="shrink-0 px-6 py-3 rounded-xl bg-white/10 hover:bg-[#F80404] text-white hover:text-black font-black text-xs uppercase tracking-wider transition-all border border-white/15"
        >
          Consulter un coach à Genève
        </Link>
      </div>
    </div>
  );
}
