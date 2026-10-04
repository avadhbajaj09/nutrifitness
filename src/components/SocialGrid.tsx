import React from 'react';
import Image from 'next/image';

const posts = [
  { img: '/images/fitrush/imgi_250_img-1x1-1.webp', tag: '#NutriFitnessCH' },
  { img: '/images/fitrush/imgi_67_img.webp', tag: '#GenevaFitness' },
  { img: '/images/fitrush/imgi_62_blog-post-6.webp', tag: '#SwissAthletes' },
  { img: '/images/fitrush/imgi_66_blog-post-7.webp', tag: '#CreapureSuisse' },
  { img: '/images/fitrush/imgi_252_img-slider-9-4.webp', tag: '#PostPacPriority' }
];

export default function SocialGrid() {
  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-1 font-heading">
            Communauté Athlètes
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
            Rejoignez le Mouvement #NutriFitnessCH
          </h2>
        </div>
        <a 
          href="https://instagram.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider flex items-center gap-1.5"
        >
          <span>Suivre @NutriFitness.ch</span>
          <span>→</span>
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {posts.map((p, idx) => (
          <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-square border border-white/10 shadow-lg">
            <Image 
              src={p.img} 
              alt="Athlète NutriFitness" 
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110 filter brightness-90 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
              <span className="text-xs font-black text-white bg-black/70 px-3 py-1.5 rounded-full border border-white/20">
                {p.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
