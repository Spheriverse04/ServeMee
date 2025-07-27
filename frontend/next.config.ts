import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.pexels.com', 'storage.googleapis.com'],
    unoptimized: false,
  },
  experimental: {
    optimizePackageImports: ['react-hot-toast'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
