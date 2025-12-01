/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@nightlife-os/core', '@nightlife-os/ui', '@nightlife-os/shared-types'],
};

module.exports = nextConfig;
