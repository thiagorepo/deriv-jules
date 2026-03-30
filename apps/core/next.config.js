/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize build for Nx monorepo
  nx: {
    svgr: false,
  },
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  compress: true,
  optimizeFonts: true,
  productionBrowserSourceMaps: false,
  swcMinify: true,
  experimental: {
    // Use the latest React features
    reactCompiler: false,
  },
  // External packages configuration
  transpilePackages: [
    '@org/shared-config',
    '@org/shared-auth',
    '@org/shared-supabase',
    '@org/shared-types',
    '@org/supabase',
    '@org/ui',
    '@org/theme',
    '@org/deriv-api',
    '@org/core-routes',
  ],
};

module.exports = nextConfig;
