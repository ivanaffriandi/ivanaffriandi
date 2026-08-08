import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["firebase", "@firebase/auth", "@firebase/app", "@firebase/component", "@firebase/util"],
  devIndicators: {
    position: 'bottom-right',
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'blogger.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      }
    ],
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
