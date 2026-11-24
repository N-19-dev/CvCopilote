import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Site 100 % statique, servi par Cloudflare (Workers static assets).
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
