import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata: Metadata = {
  title: 'Administration & POS Register | NutriFitness Geneva',
  description: 'Management dashboard and POS register for NutriFitness Geneva.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Admin Dashboard...</div>}>
      <AdminDashboardClient />
    </Suspense>
  );
}
