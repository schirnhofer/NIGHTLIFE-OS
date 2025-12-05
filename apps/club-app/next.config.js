/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@nightlife-os/core', '@nightlife-os/ui', '@nightlife-os/shared-types'],
  typescript: {
    // Während der Entwicklung: Ignoriere TypeScript-Fehler beim Build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Während der Entwicklung: Ignoriere ESLint-Fehler beim Build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
