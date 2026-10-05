import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import QuickViewModal from '@/components/QuickViewModal';
import SearchOverlay from '@/components/SearchOverlay';
import ToastContainer from '@/components/ToastContainer';
import ChatBot from '@/components/ChatBot';
import GoogleTranslate from '@/components/GoogleTranslate';
import { organization, website } from '@/lib/schema';

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
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([orgSchema, webSchema]),
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-[#0A0A0A] text-white antialiased">
        <StoreProvider>
          <TopBar />
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
            {children}
          </main>
          <Footer />

          {/* E-Commerce Overlays */}
          <CartDrawer />
          <QuickViewModal />
          <SearchOverlay />
          <ToastContainer />
          <ChatBot />
          <GoogleTranslate />
        </StoreProvider>
      </body>
    </html>
  );
}
