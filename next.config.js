/** @type {import('next').NextConfig} */
const generateRobotsTxt = require("./scripts/generate-robots-txt");
const removeImports = require("next-remove-imports")({});

const nextConfig = removeImports({
  reactStrictMode: true,
  swcMinify: true,
  webpack(config, { isServer }) {
    if (isServer) {
      generateRobotsTxt();
    }
    return config;
  },
});

module.exports = nextConfig;
