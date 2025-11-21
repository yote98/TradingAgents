import type { NextConfig } from "next";

// Force rebuild with env vars - Nov 20 2025
const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable to reduce hydration noise
  output: 'standalone', // Use standalone output for server deployment
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint during production builds
  },
  typescript: {
    ignoreBuildErrors: true, // Disable TypeScript errors during builds
  },
  // Suppress hydration warnings from theme provider inline styles
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // NUCLEAR CACHE BUSTING - Disable ALL caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
