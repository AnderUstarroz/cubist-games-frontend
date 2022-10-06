/** @type {import('next').NextConfig} */
const generateRobotsTxt = require("./scripts/generate-robots-txt");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config, { isServer }) {
    if (isServer) {
      generateRobotsTxt();
    }
    return config;
  },
};

module.exports = nextConfig;
