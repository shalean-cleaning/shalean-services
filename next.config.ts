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
  webpack: (config, { dev, isServer }) => {
    // Fix chunk loading issues in development
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      };
    }
    return config;
  },
  // Increase timeout for chunk loading
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', '@tanstack/react-query-devtools'],
  },
};

export default nextConfig;