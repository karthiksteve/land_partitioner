/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'maps.googleapis.com',
      'mt1.googleapis.com',
      'mt2.googleapis.com',
      'mt3.googleapis.com',
      'khms0.googleapis.com',
      'khms1.googleapis.com',
      'server.arcgisonline.com',
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
