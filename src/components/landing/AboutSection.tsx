'use client';

import { useId } from 'react';
import { resolveLocalizedField, useLandingI18n } from '@/lib/landing-i18n';

interface AboutProfile {
  avatar?: string | null;
  [key: string]: unknown;
}

export default function AboutSection({ profile }: { profile: AboutProfile | null | undefined }) {
  const blobId = useId();
  const blobPath = 'M57.7,-64.2C74,-55,85.9,-36.2,84.7,-18.6C83.4,-1,68.9,15.2,58.1,33C47.2,50.9,39.9,70.4,25.8,79.1C11.6,87.8,-9.4,85.8,-27.3,78C-45.2,70.2,-60,56.7,-68.3,40.4C-76.7,24,-78.7,4.9,-75.2,-13C-71.8,-31,-62.9,-47.7,-49.5,-57.4C-36,-67,-18,-69.6,1.3,-71.2C20.7,-72.8,41.4,-73.4,57.7,-64.2Z';
  const { lang, text } = useLandingI18n();
  const activeLang = lang as 'en' | 'id';
  const name = resolveLocalizedField(profile, 'name', activeLang, 'Professional');
  const title = resolveLocalizedField(profile, 'title', activeLang, 'Full Stack Developer');
  const bio = resolveLocalizedField(profile, 'bio', activeLang, text.hero.fallbackBio);
  const location = resolveLocalizedField(profile, 'location', activeLang, '-');
  const avatarSrc =
    profile?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop';

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-14 sm:py-20" id="about">
      <div className="space-y-10">
        <div>
          <p className="text-primary font-label text-xs uppercase tracking-[0.2em] font-semibold mb-3">{text.about.kicker}</p>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-on-surface">{text.about.title}</h2>
        </div>

        <div className="editorial-grid gap-8 sm:gap-12 items-center">
          <div className="col-span-12 lg:col-span-5">
            <div className="relative mx-auto w-full max-w-sm">
              <div className="relative z-10 mx-auto h-[360px] w-[360px] sm:h-[420px] sm:w-[420px] drop-shadow-[0_24px_50px_rgba(0,0,0,0.42)]">
                <svg
                  viewBox="0 0 200 200"
                  role="img"
                  aria-label={`${name} Portrait`}
                  className="h-full w-full"
                >
                  <defs>
                    <clipPath id={blobId} clipPathUnits="userSpaceOnUse">
                      <path d={blobPath} transform="translate(100 100)" />
                    </clipPath>
                  </defs>
                  <path
                    fill="#666de0"
                    d={blobPath}
                    transform="translate(100 100)"
                  />
                  <image
                    transform="translate(0,-6)"
                    href={avatarSrc}
                    width="200"
                    height="200"
                    preserveAspectRatio="xMidYMin slice"
                    clipPath={`url(#${blobId})`}
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7 space-y-5">
            <p className="text-lg sm:text-xl font-headline font-bold text-on-surface">{name} - {title}</p>
            <p className="text-on-surface-variant leading-relaxed">{bio}</p>
            <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">{text.about.locationLabel}: <span className="text-on-surface">{location}</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}
