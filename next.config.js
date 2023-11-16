/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  transpilePackages: ['antd-style'],
};

module.exports = nextConfig;
