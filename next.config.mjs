/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'nutrifitness.ch' },
      { protocol: 'https', hostname: 'fitrush.bzotech.com' },
      { protocol: 'https', hostname: 'marvelousnutrition.com' },
      { protocol: 'https', hostname: 'dirtysquads.com' },
      { protocol: 'http', hostname: 'dirtysquads.com' }
    ]
  },
};

export default nextConfig;
