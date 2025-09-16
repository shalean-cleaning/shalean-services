import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Let production builds complete even with ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

export default nextConfig;