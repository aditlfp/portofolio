'use client';

import { resolveLocalizedField, useLandingI18n } from '@/lib/landing-i18n';
const CURRENT_YEAR = new Date().getFullYear();

interface FooterProfile {
  [key: string]: unknown;
}

export default function Footer({ profile }: { profile: FooterProfile | null | undefined }) {
  const { lang, text } = useLandingI18n();
  const displayName = resolveLocalizedField(profile, 'name', lang, 'Executive');

  return (
    <footer className="bg-surface border-t border-slate-800/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-7xl mx-auto gap-8">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-primary font-headline font-bold tracking-[0.2em] uppercase text-xs">{text.footer.tagline}</div>
          <p className="text-slate-600 text-xs uppercase tracking-[0.05em] font-body">
            &copy; {CURRENT_YEAR} {displayName} {text.footer.copyright}
          </p>
        </div>

        <div className="flex gap-8">
          <a href="https://www.linkedin.com/in/aditya-budi-103bb92a8/" target="_blank" className="text-slate-600 hover:text-primary transition-colors text-xs uppercase tracking-[0.05em] font-body underline-offset-4 hover:underline">LinkedIn</a>
          <a href="https://github.com/aditlfp" target="_blank" className="text-slate-600 hover:text-primary transition-colors text-xs uppercase tracking-[0.05em] font-body underline-offset-4 hover:underline">GitHub</a>
          <a href="https://fastwork.id/user/adityabudi?source=web_marketplace_profile-menu_profile" target="_blank" className="text-slate-600 hover:text-primary transition-colors text-xs uppercase tracking-[0.05em] font-body underline-offset-4 hover:underline">FastWork</a>
        </div>
      </div>
    </footer>
  );
}
