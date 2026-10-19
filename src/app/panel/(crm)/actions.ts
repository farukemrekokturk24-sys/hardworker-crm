"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, logout, logActivity } from "@/lib/auth";
import { assertCan } from "@/lib/permissions";
import { nextDealRef, nextLeadRef, upsertLead } from "@/lib/leads";
import { normalizePhone } from "@/lib/utils";

export type ActionState = { ok?: boolean; error?: string };

export async function logoutAction() {
  await logout();
  redirect("/panel/giris");
}

/* =========================================================== LEAD'LER */

export async function updateLeadStatus(leadId: string, status: string) {
  const s = await requireSession();
  assertCan(s.role, "leads");

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { error: "Lead bulunamadı." };
  if (lead.status === status) return { ok: true };

  await prisma.$transaction([
    prisma.lead.update({
      where: { id: leadId },
      data: {
        status,
        lastActivityAt: new Date(),
        convertedAt: status === "WON" ? new Date() : lead.convertedAt,
      },
    }),
    prisma.leadStatusHistory.create({
      data: { leadId, fromStatus: lead.status, toStatus: status, userId: s.uid },
    }),
  ]);

  await logActivity(s.uid, "status_changed", "lead", leadId, `${lead.name}: ${lead.status} → ${status}`);
  revalidatePath("/panel/leadler");
  revalidatePath(`/panel/leadler/${leadId}`);
  return { ok: true };
}

export async function assignLead(leadId: string, userId: string | null) {
  const s = await requireSession();
  assertCan(s.role, "leads");

  await prisma.lead.update({
    where: { id: leadId },
    data: { assignedToId: userId, lastActivityAt: new Date() },
  });
  await logActivity(s.uid, "updated", "lead", leadId, "Sorumlu değiştirildi");
  revalidatePath("/panel/leadler");
  revalidatePath(`/panel/leadler/${leadId}`);
  return { ok: true };
}

export async function updateLeadTemp(leadId: string, temp: string) {
  const s = await requireSession();
  assertCan(s.role, "leads");
  await prisma.lead.update({ where: { id: leadId }, data: { temp } });
  revalidatePath(`/panel/leadler/${leadId}`);
  return { ok: true };
}

