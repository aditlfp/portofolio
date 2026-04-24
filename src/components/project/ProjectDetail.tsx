'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AppIcon from '@/components/ui/AppIcon';
import { resolveLocalizedArrayField, resolveLocalizedField, useLandingI18n } from '@/lib/landing-i18n';

const parseFlexibleJson = <T,>(value: unknown, fallback: T): T => {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
};

const hasHtmlTags = (content: string) => /<\/?[a-z][\s\S]*>/i.test(content);

const escapeHtml = (content: string) =>
  content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const decodeHtmlEntities = (content: string) =>
  content
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&');

const sanitizeRichHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, '')
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*("|')\s*javascript:[^"']*("|')/gi, 'href="#"');

const toNarrativeHtml = (content: string) => {
  if (!content.trim()) return '';
  const decoded = decodeHtmlEntities(content).trim();
  if (hasHtmlTags(decoded)) return sanitizeRichHtml(decoded);
  return decoded
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
};

const asStatsObject = (value: unknown): Record<string, string | number> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => typeof entry === 'string' || typeof entry === 'number')
  );
};

interface ProjectRecord {
  title?: string;
  thumbnail?: string | null;
  hero_image?: string | null;
  gallery?: unknown;
  tech_stack?: unknown;
  stats?: unknown;
  category?: string | null;
  description?: string | null;
  long_description?: string | null;
  live_url?: string | null;
  repo_url?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export default function ProjectDetail({ project }: { project: ProjectRecord; profile?: unknown }) {
  const { lang, text } = useLandingI18n();
  const title = resolveLocalizedField(project, 'title', lang, 'Untitled Project');
  const description = resolveLocalizedField(project, 'description', lang, '');
  const descriptionHtml = toNarrativeHtml(description);
  const longDescription = resolveLocalizedField(project, 'long_description', lang, text.projectDetail.noDetail);
  const longDescriptionHtml = toNarrativeHtml(longDescription);
  const category = resolveLocalizedField(project, 'category', lang, text.projectDetail.portfolio);
  const gallery = asStringArray(parseFlexibleJson<unknown>(project.gallery, []));
  const [activeSlide, setActiveSlide] = useState(0);
  const techStackRaw = asStringArray(parseFlexibleJson<unknown>(project.tech_stack, []));
  const stats = asStatsObject(parseFlexibleJson<unknown>(project.stats, {}));
  const createdYear = project.created_at ? new Date(project.created_at).getFullYear() : null;
  const titleParts = title.trim().split(/\s+/);
  const titleFirst = titleParts[0] || title;
  const titleRest = titleParts.slice(1).join(' ');
  const techStack =
    resolveLocalizedArrayField(project, 'tech_stack', lang).length > 0
      ? resolveLocalizedArrayField(project, 'tech_stack', lang)
      : techStackRaw;
  const carouselImages = useMemo(() => {
    const candidates = [
      ...gallery,
      typeof project.hero_image === 'string' ? project.hero_image : '',
      typeof project.thumbnail === 'string' ? project.thumbnail : '',
    ].filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    return Array.from(new Set(candidates));
  }, [gallery, project.hero_image, project.thumbnail]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="animate-fade-in max-w-full overflow-x-clip">

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      {/* FIX: Use dvh for better mobile viewport height, smaller on mobile */}
      <section className="relative w-full h-[40dvh] min-h-[220px] sm:h-[50dvh] sm:min-h-[280px] lg:h-[65dvh] lg:min-h-[380px] px-3 sm:px-6 lg:px-8 overflow-hidden">
        <div className="w-full h-full rounded-xl overflow-hidden relative group">
          <Image
            src={
              project.hero_image ||
              project.thumbnail ||
              'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop'
            }
            alt={title}
            fill
            className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/55" />

          {/* Back Button — min 44px touch target */}
          <Link
            href="/#projects"
            className="absolute top-3 left-3 sm:top-6 sm:left-6 flex items-center gap-2 text-on-surface bg-surface-container-high/40 backdrop-blur-md px-3 sm:px-4 min-h-[44px] rounded-full hover:bg-surface-container-high transition-all cursor-pointer max-w-[calc(100%-1.5rem)]"
          >
            <AppIcon name="arrowBack" className="shrink-0" />
            <span className="truncate font-label text-xs uppercase tracking-widest font-medium">
              {text.projectDetail.allProjects}
            </span>
          </Link>
        </div>
      </section>

      {/* ─── Project Narrative ────────────────────────────────────────────── */}
      <article className="max-w-7xl mx-auto overflow-x-hidden px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/*
          FIX: Switch two-column layout at `lg` (1024px) instead of `md` (768px).
          On tablets (768–1023px) content stacks vertically for better readability.
        */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">

          {/* ── Left Column: Title & Content ─────────────────────────── */}
          <div className="col-span-1 lg:col-span-7 min-w-0">
            <header className="mb-10 sm:mb-12">

              {/* Category + Year badges */}
              <div className="mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="px-3 py-1 bg-primary-container/20 text-primary border border-primary/20 rounded-full font-label text-[10px] uppercase tracking-[0.1em] font-bold">
                  {category}
                </span>
                <span className="text-slate-500 font-label text-[10px] uppercase tracking-[0.1em]">
                  {createdYear
                    ? `${createdYear} ${text.projectDetail.project}`
                    : text.projectDetail.project}
                </span>
              </div>

              {/* Title
                  FIX: Removed `md:text-7xl` that was overriding the clamp,
                  causing inconsistent size at tablet breakpoint.
                  clamp(1.8rem, 6vw, 3.4rem) scales smoothly across all viewports. */}
              <h1 className="max-w-full whitespace-normal [overflow-wrap:anywhere] break-words font-headline text-[clamp(1.8rem,6vw,3.4rem)] font-extrabold text-slate-100 tracking-tight leading-[0.95] mb-6 sm:mb-8">
                <span className="block max-w-full [overflow-wrap:anywhere]">{titleFirst}</span>{' '}
                {titleRest ? (
                  <span className="block max-w-full [overflow-wrap:anywhere] text-primary italic">
                    {titleRest}
                  </span>
                ) : null}
              </h1>

              {/* Description — FIX: Removed accidental `bg-red-500` debug class */}
              <div
                className="max-w-full whitespace-normal [overflow-wrap:anywhere] break-words font-body text-base sm:text-lg lg:text-xl text-on-surface-variant leading-relaxed [&_a]:break-all [&_a]:text-primary [&_a]:underline [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </header>

            {/* ── Carousel ─────────────────────────────────────────────── */}
            {carouselImages.length > 0 && (
              <div className="mb-10 rounded-2xl bg-surface-container-low p-3 sm:p-4 ring-1 ring-outline-variant/20">
                <div className="relative overflow-hidden rounded-xl aspect-[16/9] bg-surface-container-lowest">
                  <Image
                    src={carouselImages[activeSlide]}
                    alt={`${title} slide ${activeSlide + 1}`}
                    fill
                    className="object-cover"
                  />

                  {carouselImages.length > 1 && (
                    <>
                      {/* FIX: Ensure min 44x44px touch targets on carousel nav buttons */}
                      <button
                        type="button"
                        onClick={prevSlide}
                        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 min-w-[44px] min-h-[44px] flex items-center justify-center text-white backdrop-blur-md hover:bg-black/70 transition-colors cursor-pointer"
                        aria-label="Previous image"
                      >
                        <AppIcon name="arrowBack" />
                      </button>
                      <button
                        type="button"
                        onClick={nextSlide}
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 min-w-[44px] min-h-[44px] flex items-center justify-center text-white backdrop-blur-md hover:bg-black/70 transition-colors cursor-pointer"
                        aria-label="Next image"
                      >
                        <AppIcon name="arrowForward" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail strip */}
                {carouselImages.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {carouselImages.map((img, index) => (
                      <button
                        key={`${img}-${index}`}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        className={`relative h-14 sm:h-16 w-20 sm:w-24 shrink-0 overflow-hidden rounded-md ring-2 transition-all cursor-pointer ${
                          index === activeSlide ? 'ring-primary' : 'ring-transparent opacity-60 hover:opacity-100'
                        }`}
                        aria-label={`Open image ${index + 1}`}
                        aria-pressed={index === activeSlide}
                      >
                        <Image src={img} alt={`${title} thumbnail ${index + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Long Description */}
            <div
              className="min-w-0 break-words space-y-8 font-body text-slate-300 leading-relaxed text-base sm:text-lg [&_a]:break-all [&_a]:text-primary [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:sm:text-xl [&_h3]:font-bold [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_li]:ml-6 [&_ol]:my-4 [&_ol]:list-decimal [&_p]:mb-5 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:text-sm [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_td]:break-words [&_ul]:my-4 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: longDescriptionHtml }}
            />

            {/* ── CTA Buttons ──────────────────────────────────────────── */}
            <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#666de0] text-on-primary w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 min-h-[52px] rounded-xl font-bold font-headline text-base sm:text-lg tracking-tight transition-all duration-300 hover:bg-[#757be3] hover:shadow-[0_10px_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
                >
                  <span>{text.projectDetail.launch}</span>
                  <AppIcon name="externalLink" />
                </a>
              )}
              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-surface-container-high text-primary w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 min-h-[52px] rounded-xl font-bold font-headline text-base sm:text-lg tracking-tight transition-all duration-300 hover:bg-surface-container-highest flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
                >
                  <AppIcon name="code" />
                  <span>{text.projectDetail.repo}</span>
                </a>
              )}
            </div>
          </div>

          {/* ── Right Column: Tech Stack & Stats ─────────────────────── */}
          {/*
            FIX: On mobile/tablet (< lg) the aside renders below the main content
            naturally. Sticky only activates at lg+. Use col-start-9 only at lg
            to correctly position in the 12-col grid.
          */}
          <aside className="col-span-1 lg:col-span-4 lg:col-start-9 min-w-0">
            <div className="space-y-6 sm:space-y-8 lg:space-y-10 lg:sticky lg:top-28">

              {/* Tech Stack Bento Card */}
              {techStack.length > 0 && (
                <div className="bg-surface-container-low p-5 sm:p-6 lg:p-8 rounded-2xl border border-outline-variant/10 shadow-xl">
                  <h3 className="font-headline text-xs uppercase tracking-[0.2em] text-slate-500 mb-6 font-bold">
                    {text.projectDetail.technologies}
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {techStack.map((tech, i) => (
                      <div
                        key={i}
                        className="max-w-full bg-surface-container-high px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3 hover:border-primary/40 border border-transparent transition-all cursor-default"
                      >
                        <AppIcon name="terminal" className="text-base sm:text-xl text-primary shrink-0" />
                        <span className="font-body text-xs sm:text-sm font-medium text-slate-200 break-all">
                          {tech}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats / Metadata */}
              {Object.keys(stats).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 sm:gap-4">
                  {Object.entries(stats).map(([label, value], i) => (
                    <div key={i} className="min-w-0 bg-surface-container-lowest p-4 sm:p-5 lg:p-6 rounded-2xl">
                      <p className="font-label text-[10px] uppercase tracking-widest text-slate-500 mb-1 truncate">
                        {label}
                      </p>
                      <p className="break-words font-headline text-xl sm:text-2xl font-bold text-primary">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>

      {/* Scroll Indicator — desktop only, unchanged */}
      <div className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 w-[1px] h-32 bg-outline-variant/30">
        <div className="w-full h-1/2 bg-primary" />
      </div>
    </div>
  );
}
