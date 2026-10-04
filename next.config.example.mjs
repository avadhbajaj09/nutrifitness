// Copy to next.config.mjs
import { readFileSync, existsSync } from 'node:fs';

const redirects = existsSync('./src/redirects.json') ? JSON.parse(readFileSync('./src/redirects.json', 'utf8')) : [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: { formats: ['image/avif', 'image/webp'], remotePatterns: [{ protocol: 'https', hostname: 'nutrifitness.ch' }] },
  async redirects() { return redirects; },
  async headers() {
    const prod = process.env.VERCEL_ENV === 'production';
    return prod ? [] : [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
};
export default nextConfig;
