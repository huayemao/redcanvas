import createMDX from '@next/mdx';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});


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
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/redcanvas',
      },
      {
        // 使用 source 和 destination 而不是复杂正则
        source: '/prettyscore/:path*',
        destination: '/prettyscore/:path*'
      },
      {
        // 使用 source 和 destination 而不是复杂正则
        source: '/:path*',
        destination: '/redcanvas/:path*'
      },

      {
        source: '/redcanvas/about',
        destination: '/redcanvas/blog/about',
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      // Without options
      'remark-gfm',
    ],
    rehypePlugins: [

    ],
  },
});

export default withSerwist(withMDX(nextConfig));
