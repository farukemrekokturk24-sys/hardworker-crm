"use server";

import { prisma } from "@/lib/prisma";
import {
  requireSession,
  hashPassword,
  verifyPassword,
  logActivity,
} from "@/lib/auth";

export type ActionState = { ok?: boolean; error?: string };

/** Şifre için asgari kurallar — yönetici formundaki kuralla aynı taban. */
const MIN = 8;

/**
 * Oturumu açık kullanıcının kendi şifresini değiştirir.
 * Yalnızca oturum sahibinin kaydına dokunur; başka kullanıcı hedeflenemez.
 */
export async function changeOwnPassword(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();

  const mevcut = String(formData.get("current") ?? "");
  const yeni = String(formData.get("next") ?? "");
  const tekrar = String(formData.get("repeat") ?? "");

  if (!mevcut || !yeni) {
    return { error: "Mevcut ve yeni şifreyi girin." };
  }
  if (yeni.length < MIN) {
    return { error: `Yeni şifre en az ${MIN} karakter olmalı.` };
  }
  if (yeni !== tekrar) {
    return { error: "Yeni şifre ile tekrarı aynı değil." };
  }
  if (yeni === mevcut) {
    return { error: "Yeni şifre mevcut şifreyle aynı olamaz." };
  }

  // Hedef daima oturum sahibinin kendi kaydıdır.
  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { id: true, passwordHash: true, active: true },
  });
  if (!user || !user.active) {
    return { error: "Hesap bulunamadı." };
  }

  if (!(await verifyPassword(mevcut, user.passwordHash))) {
    return { error: "Mevcut şifre hatalı." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(yeni) },
  });

  // Şifre değişikliği güvenlik olayıdır; kaydı tutulur (şifre asla loglanmaz).
  await logActivity(session.uid, "updated", "user", session.uid, "Şifresini değiştirdi");

  return { ok: true };
}
