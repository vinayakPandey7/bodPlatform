/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:5000/api"
        : "https://bodplatform.onrender.com/api"),
    API_URL:
      process.env.API_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:5000/api"
        : "https://bodplatform.onrender.com/api"),
  },
  images: {
    domains: ['res.cloudinary.com', 'localhost'], // Add your image domains
  },
}

module.exports = nextConfig
