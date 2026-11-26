import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Fallback if middleware is skipped; primary path is middleware rewrite (URL stays /).
    return [];
  },
  async rewrites() {
    return [{ source: "/landing", destination: "/landing/index.html" }];
  },
};

export default nextConfig;
