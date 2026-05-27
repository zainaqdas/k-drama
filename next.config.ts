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
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Prevent Next.js from bundling puppeteer — it needs its own Chromium binary
  serverExternalPackages: ["puppeteer"],
};

export default nextConfig;
