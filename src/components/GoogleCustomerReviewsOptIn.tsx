'use client';

import React, { useEffect, useMemo } from 'react';
import Script from 'next/script';

interface GoogleCustomerReviewsOptInProps {
  orderId: string;
  email: string;
  deliveryCountry?: string;
  estimatedDeliveryDate?: string;
  products?: Array<{ gtin?: string }>;
}

declare global {
  interface Window {
    gapi?: any;
    renderOptIn?: () => void;
  }
}

export default function GoogleCustomerReviewsOptIn({
  orderId,
  email,
  deliveryCountry = 'CH',
  estimatedDeliveryDate,
  products = [],
}: GoogleCustomerReviewsOptInProps) {
  const merchantId = process.env.NEXT_PUBLIC_MERCHANT_CENTER_ID || '5859141493';

  // Format delivery date to YYYY-MM-DD
  const deliveryDate = useMemo(() => {
    if (estimatedDeliveryDate && /^\d{4}-\d{2}-\d{2}$/.test(estimatedDeliveryDate)) {
      return estimatedDeliveryDate;
    }
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }, [estimatedDeliveryDate]);

  const validProducts = useMemo(() => {
    return (products || [])
      .filter(p => p && p.gtin && typeof p.gtin === 'string' && p.gtin.trim().length > 0)
      .map(p => ({ gtin: p.gtin!.trim() }));
  }, [products]);

  useEffect(() => {
    window.renderOptIn = function () {
      if (typeof window !== 'undefined' && window.gapi && window.gapi.load) {
        window.gapi.load('surveyoptin', function () {
          if (window.gapi?.surveyoptin?.render) {
            const config: Record<string, any> = {
              merchant_id: Number(merchantId) || 5859141493,
              order_id: orderId,
              email: email,
              delivery_country: deliveryCountry || 'CH',
              estimated_delivery_date: deliveryDate,
            };

            if (validProducts.length > 0) {
              config.products = validProducts;
            }

            try {
              window.gapi.surveyoptin.render(config);
            } catch (err) {
              console.warn('[Google Customer Reviews] Render error:', err);
            }
          }
        });
      }
    };

    if (typeof window !== 'undefined' && window.gapi && window.gapi.load) {
      window.renderOptIn();
    }
  }, [merchantId, orderId, email, deliveryCountry, deliveryDate, validProducts]);

  return (
    <>
      <Script
        id="google-customer-reviews-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.renderOptIn = function() {
              if (window.gapi && window.gapi.load) {
                window.gapi.load('surveyoptin', function() {
                  if (window.gapi && window.gapi.surveyoptin) {
                    window.gapi.surveyoptin.render({
                      "merchant_id": ${Number(merchantId) || 5859141493},
                      "order_id": ${JSON.stringify(orderId)},
                      "email": ${JSON.stringify(email)},
                      "delivery_country": ${JSON.stringify(deliveryCountry || 'CH')},
                      "estimated_delivery_date": ${JSON.stringify(deliveryDate)}${
                        validProducts.length > 0
                          ? `, "products": ${JSON.stringify(validProducts)}`
                          : ''
                      }
                    });
                  }
                });
              }
            };
          `,
        }}
      />
      <Script
        id="google-customer-reviews-platform"
        src="https://apis.google.com/js/platform.js?onload=renderOptIn"
        strategy="afterInteractive"
      />
    </>
  );
}
