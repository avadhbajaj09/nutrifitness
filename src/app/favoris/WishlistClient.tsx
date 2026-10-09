'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PRODUCTS } from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';
import { getLocalized } from '@/lib/types';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';

export default function WishlistClient() {
  const { wishlist, addToCart, showToast, isProductDeliverable } = useStore();

  // Find products in catalog that are wishlisted
  const wishlistedProducts = PRODUCTS.filter(p => {
    const slug = getLocalized(p.slug);
    return wishlist.includes(slug) || wishlist.includes(p.id);
  });

  const handleAddAllToCart = () => {
    let addedCount = 0;
    let blockedCount = 0;
    wishlistedProducts.forEach(p => {
      const inStock = p.variants?.some(v => v.inStock) ?? true;
      if (inStock) {
        if (isProductDeliverable(p)) {
          addToCart(p, { quantity: 1 });
          addedCount++;
        } else {
          blockedCount++;
        }
      }
    });
    if (addedCount > 0) {
      showToast('Panier', `${addedCount} produit(s) ajoutés au panier !`);
    } else if (blockedCount > 0) {
      showToast('Non disponible', 'Ces articles ne sont pas livrables vers votre pays.');
    }
  };

  return (
    <div className="py-6">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="text-xs text-white/50 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-white font-medium">Mes Favoris</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F80404]/10 border border-[#F80404]/30 text-[#F80404] text-[10px] font-black uppercase tracking-wider rounded-full mb-2">
            <Heart className="w-3.5 h-3.5 fill-[#F80404]" />
            Liste d'envies
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-heading">
            Mes Favoris <span className="text-white/40 text-lg font-bold ml-2">({wishlistedProducts.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Conservez vos protéines et compléments préférés pour vos prochaines commandes.
          </p>
        </div>

        {wishlistedProducts.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddAllToCart}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg hover:shadow-[#F80404]/20 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              Tout ajouter au panier
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {wishlistedProducts.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-6">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Votre liste d'envies est vide</h2>
          <p className="text-sm text-white/60 mb-8">
            Vous n'avez pas encore sauvegardé d'article. Parcourez notre sélection de nutrition sportive pour ajouter vos favoris !
          </p>
          <Link
            href="/boutique/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#F80404] hover:bg-[#FF3D00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg active:scale-95"
          >
            Explorer la boutique
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
