import "server-only";
import { prisma } from "./prisma";
import { normalizePhone } from "./utils";

/** HW-2026-0042 — yıl bazlı sıralı referans */
export async function nextLeadRef(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.lead.count({
    where: { refNo: { startsWith: `HW-${year}-` } },
  });
  return `HW-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function nextDealRef(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.deal.count({
    where: { refNo: { startsWith: `DEAL-${year}-` } },
  });
  return `DEAL-${year}-${String(count + 1).padStart(4, "0")}`;
}

/**
 * Lead puanı — satış ekibinin önceliklendirmesi için.
 * Bütçe, ilgilenilen proje, iletişim bilgisi zenginliği ve davranış sinyalleri.
 */
export function scoreLead(input: {
  email?: string | null;
  budgetMax?: number | null;
  projectId?: string | null;
  unitId?: string | null;
  purpose?: string | null;
  viewCount?: number;
}): { score: number; temp: "HOT" | "WARM" | "COLD" } {
  let s = 30;
  if (input.email) s += 10;
  if (input.projectId) s += 10;
  if (input.unitId) s += 15;
  if (input.purpose === "YATIRIM") s += 10;
  if (input.budgetMax && input.budgetMax >= 150000) s += 15;
  else if (input.budgetMax && input.budgetMax >= 90000) s += 8;
  s += Math.min(input.viewCount ?? 0, 10) * 2;
  s = Math.max(0, Math.min(100, s));
  return { score: s, temp: s >= 70 ? "HOT" : s >= 45 ? "WARM" : "COLD" };
}

/**
 * Telefona göre lead bulur ya da oluşturur.
 * Aynı numara tekrar kayıt olursa yeni lead açılmaz; mevcut kayıt zenginleştirilir.
 */
export async function upsertLead(input: {
  name: string;
  phone: string;
  email?: string | null;
  country?: string | null;
  source?: string;
  projectId?: string | null;
  unitId?: string | null;
  purpose?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  message?: string | null;
  interestedTypes?: string[] | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrer?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const phone = normalizePhone(input.phone);
  const existing = await prisma.lead.findFirst({
    where: { phone, deletedAt: null },
  });

  const { score, temp } = scoreLead(input);

  if (existing) {
    const updated = await prisma.lead.update({
      where: { id: existing.id },
      data: {
        name: input.name || existing.name,
        email: input.email ?? existing.email,
        country: input.country ?? existing.country,
        projectId: input.projectId ?? existing.projectId,
        unitId: input.unitId ?? existing.unitId,
        purpose: input.purpose ?? existing.purpose,
        budgetMin: input.budgetMin ?? existing.budgetMin,
        budgetMax: input.budgetMax ?? existing.budgetMax,
        interestedTypes: input.interestedTypes
          ? (input.interestedTypes as never)
          : (existing.interestedTypes as never),
        score: Math.max(existing.score, score),
        temp: existing.score >= score ? existing.temp : temp,
        lastActivityAt: new Date(),
      },
    });
    await prisma.leadActivity.create({
      data: {
        leadId: updated.id,
        type: "SYSTEM",
        title: "Siteye tekrar kayıt oldu",
        detail: input.message ?? "Fiyat listesi yeniden görüntülendi.",
      },
    });
    return { lead: updated, isNew: false };
  }

  const lead = await prisma.lead.create({
    data: {
      refNo: await nextLeadRef(),
      name: input.name,
      phone,
      email: input.email ?? null,
      country: input.country ?? null,
      source: input.source ?? "PRICE_GATE",
      status: "NEW",
      score,
      temp,
      projectId: input.projectId ?? null,
      unitId: input.unitId ?? null,
      purpose: input.purpose ?? null,
      budgetMin: input.budgetMin ?? null,
      budgetMax: input.budgetMax ?? null,
      message: input.message ?? null,
      interestedTypes: input.interestedTypes ? (input.interestedTypes as never) : undefined,
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      referrer: input.referrer ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  });

  await prisma.$transaction([
    prisma.leadStatusHistory.create({
      data: { leadId: lead.id, toStatus: "NEW" },
    }),
    prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "SYSTEM",
        title: "Lead oluşturuldu",
        detail: `Kaynak: ${input.source ?? "PRICE_GATE"}`,
      },
    }),
  ]);

  return { lead, isNew: true };
}
