const bundleAnalyzer = require('@next/bundle-analyzer');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const PLAYGROUND_SERVER_BASE_URL = process.env.PLAYGROUND_SERVER_BASE_URL || 'http://127.0.0.1:8000';

/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['react-icons'],
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
  output: 'standalone',
};

module.exports = withBundleAnalyzer(nextConfig);
