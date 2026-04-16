import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: '29u63gnblbqldkwg.public.blob.vercel-storage.com',
        pathname: '/img/**',
      },
    ],
  },
  // Update for Next.js 16
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
