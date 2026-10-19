import "server-only";
import { prisma } from "./prisma";
import { canSeePrices } from "./visitor";
import type { ProjectCardData } from "@/components/site/project-card";

/**
 * Kart görünümü için proje listesi.
 * Fiyatlar yalnızca kayıtlı ziyaretçiye gönderilir — kilitliyken gerçek değer
 * HTML'e hiç yazılmaz, sadece "fiyat var mı" bilgisi taşınır.
 */
export async function getProjectCards(opts?: {
  featuredOnly?: boolean;
  take?: number;
}): Promise<ProjectCardData[]> {
  const [showPrices, projects] = await Promise.all([
    canSeePrices(),
    prisma.project.findMany({
      where: { published: true, ...(opts?.featuredOnly ? { featured: true } : {}) },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: opts?.take,
      select: {
        id: true, slug: true, name: true, tagline: true, status: true,
        city: true, district: true, coverImage: true, deliveryLabel: true,
        units: { select: { status: true, price: true } },
      },
    }),
  ]);

  return projects.map((p) => {
    const available = p.units.filter((u) => u.status === "AVAILABLE");
    const prices = available.map((u) => u.price).filter((v): v is number => !!v);
    const min = prices.length ? Math.min(...prices) : null;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      status: p.status,
      city: p.city,
      district: p.district,
      coverImage: p.coverImage,
      deliveryLabel: p.deliveryLabel,
      totalUnits: p.units.length,
      availableUnits: available.length,
      minPrice: showPrices ? min : null,
      hasPrice: min !== null,
    };
  });
}

export async function getSiteStats() {
  const [projects, completed, ongoing, units, sold] = await Promise.all([
    prisma.project.count({ where: { published: true } }),
    prisma.project.count({ where: { published: true, status: "COMPLETED" } }),
    prisma.project.count({ where: { published: true, status: "ONGOING" } }),
    prisma.unit.count(),
    prisma.unit.count({ where: { status: "SOLD" } }),
  ]);
  return { projects, completed, ongoing, units, sold };
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findFirst({
    where: { slug, published: true },
    include: {
      images: { orderBy: [{ category: "asc" }, { order: "asc" }] },
      blocks: { orderBy: { order: "asc" } },
      units: { orderBy: [{ order: "asc" }], include: { block: true } },
    },
  });
}
