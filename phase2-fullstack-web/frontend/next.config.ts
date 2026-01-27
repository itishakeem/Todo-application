import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enable standalone output for optimized Docker containers
  // This creates a minimal production build with all dependencies bundled
  output: 'standalone',
};

export default nextConfig;
