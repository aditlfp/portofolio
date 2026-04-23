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

const toNarrativeHtml = (content: string) => {
  if (!content.trim()) return '';
  if (hasHtmlTags(content)) return content;
  return content
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
  const longDescription = resolveLocalizedField(project, 'long_description', lang, text.projectDetail.noDetail);
  const longDescriptionHtml = toNarrativeHtml(longDescription);
  const category = resolveLocalizedField(project, 'category', lang, text.projectDetail.portfolio);
  const gallery = asStringArray(parseFlexibleJson<unknown>(project.gallery, []));
  const [activeSlide, setActiveSlide] = useState(0);
  const techStackRaw = asStringArray(parseFlexibleJson<unknown>(project.tech_stack, []));
  const stats = asStatsObject(parseFlexibleJson<unknown>(project.stats, {}));
  const createdYear = project.created_at ? new Date(project.created_at).getFullYear() : null;
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
    <div className="animate-fade-in">
      {/* Hero Section: Immersive Imagery */}
      <section className="relative w-full min-h-[360px] h-[52vh] md:h-[68vh] px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="w-full h-full rounded-xl overflow-hidden relative group">
          <Image 
            src={project.hero_image || project.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop'} 
            alt={title}
            fill
            className="object-cover transform transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/55"></div>
          
          {/* Floating Back Button */}
          <Link href="/#projects" className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center space-x-2 text-on-surface bg-surface-container-high/40 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full hover:bg-surface-container-high transition-all">
            <AppIcon name="arrowBack" />
            <span className="font-label text-xs uppercase tracking-widest font-medium">{text.projectDetail.allProjects}</span>
          </Link>
        </div>
      </section>

      {/* Project Narrative Section */}
      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="editorial-grid gap-12">
          {/* Left Column: Title & Intro */}
          <div className="col-span-12 md:col-span-7">
            <header className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <span className="px-3 py-1 bg-primary-container/20 text-primary border border-primary/20 rounded-full font-label text-[10px] uppercase tracking-[0.1em] font-bold">
                  {category}
                </span>
                <span className="text-slate-500 font-label text-[10px] uppercase tracking-[0.1em]">
                  {createdYear ? `${createdYear} ${text.projectDetail.project}` : text.projectDetail.project}
                </span>
              </div>
              <h1 className="font-headline text-3xl sm:text-5xl md:text-7xl font-extrabold text-slate-100 tracking-tighter leading-none mb-8">
                {title.split(' ')[0]} <span className="text-primary italic">{title.split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="font-body text-base sm:text-xl text-on-surface-variant leading-relaxed max-w-2xl">
                {description}
              </p>
            </header>

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
                      <button
                        type="button"
                        onClick={prevSlide}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-md hover:bg-black/70"
                        aria-label="Previous image"
                      >
                        <AppIcon name="arrowBack" />
                      </button>
                      <button
                        type="button"
                        onClick={nextSlide}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-md hover:bg-black/70"
                        aria-label="Next image"
                      >
                        <AppIcon name="arrowForward" />
                      </button>
                    </>
                  )}
                </div>

                {carouselImages.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {carouselImages.map((img, index) => (
                      <button
                        key={`${img}-${index}`}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md ring-2 transition-all ${
                          index === activeSlide ? 'ring-primary' : 'ring-transparent'
                        }`}
                        aria-label={`Open image ${index + 1}`}
                      >
                        <Image src={img} alt={`${title} thumbnail ${index + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div
              className="space-y-8 font-body text-slate-300 leading-relaxed text-base sm:text-lg [&_a]:text-primary [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_li]:ml-6 [&_ol]:my-4 [&_ol]:list-decimal [&_p]:mb-5 [&_ul]:my-4 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: longDescriptionHtml }}
            />

            {/* Call to Action */}
            <div className="mt-12 flex flex-wrap gap-6 items-center">
              {project.live_url && (
                <a 
                  href={project.live_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#666de0] text-on-primary w-full sm:w-auto px-6 sm:px-10 py-4 rounded-xl font-bold font-headline text-base sm:text-lg tracking-tight transition-all duration-300 hover:bg-[#757be3] hover:shadow-[0_10px_30px_rgba(79,70,229,0.3)] flex items-center justify-center space-x-3 active:scale-95"
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
                  className="bg-surface-container-high text-primary w-full sm:w-auto px-6 sm:px-10 py-4 rounded-xl font-bold font-headline text-base sm:text-lg tracking-tight transition-all duration-300 hover:bg-surface-container-highest flex items-center justify-center space-x-3 active:scale-95"
                >
                  <AppIcon name="code" />
                  <span>{text.projectDetail.repo}</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Tech Stack & Specs */}
          <aside className="col-span-12 md:col-span-4 md:col-start-9">
            <div className="space-y-8 md:space-y-12 md:sticky md:top-32">
              {/* Tech Stack Bento Card */}
              <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 shadow-2xl">
                <h3 className="font-headline text-sm uppercase tracking-[0.2em] text-slate-500 mb-8 font-bold">{text.projectDetail.technologies}</h3>
                <div className="flex flex-wrap gap-3">
                  {techStack.map((tech, i) => (
                    <div key={i} className="bg-surface-container-high px-4 py-3 rounded-lg flex items-center space-x-3 group hover:border-primary/40 border border-transparent transition-all">
                      <AppIcon name="terminal" className="text-xl text-primary" />
                      <span className="font-body text-sm font-medium text-slate-200">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats/Metadata */}
                <div className="grid grid-cols-2 gap-4">
                {Object.entries(stats).map(([label, value], i) => (
                  <div key={i} className="bg-surface-container-lowest p-6 rounded-2xl">
                    <p className="font-label text-[10px] uppercase tracking-widest text-slate-500 mb-1">{label}</p>
                    <p className="font-headline text-2xl font-bold text-primary">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* Scroll Indicator Anchor */}
      <div className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 w-[1px] h-32 bg-outline-variant/30">
        <div className="w-full h-1/2 bg-primary"></div>
      </div>
    </div>
  );
}
