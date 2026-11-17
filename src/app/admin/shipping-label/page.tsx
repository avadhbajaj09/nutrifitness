'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SwissPostBoxLabel from '@/components/admin/shipping/SwissPostBoxLabel';
import { RefreshCw, AlertCircle } from 'lucide-react';

function ShippingLabelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('id');
  const orderNumber = searchParams.get('orderNumber') || searchParams.get('ref') || 'CMD-ONLINE';

  const [isLoading, setIsLoading] = useState(!!orderId);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (!orderId) {
      // Direct params mode (e.g. from manual generator)
      setOrderData({
        orderNumber: orderNumber,
        recipient: {
          name: searchParams.get('name') || 'Client NutriFitness',
          street: searchParams.get('street') || 'Rue du Commerce 10',
          zip: searchParams.get('zip') || '1204',
          city: searchParams.get('city') || 'Genève',
          country: searchParams.get('country') || 'CH',
          phone: searchParams.get('phone') || undefined,
        },
        weightKg: Number(searchParams.get('weight')) || 1.0,
        trackingNumber: searchParams.get('trackingNumber') || undefined,
      });
      return;
    }

    async function fetchOrder() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/admin/orders/${orderId}/label`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load order details');
        }

        setOrderData({
          orderNumber: data.orderNumber || orderId,
          recipient: data.recipient,
          sender: data.sender,
          weightKg: 1.0,
          trackingNumber: data.trackingNumber,
          pdfUrl: `/api/admin/orders/${orderId}/label?format=pdf`,
        });
      } catch (err: any) {
        console.warn('[Shipping Label] Supabase API fetch warning, fallback to URL parameters:', err);
        // Graceful fallback to search params so the sticker can always be printed
        const qName = searchParams.get('name') || 'Client NutriFitness';
        const qStreet = searchParams.get('street') || 'Rue du Commerce 10';
        const qZip = searchParams.get('zip') || '1204';
        const qCity = searchParams.get('city') || 'Genève';
        const qCountry = searchParams.get('country') || 'CH';
        const qPhone = searchParams.get('phone') || undefined;

        setOrderData({
          orderNumber: orderNumber || orderId,
          recipient: {
            name: qName,
            street: qStreet,
            zip: qZip,
            city: qCity,
            country: qCountry,
            phone: qPhone,
          },
          weightKg: Number(searchParams.get('weight')) || 1.0,
          trackingNumber: searchParams.get('trackingNumber') || undefined,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, orderNumber, searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-500 mb-3" />
        <p className="text-xs font-bold text-slate-700">Génération de l'étiquette La Poste Suisse...</p>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-200 max-w-md w-full text-center">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h2 className="text-sm font-bold text-slate-900 mb-1">Impossible de générer l'étiquette</h2>
          <p className="text-xs text-slate-600 mb-4">{error || 'Commande introuvable'}</p>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
          >
            Retour au panneau admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <SwissPostBoxLabel
      orderNumber={orderData.orderNumber}
      recipient={orderData.recipient}
      sender={orderData.sender}
      weightKg={orderData.weightKg}
      service="PRI"
      trackingNumber={orderData.trackingNumber}
      pdfUrl={orderData.pdfUrl}
      onClose={() => window.history.back()}
    />
  );
}

export default function ShippingLabelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      }
    >
      <ShippingLabelContent />
    </Suspense>
  );
}
