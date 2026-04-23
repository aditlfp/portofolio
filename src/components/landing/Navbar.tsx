'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppIcon from '@/components/ui/AppIcon';
import { resolveLocalizedField, useLandingI18n } from '@/lib/landing-i18n';

interface NavbarProfile {
  name?: string | null;
}

export default function Navbar({ profile }: { profile: NavbarProfile | null | undefined }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { lang, changeLang, text } = useLandingI18n();
  const displayName = resolveLocalizedField(profile as Record<string, unknown>, 'name', lang, 'Executive');

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
      <nav className={`glass-navbar backdrop-blur-sm w-full max-w-7xl rounded-[1.2rem] sm:rounded-[1.6rem] border px-3 py-2.5 sm:px-6 sm:py-4 transition-all duration-300 ${isScrolled ? 'border-white/16 shadow-[0_22px_60px_rgba(0,0,0,0.34)]' : 'border-white/10 shadow-[0_14px_36px_rgba(0,0,0,0.2)]'} flex items-center justify-between gap-2`}>
        <div className="text-[11px] sm:text-xl font-black uppercase tracking-[0.08em] text-slate-100 font-headline truncate max-w-[calc(100%-44px)] sm:max-w-none">
          <span className="glass-navbar-title">
            {displayName} {text.nav.portfolio}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-x-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">
          <Link href="#about" className="glass-nav-link rounded-full px-4 py-2 text-slate-200 font-headline font-bold tracking-tight">{text.nav.about}</Link>
          <Link href="#projects" className="glass-nav-link rounded-full px-4 py-2 text-slate-200 font-headline font-bold tracking-tight">{text.nav.projects}</Link>
          <Link href="#tech-stack" className="glass-nav-link rounded-full px-4 py-2 text-slate-200 font-headline font-bold tracking-tight">{text.nav.skills}</Link>
          <Link href="#experience" className="glass-nav-link rounded-full px-4 py-2 text-slate-200 font-headline font-bold tracking-tight">{text.nav.experience}</Link>
          <Link href="#contact" className="glass-nav-link rounded-full px-4 py-2 text-slate-200 font-headline font-bold tracking-tight">{text.nav.contact}</Link>
          
          <div className="relative inline-flex items-center gap-0 rounded-full border border-white/15 bg-white/[0.06] p-1 backdrop-blur-sm">
            <div 
              className={`absolute inset-1 rounded-full bg-white/18 transition-all duration-300 ease-out ${
                lang === 'en' ? 'translate-x-0' : 'translate-x-[calc(100%)]'
              }`}
              style={{
                width: 'calc(50% - 4px)',
              }}
            />
            
            <button
              type="button"
              onClick={() => changeLang('en')}
              className="relative z-10 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-200 transition-colors duration-300"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => changeLang('id')}
              className="relative z-10 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-200 transition-colors duration-300"
            >
              ID
            </button>
          </div>
        </div>

        <div className="hidden sm:block">
          <button className="glass-cta button-hover px-4 py-2 sm:px-6 sm:py-2.5 rounded-[1rem] font-headline font-bold text-xs sm:text-sm tracking-tight text-white active:scale-95 transition-all duration-300">
            {text.nav.hireMe}
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
              <span className="text-sm font-headline font-bold uppercase tracking-wider text-on-surface">{text.nav.navigation}</span>
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
              <Link href="#about" onClick={() => setIsMenuOpen(false)} className="rounded-xl px-4 py-3 bg-surface-container-high text-on-surface font-bold">{text.nav.about}</Link>
              <Link href="#projects" onClick={() => setIsMenuOpen(false)} className="rounded-xl px-4 py-3 bg-surface-container-high text-on-surface font-bold">{text.nav.projects}</Link>
              <Link href="#tech-stack" onClick={() => setIsMenuOpen(false)} className="rounded-xl px-4 py-3 bg-surface-container-high text-on-surface font-bold">{text.nav.skills}</Link>
              <Link href="#experience" onClick={() => setIsMenuOpen(false)} className="rounded-xl px-4 py-3 bg-surface-container-high text-on-surface font-bold">{text.nav.experience}</Link>
              <Link href="#contact" onClick={() => setIsMenuOpen(false)} className="rounded-xl px-4 py-3 bg-surface-container-high text-on-surface font-bold">{text.nav.contact}</Link>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-2 backdrop-blur-xl">
              <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{text.nav.language}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => changeLang('en')}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider ${lang === 'en' ? 'bg-white/18 text-on-surface ring-1 ring-white/25' : 'bg-surface-container-high text-on-surface'}`}
                >
                  {text.nav.english}
                </button>
                <button
                  type="button"
                  onClick={() => changeLang('id')}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider ${lang === 'id' ? 'bg-white/18 text-on-surface ring-1 ring-white/25' : 'bg-surface-container-high text-on-surface'}`}
                >
                  {text.nav.bahasa}
                </button>
              </div>
            </div>
            <button className="indigo-gradient-bg text-white w-full py-3 rounded-xl font-bold">{text.nav.hireMe}</button>
          </div>
        </div>
      )}
    </div>
  );
}
