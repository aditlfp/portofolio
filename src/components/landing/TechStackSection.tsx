'use client';

import AppIcon from '@/components/ui/AppIcon';
import { resolveTechIconHoverColor } from '@/lib/icon-registry';
import { resolveLocalizedField, useLandingI18n } from '@/lib/landing-i18n';

interface TechStackItem {
  id?: string | number;
  icon?: string | null;
  [key: string]: unknown;
}

export default function TechStackSection({ techStack }: { techStack: TechStackItem[] }) {
  const { lang, text } = useLandingI18n();

  return (
    <section className="bg-surface-container-low py-14 sm:py-24" id="tech-stack">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight">
              {text.tech.title.split(' ')[0]} <span className="text-primary">{text.tech.title.split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-on-surface-variant max-w-md">
              {text.tech.desc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {techStack.map((item) => {
            const displayName = resolveLocalizedField(item, 'name', lang, 'Stack');
            return (
            <div
              key={item.id ?? displayName}
              className="bg-surface-container-high p-8 rounded-2xl flex flex-col items-center justify-center gap-4 transition-transform duration-300 hover:-translate-y-1 hover:bg-surface-container-highest group cursor-pointer"
              style={{ '--tech-hover-color': resolveTechIconHoverColor(item.icon) } as Record<string, string>}
            >
              <AppIcon name={item.icon || 'terminal'} className="text-4xl text-primary transition-transform duration-300 group-hover:scale-110 group-hover:text-[var(--tech-hover-color)]" />
              <span className="font-label text-sm font-semibold tracking-wide uppercase">{displayName}</span>
            </div>
          )})}

          {techStack.length === 0 && (
            <div className="col-span-full py-12 text-center text-on-surface-variant italic">
              {text.tech.empty}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
