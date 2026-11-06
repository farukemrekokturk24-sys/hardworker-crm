import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // CRM ve site verisi her istekte veritabanından okunur; bileşen önbelleği kapalı.
  cacheComponents: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // macOS exFAT diskte ("._" kaynak-çatal dosyaları) görsel önbelleği bozuluyor
    // ve optimize edilmiş görsel yerine çöp dosya servis ediliyor.
    // Yerelde kapatılır; Vercel'de (Linux) değişken tanımsız olduğu için açık kalır.
    unoptimized: process.env.DISABLE_IMAGE_OPT === "1",
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
