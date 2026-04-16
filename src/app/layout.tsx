import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

import { generateThemeVars } from '@/lib/theme';
import GlobalEnhancements from '@/components/ui/GlobalEnhancements';
import { getCachedSiteSettings } from '@/lib/site-cache';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aditya Andrian Krisna Budi Portfolio | Full-Stack Web Developer",
  description: "Architecting Digital Experiences. Senior product designer and full-stack developer dedicated to crafting intentional, high-performance interfaces.",
  keywords: ["Software Engineer", "Product Designer", "Full-Stack Developer", "Web Development", "UI/UX", "Next.js", "React"],
  authors: [{ name: 'Executive Design' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Aditya Andrian Krisna Budi Portfolio | Full-Stack Web Developer',
    description: 'Senior product designer and full-stack developer dedicated to crafting intentional, high-performance interfaces.',
    siteName: 'Aditya Andrian Krisna Budi Portfolio',
    images: [{
      url: '/og-image.jpg', // Placeholder for standard OG image
      width: 1200,
      height: 630,
      alt: 'Aditya Andrian Krisna Budi Portfolio',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aditya Andrian Krisna Budi Portfolio | Full-Stack Web Developer',
    description: 'Senior product designer and full-stack developer dedicated to crafting intentional, high-performance interfaces.',
    creator: '@yourhandle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getCachedSiteSettings();
  const themeVars = generateThemeVars(settings.primary_color || '#c3c0ff');
  const neutralVars = settings.theme_mode === 'light' ? `
    --app-surface: #fdfdfd;
    --app-surface-bright: #ffffff;
    --app-surface-variant: #e1e3e8;
    --app-on-surface: #1a1a1a;
    --app-on-surface-variant: #4a4b50;
    --app-surface-lowest: #ffffff;
    --app-surface-low: #f5f5f5;
    --app-surface-container: #ebebeb;
    --app-surface-high: #e0e0e0;
    --app-surface-highest: #d6d6d6;
  ` : `
    --app-surface: #131313;
    --app-surface-bright: #393939;
    --app-surface-variant: #353534;
    --app-on-surface: #e5e2e1;
    --app-on-surface-variant: #c7c4d8;
    --app-surface-lowest: #0e0e0e;
    --app-surface-low: #1c1b1b;
    --app-surface-container: #201f1f;
    --app-surface-high: #2a2a2a;
    --app-surface-highest: #353534;
  `;

  const inlineCss = `
    :root {
      ${Object.entries(themeVars).map(([k, v]) => `${k.replace('--color-', '--app-')}: ${v};`).join('\n')}
      ${neutralVars}
    }
  `;

  return (
    <html lang="en" className={settings.theme_mode === 'light' ? 'light' : 'dark'}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: inlineCss }} />
      </head>
      <body className={`${inter.variable} ${manrope.variable} antialiased selection:bg-primary-container selection:text-on-primary-container bg-surface text-on-surface`}>
        <GlobalEnhancements />
        {children}
      </body>
    </html>
  );
}
