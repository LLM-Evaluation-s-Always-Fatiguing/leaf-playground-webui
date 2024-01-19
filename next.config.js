const bundleAnalyzer = require('@next/bundle-analyzer');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const PLAYGROUND_SERVER_BASE_URL = process.env.PLAYGROUND_SERVER_BASE_URL || 'http://127.0.0.1:8000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  compiler: {
    emotion: true,
  },
  experimental: {
    optimizePackageImports: ['react-icons', '@formily/antd-v5'],
  },
  transpilePackages: ['antd-style', '@formily/antd-v5', '@ant-design/happy-work-theme'],
  async rewrites() {
    return [
      {
        source: '/server-api/:path*',
        destination: `${PLAYGROUND_SERVER_BASE_URL}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // replace this your actual origin
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
  output: 'standalone',
};

module.exports = withBundleAnalyzer(nextConfig);
