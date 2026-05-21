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
