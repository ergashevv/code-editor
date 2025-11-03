/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API routes configuration
  async rewrites() {
    return [];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

module.exports = nextConfig;

