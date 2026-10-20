import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inscription Coaching Nutritionnel Personnalisé | NutriFitness.ch',
  description: 'Bilan nutritionnel offert et programme personnalisé avec nos coachs diplômés en Suisse.',
};

export default function InscriptionCoachingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
