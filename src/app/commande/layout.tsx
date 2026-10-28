import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finaliser ma Commande Sécurisée | NutriFitness.ch',
  description: 'Paiement sécurisé en Francs Suisses (TWINT, Cartes Bancaires, PostFinance, Apple Pay). Expédition rapide PostPac Priority 1-2 jours ou retrait Click & Collect à Genève.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
