import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.travingat.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL || "http://127.0.0.1:8000"}/api/:path*`,
      },
      {
        source: "/ws/:path*",
        destination: `${process.env.BACKEND_URL?.replace("http", "ws") || "ws://127.0.0.1:8000"}/ws/:path*`,
      }
    ];
  },
};

export default nextConfig;
