'use client';

import { useState, useEffect, useMemo } from 'react';
import { DeliveryEstimateItemInput, DeliveryEstimateItemResult } from '@/lib/delivery/types';

// Global client memory cache for delivery estimates: key -> result
const estimatesCache = new Map<string, { data: DeliveryEstimateItemResult; timestamp: number }>();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export function useDeliveryEstimates(
  items: DeliveryEstimateItemInput[],
  countryCode: string
) {
  const [estimates, setEstimates] = useState<Map<string, DeliveryEstimateItemResult>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [overallLatestDate, setOverallLatestDate] = useState<string | null>(null);
  const [overallLatestFormatted, setOverallLatestFormatted] = useState<{ fr: string; en: string; de: string } | null>(null);

  const country = (countryCode || 'CH').toUpperCase().trim();

  // Stable key for dependencies
  const itemsKey = useMemo(() => {
    return `${country}:${items.map(it => `${it.productId}_${it.variantSku || ''}_${it.shippingOriginHint || ''}`).join('|')}`;
  }, [country, items]);

  useEffect(() => {
    if (!items || items.length === 0) {
      setLoading(false);
      return;
    }

    let isCancelled = false;
    const now = Date.now();
    const missingItems: DeliveryEstimateItemInput[] = [];
    const resultMap = new Map<string, DeliveryEstimateItemResult>();

    // 1. Check local cache
    for (const it of items) {
      const cacheKey = `${country}:${it.productId}:${it.variantSku || ''}`;
      const cached = estimatesCache.get(cacheKey);
      if (cached && (now - cached.timestamp < CACHE_TTL)) {
        resultMap.set(it.productId, cached.data);
      } else {
        missingItems.push(it);
      }
    }

    // If all items are cached, return immediately
    if (missingItems.length === 0) {
      setEstimates(resultMap);
      setLoading(false);
      return;
    }

    // 2. Fetch missing items in a single batch request
    setLoading(true);

    fetch('/api/delivery/estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country,
        items: missingItems
      })
    })
      .then(res => res.json())
      .then(data => {
        if (isCancelled) return;
        if (data.success && Array.isArray(data.items)) {
          for (const itemResult of data.items) {
            const cacheKey = `${country}:${itemResult.productId}:${itemResult.variantSku || ''}`;
            estimatesCache.set(cacheKey, { data: itemResult, timestamp: Date.now() });
            resultMap.set(itemResult.productId, itemResult);
          }
          if (data.overallLatestDate) {
            setOverallLatestDate(data.overallLatestDate);
          }
          if (data.overallLatestFormatted) {
            setOverallLatestFormatted(data.overallLatestFormatted);
          }
        }
        setEstimates(new Map(resultMap));
        setLoading(false);
      })
      .catch(err => {
        if (isCancelled) return;
        console.warn('[useDeliveryEstimates] API fetch error:', err);
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [itemsKey, country]);

  return {
    estimates,
    loading,
    overallLatestDate,
    overallLatestFormatted
  };
}
