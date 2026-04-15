'use client';

import { useLandingI18n } from '@/lib/landing-i18n';

export default function LandingLanguageDock() {
  const { lang, changeLang, text } = useLandingI18n();

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <>
      <div className="fixed right-4 top-20 z-[80] hidden md:flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.06] px-2 py-1 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
        <button
          type="button"
          onClick={() => changeLang('en')}
          className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
            lang === 'en' ? 'bg-white/18 text-on-surface ring-1 ring-white/25' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => changeLang('id')}
          className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
            lang === 'id' ? 'bg-white/18 text-on-surface ring-1 ring-white/25' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          ID
        </button>
      </div>

      <button
        type="button"
        onClick={scrollToContact}
        className="fixed bottom-5 right-4 z-40 rounded-full border border-white/15 bg-white/[0.08] px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-white/[0.13] active:scale-[0.97]"
      >
        {text.floating.contact}
      </button>
    </>
  );
}
