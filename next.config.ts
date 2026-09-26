import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export → Cloudflare Workers Static Assets (the platform's stack
  // precedent, proven by prism.nanisoft.com).
  output: 'export',
  images: {
    unoptimized: true,
  },
};

// fumadocs-mdx's Macro API integration: compiles content collections and
// transforms `lib/source.ts`'s defineDocs/defineCollections calls. Call, not
// wrap — `createMDX(nextConfig)` would hand Next a function that spreads the
// config phase string into the config object (prism's site documents this).
export default createMDX()(nextConfig);
