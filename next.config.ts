import { readFileSync } from 'node:fs';
import type { NextConfig } from 'next';

// Share one policy between Cloudflare static assets and rendered pages.
const securityHeaders = [...readFileSync('public/_headers', 'utf8').matchAll(/^  ([\w-]+): (.+)$/gm)]
  .map(([, key, value]) => ({ key, value: value.trim() }));

const nextConfig: NextConfig = {
  async headers() {
    // The router's wildcard does not match the root path.
    return ['/', '/:path*'].map(source => ({ source, headers: securityHeaders }));
  },
};

export default nextConfig;
