import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductLocationManagerClient from './ProductLocationManagerClient';

export const metadata: Metadata = {
  title: 'Inventory & Location Manager | NutriFitness Admin',
  description: 'Multi-origin inventory and location management (Geneva & Portugal).',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Inventory Manager...</div>}>
      <ProductLocationManagerClient />
    </Suspense>
  );
}
