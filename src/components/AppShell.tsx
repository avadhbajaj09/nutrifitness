'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import QuickViewModal from '@/components/QuickViewModal';
import SearchOverlay from '@/components/SearchOverlay';
import ToastContainer from '@/components/ToastContainer';
import ChatBot from '@/components/ChatBot';
import GoogleTranslate from '@/components/GoogleTranslate';
import MobileBottomTabBar from '@/components/MobileBottomTabBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/wp-admin') || pathname?.startsWith('/admin') || pathname?.startsWith('/teamomar');
  const isMaintenance = pathname?.startsWith('/maintenance');

  useEffect(() => {
    if (isAdmin) {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    } else {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0A0A0A';
      document.body.style.color = '#F3F4F6';
    }
  }, [isAdmin]);

  if (isAdmin || isMaintenance) {
    return (
      <div className="min-h-screen w-full">
        {children}
      </div>
    );
  }

  const handleOpenCategories = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openMobileCategories'));
    }
  };

  return (
    <>
      <TopBar />
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 max-md:pb-[calc(56px+env(safe-area-inset-bottom,16px)+20px)]">
        {children}
      </main>
      <Footer />
      <MobileBottomTabBar onOpenCategories={handleOpenCategories} />
      <CartDrawer />
      <QuickViewModal />
      <SearchOverlay />
      <ToastContainer />
      <ChatBot />
      <GoogleTranslate />
    </>
  );
}
