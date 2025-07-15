/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "development"
        ? "https://bodplatform.onrender.com/api/:path*"
        : "https://bodplatform.onrender.com/api"),
    API_URL:
      process.env.API_URL ||
      (process.env.NODE_ENV === "development"
        ? "https://bodplatform.onrender.com/api/:path*"
        : "https://bodplatform.onrender.com/api"),
  },
  images: {
    domains: ["localhost"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "https://bodplatform.onrender.com/api/:path*"
            : "https://bodplatform.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
