'use client';

import Image from 'next/image';
import Link from 'next/link';
import AppIcon from '@/components/ui/AppIcon';
import { TbBrandLaravel } from 'react-icons/tb';
import { resolveLocalizedField, useLandingI18n } from '@/lib/landing-i18n';

interface HeroProfile {
  avatar?: string | null;
  [key: string]: unknown;
}

export default function HeroSection({ profile }: { profile: HeroProfile | null | undefined }) {
  const { lang, text } = useLandingI18n();
  const profileName = resolveLocalizedField(profile, 'name', lang, 'Professional');
  const yearsExperience = resolveLocalizedField(profile, 'years_experience', lang, '8+ Years');

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in" id="hero">
      <div className="editorial-grid gap-8 sm:gap-12 items-center text-center lg:text-left">
        <div className="col-span-12 lg:col-span-7 space-y-6 sm:space-y-8 flex flex-col items-center lg:items-start">
          <div className="space-y-3 sm:space-y-4">
            <span className="text-primary font-label text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold">
              {text.hero.available}
            </span>
            <h1 className="text-[42px] leading-[0.94] sm:text-5xl md:text-7xl font-headline font-extrabold tracking-tight text-on-background">
              {text.hero.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6">
            <Link
              href="#projects"
              className="indigo-gradient-bg text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95 text-sm sm:text-base"
            >
              {text.hero.cta}
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center">
                  <TbBrandLaravel className="text-sm text-primary" />
                </div>
              </div>
              <span className="text-xs sm:text-sm font-label text-on-surface-variant">{text.hero.expert}</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="relative max-w-md mx-auto lg:max-w-none">
            <div className="aspect-square w-full relative">
              <svg
                viewBox="0 0 200 200"
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[118%] w-[118%] -translate-x-1/2 -translate-y-1/2 text-primary/55"
              >
                <path
                  fill="#666de0"
                  d="M65.2,-51.1C79.1,-34.6,81.1,-7.8,75.1,16.7C69.2,41.1,55.2,63.3,35.3,72.5C15.5,81.7,-10.1,78,-31.9,67.1C-53.8,56.3,-71.8,38.4,-76.3,17.7C-80.8,-3.1,-71.9,-26.6,-56.9,-43.4C-41.9,-60.1,-21,-70.1,2.4,-72C25.7,-73.9,51.4,-67.6,65.2,-51.1Z"
                  transform="translate(100 100)"
                />
              </svg>
              <Image
                src={profile?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop'}
                alt={`${profileName} Portrait`}
                fill
                className="object-contain object-bottom p-3 sm:p-4"
                sizes="(max-width: 768px) 100vw, 500px"
                fetchPriority="high"
                priority
              />
            </div>
            <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-surface-container-high p-3 sm:p-6 rounded-2xl shadow-xl shadow-blue-500/10 ring-1 ring-outline-variant/10 z-40">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 bg-primary-container/20 rounded-lg">
                  <AppIcon name="sparkles" className="text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-base sm:text-xl font-bold font-headline">{yearsExperience}</div>
                  <div className="text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider">{text.hero.experience}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