export async function addLeadNote(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await requireSession();
  assertCan(s.role, "leads");

  const leadId = String(formData.get("leadId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!leadId || !body) return { error: "Not boş olamaz." };

  await prisma.$transaction([
    prisma.leadNote.create({ data: { leadId, userId: s.uid, body } }),
    prisma.lead.update({ where: { id: leadId }, data: { lastActivityAt: new Date() } }),
  ]);
  revalidatePath(`/panel/leadler/${leadId}`);
  return { ok: true };
}

export async function addLeadActivity(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await requireSession();
  assertCan(s.role, "leads");

  const leadId = String(formData.get("leadId") ?? "");
  const type = String(formData.get("type") ?? "CALL");
  const title = String(formData.get("title") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();
  const outcome = String(formData.get("outcome") ?? "").trim();

  if (!leadId || !title) return { error: "Başlık gerekli." };

  await prisma.$transaction([
    prisma.leadActivity.create({
      data: {
        leadId, userId: s.uid, type, title,
        detail: detail || null,
        outcome: outcome || null,
      },
    }),
    prisma.lead.update({ where: { id: leadId }, data: { lastActivityAt: new Date() } }),
  ]);
  revalidatePath(`/panel/leadler/${leadId}`);
  return { ok: true };
}

const leadSchema = z.object({
  name: z.string().trim().min(2, "Ad gerekli."),
  phone: z.string().trim().min(7, "Telefon gerekli."),
  email: z.string().trim().optional(),
  country: z.string().trim().optional(),
  source: z.string().optional(),
  projectId: z.string().optional(),
  purpose: z.string().optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  assignedToId: z.string().optional(),
  message: z.string().optional(),
});

export async function createLead(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await requireSession();
  assertCan(s.role, "leads");

  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Form hatalı." };
  }
  const d = parsed.data;

  const existing = await prisma.lead.findFirst({
    where: { phone: normalizePhone(d.phone), deletedAt: null },
  });
  if (existing) {
    return { error: `Bu numara zaten kayıtlı: ${existing.refNo} — ${existing.name}` };
  }

  const lead = await prisma.lead.create({
    data: {
      refNo: await nextLeadRef(),
      name: d.name,
      phone: normalizePhone(d.phone),
      email: d.email || null,
      country: d.country || null,
      source: d.source || "MANUAL",
      projectId: d.projectId || null,
      purpose: d.purpose || null,
      budgetMin: d.budgetMin ? Number(d.budgetMin) : null,
      budgetMax: d.budgetMax ? Number(d.budgetMax) : null,
      assignedToId: d.assignedToId || null,
      message: d.message || null,
      score: 50,
      temp: "WARM",
    },
  });

  await prisma.$transaction([
    prisma.leadStatusHistory.create({ data: { leadId: lead.id, toStatus: "NEW", userId: s.uid } }),
    prisma.leadActivity.create({
      data: { leadId: lead.id, userId: s.uid, type: "SYSTEM", title: "Lead panelden oluşturuldu" },
    }),
  ]);

  await logActivity(s.uid, "created", "lead", lead.id, `${lead.name} eklendi`);
  revalidatePath("/panel/leadler");
  redirect(`/panel/leadler/${lead.id}`);
}

export async function deleteLead(leadId: string) {
  const s = await requireSession();
  assertCan(s.role, "leads.delete");
  await prisma.lead.update({ where: { id: leadId }, data: { deletedAt: new Date() } });
  await logActivity(s.uid, "deleted", "lead", leadId, "Lead silindi");
  revalidatePath("/panel/leadler");
  redirect("/panel/leadler");
}

/* ========================================================== RANDEVULAR */

export async function createAppointment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await requireSession();
  assertCan(s.role, "appointments");

  const leadId = String(formData.get("leadId") ?? "");
  const startsAt = String(formData.get("startsAt") ?? "");
  if (!leadId || !startsAt) return { error: "Lead ve tarih gerekli." };

  await prisma.appointment.create({
    data: {
      leadId,
      projectId: String(formData.get("projectId") ?? "") || null,
      unitId: String(formData.get("unitId") ?? "") || null,
      userId: String(formData.get("userId") ?? "") || s.uid,
      type: String(formData.get("type") ?? "VIEWING"),
      startsAt: new Date(startsAt),
      location: String(formData.get("location") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath("/panel/randevular");
  revalidatePath(`/panel/leadler/${leadId}`);
  return { ok: true };
}

export async function updateAppointmentStatus(id: string, status: string) {
  const s = await requireSession();
  assertCan(s.role, "appointments");
  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/panel/randevular");
  return { ok: true };
}

export async function deleteAppointment(id: string) {
  const s = await requireSession();
  assertCan(s.role, "appointments");
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/panel/randevular");
  return { ok: true };
}

/* ============================================================ SATIŞLAR */

export async function createDeal(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await requireSession();
  assertCan(s.role, "deals");

  const leadId = String(formData.get("leadId") ?? "");
  const unitId = String(formData.get("unitId") ?? "");
  const agreedPrice = Number(formData.get("agreedPrice") ?? 0);
  if (!leadId || !unitId || !agreedPrice) {
    return { error: "Lead, daire ve anlaşılan fiyat gerekli." };
  }

  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit) return { error: "Daire bulunamadı." };
  if (unit.status === "SOLD") return { error: "Bu daire zaten satılmış." };

  const downPaymentPct = Number(formData.get("downPaymentPct") ?? 35);
  const installmentMonths = Number(formData.get("installmentMonths") ?? 36);
  const downPayment = Math.round((agreedPrice * downPaymentPct) / 100);
  const listPrice = unit.price ?? agreedPrice;

  const deal = await prisma.deal.create({
    data: {
      refNo: await nextDealRef(),
      leadId,
      projectId: unit.projectId,
      unitId,
      agentId: s.uid,
      listPrice,
      agreedPrice,
      currency: unit.currency,
      discountPct: listPrice > 0 ? Math.round(((listPrice - agreedPrice) / listPrice) * 1000) / 10 : 0,
      downPaymentPct,
      downPayment,
      installmentMonths,
      status: "RESERVATION",
      reservedAt: new Date(),
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  // Taksit planını üret
  const remaining = agreedPrice - downPayment;
  const monthly = installmentMonths > 0 ? Math.round(remaining / installmentMonths) : 0;
  await prisma.installment.createMany({
    data: [
      {
        dealId: deal.id, no: 0, label: "Peşinat",
        amount: downPayment, dueDate: new Date(), status: "PENDING",
      },
      ...Array.from({ length: installmentMonths }, (_, i) => {
        const due = new Date();
        due.setMonth(due.getMonth() + i + 1);
        return {
          dealId: deal.id, no: i + 1, label: `${i + 1}. Taksit`,
          amount: monthly, dueDate: due, status: "PENDING",
        };
      }),
    ],
  });

  await prisma.$transaction([
    prisma.unit.update({ where: { id: unitId }, data: { status: "RESERVED" } }),
    prisma.lead.update({
      where: { id: leadId },
      data: { status: "RESERVED", temp: "HOT", lastActivityAt: new Date() },
    }),
    prisma.leadStatusHistory.create({
      data: { leadId, toStatus: "RESERVED", userId: s.uid },
    }),
  ]);

  await logActivity(s.uid, "created", "deal", deal.id, `${deal.refNo} rezervasyonu açıldı`);
  revalidatePath("/panel/satislar");
  revalidatePath("/panel/daireler");
  redirect(`/panel/satislar/${deal.id}`);
}

export async function updateDealStatus(dealId: string, status: string) {
  const s = await requireSession();
  assertCan(s.role, "deals");

  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) return { error: "Satış bulunamadı." };

  const now = new Date();
  const data: Record<string, unknown> = { status };
  if (status === "CONTRACT") data.contractAt = now;
  if (status === "COMPLETED") data.completedAt = now;
  if (status === "CANCELLED") data.cancelledAt = now;

  await prisma.deal.update({ where: { id: dealId }, data });

  // Daire durumu satış durumunu izler
  const unitStatus =
    status === "CANCELLED" ? "AVAILABLE" : status === "RESERVATION" ? "RESERVED" : "SOLD";
  await prisma.unit.update({ where: { id: deal.unitId }, data: { status: unitStatus } });

  if (status === "COMPLETED") {
    await prisma.$transaction([
      prisma.lead.update({
        where: { id: deal.leadId },
        data: { status: "WON", convertedAt: now },
      }),
      prisma.leadStatusHistory.create({
        data: { leadId: deal.leadId, toStatus: "WON", userId: s.uid },
      }),
    ]);
  }

  await logActivity(s.uid, "status_changed", "deal", dealId, `${deal.refNo} → ${status}`);
  revalidatePath("/panel/satislar");
  revalidatePath(`/panel/satislar/${dealId}`);
  revalidatePath("/panel/daireler");
  return { ok: true };
}

export async function markInstallmentPaid(installmentId: string, amount?: number) {
  const s = await requireSession();
  assertCan(s.role, "deals");

  const inst = await prisma.installment.findUnique({ where: { id: installmentId } });
  if (!inst) return { error: "Taksit bulunamadı." };

  const paid = amount ?? inst.amount;
  await prisma.installment.update({
    where: { id: installmentId },
    data: {
      paidAmount: paid,
      paidAt: new Date(),
      status: paid >= inst.amount ? "PAID" : "PARTIAL",
    },
  });

  revalidatePath(`/panel/satislar/${inst.dealId}`);
  return { ok: true };
}

/* ============================================================= DAİRELER */

export async function updateUnit(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await requireSession();
  assertCan(s.role, "units.edit");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Daire bulunamadı." };

  const priceRaw = String(formData.get("price") ?? "").trim();

  await prisma.unit.update({
    where: { id },
    data: {
      price: priceRaw ? Number(priceRaw) : null,
      status: String(formData.get("status") ?? "AVAILABLE"),
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  await logActivity(s.uid, "updated", "unit", id, "Daire güncellendi");
  revalidatePath("/panel/daireler");
  return { ok: true };
}

export async function bulkUpdateUnitStatus(unitIds: string[], status: string) {
  const s = await requireSession();
  assertCan(s.role, "units.edit");
  await prisma.unit.updateMany({ where: { id: { in: unitIds } }, data: { status } });
  await logActivity(s.uid, "updated", "unit", null, `${unitIds.length} daire → ${status}`);
  revalidatePath("/panel/daireler");
  return { ok: true };
}

/** Yüzdelik zam/indirim — seçili dairelere uygulanır */
export async function bulkAdjustPrices(unitIds: string[], percent: number) {
  const s = await requireSession();
  assertCan(s.role, "units.edit");

  const units = await prisma.unit.findMany({
    where: { id: { in: unitIds }, price: { not: null } },
    select: { id: true, price: true },
  });

  await prisma.$transaction(
    units.map((u) =>
      prisma.unit.update({
        where: { id: u.id },
        data: { price: Math.round((u.price ?? 0) * (1 + percent / 100)) },
      })
    )
  );

  await logActivity(s.uid, "updated", "unit", null, `${units.length} daire fiyatı %${percent} güncellendi`);
  revalidatePath("/panel/daireler");
  return { ok: true };
}

/* ============================================================= GÖREVLER */

export async function createTask(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await requireSession();
  assertCan(s.role, "tasks");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Görev başlığı gerekli." };

  const due = String(formData.get("dueDate") ?? "");
  await prisma.task.create({
    data: {
      title,
      detail: String(formData.get("detail") ?? "") || null,
      dueDate: due ? new Date(due) : null,
      priority: String(formData.get("priority") ?? "NORMAL"),
      leadId: String(formData.get("leadId") ?? "") || null,
      assignedToId: String(formData.get("assignedToId") ?? "") || s.uid,
      createdById: s.uid,
    },
  });

  revalidatePath("/panel/gorevler");
  revalidatePath("/panel");
  return { ok: true };
}

export async function toggleTask(id: string) {
  await requireSession();
  const t = await prisma.task.findUnique({ where: { id } });
  if (!t) return { error: "Görev bulunamadı." };
  await prisma.task.update({
    where: { id },
    data: { done: !t.done, doneAt: !t.done ? new Date() : null },
  });
  revalidatePath("/panel/gorevler");
  revalidatePath("/panel");
  return { ok: true };
}

export async function deleteTask(id: string) {
  await requireSession();
  await prisma.task.delete({ where: { id } });
  revalidatePath("/panel/gorevler");
  return { ok: true };
}

/* ============================================================ MESAJLAR */

export async function markMessageHandled(id: string) {
  await requireSession();
  await prisma.contactMessage.update({ where: { id }, data: { handled: true } });
  revalidatePath("/panel/mesajlar");
  return { ok: true };
}

/* ============================================================ PROJELER */

export async function updateProject(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await requireSession();
  assertCan(s.role, "projects");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Proje bulunamadı." };

  const featuresRaw = String(formData.get("features") ?? "");

  await prisma.project.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? ""),
      tagline: String(formData.get("tagline") ?? "") || null,
      descriptionTr: String(formData.get("descriptionTr") ?? "") || null,
      status: String(formData.get("status") ?? "ONGOING"),
      published: formData.get("published") === "on",
      featured: formData.get("featured") === "on",
      city: String(formData.get("city") ?? "") || null,
      district: String(formData.get("district") ?? "") || null,
      address: String(formData.get("address") ?? "") || null,
      deliveryLabel: String(formData.get("deliveryLabel") ?? "") || null,
      downPaymentPct: formData.get("downPaymentPct")
        ? Number(formData.get("downPaymentPct"))
        : null,
      installmentMonths: formData.get("installmentMonths")
        ? Number(formData.get("installmentMonths"))
        : null,
      paymentTermsTr: String(formData.get("paymentTermsTr") ?? "") || null,
      seoTitle: String(formData.get("seoTitle") ?? "") || null,
      seoDescription: String(formData.get("seoDescription") ?? "") || null,
      features: featuresRaw
        ? (featuresRaw.split("\n").map((l) => l.trim()).filter(Boolean) as never)
        : undefined,
    },
  });

  await logActivity(s.uid, "updated", "project", id, "Proje güncellendi");
  revalidatePath("/panel/projeler");
  revalidatePath("/projeler");
  return { ok: true };
}

export async function setProjectCover(projectId: string, url: string) {
  const s = await requireSession();
  assertCan(s.role, "projects");
  await prisma.project.update({ where: { id: projectId }, data: { coverImage: url } });
  revalidatePath(`/panel/projeler/${projectId}`);
  revalidatePath("/projeler");
  return { ok: true };
}

export async function deleteProjectImage(imageId: string) {
  const s = await requireSession();
  assertCan(s.role, "projects");
  const img = await prisma.projectImage.findUnique({ where: { id: imageId } });
  await prisma.projectImage.delete({ where: { id: imageId } });
  if (img) revalidatePath(`/panel/projeler/${img.projectId}`);
  return { ok: true };
}

/* ========================================================= KULLANICILAR */

export async function createUser(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await requireSession();
  assertCan(s.role, "*");

  const { hashPassword } = await import("@/lib/auth");
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !name || password.length < 6) {
    return { error: "Ad, e-posta ve en az 6 karakterli şifre gerekli." };
  }
  if (await prisma.user.findUnique({ where: { email } })) {
    return { error: "Bu e-posta zaten kayıtlı." };
  }

  await prisma.user.create({
    data: {
      name, email,
      phone: String(formData.get("phone") ?? "") || null,
      passwordHash: await hashPassword(password),
      role: String(formData.get("role") ?? "AGENT"),
    },
  });

  await logActivity(s.uid, "created", "user", null, `${name} eklendi`);
  revalidatePath("/panel/kullanicilar");
  return { ok: true };
}

export async function toggleUserActive(userId: string) {
  const s = await requireSession();
  assertCan(s.role, "*");
  if (userId === s.uid) return { error: "Kendi hesabınızı kapatamazsınız." };
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) return { error: "Kullanıcı bulunamadı." };
  await prisma.user.update({ where: { id: userId }, data: { active: !u.active } });
  revalidatePath("/panel/kullanicilar");
  return { ok: true };
}

/* ============================================================= AYARLAR */

export async function saveSetting(key: string, value: unknown) {
  const s = await requireSession();
  assertCan(s.role, "*");
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: value as never },
    update: { value: value as never },
  });
  revalidatePath("/panel/ayarlar");
  revalidatePath("/", "layout");
  return { ok: true };
}

/* Siteden gelen lead'i panelden yeniden kullanmak için yeniden dışa aktarım */
export { upsertLead };
