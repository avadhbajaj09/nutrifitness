'use client';

import React from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { isAdminPath } from '@/lib/tracking-exclusion';

export const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || 'GTM-PV57BJ6S';
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-PM7DDRRRRC';
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '467149266332568';

export default function GoogleAnalytics() {
  const pathname = usePathname();

  // If on an administrative or internal staff route, do not render tracking scripts
  if (isAdminPath(pathname)) {
    return null;
  }

  return (
    <>
      {/* 1. Google Consent Mode v2 & Tracking Governance (Guards against dev, admin, staff before loading) */}
      <Script
        id="google-consent-mode-v2-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;

            (function() {
              var host = (window.location.hostname || '').toLowerCase();
              var path = (window.location.pathname || '').toLowerCase();
              var search = (window.location.search || '').toLowerCase();

              // 1. Dev / preview / staging environment check
              var isDev = host === 'localhost' || host === '127.0.0.1' || host.indexOf('.local') !== -1 || host.indexOf('.internal') !== -1 || host.indexOf('vercel.app') !== -1;
              if (isDev) {
                console.log('[Tracking] GA4 and Meta Pixel disabled in development/preview environment (' + host + ')');
                window.__tracking_excluded = true;
                return;
              }

              // 2. Admin & staff pages check
              var adminPaths = ['/admin', '/wp-admin', '/mail', '/teamomar', '/maintenance'];
              for (var i = 0; i < adminPaths.length; i++) {
                if (path === adminPaths[i] || path.indexOf(adminPaths[i] + '/') === 0) {
                  console.log('[Tracking] GA4 and Meta Pixel disabled on admin page (' + path + ')');
                  window.__tracking_excluded = true;
                  return;
                }
              }

              // 3. Logged-in admin & staff check (localStorage, sessionStorage, cookies)
              var isStaff = false;
              try {
                var staffKeys = ['nf_admin_auth', 'nutrifitness_admin_auth', 'nutrifitness_omar_auth', 'teamomar_auth', 'nf_staff_session'];
                for (var j = 0; j < staffKeys.length; j++) {
                  var lVal = localStorage.getItem(staffKeys[j]);
                  var sVal = sessionStorage.getItem(staffKeys[j]);
                  if ((lVal && lVal !== 'false' && lVal !== 'null') || (sVal && sVal !== 'false' && sVal !== 'null')) {
                    isStaff = true; break;
                  }
                }
                if (!isStaff) {
                  var cookies = document.cookie || '';
                  if (cookies.indexOf('nf_maintenance_bypass=true') !== -1 || cookies.indexOf('nf_is_staff=true') !== -1 || cookies.indexOf('nf_admin_auth') !== -1) {
                    isStaff = true;
                  }
                }
                if (!isStaff && (search.indexOf('preview=nutrifit') !== -1 || search.indexOf('preview=marco') !== -1 || search.indexOf('preview=1201') !== -1 || search.indexOf('preview=active') !== -1)) {
                  isStaff = true;
                }
              } catch(e) {}

              if (isStaff) {
                console.log('[Tracking] GA4 and Meta Pixel disabled for logged-in administrator / staff');
                window.__tracking_excluded = true;
                try { document.cookie = 'nf_is_staff=true; path=/; max-age=2592000; SameSite=Lax'; } catch(e){}
                return;
              }

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
            })();
          `,
        }}
      />

      {/* 2. Google Analytics 4 (gtag.js) direct feed to G-PM7DDRRRRC */}
      <Script
        id="ga4-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="ga4-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if (!window.__tracking_excluded) {
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                send_page_view: true
              });
            }
          `,
        }}
      />

      {/* 3. Google Tag Manager Container (Loaded via next/script afterInteractive, guarded against exclusion) */}
      <Script
        id="gtm-loader"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if (!window.__tracking_excluded) {
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
            }
          `,
        }}
      />

      {/* 3. Meta Pixel (Loaded when marketing consent is granted, guarded against exclusion) */}
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if (!window.__tracking_excluded) {
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
                if (window.__meta_pixel_initialized || window.__tracking_excluded) return;
                window.__meta_pixel_initialized = true;
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              }

              if (parsed && parsed.marketing === true) {
                initMetaPixel();
              } else {
                window.addEventListener('nf_consent_updated', function(e) {
                  if (e.detail && e.detail.marketing && !window.__tracking_excluded) {
                    initMetaPixel();
                  }
                }, { once: true });
              }
            }
          `,
        }}
      />
    </>
  );
}
