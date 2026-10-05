'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export function applyLanguageTranslation(targetLang: 'fr' | 'de' | 'it' | 'en') {
  try {
    const hostname = window.location.hostname;
    const cookieDomain = hostname.includes('.') ? `.${hostname.split('.').slice(-2).join('.')}` : hostname;

    if (targetLang === 'fr') {
      // Clear translation cookies to restore pure native French
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = `googtrans=; path=/; domain=${hostname}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      document.cookie = `googtrans=; path=/; domain=${cookieDomain}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      document.cookie = 'googtrans=/fr/fr; path=/;';
      document.cookie = `googtrans=/fr/fr; path=/; domain=${cookieDomain};`;

      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select) {
        select.value = 'fr';
        select.dispatchEvent(new Event('change'));
      }
      window.location.reload();
      return;
    }

    // Set translation cookie for target language
    const transVal = `/fr/${targetLang}`;
    document.cookie = `googtrans=${transVal}; path=/;`;
    document.cookie = `googtrans=${transVal}; path=/; domain=${hostname};`;
    document.cookie = `googtrans=${transVal}; path=/; domain=${cookieDomain};`;

    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      select.value = targetLang;
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  } catch (err) {
    console.warn('Translation switch error:', err);
  }
}

export default function GoogleTranslate() {
  useEffect(() => {
    // Only load in browser
    if (typeof window === 'undefined') return;

    window.googleTranslateElementInit = () => {
      try {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'fr',
              includedLanguages: 'fr,de,it,en',
              autoDisplay: false,
              layout: window.google.translate.TranslateElement.InlineLayout?.SIMPLE,
            },
            'google_translate_element'
          );
        }
      } catch (e) {
        console.warn('Google translate init error:', e);
      }
    };

    // Load Google Translate script if not already added
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.async = true;
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div id="google_translate_element" style={{ display: 'none', position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
  );
}
