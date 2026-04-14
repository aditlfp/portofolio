import { MetadataRoute } from 'next';
import { getCachedPublicProjects } from '@/lib/site-cache';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://portofolio.com';

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
  ];

  try {
    const projects = await getCachedPublicProjects();
    projects.forEach((p: any) => {
      routes.push({
        url: `${baseUrl}/projects/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      });
    });
  } catch (error) {
    // Graceful fallback if database fails
  }

  return routes;
}
