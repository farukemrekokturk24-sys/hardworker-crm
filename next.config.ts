import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // CRM ve site verisi her istekte veritabanından okunur; bileşen önbelleği kapalı.
  cacheComponents: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    root: path.resolve("."),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
