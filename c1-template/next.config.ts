import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable to reduce hydration noise
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint during production builds
  },
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript checks
  },
  // Suppress hydration warnings from theme provider inline styles
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
