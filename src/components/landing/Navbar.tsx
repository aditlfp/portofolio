'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppIcon from '@/components/ui/AppIcon';

export default function Navbar({ profile }: { profile: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const nextScrolled = window.scrollY > 50;
      setIsScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <div className="fixed top-0 z-50 flex w-full justify-center p-2 sm:p-4 transition-all duration-300">
      <nav className={`glass-navbar w-full max-w-7xl rounded-[1.2rem] sm:rounded-[1.6rem] border px-3 py-2.5 sm:px-6 sm:py-4 transition-all duration-300 ${isScrolled ? 'border-white/16 shadow-[0_22px_60px_rgba(0,0,0,0.34)]' : 'border-white/10 shadow-[0_14px_36px_rgba(0,0,0,0.2)]'} flex items-center justify-between gap-2`}>
        <div className="text-[11px] sm:text-xl font-black uppercase tracking-[0.08em] text-slate-100 font-headline truncate max-w-[calc(100%-44px)] sm:max-w-none">
          <span className="glass-navbar-title">
            {profile?.name || 'Executive'} Portfolio
          </span>
        </div>

        <div className="hidden md:flex items-center gap-x-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">
          <Link href="#hero" className="glass-nav-link rounded-full px-4 py-2 text-slate-200 font-headline font-bold tracking-tight">About</Link>
          <Link href="#projects" className="glass-nav-link rounded-full px-4 py-2 text-slate-200 font-headline font-bold tracking-tight">Projects</Link>
          <Link href="#contact" className="glass-nav-link rounded-full px-4 py-2 text-slate-200 font-headline font-bold tracking-tight">Contact</Link>
        </div>

        <div className="hidden sm:block">
          <button className="glass-cta button-hover px-4 py-2 sm:px-6 sm:py-2.5 rounded-[1rem] font-headline font-bold text-xs sm:text-sm tracking-tight text-white active:scale-95 transition-all duration-300">
            Hire Me
          </button>
        </div>

        <button
          type="button"
          className="sm:hidden p-1.5 rounded-lg bg-white/5 border border-white/10 text-white"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
        >
          <AppIcon name="menu" />
        </button>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] sm:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-xs bg-surface-container-low border-l border-outline-variant/20 p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-headline font-bold uppercase tracking-wider text-on-surface">Navigation</span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg bg-surface-container-high text-on-surface"
                aria-label="Close menu"
              >
                <AppIcon name="close" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="#hero" onClick={() => setIsMenuOpen(false)} className="rounded-xl px-4 py-3 bg-surface-container-high text-on-surface font-bold">About</Link>
              <Link href="#projects" onClick={() => setIsMenuOpen(false)} className="rounded-xl px-4 py-3 bg-surface-container-high text-on-surface font-bold">Projects</Link>
              <Link href="#contact" onClick={() => setIsMenuOpen(false)} className="rounded-xl px-4 py-3 bg-surface-container-high text-on-surface font-bold">Contact</Link>
            </div>
            <button className="indigo-gradient-bg text-white w-full py-3 rounded-xl font-bold">Hire Me</button>
          </div>
        </div>
      )}
    </div>
  );
}
