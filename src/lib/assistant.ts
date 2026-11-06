import "server-only";
import { prisma } from "./prisma";
import { canSeePrices } from "./visitor";
import { formatPrice } from "./utils";

/**
 * "HardworkerAI" — site üzerindeki satış danışmanı asistanı.
 *
 * Cevaplar hazır kalıplardan üretilir; veriler veritabanındaki gerçek
 * projelerden gelir. Fiyat kuralı burada da geçerlidir: ziyaretçi kayıtlı
 * değilse rakam verilmez, fiyat kaydına yönlendirilir.
 */

export const ASSISTANT = {
  name: "HardworkerAI",
  title: "Dijital Satış Danışmanı",
  greeting:
    "Merhaba, ben HardworkerAI 👋 Projeler, daire tipleri, fiyatlar, ödeme planı, teslim tarihleri, tapu süreci ve daha fazlası hakkında sorabilirsiniz.",
} as const;

export type AssistantProject = {
  slug: string;
  name: string;
  district: string | null;
  city: string | null;
  status: string;
  deliveryLabel: string | null;
  totalUnits: number;
  availableUnits: number;
  types: string[];
  minPriceLabel: string | null;
  downPaymentPct: number | null;
  installmentMonths: number | null;
};

export type AssistantData = {
  showPrices: boolean;
  projects: AssistantProject[];
};

export async function getAssistantData(): Promise<AssistantData> {
  const [showPrices, projects] = await Promise.all([
    canSeePrices(),
    prisma.project.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      select: {
        slug: true, name: true, district: true, city: true, status: true,
        deliveryLabel: true, downPaymentPct: true, installmentMonths: true,
        units: { select: { status: true, price: true, type: true } },
      },
    }),
  ]);

  return {
    showPrices,
    projects: projects.map((p) => {
      const available = p.units.filter((u) => u.status === "AVAILABLE");
      const prices = available.map((u) => u.price).filter((v): v is number => !!v);
      const min = prices.length ? Math.min(...prices) : null;
      return {
        slug: p.slug,
        name: p.name,
        district: p.district,
        city: p.city,
        status: p.status,
        deliveryLabel: p.deliveryLabel,
        totalUnits: p.units.length,
        availableUnits: available.length,
        types: [...new Set(p.units.map((u) => u.type))],
        // Kayıtsız ziyaretçiye rakam gönderilmez
        minPriceLabel: showPrices && min !== null ? formatPrice(min) : null,
        downPaymentPct: p.downPaymentPct,
        installmentMonths: p.installmentMonths,
      };
    }),
  };
}
