/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    unoptimized: true, // Disable image optimization for simpler deployment
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
      return plugin.constructor.name !== 'TraceEntryPointsPlugin';
    });
    
    return config;
  }
};

export default nextConfig;
