import { cacheLife, cacheTag, revalidateTag } from 'next/cache';

import {
  getCertificates,
  getProfile,
  getProjectByIdOrSlug,
  getProjects,
  getExperience,
  getSections,
  getSettings,
  getTechStack,
} from '@/lib/db';

export const PUBLIC_CONTENT_TAG = 'public-content';
export const SETTINGS_TAG = 'site-settings';
export const HOME_PAGE_TAG = 'home-page';
export const PROJECTS_TAG = 'projects';

const DEFAULT_SETTINGS = {
  theme_mode: 'dark',
  primary_color: '#c3c0ff',
};

export async function getCachedSiteSettings() {
  'use cache';

  cacheLife('hours');
  cacheTag(PUBLIC_CONTENT_TAG, SETTINGS_TAG);

  try {
    return await getSettings();
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getCachedHomePageData() {
  'use cache';

  cacheLife('hours');
  cacheTag(PUBLIC_CONTENT_TAG, HOME_PAGE_TAG, PROJECTS_TAG);

  const [profile, sections, techStack, projects, experience, certificates] = await Promise.all([
    getProfile(),
    getSections(),
    getTechStack(),
    getProjects('public'),
    getExperience(),
    getCertificates(),
  ]);

  return { profile, sections, techStack, projects, experience, certificates };
}

export async function getCachedProjectPageData(slug: string) {
  'use cache';

  cacheLife('hours');
  cacheTag(PUBLIC_CONTENT_TAG, PROJECTS_TAG);

  const [project, profile] = await Promise.all([getProjectByIdOrSlug(slug), getProfile()]);
  return { project, profile };
}

export async function getCachedPublicProjects() {
  'use cache';

  cacheLife('hours');
  cacheTag(PUBLIC_CONTENT_TAG, PROJECTS_TAG);

  return await getProjects('public');
}

export function revalidatePublicSiteCache() {
  revalidateTag(PUBLIC_CONTENT_TAG, 'max');
}
