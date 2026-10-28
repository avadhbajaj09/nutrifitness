import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mon Panier d\'Achat | NutriFitness.ch Genève',
  description: 'Consultez votre panier de compléments alimentaires, vos réductions exclusives et vos options de livraison rapide 1-2 jours ou Click & Collect en Suisse.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
