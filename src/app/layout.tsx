import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import AppShell from '@/components/AppShell';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import { organization, website } from '@/lib/schema';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.BING_SITE_VERIFICATION;
const verification = (googleVerification || bingVerification)
  ? {
      ...(googleVerification ? { google: googleVerification } : {}),
      ...(bingVerification ? { other: { 'msvalidate.01': bingVerification } } : {}),
    }
  : undefined;

export const metadata: Metadata = {
  title: 'Nutrition Sportive & Protéines en Suisse | NutriFitness.ch',
  description: 'Boutique de nutrition sportive en Suisse et en ligne. Protéines whey, créatine Creapure®, pré-workout. 100% stock en Suisse, livraison 1-2 jours offerte dès 75 CHF ou retrait Click & Collect.',
  metadataBase: new URL('https://nutrifitness.ch'),
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'NutriFitness.ch — Nutrition Sportive Suisse',
    description: 'Protéines whey, créatine Creapure®, pré-workouts et vitamines certifiées. Stock 100% en Suisse et livraison 1-2 jours.',
    siteName: 'NutriFitness.ch',
    locale: 'fr_CH',
    type: 'website',
    images: ['https://nutrifitness.ch/images/brand/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NutriFitness.ch — Nutrition Sportive Suisse',
    description: 'Protéines whey, créatine Creapure®, pré-workouts et vitamines certifiées. Stock 100% en Suisse et livraison 1-2 jours.',
    images: ['https://nutrifitness.ch/images/brand/logo.png'],
  },
  robots: process.env.VERCEL_ENV === 'preview'
    ? { index: false, follow: false }
    : { index: true, follow: true },
  ...(verification ? { verification } : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = organization();
  const webSchema = website();

  return (
    <html lang="fr-CH" className="dark">
      <head>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Condensed:wght@700;900&family=Unbounded:wght@400;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([orgSchema, webSchema]),
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-[#0A0A0A] text-white antialiased">
        {/* Google Tag Manager (noscript fallback for non-JS clients) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PN4QDH2B"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <GoogleAnalytics />
        <StoreProvider>
          <AppShell>
            {children}
          </AppShell>
          <CookieConsentBanner />
        </StoreProvider>
      </body>
    </html>
  );
}
