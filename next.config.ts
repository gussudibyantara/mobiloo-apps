import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

// Keep the local server independent from production verification builds.
export default function nextConfig(phase:string):NextConfig {
 return {reactStrictMode:true,poweredByHeader:false,distDir:phase===PHASE_DEVELOPMENT_SERVER?'.next-dev':'.next'};
}
