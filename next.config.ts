import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: 'bottom-right',
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'ivan-affriandi.web.app',
        'ivan-affriandi.firebaseapp.com',
        'ivanaffriandi.com',
        'www.ivanaffriandi.com',
        'localhost:3000'
      ]
    }
  }
};

export default nextConfig;
