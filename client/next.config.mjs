/** @type {import('next').NextConfig} */
const nextConfig = {
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
    domains: ["localhost"],
  },
  // Remove the rewrites function entirely for production
  // Rewrites don't work for external URLs - they're only for internal routing
  ...(process.env.NODE_ENV === "development" && {
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:5000/api/:path*",
        },
      ];
    },
  }),
};

export default nextConfig;
