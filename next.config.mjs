/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'nutrifitness.ch' },
      { protocol: 'https', hostname: 'fitrush.bzotech.com' }
    ]
  },
};

export default nextConfig;
