import React from 'react';

const reviews = [
  {
    author: 'Julien M.',
    location: 'Genève (Eaux-Vives)',
    role: 'Athlète Crossfit & Musculation',
    rating: 5,
    title: 'Livraison 24h respectée à la minute près !',
    text: 'Commande passée un mardi à 13h20, reçue le mercredi matin par PostPac Priority. Pas de frais de douane cachés, packshots conformes et la Créatine Creapure se dissout parfaitement.'
  },
  {
    author: 'Marc B.',
    location: 'Lausanne (Vaud)',
    role: 'Coach Fitness Indépendant',
    rating: 5,
    title: 'Le meilleur shop de nutrition en Suisse romande',
    text: 'Je recommande NutriFitness à tous mes clients. Les taux de protéines sont certifiés, les fiches nutritionnelles sont transparentes et le paiement par TWINT se fait en deux secondes.'
  },
  {
    author: 'Sophie T.',
    location: 'Nyon (Genève / Vaud)',
    role: 'Course à pied & Trail',
    rating: 5,
    title: 'Top conseils à la boutique des Pâquis',
    text: 'J\'ai testé le Click & Collect à Genève. Accueil hyper pro, conseils avisés sur les électrolytes et les vitamines pour mes sorties longues. Boutique propre et moderne.'
  }
];

export default function Testimonials() {
  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#F80404] mb-1 font-heading">
            Témoignages Vérifiés
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
            Ce que Disent nos Athlètes en Suisse
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex text-amber-400 text-sm">★★★★★</div>
          <span className="text-xs font-bold text-white">4.9 / 5 sur 340+ avis</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div key={idx} className="bg-[#141414] rounded-2xl border border-white/10 p-6 flex flex-col justify-between hover:border-[#F80404]/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex text-amber-400 text-xs">★★★★★</div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  ✓ Achat Vérifié
                </span>
              </div>

              <h3 className="text-sm font-bold text-white font-heading leading-snug">
                &quot;{rev.title}&quot;
              </h3>

              <p className="text-xs text-white/70 leading-relaxed italic">
                &quot;{rev.text}&quot;
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{rev.author}</p>
                <p className="text-[10px] text-white/50">{rev.role}</p>
              </div>
              <span className="text-[10px] font-bold text-white/40">{rev.location}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
