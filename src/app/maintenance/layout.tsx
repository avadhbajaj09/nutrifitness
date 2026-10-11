import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NutriFitness.ch — Bientôt Disponible | Boutique en Préparation',
  description: 'Notre boutique en ligne NutriFitness finalise ses préparatifs. Retrouvez notre boutique physique Rue des Pâquis 34, 1201 Genève.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
