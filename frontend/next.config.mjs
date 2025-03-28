/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true, // Disable image optimization for simpler deployment
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Custom image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Device breakpoints
    disableStaticImages: false, // Enable importing images with import statements
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Use standard output for Vercel
  // Properly handle static and serverless functions
  output: 'standalone',
  distDir: '.next', // Explicitly set distDir
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Add asset resource handling for images
    config.module.rules.push({
      test: /\.(png|jpg|jpeg|gif|svg)$/i,
      type: 'asset/resource',
    });
    
    // Disable webpack cache to prevent errors
    config.cache = false;
    
    // Disable tracing and optimizations that cause issues
    if (config.optimization) {
      config.optimization.usedExports = false;
      if (config.optimization.splitChunks) {
        config.optimization.splitChunks.cacheGroups = {};
      }
    }
    
    // Disable the trace entry points plugin
    const plugins = config.plugins || [];
    config.plugins = plugins.filter(plugin => {
      return plugin.constructor && plugin.constructor.name !== 'TraceEntryPointsPlugin';
    });
    
    return config;
  },
  // Add proper asset handling for static assets
  assetPrefix: process.env.NODE_ENV === 'production' ? '/_next' : '',
};

export default nextConfig;
