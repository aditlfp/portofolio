'use client';

import React, { Suspense, useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { Toaster } from 'react-hot-toast';
import AppIcon from '@/components/ui/AppIcon';

function AdminChromeFallback() {
  return (
    <div className="rounded-2xl bg-surface-container-low p-4 ring-1 ring-outline-variant/10 shimmer min-h-16" />
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Suspense fallback={<div className="hidden lg:block lg:w-64 bg-surface-container-lowest" />}>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </Suspense>
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 lg:ml-64 bg-surface min-h-screen pb-20 transition-all duration-300 overflow-x-hidden">
        <div className="lg:hidden p-4 sticky top-0 bg-surface/80 backdrop-blur-md z-20 flex justify-between items-center border-b border-outline-variant/10">
          <span className="font-headline font-bold text-primary">Portfolio Admin</span>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg bg-surface-container-high text-on-surface"
          >
            <AppIcon name="menu" />
          </button>
        </div>
        <Suspense fallback={<div className="px-4 sm:px-6 lg:px-12 pt-6"><AdminChromeFallback /></div>}>
          <Header />
        </Suspense>
        <div className="px-4 sm:px-6 lg:px-12">
          <Suspense fallback={<div className="mt-8 h-64 rounded-3xl bg-surface-container-low shimmer" />}>
            {children}
          </Suspense>
        </div>
      </main>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'bg-surface-container-high text-on-surface ring-1 ring-outline-variant/10 font-label font-bold text-sm',
          duration: 4000,
        }}
      />
    </div>
  );
}
