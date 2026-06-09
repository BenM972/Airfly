// Keep-alive: 2026-06-09
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    if (!process.env.NEXT_PUBLIC_SITE_URL?.includes("airfly972.com")) return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.airfly972.com" }],
        destination: "https://airfly972.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
