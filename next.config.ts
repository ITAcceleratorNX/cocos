import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Direct access to static landing assets & original HTML
      { source: "/landing", destination: "/landing/index.html" },
    ];
  },
};

export default nextConfig;
