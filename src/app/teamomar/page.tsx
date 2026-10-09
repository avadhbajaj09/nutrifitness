import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import TeamOmarClient from './TeamOmarClient';

export const metadata: Metadata = {
  title: 'Omar Team Portal · Portugal Warehouse | NutriFitness',
  description: 'Logistics, stock and fulfillment portal for NutriFitness Portugal warehouse team.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TeamOmarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading Portugal Logistics Portal...</span>
        </div>
      </div>
    }>
      <TeamOmarClient />
    </Suspense>
  );
}
