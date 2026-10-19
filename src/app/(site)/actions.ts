"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { upsertLead } from "@/lib/leads";
import { signVisitor, getVisitor, trackView } from "@/lib/visitor";
import { requestMeta } from "@/lib/auth";
import { isValidPhone, normalizePhone } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Adınızı girin."),
  phone: z.string().trim().refine(isValidPhone, "Geçerli bir telefon numarası girin."),
  email: z.string().trim().email("Geçerli bir e-posta girin.").optional().or(z.literal("")),
  country: z.string().trim().optional(),
  purpose: z.enum(["YATIRIM", "OTURUM", "KIRALAMA"]).optional().or(z.literal("")),
  projectId: z.string().optional().or(z.literal("")),
  unitId: z.string().optional().or(z.literal("")),
  kvkk: z.string().optional(),
});

export type RegisterState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

/** "Fiyat görmek için kayıt ol" — lead açar ve ziyaretçi oturumu başlatır. */
export async function registerForPrices(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0];
      if (typeof k === "string" && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, fieldErrors, error: "Lütfen formu kontrol edin." };
  }

  if (raw.kvkk !== "on") {
    return {
      ok: false,
      fieldErrors: { kvkk: "Devam etmek için onay vermeniz gerekiyor." },
      error: "Lütfen formu kontrol edin.",
    };
  }

  const d = parsed.data;
  const meta = await requestMeta();

  try {
    const { lead } = await upsertLead({
      name: d.name,
      phone: d.phone,
      email: d.email || null,
      country: d.country || null,
      purpose: d.purpose || null,
      projectId: d.projectId || null,
      unitId: d.unitId || null,
      source: "PRICE_GATE",
      message: "Fiyat listesini görmek için kayıt oldu.",
      utmSource: raw.utm_source || null,
      utmMedium: raw.utm_medium || null,
      utmCampaign: raw.utm_campaign || null,
      referrer: meta.referrer,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    await signVisitor({ lid: lead.id, name: lead.name, phone: lead.phone });
    await trackView({
      projectId: d.projectId || null,
      unitId: d.unitId || null,
      action: "PRICE_UNLOCK",
    });

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    console.error("registerForPrices", e);
    return { ok: false, error: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin." };
  }
}

/* ------------------------------------------------------------- İletişim */

const contactSchema = z.object({
  name: z.string().trim().min(2, "Adınızı girin."),
  phone: z.string().trim().refine(isValidPhone, "Geçerli bir telefon numarası girin."),
  email: z.string().trim().email("Geçerli bir e-posta girin.").optional().or(z.literal("")),
  subject: z.string().trim().optional(),
  message: z.string().trim().min(5, "Mesajınızı yazın."),
});

export async function sendContactMessage(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0];
      if (typeof k === "string" && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, fieldErrors, error: "Lütfen formu kontrol edin." };
  }

  const d = parsed.data;
  const meta = await requestMeta();

  try {
    const { lead } = await upsertLead({
      name: d.name,
      phone: d.phone,
      email: d.email || null,
      source: "CONTACT_FORM",
      message: d.message,
      referrer: meta.referrer,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    await prisma.contactMessage.create({
      data: {
        name: d.name,
        phone: normalizePhone(d.phone),
        email: d.email || null,
        subject: d.subject || null,
        message: d.message,
        leadId: lead.id,
      },
    });

    return { ok: true };
  } catch (e) {
    console.error("sendContactMessage", e);
    return { ok: false, error: "Mesaj gönderilemedi. Lütfen tekrar deneyin." };
  }
}

/* -------------------------------------------------------- Randevu talebi */

export async function requestAppointment(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  if (!raw.name?.trim() || !isValidPhone(raw.phone ?? "")) {
    return { ok: false, error: "Ad ve geçerli bir telefon numarası gerekli." };
  }
  const meta = await requestMeta();
  try {
    const { lead } = await upsertLead({
      name: raw.name,
      phone: raw.phone,
      email: raw.email || null,
      projectId: raw.projectId || null,
      source: "CONTACT_FORM",
      message: `Proje gezisi talebi${raw.note ? ` — ${raw.note}` : ""}`,
      referrer: meta.referrer,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
    await prisma.appointment.create({
      data: {
        leadId: lead.id,
        projectId: raw.projectId || null,
        type: "VIEWING",
        status: "SCHEDULED",
        startsAt: raw.date ? new Date(raw.date) : new Date(Date.now() + 2 * 86400000),
        notes: raw.note || "Siteden gelen gezi talebi",
      },
    });
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "VIEWING", temp: "HOT", score: Math.max(75, 0) },
    });
    return { ok: true };
  } catch (e) {
    console.error("requestAppointment", e);
    return { ok: false, error: "Talep gönderilemedi. Lütfen tekrar deneyin." };
  }
}

/** Ziyaretçi bir daireye baktığında kaydeder (satışa sinyal). */
export async function logUnitView(projectId: string, unitId?: string) {
  const v = await getVisitor();
  if (!v) return;
  await trackView({ projectId, unitId: unitId ?? null, action: "VIEW" });
}
