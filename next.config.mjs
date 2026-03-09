/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'fonts.loli.net',
      },
      {
        protocol: 'https',
        hostname: 'gstatic.loli.net',
      },
    ],
  },
};

export default nextConfig;
