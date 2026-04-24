'use client';

import { resolveLocalizedField, useLandingI18n } from '@/lib/landing-i18n';

interface ExperienceItem {
  id?: string | number;
  [key: string]: unknown;
}

const hasHtmlTags = (content: string) => /<\/?[a-z][\s\S]*>/i.test(content);

const escapeHtml = (content: string) =>
  content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toNarrativeHtml = (content: string) => {
  if (!content.trim()) return '';
  if (hasHtmlTags(content)) return content;

  return content
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
};

const sanitizeHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, '')
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*("|')\s*javascript:[^"']*("|')/gi, 'href="#"');

export default function ExperienceSection({ experience }: { experience: ExperienceItem[] }) {
  const { lang, text } = useLandingI18n();
  const activeLang = lang as 'en' | 'id';

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-14 sm:py-20" id="experience">
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-primary font-label text-xs uppercase tracking-[0.2em] font-semibold">{text.experience.kicker}</p>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-on-surface">{text.experience.title}</h2>
        </div>

        {experience.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/20 p-8 text-center text-on-surface-variant italic">
            {text.experience.empty}
          </div>
        ) : (
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1 bottom-1 z-10 w-[2px] -translate-x-1/2 bg-gradient-to-b from-primary/80 via-primary/55 to-primary/80 shadow-[0_0_18px_rgba(138,63,252,0.45)] md:left-1/2" />

            <div className="space-y-8">
              {experience.map((item, index) => {
                const role = resolveLocalizedField(item, 'role', activeLang, '-');
                const company = resolveLocalizedField(item, 'company', activeLang, '-');
                const period = resolveLocalizedField(item, 'period', activeLang, '-');
                const location = resolveLocalizedField(item, 'location', activeLang, '-');
                const description = resolveLocalizedField(item, 'description', activeLang, '');
                const descriptionHtml = sanitizeHtml(toNarrativeHtml(description));
                const isRight = index % 2 === 0;

                return (
                  <div key={item.id} className="relative md:grid md:grid-cols-2 md:gap-10">
                    <div
                      className={`pl-12 md:pl-0 ${
                        isRight ? 'md:col-start-2 md:pr-0 md:pl-8' : 'md:col-start-1 md:pr-8 md:pl-0'
                      }`}
                    >
                      <article className="rounded-2xl bg-surface-container-low p-5 sm:p-6 ring-1 ring-outline-variant/15 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-surface-container-high px-2 py-1 text-[11px] font-label uppercase tracking-wider text-on-surface-variant">
                            {period}
                          </span>
                          <span className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                            {company}
                          </span>
                        </div>
                        <h3 className="font-headline text-lg font-bold text-on-surface">{role}</h3>
                        <p className="mt-1 text-xs font-label uppercase tracking-wider text-on-surface-variant">{location}</p>
                        {descriptionHtml ? (
                          <div
                            className="mt-4 text-sm leading-relaxed text-on-surface-variant [&_a]:text-primary [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_li]:ml-5 [&_ol]:my-3 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:my-3 [&_ul]:list-disc"
                            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                          />
                        ) : null}
                      </article>
                    </div>

                    <div className="pointer-events-none absolute left-4 top-6 z-20 -translate-x-1/2 md:left-1/2 md:top-7">
                      <div className="relative h-3.5 w-3.5">
                        <span className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/45 animate-ping" />
                        <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/45 animate-ping [animation-duration:1.6s]" />
                        <span className="relative block h-3.5 w-3.5 rounded-full bg-primary ring-4 ring-primary/30 shadow-[0_0_12px_rgba(138,63,252,0.55)]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
