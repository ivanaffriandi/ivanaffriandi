import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: process.env.BACKEND_INTERNAL_URL || "http://backend:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
