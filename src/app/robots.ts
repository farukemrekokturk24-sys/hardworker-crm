import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

const BASE = siteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/panel", "/api"] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
