import { getRedirects } from './redirects.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'nutrifitness.ch' },
      { protocol: 'https', hostname: 'fitrush.bzotech.com' },
      { protocol: 'https', hostname: 'marvelousnutrition.com' },
      { protocol: 'https', hostname: 'dirtysquads.com' },
      { protocol: 'http', hostname: 'dirtysquads.com' },
      { protocol: 'https', hostname: 'punhmwlpaghmjndpyusf.supabase.co' }
    ]
  },
  async redirects() {
    return getRedirects();
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default nextConfig;
