'use client';

import React from 'react';
import Script from 'next/script';

const GTM_CONTAINER_ID = 'GTM-PN4QDH2B';
export const GA_MEASUREMENT_ID = 'G-PM7DDRRRRC';
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '467149266332568';

export default function GoogleAnalytics() {
  return (
    <>
      {/* 1. Google Consent Mode v2 (MUST execute before GTM & GA4 load) */}
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

            // Google Consent Mode v2: default denied unless explicitly accepted
            gtag('consent', 'default', {
              'analytics_storage': (parsed && parsed.analytics === true) ? 'granted' : 'denied',
              'ad_storage': (parsed && parsed.marketing === true) ? 'granted' : 'denied',
              'ad_user_data': (parsed && parsed.marketing === true) ? 'granted' : 'denied',
              'ad_personalization': (parsed && parsed.marketing === true) ? 'granted' : 'denied',
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

      {/* 3. Meta Pixel (Loaded when marketing consent is granted) */}
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');

            var consentMatch = document.cookie.match(/(?:^|; )nf_consent=([^;]*)/);
            var parsed = null;
            if (consentMatch) {
              try { parsed = JSON.parse(decodeURIComponent(consentMatch[1])); } catch(e){}
            }

            function initMetaPixel() {
              if (window.__meta_pixel_initialized) return;
              window.__meta_pixel_initialized = true;
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            }

            if (parsed && parsed.marketing === true) {
              initMetaPixel();
            } else {
              window.addEventListener('nf_consent_updated', function(e) {
                if (e.detail && e.detail.marketing) {
                  initMetaPixel();
                }
              }, { once: true });
            }
          `,
        }}
      />
    </>
  );
}
