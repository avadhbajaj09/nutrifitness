import type { Metadata } from 'next';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata: Metadata = {
  title: 'Administration & Caisse POS | NutriFitness Genève',
  description: 'Panneau de gestion du catalogue et système de caisse enregistreuse POS pour la boutique NutriFitness à Genève.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
