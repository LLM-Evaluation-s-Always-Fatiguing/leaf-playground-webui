const bundleAnalyzer = require('@next/bundle-analyzer');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  transpilePackages: ['antd-style'],
};

module.exports = withBundleAnalyzer(nextConfig);
