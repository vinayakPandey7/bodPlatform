const path = require('path')
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Add cache-busting headers to prevent API URL caching issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    // Force production API URL to prevent localhost issues
    NEXT_PUBLIC_API_URL: "https://theciero.com/api",
    API_URL: "https://theciero.com/api",
  },
  images: {
    domains: ['res.cloudinary.com', 'localhost'], // Add your image domains
  },
  webpack: (config) => {
    // Ensure '@' alias always resolves to './src' during build on server
    config.resolve = config.resolve || {}
    config.resolve.alias = config.resolve.alias || {}
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')
    return config
  },
}

module.exports = nextConfig
