import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hardworkercyprus.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await prisma.project.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const staticPages = [
    { path: "", priority: 1 },
    { path: "/projeler", priority: 0.9 },
    { path: "/hakkimizda", priority: 0.7 },
    { path: "/neden-kibris", priority: 0.8 },
    { path: "/iletisim", priority: 0.7 },
    { path: "/kvkk", priority: 0.3 },
    { path: "/gizlilik", priority: 0.3 },
  ];

  return [
    ...staticPages.map((p) => ({
      url: `${BASE}${p.path}`,
      lastModified: new Date(),
      priority: p.priority,
    })),
    ...projects.map((p) => ({
      url: `${BASE}/projeler/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.9,
    })),
  ];
}
