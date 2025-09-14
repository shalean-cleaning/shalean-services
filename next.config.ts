/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Keep only stable remote hosts if you still use any external images
    // Most images should now be local assets or pinned images
    remotePatterns: [
      // Only add hosts you actually need for external images
      // { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

module.exports = nextConfig;