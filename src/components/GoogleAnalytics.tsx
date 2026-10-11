'use client';

import React from 'react';
import Script from 'next/script';

export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!gaId || !gaId.trim()) {
    return null;
  }

  return (
    <>
      <Script
        id="ga4-consent-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;

            // Check existing first-party cookie
            var consentMatch = document.cookie.match(/(?:^|; )nf_consent=([^;]*)/);
            var parsed = null;
            if (consentMatch) {
              try { parsed = JSON.parse(decodeURIComponent(consentMatch[1])); } catch(e){}
            }

            // Google Consent Mode v2 defaults: all storage denied unless already granted
            gtag('consent', 'default', {
              'analytics_storage': (parsed && parsed.analytics) ? 'granted' : 'denied',
              'ad_storage': (parsed && parsed.marketing) ? 'granted' : 'denied',
              'ad_user_data': (parsed && parsed.marketing) ? 'granted' : 'denied',
              'ad_personalization': (parsed && parsed.marketing) ? 'granted' : 'denied',
              'wait_for_update': 500
            });
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              send_page_view: true
            });
          `,
        }}
      />
      <Script
        id="ga4-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
    </>
  );
}
