import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeroSlider from '@/components/HeroSlider';
import CategorySection from '@/components/CategorySection';
import ProductCarousel from '@/components/ProductCarousel';
import ShopByGoal from '@/components/ShopByGoal';
import BrandShowcase from '@/components/BrandShowcase';
import TrustStrip from '@/components/TrustStrip';
import Testimonials from '@/components/Testimonials';
import SocialGrid from '@/components/SocialGrid';
import Newsletter from '@/components/Newsletter';
import ProductCard from '@/components/ProductCard';
import ProductMarquee from '@/components/ProductMarquee';
import StoreMap from '@/components/StoreMap';
import HomeFAQ from '@/components/HomeFAQ';
import { PRODUCTS } from '@/lib/catalog';
import { getHiddenProductSlugs } from '@/lib/hiddenProducts';

export default async function HomePage() {
  const hiddenSlugs = await getHiddenProductSlugs();
  const physicalProducts = PRODUCTS.filter(p => {
    const slug = (p.slug?.fr || '').toLowerCase().trim();
    const id = p.id || '';
    if (hiddenSlugs.has(slug) || hiddenSlugs.has(id)) return false;
    return p.categorySlug !== 'guides-ebooks' && p.id !== 'prod-25430';
  });
  const bestSellers = physicalProducts.slice(0, 8);
  const newArrivals = physicalProducts.slice(8, 16);
  const performanceCollection = physicalProducts.slice(16, 24);

  return (
    <>
      {/* 1. HERO SLIDER */}
      <HeroSlider />

      {/* 2. RUNNING PRODUCT IMAGES MARQUEE */}
      <ProductMarquee products={physicalProducts} />

      {/* 3. CATEGORIES SECTION (5 FITRUSH BANNERS) */}
      <CategorySection />

      {/* 4. BEST SELLERS CAROUSEL */}
      <ProductCarousel 
        title="Bestsellers & Tendances en Suisse"
        subtitle="Les Plus Plébiscités"
        products={bestSellers}
      />

      {/* 5. LARGE PROMOTIONAL BANNER */}
      <section className="relative rounded-3xl overflow-hidden border border-white/15 my-16 shadow-2xl">
        <div className="relative w-full h-[360px] sm:h-[420px]">
          <Image 
            src="/images/blog/nutriftiness-images35.jpg" 
            alt="Offre exclusive NutriFitness Suisse"
            fill
            className="object-cover object-center filter brightness-90"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
        
        <div className="absolute inset-0 p-8 sm:p-14 flex flex-col justify-center max-w-xl space-y-4">
          <span className="inline-block px-3 py-1 bg-[#F80404] text-black text-xs font-black uppercase tracking-wider rounded-md w-fit">
            Offre Spéciale Athlète
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase font-heading leading-tight">
            LIVRAISON OFFERTE DÈS 75 CHF PARTOUT EN SUISSE
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Passez votre commande en toute sérénité : zéro formalité douanière, livraison express par la Poste Suisse sous 24h ou retrait gratuit dans notre boutique à Genève.
          </p>
          <div>
            <Link 
              href="/boutique/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#F80404] text-black font-black uppercase tracking-wider text-xs rounded-full transition-all shadow-md active:scale-95"
            >
              <span>Voir Tous les Produits</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. SHOP BY GOAL */}
      <ShopByGoal />

      {/* 7. NEW ARRIVALS CAROUSEL */}
      <ProductCarousel 
        title="Nouveautés & Derniers Arrivages"
        subtitle="Fraîchement Entrés en Stock"
        products={newArrivals}
      />

      {/* 8. PERFORMANCE COLLECTION (Curated Grid) */}
      <section className="mb-16">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-1 font-heading">
              Gamme Force & Endurance
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
              Collection Performance Suisse
            </h2>
          </div>
          <Link href="/boutique/?cat=pre-workout" className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider">
            Boosters & Créatines →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {performanceCollection.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 9. GENEVA BOUTIQUE SHOWCASE */}
      <section className="bg-[#121212] rounded-3xl border border-white/10 p-8 sm:p-12 mb-16 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/15 text-white text-xs font-bold rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#D52B1E] inline-block" />
              Boutique Physique à Genève
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase font-heading">
              RENCONTREZ NOS COACHS AU 34 RUE DES PÂQUIS
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Besoin d&apos;un conseil personnalisé pour votre prise de masse ou votre sèche ? Notre boutique genevoise vous accueille pour des bilans personnalisés et pour retirer vos commandes en Click & Collect dès 2 heures après votre achat.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                <p className="text-white/40 uppercase font-bold mb-1">Horaires Lun–Ven :</p>
                <p className="font-bold text-white text-sm">12h30 – 19h00</p>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                <p className="text-white/40 uppercase font-bold mb-1">Horaires Samedi :</p>
                <p className="font-bold text-white text-sm">12h00 – 17h00</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link 
                href="/boutique-geneve/"
                className="min-h-[46px] px-6 py-2.5 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase text-xs rounded-full transition-all inline-flex items-center justify-center gap-2"
              >
                Infos & Horaires de la Boutique
              </Link>
              <a 
                href="tel:+41792503564"
                className="min-h-[46px] px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-full border border-white/15 transition-all inline-flex items-center justify-center gap-2"
              >
                📞 +41 79 250 35 64
              </a>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/15 aspect-[4/3] shadow-2xl">
            <Image 
              src="/images/fitrush/imgi_248_slider-h9-2.webp" 
              alt="Boutique NutriFitness Genève" 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 text-xs font-bold text-white">
              📍 34 Rue des Pâquis, 1201 Genève (5 min de la Gare Cornavin)
            </div>
          </div>
        </div>

        {/* Proper Interactive Store Map */}
        <StoreMap />
      </section>

      {/* 10. BRAND SHOWCASE */}
      <BrandShowcase />

      {/* 11. TRUST STRIP */}
      <TrustStrip />

      {/* 12. TESTIMONIALS */}
      <Testimonials />

      {/* 13. EDITORIAL NUTRITION GUIDES */}
      <section className="mb-16">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-1 font-heading">Dossiers d&apos;Experts</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">Guides & Conseils Nutrition</h2>
          </div>
          <Link href="/blog/" className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider flex items-center gap-1 group">
            <span>Tous les 20 Guides</span>
            <span className="text-[#F80404] group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/blog/creatine-quand-comment-la-prendre/"
            className="bg-[#141414] rounded-2xl overflow-hidden border border-white/10 group hover:border-[#F80404]/50 transition-all flex flex-col"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image 
                src="/images/blog/nutriftiness-images14.png" 
                alt="Créatine Monohydrate Guide Suisse" 
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#F80404] mb-1">Créatine & Force</span>
              <h3 className="text-base font-bold text-white group-hover:text-[#F80404] transition-colors mb-2 line-clamp-2">
                Créatine : quand et comment la prendre ?
              </h3>
              <p className="text-xs text-white/60 mb-4 line-clamp-2">
                Dose, moment idéal, mélange et prise les jours de repos : le guide scientifique et pratique pour votre créatine à Genève.
              </p>
              <span className="mt-auto text-xs font-bold text-white group-hover:text-[#F80404] transition-colors">
                Lire le dossier (5 min) →
              </span>
            </div>
          </Link>

          <Link 
            href="/blog/whey-concentree-ou-isolate/"
            className="bg-[#141414] rounded-2xl overflow-hidden border border-white/10 group hover:border-[#F80404]/50 transition-all flex flex-col"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image 
                src="/images/blog/nutriftiness-images20.jpg" 
                alt="Whey Isolate vs Concentrée" 
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#F80404] mb-1">Protéines & Sèche</span>
              <h3 className="text-base font-bold text-white group-hover:text-[#F80404] transition-colors mb-2 line-clamp-2">
                Whey concentrée ou isolate : que choisir ?
              </h3>
              <p className="text-xs text-white/60 mb-4 line-clamp-2">
                Pureté, teneur en lactose, vitesse d&apos;assimilation et budget : notre comparatif complet pour faire le bon choix.
              </p>
              <span className="mt-auto text-xs font-bold text-white group-hover:text-[#F80404] transition-colors">
                Lire le dossier (5 min) →
              </span>
            </div>
          </Link>

          <Link 
            href="/blog/electrolytes-hydratation-effort/"
            className="bg-[#141414] rounded-2xl overflow-hidden border border-white/10 group hover:border-[#F80404]/50 transition-all flex flex-col"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image 
                src="/images/blog/nutriftiness-images36.jpg" 
                alt="Électrolytes et Hydratation" 
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#F80404] mb-1">Endurance & Énergie</span>
              <h3 className="text-base font-bold text-white group-hover:text-[#F80404] transition-colors mb-2 line-clamp-2">
                Électrolytes et hydratation pendant l&apos;effort
              </h3>
              <p className="text-xs text-white/60 mb-4 line-clamp-2">
                Sodium, potassium, magnésium : comment prévenir la déshydratation et les baisses de régime lors d&apos;efforts intenses.
              </p>
              <span className="mt-auto text-xs font-bold text-white group-hover:text-[#F80404] transition-colors">
                Lire le dossier (5 min) →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 14. SOCIAL GRID */}
      <SocialGrid />

      {/* 15. FAQ NUTRIFITNESS ACCUEIL */}
      <HomeFAQ />

      {/* 16. VIP NEWSLETTER */}
      <Newsletter />
    </>
  );
}
