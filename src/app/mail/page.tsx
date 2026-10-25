import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import MailClient from './MailClient';

export const metadata: Metadata = {
  title: 'Messagerie Admin — info@nutrifitness.ch',
  description: 'Interface de gestion des e-mails officiels NutriFitness Genève.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm font-medium">Chargement de la messagerie...</div>
        </div>
      </div>
    }>
      <MailClient />
    </Suspense>
  );
}
