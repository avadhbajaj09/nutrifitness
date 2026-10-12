'use client';

import React from 'react';
import Script from 'next/script';

const GTM_CONTAINER_ID = 'GTM-PN4QDH2B';

export default function GoogleAnalytics() {
  return (
    <>
      {/* 1. Google Consent Mode v2 (MUST execute before GTM loads) */}
      <Script
        id="google-consent-mode-v2-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;

            // Check existing first-party consent cookie
            var consentMatch = document.cookie.match(/(?:^|; )nf_consent=([^;]*)/);
            var parsed = null;
            if (consentMatch) {
              try { parsed = JSON.parse(decodeURIComponent(consentMatch[1])); } catch(e){}
            }

            // Google Consent Mode v2: default denied for all 4 storage categories
            gtag('consent', 'default', {
              'analytics_storage': (parsed && parsed.analytics) ? 'granted' : 'denied',
              'ad_storage': (parsed && parsed.marketing) ? 'granted' : 'denied',
              'ad_user_data': (parsed && parsed.marketing) ? 'granted' : 'denied',
              'ad_personalization': (parsed && parsed.marketing) ? 'granted' : 'denied',
              'wait_for_update': 500
            });
          `,
        }}
      />

      {/* 2. Google Tag Manager Container (Loaded via next/script afterInteractive) */}
      <Script
        id="gtm-loader"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
          `,
        }}
      />
    </>
  );
}
