"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { nextLeadRef } from "@/lib/leads";
import { normalizePhone, isValidPhone } from "@/lib/utils";

export type BrokerState = { ok?: boolean; error?: string };

/** Oturumun emlakçı (ya da önizleyen yönetici) olduğunu doğrular. */
async function requireBroker() {
  const s = await requireSession();
  if (s.role !== "BROKER" && s.role !== "SUPER_ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return s;
}

/** Emlakçının müşterisini kaydeder; lead doğrudan emlakçıya bağlanır. */
export async function addBrokerCustomer(
  _prev: BrokerState,
  formData: FormData
): Promise<BrokerState> {
  const s = await requireBroker();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "");

  if (name.length < 2) return { error: "Müşteri adını girin." };
  if (!isValidPhone(phone)) return { error: "Geçerli bir telefon numarası girin." };

  const normalized = normalizePhone(phone);
  const existing = await prisma.lead.findFirst({
    where: { phone: normalized, deletedAt: null },
    select: { id: true, refNo: true, name: true, referredById: true },
  });

  if (existing) {
    if (existing.referredById && existing.referredById !== s.uid) {
      return {
        error: `Bu numara sistemde başka bir danışmana kayıtlı (${existing.refNo}).`,
      };
    }
    await prisma.lead.update({
      where: { id: existing.id },
      data: {
        referredById: s.uid,
        projectId: projectId || undefined,
        lastActivityAt: new Date(),
      },
    });
    revalidatePath("/emlakci");
    return { ok: true };
  }

  const lead = await prisma.lead.create({
    data: {
      refNo: await nextLeadRef(),
      name,
      phone: normalized,
      email: String(formData.get("email") ?? "") || null,
      country: String(formData.get("country") ?? "") || null,
      purpose: String(formData.get("purpose") ?? "") || null,
      message: String(formData.get("note") ?? "") || null,
      projectId: projectId || null,
      source: "REFERRAL",
      status: "NEW",
      referredById: s.uid,
      score: 55,
      temp: "WARM",
    },
  });

  await prisma.$transaction([
    prisma.leadStatusHistory.create({ data: { leadId: lead.id, toStatus: "NEW", userId: s.uid } }),
    prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: s.uid,
        type: "SYSTEM",
        title: "Emlakçı tarafından eklendi",
        detail: `${s.name} kendi müşterisini kaydetti.`,
      },
    }),
  ]);

  revalidatePath("/emlakci");
  return { ok: true };
}

/** Proje için takip edilebilir sunum linki üretir. */
export async function createShareLink(
  projectId: string | null,
  label?: string
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const s = await requireBroker();

  const token = randomBytes(6).toString("base64url");
  await prisma.shareLink.create({
    data: { token, userId: s.uid, projectId: projectId || null, label: label || null },
  });

  revalidatePath("/emlakci");
  return { ok: true, token };
}

export async function deleteShareLink(id: string): Promise<BrokerState> {
  const s = await requireBroker();
  const link = await prisma.shareLink.findUnique({ where: { id } });
  if (!link || link.userId !== s.uid) return { error: "Link bulunamadı." };
  await prisma.shareLink.delete({ where: { id } });
  revalidatePath("/emlakci");
  return { ok: true };
}

/** Emlakçının kendi müşterisine not düşmesi. */
export async function addBrokerNote(
  _prev: BrokerState,
  formData: FormData
): Promise<BrokerState> {
  const s = await requireBroker();
  const leadId = String(formData.get("leadId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!leadId || !body) return { error: "Not boş olamaz." };

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, referredById: s.uid },
    select: { id: true },
  });
  if (!lead) return { error: "Bu müşteri size ait değil." };

  await prisma.$transaction([
    prisma.leadNote.create({ data: { leadId, userId: s.uid, body } }),
    prisma.lead.update({ where: { id: leadId }, data: { lastActivityAt: new Date() } }),
  ]);

  revalidatePath("/emlakci");
  return { ok: true };
}
