import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'https://aiagentitimedatedaybackend.vercel.app',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://aiagentitimedatedaybackend.vercel.app/:path*',
      },
    ];
  },
};

export default nextConfig;
