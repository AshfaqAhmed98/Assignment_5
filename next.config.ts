import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    const backendUrl = (
      process.env.BACKEND_URL ??
      process.env.NEXT_PUBLIC_BACKEND_URL ??
      "http://localhost:3001"
    ).replace(/\/$/, "");

    return [
      {
        source: "/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
