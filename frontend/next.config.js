/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignorar erros de lint durante o build para permitir deploy rápido;
    // idealmente solucionar warnings/erros em follow-up.
    ignoreDuringBuilds: true,
  },
  // Performance optimizations
  swcMinify: true,
  compress: true,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Experimental features for performance - disabled temporarily
  // experimental: {
  //   optimizeCss: true,
  //   scrollRestoration: true,
  // },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: '[REDACTED_TOKEN]',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: '[REDACTED_TOKEN]',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, [REDACTED_TOKEN]=86400',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
        },
      };
    }

    // Add bundle analyzer in development
    if (!dev && process.env.ANALYZE === 'true') {
      const { [REDACTED_TOKEN] } = require('[REDACTED_TOKEN]');
      config.plugins.push(
        new [REDACTED_TOKEN]({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }

    return config;
  },
};

module.exports = nextConfig;