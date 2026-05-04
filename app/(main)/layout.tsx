'use client';
import { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { Toaster } from 'react-hot-toast';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomCursor />
      <AnnouncementBanner />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#111', color: '#e5e5e5', border: '1px solid #1a1a1a' },
          duration: 4000,
        }}
      />
    </>
  );
}
