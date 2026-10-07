'use client';

import { useEffect, useState } from 'react';
import { AvailabilityResult } from '@/lib/fulfillment/types';

interface DeliveryBadgeProps {
  productId: string;
  shippingOrigin?: 'switzerland' | 'portugal';
  className?: string;
}

const COUNTRIES = [
  { code: 'CH', name: 'Suisse' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'IT', name: 'Italie' },
  { code: 'AT', name: 'Autriche' },
  { code: 'BE', name: 'Belgique' },
  { code: 'ES', name: 'Espagne' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PL', name: 'Pologne' },
  { code: 'NL', name: 'Pays-Bas' },
  { code: 'GB', name: 'Royaume-Uni' },
  { code: 'NO', name: 'Norvège' },
  { code: 'IS', name: 'Islande' },
];

export function DeliveryBadge({ productId, shippingOrigin, className = '' }: DeliveryBadgeProps) {
  const [country, setCountry] = useState('CH');
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Read cookie
    const match = document.cookie.match(new RegExp('(^| )nf_country=([^;]+)'));
    if (match) {
      setCountry(match[2]);
    }
  }, []);

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/fulfillment/availability?productId=${productId}&country=${country}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setAvailability(data);
        
        // Save cookie
        document.cookie = `nf_country=${country}; path=/; max-age=${30 * 24 * 60 * 60}`;
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAvailability();
  }, [productId, country]);

  if (error) {
    return (
      <div className={`text-sm text-gray-400 ${className}`}>
        Livraison depuis: {shippingOrigin === 'switzerland' ? 'Genève' : 'Portugal'}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Livrer à:</span>
        <select 
          value={country} 
          onChange={(e) => setCountry(e.target.value)}
          className="bg-[#1a1a1a] border border-gray-800 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-red-500"
        >
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="h-6 w-64 bg-gray-800 animate-pulse rounded"></div>
      ) : availability ? (
        <div className="flex flex-col gap-1">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm w-fit ${
            !availability.available ? 'bg-red-900/30 text-red-400 border border-red-900/50' :
            availability.origin === 'GENEVA' ? 'bg-green-900/20 text-green-400 border border-green-900/30' :
            'bg-blue-900/20 text-blue-400 border border-blue-900/30'
          }`}>
            <span>{availability.available ? '🚚' : '❌'}</span>
            <span>{availability.labelFr}</span>
          </div>
          {availability.dutiesNote && (
            <span className="text-xs text-yellow-500/80">{availability.dutiesNote}</span>
          )}
        </div>
      ) : null}
    </div>
  );
}
