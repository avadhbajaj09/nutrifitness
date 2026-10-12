import type { Metadata } from 'next';
import { Inter, Unbounded, Roboto_Condensed } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import AppShell from '@/components/AppShell';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import { organization, website } from '@/lib/schema';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
});

const unbounded = Unbounded({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-unbounded',
  weight: ['400', '700', '800', '900'],
});

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-condensed',
  weight: ['700', '900'],
  style: ['normal', 'italic'],
});

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.BING_SITE_VERIFICATION;
const verification = (googleVerification || bingVerification)
  ? {
      ...(googleVerification ? { google: googleVerification } : {}),
      ...(bingVerification ? { other: { 'msvalidate.01': bingVerification } } : {}),
    }
  : undefined;

export const metadata: Metadata = {
  title: 'Nutrition Sportive & Protéines à Genève et en Suisse | NutriFitness.ch',
  description: 'Boutique de nutrition sportive à Genève et en ligne. Protéines whey, créatine Creapure®, pré-workout. 100% stock en Suisse, livraison 24h offerte dès 75 CHF ou retrait Rue des Pâquis.',
  metadataBase: new URL('https://nutrifitness.ch'),
  openGraph: {
    title: 'NutriFitness.ch — Nutrition Sportive Suisse',
    description: 'Protéines whey, créatine Creapure®, pré-workouts et vitamines certifiées. Stock 100% en Suisse et livraison 24h.',
    siteName: 'NutriFitness.ch',
    locale: 'fr_CH',
    type: 'website',
    images: ['https://nutrifitness.ch/images/brand/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NutriFitness.ch — Nutrition Sportive Suisse',
    description: 'Protéines whey, créatine Creapure®, pré-workouts et vitamines certifiées. Stock 100% en Suisse et livraison 24h.',
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
    <html lang="fr-CH" className={`dark ${inter.variable} ${unbounded.variable} ${robotoCondensed.variable}`}>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PV57BJ6S');`,
          }}
        />
        {/* End Google Tag Manager */}
        <meta name="google" content="notranslate" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([orgSchema, webSchema]),
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-[#0A0A0A] text-white antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PV57BJ6S"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
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
