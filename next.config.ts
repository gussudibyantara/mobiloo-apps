import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

// Keep the local server independent from production verification builds.
export default function nextConfig(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  
  return {
    reactStrictMode: true,
    poweredByHeader: false,
    distDir: isDev ? '.next-dev' : '.next',
    // Tambahkan output standalone khusus untuk production build Docker/Coolify
    output: isDev ? undefined : 'standalone',
  };
}