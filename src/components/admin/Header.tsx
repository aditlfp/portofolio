'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AppIcon from '@/components/ui/AppIcon';

export default function Header() {
  const pathname = usePathname();
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.includes('/projects')) return 'Projects';
    if (pathname.includes('/experience')) return 'Experience';
    if (pathname.includes('/sections')) return 'Layout Editor';
    if (pathname.includes('/certificates')) return 'Certificates';
    if (pathname.includes('/tech-stack')) return 'Tech Stack';
    if (pathname.includes('/profile')) return 'Profile';
    if (pathname.includes('/contact')) return 'Messages';
    return 'Admin';
  };

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8 flex flex-col sm:flex-row gap-4 sm:gap-3 justify-between sm:items-center border-b border-outline-variant/10">
      <div>
        <h2 className="font-headline font-extrabold text-2xl sm:text-3xl tracking-tight text-on-surface">{getPageTitle()}</h2>
        <p className="text-on-surface-variant font-body text-xs sm:text-sm mt-1">
          {pathname === '/admin' ? 'Welcome back. Management suite is ready.' : `Manage your ${getPageTitle().toLowerCase()} below.`}
        </p>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button className="bg-surface-container-high p-2 rounded-lg text-on-surface hover:text-primary transition-colors ring-1 ring-outline-variant/10">
          <AppIcon name="notifications" />
        </button>
        <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 flex-1 sm:flex-none">
          View Website
        </button>
      </div>
    </header>
  );
}
