import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enable experimental features for better PWA support
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Compress pages
  compress: true,
  // Enable powered by header removal for security
  poweredByHeader: false,
};

export default nextConfig;
